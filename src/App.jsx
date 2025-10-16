import { useState } from 'react'
import Header from './components/Header'
import MethodPicker from './components/MethodPicker'
import Uploader from './components/Uploader'
import UrlInput from './components/UrlInput'
import Progress from './components/Progress'
import TranscriptView from './components/TranscriptView'
import Footer from './components/Footer'
import './App.css'

function App() {
  const [method, setMethod] = useState(null) // 'upload' | 'url'
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState({ stage: '', percent: 0 })
  const [transcript, setTranscript] = useState(null)
  const [error, setError] = useState(null)
  const [audioInfo, setAudioInfo] = useState(null)

  // Debug logs
  console.log('🔍 App State:', { method, processing, progress, transcript: !!transcript, error, audioInfo })

  const handleMethodSelect = (selectedMethod) => {
    console.log('🎯 Method selected:', selectedMethod)
    setMethod(selectedMethod)
    setTranscript(null)
    setError(null)
    setProgress({ stage: '', percent: 0 })
  }

  const handleReset = () => {
    console.log('🔄 Resetting app state')
    setMethod(null)
    setTranscript(null)
    setError(null)
    setProgress({ stage: '', percent: 0 })
    setProcessing(false)
    setAudioInfo(null)
  }

  const handleTranscriptComplete = (result) => {
    console.log('✅ Transcript completed:', { 
      textLength: result.text?.length, 
      duration: result.duration, 
      size: result.size 
    })
    setTranscript(result.text)
    setAudioInfo({
      duration: result.duration,
      size: result.size
    })
    setProcessing(false)
    setProgress({ stage: 'Listo ✅', percent: 100 })
  }

  const handleError = (err) => {
    console.error('❌ Error occurred:', err)
    setError(err)
    setProcessing(false)
    setProgress({ stage: '', percent: 0 })
  }

  return (
    <div className="app">
      <Header />
      
      <main className="main-content">
        <div className="container">
          {!method && !transcript && (
            <div className="hero-section">
              <h1 className="hero-title">Desgrabador de video o audio a texto</h1>
              <p className="hero-description">
                Cargá tu archivo de audio/video o pegá un link de YouTube/Vimeo y obtené 
                una transcripción automática usando inteligencia artificial.
              </p>
              <p className="hero-subtitle">
                Desarrollado por GO Observatorio y Datos
              </p>
            </div>
          )}
          
          {!method && !transcript && (
            <MethodPicker onSelectMethod={handleMethodSelect} />
          )}

          {method === 'upload' && !transcript && (
            <Uploader
              setProcessing={setProcessing}
              setProgress={setProgress}
              onComplete={handleTranscriptComplete}
              onError={handleError}
              onBack={handleReset}
            />
          )}

          {method === 'url' && !transcript && (
            <UrlInput
              setProcessing={setProcessing}
              setProgress={setProgress}
              onComplete={handleTranscriptComplete}
              onError={handleError}
              onBack={handleReset}
            />
          )}

          {processing && (
            <Progress stage={progress.stage} percent={progress.percent} />
          )}

          {error && (
            <div className="error-container card" role="alert" aria-live="assertive">
              <h3>⚠️ Error</h3>
              <p>{error}</p>
              <button className="btn-placa" onClick={handleReset}>
                Volver a intentar
              </button>
            </div>
          )}

          {transcript && (
            <TranscriptView
              transcript={transcript}
              audioInfo={audioInfo}
              onReset={handleReset}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default App


