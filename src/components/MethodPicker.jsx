import './MethodPicker.css'

function MethodPicker({ onSelectMethod }) {
  return (
    <div className="method-picker">
      <h2>¿Cómo querés ingresar el contenido?</h2>
      <p className="method-picker-subtitle">
        Elegí una de las siguientes opciones para comenzar
      </p>
      
      <div className="method-buttons">
        <button
          className="method-button btn-placa"
          onClick={() => onSelectMethod('upload')}
          aria-label="Subir archivo de audio o video desde tu dispositivo"
        >
          <span className="method-icon" aria-hidden="true">📁</span>
          <div className="method-text">
            <span className="method-title">Subir archivo</span>
            <span className="method-desc">.mp3 o .mp4</span>
          </div>
        </button>

        <button
          className="method-button btn-placa"
          onClick={() => onSelectMethod('url')}
          aria-label="Pegar enlace de video de YouTube o Vimeo"
        >
          <span className="method-icon" aria-hidden="true">🔗</span>
          <div className="method-text">
            <span className="method-title">Pegar link</span>
            <span className="method-desc">YouTube o Vimeo</span>
          </div>
        </button>
      </div>
    </div>
  )
}

export default MethodPicker


