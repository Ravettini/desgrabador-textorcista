const Busboy = require('busboy')
const Replicate = require('replicate')

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
          model: "small",
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
    console.log('=== Iniciando handler de transcripción ===')
    console.log('HTTP Method:', event.httpMethod)
    console.log('Content-Type:', event.headers['content-type'] || event.headers['Content-Type'])
    
    // Inicializar Replicate dentro del handler
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN
    })
    
    console.log('Replicate inicializado')

    const contentType = event.headers['content-type'] || event.headers['Content-Type'] || ''

    let audioBuffer
    let filename = 'audio.mp3'
    let duration = null
    let size = null

    // Por ahora, SOLO soportar archivos subidos (no URLs)
    if (contentType.includes('application/json')) {
      // URLs deshabilitadas temporalmente para debugging
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'La descarga desde URLs está temporalmente deshabilitada. Por favor, descargá el video manualmente y subilo como archivo.'
        })
      }
    }
    // Multipart con archivo
    else if (contentType.includes('multipart/form-data')) {
      console.log('Parseando multipart/form-data...')
      const { files } = await parseMultipartForm(event)
      
      if (!files || files.length === 0) {
        throw new Error('No se recibió ningún archivo')
      }

      console.log('Archivo recibido:', files[0].filename)
      const audioFile = files[0]
      audioBuffer = audioFile.buffer
      filename = audioFile.filename
      size = `${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB`
    } else {
      throw new Error('Content-Type no soportado. Use multipart/form-data para subir archivos.')
    }

    // Validar tamaño (máximo 25MB)
    if (audioBuffer.length > 25 * 1024 * 1024) {
      throw new Error('El archivo es demasiado grande. Máximo 25MB.')
    }

    console.log('Archivo válido, iniciando transcripción...')

    // Transcribir
    const text = await transcribeAudio(audioBuffer, filename, replicate)
    
    console.log('Transcripción completada exitosamente')

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        text,
        duration: duration,
        size
      })
    }
  } catch (error) {
    console.error('=== ERROR EN HANDLER ===')
    console.error('Mensaje:', error.message)
    console.error('Stack:', error.stack)
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Error al procesar la solicitud'
      })
    }
  }
}
