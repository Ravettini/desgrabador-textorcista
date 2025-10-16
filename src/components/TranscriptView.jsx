import './TranscriptView.css'

function TranscriptView({ transcript, audioInfo, onReset }) {
  const handleDownload = () => {
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `transcripcion_${new Date().getTime()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="transcript-view">
      <div className="transcript-header card">
        <h2>✅ Transcripción completada</h2>
        {audioInfo && (
          <div className="audio-info">
            {audioInfo.duration && (
              <span className="info-badge">
                ⏱️ Duración: {audioInfo.duration}
              </span>
            )}
            {audioInfo.size && (
              <span className="info-badge">
                📦 Tamaño: {audioInfo.size}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="transcript-content card">
        <label htmlFor="transcript-text" className="transcript-label">
          Texto transcrito:
        </label>
        <div
          id="transcript-text"
          className="transcript-text"
          role="textbox"
          aria-readonly="true"
          aria-label="Transcripción del audio"
          tabIndex="0"
        >
          {transcript}
        </div>
        
        <div className="transcript-stats">
          <span>Palabras: {transcript.split(/\s+/).filter(Boolean).length}</span>
          <span>Caracteres: {transcript.length}</span>
        </div>
      </div>

      <div className="transcript-actions">
        <button
          className="btn-placa btn-lg download-button"
          onClick={handleDownload}
          aria-label="Descargar transcripción como archivo de texto"
        >
          Descargar transcripción (.txt)
        </button>
        <button
          className="btn-secondary btn-lg"
          onClick={onReset}
          aria-label="Realizar una nueva transcripción"
        >
          Nueva transcripción
        </button>
      </div>
    </div>
  )
}

export default TranscriptView


