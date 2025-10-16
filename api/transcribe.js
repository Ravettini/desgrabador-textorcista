import Busboy from 'busboy'
import Replicate from 'replicate'

// Función helper para parsear multipart/form-data
function parseMultipartForm(req) {
  return new Promise((resolve, reject) => {
    try {
      const busboy = Busboy({ 
        headers: req.headers
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

      busboy.on('error', (err) => {
        console.error('Error en busboy:', err)
        reject(err)
      })

      req.pipe(busboy)
    } catch (err) {
      console.error('Error al crear busboy:', err)
      reject(err)
    }
  })
}

// Transcribir con Whisper via Replicate
async function transcribeAudio(audioBuffer, filename, replicateClient) {
  try {
    console.log(`📝 Transcribiendo: ${filename}, tamaño: ${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB`)
    
    // Validar tamaño del buffer
    if (audioBuffer.length === 0) {
      throw new Error('El archivo de audio está vacío')
    }
    
    // Convertir buffer a base64 data URI
    const base64Audio = audioBuffer.toString('base64')
    const mimeType = filename.endsWith('.mp3') ? 'audio/mpeg' : 'audio/mp4'
    const dataUri = `data:${mimeType};base64,${base64Audio}`

    console.log('🤖 Llamando a Replicate Whisper API...')
    
    // Usar modelo Whisper en Replicate
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

    console.log('✅ Respuesta de Replicate recibida')
    
    // Replicate devuelve el texto directamente
    const text = output.transcription || output.text || output
    
    if (!text || typeof text !== 'string') {
      throw new Error('Replicate no devolvió un texto válido')
    }
    
    return text
  } catch (error) {
    console.error('❌ Error en transcripción:', error.message)
    throw new Error(`Error en la transcripción: ${error.message}`)
  }
}

export default async function handler(req, res) {
  console.log('🚀 === Iniciando handler de transcripción ===')
  console.log('📋 Method:', req.method)
  console.log('📋 URL:', req.url)
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')

  // Handle preflight
  if (req.method === 'OPTIONS') {
    console.log('✅ Preflight request handled')
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    console.log('❌ Método no permitido:', req.method)
    return res.status(405).json({ 
      success: false,
      error: 'Método no permitido. Use POST.' 
    })
  }

  try {
    const contentType = req.headers['content-type'] || ''
    console.log('📋 Content-Type:', contentType)
    
    // Inicializar Replicate
    console.log('🔧 Inicializando Replicate...')
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN
    })
    console.log('✅ Replicate inicializado')

    let audioBuffer
    let filename = 'audio.mp3'
    let size = null

    // Manejar URLs (temporalmente deshabilitado)
    if (contentType.includes('application/json')) {
      console.log('⚠️ Solicitud con JSON (URL) - temporalmente deshabilitada')
      return res.status(400).json({
        success: false,
        error: 'La descarga desde URLs está temporalmente deshabilitada. Por favor, descargá el video manualmente y subilo como archivo.'
      })
    }
    // Multipart con archivo
    else if (contentType.includes('multipart/form-data')) {
      console.log('📁 Parseando archivo subido...')
      
      const { files } = await parseMultipartForm(req)
      
      if (!files || files.length === 0) {
        console.log('❌ No se recibieron archivos')
        throw new Error('No se recibió ningún archivo')
      }

      const audioFile = files[0]
      console.log(`📦 Archivo recibido: ${audioFile.filename}, ${(audioFile.buffer.length / 1024 / 1024).toFixed(2)} MB`)
      
      audioBuffer = audioFile.buffer
      filename = audioFile.filename
      size = `${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB`
    } else {
      console.log('❌ Content-Type no soportado:', contentType)
      throw new Error(`Content-Type no soportado: ${contentType}. Use multipart/form-data para subir archivos.`)
    }

    // Validar tamaño (máximo 25MB para Whisper)
    const fileSizeMB = audioBuffer.length / 1024 / 1024
    if (fileSizeMB > 25) {
      console.log(`❌ Archivo muy grande: ${fileSizeMB.toFixed(2)} MB`)
      throw new Error(`El archivo es demasiado grande (${fileSizeMB.toFixed(2)} MB). Máximo: 25MB.`)
    }

    console.log('✅ Archivo válido, iniciando transcripción...')

    // Transcribir
    const text = await transcribeAudio(audioBuffer, filename, replicate)
    
    console.log(`✅ Transcripción completada: ${text.length} caracteres`)

    return res.status(200).json({
      success: true,
      text,
      duration: null,
      size
    })
  } catch (error) {
    console.error('❌ === ERROR EN HANDLER ===')
    console.error('📋 Mensaje:', error.message)
    console.error('📋 Stack:', error.stack)
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Error al procesar la solicitud'
    })
  }
}
