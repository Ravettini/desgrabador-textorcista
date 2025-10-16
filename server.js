const express = require('express')
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json())

// Configurar multer para archivos
const storage = multer.memoryStorage()
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB
})

// Simular la función de transcripción
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  console.log('=== 🚀 SIMULANDO TRANSCRIPCIÓN ===')
  console.log('📄 Archivo recibido:', {
    filename: req.file?.originalname,
    size: req.file?.size,
    mimetype: req.file?.mimetype
  })

  try {
    if (!req.file) {
      console.error('❌ No file received')
      return res.status(400).json({
        success: false,
        error: 'No se recibió ningún archivo'
      })
    }

    // Simular procesamiento
    console.log('⏳ Simulando transcripción...')
    await new Promise(resolve => setTimeout(resolve, 2000)) // 2 segundos

    // Texto simulado
    const mockTranscript = `Esta es una transcripción simulada del archivo "${req.file.originalname}".

El archivo tiene un tamaño de ${(req.file.size / 1024 / 1024).toFixed(2)} MB.

Esta es una demostración de la funcionalidad de transcripción. En producción, este texto sería generado por el modelo Whisper de OpenAI a través de Replicate.

La aplicación está funcionando correctamente y los logs de debug están activos.`

    console.log('✅ Transcripción simulada completada')

    res.json({
      success: true,
      text: mockTranscript,
      duration: '2:30',
      size: `${(req.file.size / 1024 / 1024).toFixed(2)} MB`
    })

  } catch (error) {
    console.error('❌ Error en transcripción simulada:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Error al procesar la transcripción'
    })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor de transcripción funcionando' })
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor de transcripción ejecutándose en http://localhost:${PORT}`)
  console.log(`📡 Endpoint: http://localhost:${PORT}/api/transcribe`)
  console.log(`❤️  Health: http://localhost:${PORT}/api/health`)
})
