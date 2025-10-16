const Busboy = require('busboy')

// Parsear multipart form data
function parseMultipartForm(event) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ 
      headers: {
        'content-type': event.headers['content-type'] || event.headers['Content-Type']
      }
    })
    
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

    busboy.on('finish', () => {
      resolve({ files })
    })

    busboy.on('error', reject)

    const bodyBuffer = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64')
      : Buffer.from(event.body)

    busboy.write(bodyBuffer)
    busboy.end()
  })
}

// Transcribir con Replicate API directa
async function transcribeWithReplicate(audioBuffer, filename) {
  const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN

  if (!REPLICATE_API_TOKEN) {
    console.log('⚠️ No hay token de Replicate')
    return `Transcripción simulada del archivo "${filename}".

Para obtener transcripciones reales, configura REPLICATE_API_TOKEN en Netlify.

Ve a https://replicate.com para obtener tu token gratuito.`
  }

  try {
    console.log('🤖 Llamando a Replicate API...')

    // Convertir buffer a base64 data URI
    const base64Audio = audioBuffer.toString('base64')
    const mimeType = filename.endsWith('.mp3') ? 'audio/mpeg' : 'audio/mp4'
    const dataUri = `data:${mimeType};base64,${base64Audio}`

    // Crear predicción con fetch directo
    const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: '4d50797290df275329f202e48c76360b3f22b08d28c196cbc54600319435f8d2',
        input: {
          audio: dataUri,
          model: 'small',
          language: 'es',
          transcription: 'plain text'
        }
      })
    })

    if (!createResponse.ok) {
      throw new Error(`Replicate API error: ${createResponse.status}`)
    }

    const prediction = await createResponse.json()
    console.log('📝 Predicción creada:', prediction.id)

    // Esperar a que termine
    let result = prediction
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        }
      })
      
      result = await statusResponse.json()
      console.log('⏳ Estado:', result.status)
    }

    if (result.status === 'failed') {
      throw new Error('Transcripción falló en Replicate')
    }

    console.log('✅ Transcripción completada')
    return result.output.transcription || result.output.text || result.output

  } catch (error) {
    console.error('❌ Error en Replicate:', error)
    throw error
  }
}

exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }

  console.log('=== 🚀 FUNCIÓN REPLICATE JS ===')
  console.log('Method:', event.httpMethod)

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
    console.log('📦 Parseando archivo...')
    const { files } = await parseMultipartForm(event)

    if (!files || files.length === 0) {
      throw new Error('No se recibió ningún archivo')
    }

    const audioFile = files[0]
    console.log('📄 Archivo:', audioFile.filename, '-', audioFile.buffer.length, 'bytes')

    // Validar tamaño (máximo 25MB)
    if (audioFile.buffer.length > 25 * 1024 * 1024) {
      throw new Error('El archivo es demasiado grande. Máximo 25MB.')
    }

    // Transcribir
    const text = await transcribeWithReplicate(audioFile.buffer, audioFile.filename)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        text,
        duration: null,
        size: `${(audioFile.buffer.length / 1024 / 1024).toFixed(2)} MB`
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
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

