const Busboy = require('busboy')
const Replicate = require('replicate')

// Cargar ytdl y fetch solo si es necesario (lazy loading)
let ytdl, fetch

// Límite de duración para evitar timeout (5 minutos)
const MAX_VIDEO_DURATION = 300 // 5 minutos en segundos

// Función helper para parsear multipart/form-data
function parseMultipartForm(event) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ 
      headers: {
        'content-type': event.headers['content-type'] || event.headers['Content-Type']
      }
    })
    
    const fields = {}
    const files = []

    busboy.on('file', (fieldname, file, info) => {
      const chunks = []
      file.on('data', (chunk) => chunks.push(chunk))
      file.on('end', () => {
        files.push({
          fieldname,
          buffer: Buffer.concat(chunks),
          filename: info.filename,
          mimeType: info.mimeType
        })
      })
    })

    busboy.on('field', (fieldname, value) => {
      fields[fieldname] = value
    })

    busboy.on('finish', () => {
      resolve({ fields, files })
    })

    busboy.on('error', reject)

    // Convertir base64 a buffer si es necesario
    const bodyBuffer = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64')
      : Buffer.from(event.body)

    busboy.write(bodyBuffer)
    busboy.end()
  })
}

// Descargar audio de YouTube con validación de duración
async function downloadYouTubeAudio(url) {
  try {
    // Lazy load ytdl-core
    if (!ytdl) {
      ytdl = require('ytdl-core')
    }
    
    const info = await ytdl.getInfo(url)
    const videoDuration = parseInt(info.videoDetails.lengthSeconds)
    
    // Validar duración antes de descargar
    if (videoDuration > MAX_VIDEO_DURATION) {
      const minutes = Math.floor(videoDuration / 60)
      throw new Error(
        `El video dura ${minutes} minutos. Por límites de Netlify, solo procesamos videos de hasta 5 minutos. ` +
        `Descargá el video manualmente y subilo como archivo.`
      )
    }
    
    const audioFormat = ytdl.chooseFormat(info.formats, { 
      quality: 'lowestaudio',
      filter: 'audioonly' 
    })

    if (!audioFormat) {
      throw new Error('No se encontró formato de audio en el video')
    }

    const stream = ytdl(url, { format: audioFormat })
    const chunks = []

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout: La descarga tardó demasiado. Intentá con un video más corto.'))
      }, 8000) // 8 segundos de timeout

      stream.on('data', chunk => chunks.push(chunk))
      stream.on('end', () => {
        clearTimeout(timeout)
        const buffer = Buffer.concat(chunks)
        resolve({
          buffer,
          duration: videoDuration,
          size: buffer.length
        })
      })
      stream.on('error', (err) => {
        clearTimeout(timeout)
        reject(err)
      })
    })
  } catch (error) {
    throw new Error(`Error al descargar de YouTube: ${error.message}`)
  }
}

// Descargar audio de Vimeo con validación
async function downloadVimeoAudio(url) {
  try {
    // Lazy load node-fetch
    if (!fetch) {
      fetch = require('node-fetch')
    }
    
    // Extraer ID de Vimeo
    const vimeoIdMatch = url.match(/vimeo\.com\/(\d+)/)
    if (!vimeoIdMatch) {
      throw new Error('URL de Vimeo inválida')
    }

    const videoId = vimeoIdMatch[1]
    
    // Obtener información del video desde la API pública de Vimeo
    const response = await fetch(`https://player.vimeo.com/video/${videoId}/config`)
    
    if (!response.ok) {
      throw new Error('No se pudo acceder al video de Vimeo. Verificá que sea público.')
    }
    
    const data = await response.json()
    
    // Validar duración
    const videoDuration = data?.video?.duration || 0
    if (videoDuration > MAX_VIDEO_DURATION) {
      const minutes = Math.floor(videoDuration / 60)
      throw new Error(
        `El video dura ${minutes} minutos. Por límites de Netlify, solo procesamos videos de hasta 5 minutos. ` +
        `Descargá el video manualmente y subilo como archivo.`
      )
    }

    // Buscar URL de audio progresivo (calidad más baja para más rápido)
    const progressiveFiles = data?.request?.files?.progressive || []
    const audioFile = progressiveFiles.find(f => 
      f.quality === '360p' || f.quality === '240p' || f.quality === 'auto'
    ) || progressiveFiles[0]

    if (!audioFile) {
      throw new Error('No se pudo obtener el archivo de Vimeo. El video puede estar privado o protegido.')
    }

    // Descargar el archivo con timeout
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000) // 8 segundos

    const audioResponse = await fetch(audioFile.url, { signal: controller.signal })
    clearTimeout(timeout)
    
    const arrayBuffer = await audioResponse.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return {
      buffer,
      duration: videoDuration,
      size: buffer.length
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Timeout: La descarga tardó demasiado. Intentá con un video más corto.')
    }
    throw new Error(`Error al descargar de Vimeo: ${error.message}`)
  }
}

