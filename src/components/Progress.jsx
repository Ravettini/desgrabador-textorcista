import './Progress.css'

function Progress({ stage, percent }) {
  return (
    <div className="progress-container card" role="status" aria-live="polite">
      <h3 className="progress-title">Procesando...</h3>
      
      <div className="progress-bar-container" aria-label="Barra de progreso">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
      
      <p className="progress-stage">
        {stage} {percent > 0 && `(${percent}%)`}
      </p>
      
      <div className="progress-spinner" aria-hidden="true">
        <div className="spinner"></div>
      </div>
    </div>
  )
}

export default Progress



