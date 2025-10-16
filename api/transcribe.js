import Busboy from 'busboy'
import Replicate from 'replicate'

// Función helper para parsear multipart/form-data
function parseMultipartForm(req) {
  return new Promise((resolve, reject) => {
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

    busboy.on('error', reject)

    req.pipe(busboy)
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

    console.log('Respuesta de Replicate recibida')
    
    return output.transcription || output.text || output
  } catch (error) {
    console.error('Error en transcribeAudio:', error)
    throw new Error(`Error en la transcripción: ${error.message}`)
  }
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  try {
    console.log('=== Iniciando handler de transcripción ===')
    console.log('HTTP Method:', req.method)
    console.log('Content-Type:', req.headers['content-type'])
    
    // Inicializar Replicate
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN
    })
    
    console.log('Replicate inicializado')

    const contentType = req.headers['content-type'] || ''

    let audioBuffer
    let filename = 'audio.mp3'
    let size = null

    // Manejar URLs (temporalmente deshabilitado)
    if (contentType.includes('application/json')) {
      console.log('Solicitud con JSON (URL) - temporalmente deshabilitada')
      return res.status(400).json({
        success: false,
        error: 'La descarga desde URLs está temporalmente deshabilitada. Por favor, descargá el video manualmente y subilo como archivo.'
      })
    }
    // Multipart con archivo
    else if (contentType.includes('multipart/form-data')) {
      console.log('Parseando multipart/form-data...')
      const { files } = await parseMultipartForm(req)
      
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

    return res.status(200).json({
      success: true,
      text,
      duration: null,
      size
    })
  } catch (error) {
    console.error('=== ERROR EN HANDLER ===')
    console.error('Mensaje:', error.message)
    console.error('Stack:', error.stack)
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Error al procesar la solicitud'
    })
  }
}