// Transcribir con Whisper via Replicate
async function transcribeAudio(audioBuffer, filename, replicateClient) {
  try {
    console.log(`Transcribiendo archivo: ${filename}, tamaño: ${audioBuffer.length} bytes`)
    
    // Convertir buffer a base64 data URI
    const base64Audio = audioBuffer.toString('base64')
    const mimeType = filename.endsWith('.mp3') ? 'audio/mpeg' : 'audio/mp4'
    const dataUri = `data:${mimeType};base64,${base64Audio}`

    console.log('Llamando a Replicate API con modelo Whisper small...')
    
    // Usar modelo Whisper en Replicate (modelo "small" como en tu script)
    const output = await replicateClient.run(
      "openai/whisper:4d50797290df275329f202e48c76360b3f22b08d28c196cbc54600319435f8d2",
      {
        input: {
          audio: dataUri,
          model: "small", // Mismo modelo que usabas en Colab
          language: "es",
          transcription: "plain text"
        }
      }
    )

    console.log('Respuesta de Replicate recibida')
    
    // Replicate devuelve el texto directamente
    return output.transcription || output.text || output
  } catch (error) {
    console.error('Error en transcribeAudio:', error)
    throw new Error(`Error en la transcripción: ${error.message}`)
  }
}

exports.handler = async function(event) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método no permitido' })
    }
  }

  try {
    console.log('Iniciando handler de transcripción...')
    
    // Inicializar Replicate dentro del handler para evitar problemas con bundler
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN
    })
    
    console.log('Replicate inicializado correctamente')
    console.log('Content-Type:', event.headers['content-type'] || event.headers['Content-Type'])

    const contentType = event.headers['content-type'] || event.headers['Content-Type'] || ''

    let audioBuffer
    let filename = 'audio.mp3'
    let duration = null
    let size = null

    // Caso 1: JSON con URL
    if (contentType.includes('application/json')) {
      const body = JSON.parse(event.body)
      const { url } = body

      if (!url) {
        throw new Error('URL no proporcionada')
      }

      // Detectar plataforma y descargar con validaciones
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const result = await downloadYouTubeAudio(url)
        audioBuffer = result.buffer
        duration = result.duration
        size = `${(result.size / 1024 / 1024).toFixed(2)} MB`
        filename = 'youtube_audio.mp3'
      } else if (url.includes('vimeo.com')) {
        const result = await downloadVimeoAudio(url)
        audioBuffer = result.buffer
        duration = result.duration
        size = `${(result.size / 1024 / 1024).toFixed(2)} MB`
        filename = 'vimeo_audio.mp4'
      } else {
        throw new Error('URL no soportada. Solo YouTube y Vimeo son compatibles.')
      }
    }
    // Caso 2: Multipart con archivo
    else if (contentType.includes('multipart/form-data')) {
      const { files } = await parseMultipartForm(event)
      
      if (!files || files.length === 0) {
        throw new Error('No se recibió ningún archivo')
      }

      const audioFile = files[0]
      audioBuffer = audioFile.buffer
      filename = audioFile.filename
      size = `${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB`
    } else {
      throw new Error('Content-Type no soportado')
    }

    // Validar tamaño (máximo 25MB para Whisper API)
    if (audioBuffer.length > 25 * 1024 * 1024) {
      throw new Error('El archivo es demasiado grande. Máximo 25MB.')
    }

    // Transcribir
    console.log('Iniciando transcripción con Whisper...')
    const text = await transcribeAudio(audioBuffer, filename, replicate)
    console.log('Transcripción completada exitosamente')

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        text,
        duration: duration ? `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}` : null,
        size
      })
    }
  } catch (error) {
    console.error('Error completo:', error)
    console.error('Error stack:', error.stack)
    console.error('Error name:', error.name)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Error al procesar la solicitud',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    }
  }
}

