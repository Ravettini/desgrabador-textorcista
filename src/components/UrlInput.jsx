import { useState } from 'react'
import axios from 'axios'
import './UrlInput.css'

function UrlInput({ setProcessing, setProgress, onComplete, onError, onBack }) {
  const [url, setUrl] = useState('')
  const [urlValid, setUrlValid] = useState(null)

  const validateUrl = (inputUrl) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+/
    
    return youtubeRegex.test(inputUrl) || vimeoRegex.test(inputUrl)
  }

  const handleUrlChange = (e) => {
    const inputUrl = e.target.value
    setUrl(inputUrl)
    
    if (inputUrl.trim()) {
      setUrlValid(validateUrl(inputUrl))
    } else {
      setUrlValid(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!url.trim() || !urlValid) {
      onError('Por favor, ingresá una URL válida de YouTube o Vimeo')
      return
    }

    try {
      setProcessing(true)
      setProgress({ stage: 'Validando enlace...', percent: 10 })

      const response = await axios.post('/api/transcribe', {
        url: url.trim()
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        onDownloadProgress: (progressEvent) => {
          // Estimación de progreso
          if (progressEvent.loaded < 1000000) {
            setProgress({ stage: 'Descargando video...', percent: 20 })
          } else if (progressEvent.loaded < 5000000) {
            setProgress({ stage: 'Extrayendo audio...', percent: 40 })
          } else {
            setProgress({ stage: 'Transcribiendo audio...', percent: 70 })
          }
        }
      })

      setProgress({ stage: 'Procesando transcripción...', percent: 95 })

      if (response.data.success) {
        onComplete({
          text: response.data.text,
          duration: response.data.duration,
          size: response.data.size || 'N/A'
        })
      } else {
        throw new Error(response.data.error || 'Error en la transcripción')
      }
    } catch (err) {
      console.error('Error:', err)
      onError(
        err.response?.data?.error || 
        err.message || 
        'Error al procesar el video. Verificá que el enlace sea público y válido.'
      )
    }
  }

  return (
    <div className="url-input-container card">
      <button className="back-button btn-secondary" onClick={onBack} aria-label="Volver al inicio">
        ← Volver
      </button>

      <h2>🔗 Pegar link de video</h2>
      <div className="info-notice">
        <p><strong>⚠️ Límite de duración</strong></p>
        <p>Solo videos de hasta <strong>5 minutos</strong> por límites de Netlify.</p>
        <p>Videos más largos: descargalos manualmente y usalos en "Subir archivo".</p>
      </div>
      <p className="url-subtitle">
        Ingresá la URL de un video de YouTube o Vimeo (máximo 5 minutos)
      </p>

      <form onSubmit={handleSubmit} className="url-form">
        <div className="input-wrapper">
          <label htmlFor="video-url" className="sr-only">
            URL del video
          </label>
          <input
            id="video-url"
            type="url"
            className={`url-input ${urlValid === true ? 'valid' : ''} ${urlValid === false ? 'invalid' : ''}`}
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={handleUrlChange}
            aria-invalid={urlValid === false}
            aria-describedby="url-help"
          />
          {urlValid === true && (
            <span className="validation-icon valid" aria-label="URL válida">✓</span>
          )}
          {urlValid === false && (
            <span className="validation-icon invalid" aria-label="URL inválida">✗</span>
          )}
        </div>

        <p id="url-help" className="url-help">
          {urlValid === false && (
            <span className="error-text">
              Ingresá una URL válida de YouTube o Vimeo
            </span>
          )}
          {!urlValid && (
            <span>
              Ejemplo: https://www.youtube.com/watch?v=abcd1234 o https://vimeo.com/123456789
            </span>
          )}
        </p>

        <div className="platform-icons" aria-label="Plataformas soportadas">
          <div className="platform-badge">
            <span role="img" aria-label="YouTube">📺</span>
            <span>YouTube</span>
          </div>
          <div className="platform-badge">
            <span role="img" aria-label="Vimeo">🎬</span>
            <span>Vimeo</span>
          </div>
        </div>

        <button
          type="submit"
          className="btn-placa btn-lg submit-button"
          disabled={!urlValid}
          aria-label="Comenzar transcripción del video"
        >
          Transcribir video
        </button>
      </form>
    </div>
  )
}

export default UrlInput


