import { useState, useRef } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import axios from 'axios'
import './Uploader.css'

function Uploader({ setProcessing, setProgress, onComplete, onError, onBack }) {
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)
  const ffmpegRef = useRef(null)
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false)

  console.log('📁 Uploader State:', { file: file?.name, dragActive, ffmpegLoaded })

  const loadFFmpeg = async () => {
    if (ffmpegRef.current) {
      console.log('🎬 FFmpeg already loaded, reusing instance')
      return ffmpegRef.current
    }
    
    console.log('🎬 Loading FFmpeg...')
    const ffmpeg = new FFmpeg()
    ffmpegRef.current = ffmpeg
    
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
    
    try {
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      })
      console.log('✅ FFmpeg loaded successfully')
      setFfmpegLoaded(true)
      return ffmpeg
    } catch (err) {
      console.error('❌ FFmpeg load error:', err)
      throw new Error('Error al cargar FFmpeg. Por favor, recargá la página.')
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0])
    }
  }

  const handleFileSelection = (selectedFile) => {
    console.log('📄 File selected:', { 
      name: selectedFile.name, 
      type: selectedFile.type, 
      size: selectedFile.size 
    })
    
    const validTypes = ['audio/mpeg', 'audio/mp3', 'video/mp4']
    const validExtensions = ['.mp3', '.mp4']
    
    const fileName = selectedFile.name.toLowerCase()
    const isValidExtension = validExtensions.some(ext => fileName.endsWith(ext))
    const isValidType = validTypes.includes(selectedFile.type)
    
    if (!isValidExtension && !isValidType) {
      console.error('❌ Invalid file type:', selectedFile.type)
      onError('El archivo debe ser .mp3 o .mp4')
      return
    }

    // Límite de 100MB
    if (selectedFile.size > 100 * 1024 * 1024) {
      console.error('❌ File too large:', selectedFile.size)
      onError('El archivo no debe superar los 100MB')
      return
    }

    console.log('✅ File validation passed')
    setFile(selectedFile)
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0])
    }
  }

  const extractAudioFromMP4 = async (videoFile) => {
    try {
      setProgress({ stage: 'Cargando herramientas de conversión...', percent: 10 })
      const ffmpeg = await loadFFmpeg()
      
      setProgress({ stage: 'Extrayendo audio del video...', percent: 30 })
      
      // Escribir archivo de video en el sistema virtual de FFmpeg
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile))
      
      // Convertir a MP3
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-vn',
        '-acodec', 'libmp3lame',
        '-ac', '2',
        '-ar', '44100',
        '-b:a', '128k',
        'output.mp3'
      ])
      
      setProgress({ stage: 'Audio extraído correctamente...', percent: 50 })
      
      // Leer el archivo de salida
      const data = await ffmpeg.readFile('output.mp3')
      const audioBlob = new Blob([data.buffer], { type: 'audio/mpeg' })
      
      return audioBlob
    } catch (err) {
      throw new Error('Error al extraer audio del video: ' + err.message)
    }
  }

  const handleSubmit = async () => {
    if (!file) {
      console.error('❌ No file selected for submission')
      return
    }

    console.log('🚀 Starting transcription process for:', file.name)

    try {
      setProcessing(true)
      setProgress({ stage: 'Preparando archivo...', percent: 5 })

      let audioBlob = file
      let fileName = file.name

      // Si es MP4, extraer audio en el cliente
      if (file.name.toLowerCase().endsWith('.mp4')) {
        console.log('🎬 Extracting audio from MP4...')
        audioBlob = await extractAudioFromMP4(file)
        fileName = file.name.replace('.mp4', '.mp3')
        console.log('✅ Audio extracted successfully')
      } else {
        console.log('🎵 Using audio file directly')
        setProgress({ stage: 'Archivo de audio listo...', percent: 50 })
      }

      setProgress({ stage: 'Enviando a transcripción...', percent: 60 })

      // Crear FormData para enviar
      const formData = new FormData()
      formData.append('audio', audioBlob, fileName)
      console.log('📤 Sending to API:', { fileName, size: audioBlob.size })

      // Usar URL de Colab si está configurada, sino usar Netlify
      const API_URL = import.meta.env.VITE_COLAB_API_URL 
        ? `${import.meta.env.VITE_COLAB_API_URL}/api/transcribe`
        : '/api/transcribe-simple'
      
      console.log('🔗 Using API URL:', API_URL)
      
      const response = await axios.post(API_URL, formData, {
        headers: {
          // No establecer Content-Type manualmente, axios lo hace automáticamente para FormData
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            60 + (progressEvent.loaded * 20) / progressEvent.total
          )
          setProgress({ 
            stage: 'Transcribiendo audio...', 
            percent: percentCompleted 
          })
        }
      })

      console.log('📥 API Response received:', { 
        success: response.data.success, 
        textLength: response.data.text?.length 
      })

      setProgress({ stage: 'Procesando transcripción...', percent: 95 })

      if (response.data.success) {
        onComplete({
          text: response.data.text,
          duration: response.data.duration,
          size: (audioBlob.size / 1024 / 1024).toFixed(2) + ' MB'
        })
      } else {
        throw new Error(response.data.error || 'Error en la transcripción')
      }
    } catch (err) {
      console.error('❌ Transcription error:', err)
      const errorMessage = err.response?.data?.error || 
        err.message || 
        'Error al procesar el archivo. Por favor, intentá nuevamente.'
      onError(String(errorMessage))
    }
  }

  return (
    <div className="uploader card">
      <button className="back-button btn-secondary" onClick={onBack} aria-label="Volver al inicio">
        ← Volver
      </button>

      <h2>📁 Subir archivo de audio o video</h2>
      <p className="uploader-subtitle">
        Formatos aceptados: .mp3 o .mp4 (máximo 100MB)
      </p>

      <div
        className={`dropzone ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Zona de carga de archivos. Hacé clic o arrastrá un archivo aquí"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            fileInputRef.current?.click()
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp3,.mp4,audio/mpeg,video/mp4"
          onChange={handleFileInput}
          className="file-input"
          aria-label="Seleccionar archivo"
        />
        
        {!file ? (
          <>
            <div className="dropzone-icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
            <p className="dropzone-text">
              <strong>Arrastrá y soltá tu archivo</strong>
            </p>
            <p className="dropzone-hint">o hacé clic para seleccionarlo</p>
            <p className="dropzone-hint">.mp3 o .mp4 • Máximo 100MB</p>
          </>
        ) : (
          <>
            <div className="file-icon" aria-hidden="true">
              {file.name.endsWith('.mp4') ? '🎬' : '🎵'}
            </div>
            <p className="file-name">{file.name}</p>
            <p className="file-size">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </>
        )}
      </div>

      {file && (
        <div className="action-buttons">
          <button
            className="btn-placa btn-lg"
            onClick={handleSubmit}
            aria-label="Comenzar transcripción del archivo seleccionado"
          >
            Transcribir
          </button>
          <button
            className="btn-secondary"
            onClick={() => setFile(null)}
            aria-label="Eliminar archivo seleccionado"
          >
            🗑️ Eliminar
          </button>
        </div>
      )}
    </div>
  )
}

export default Uploader


