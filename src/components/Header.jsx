import './Header.css'

function Header() {
  return (
    <header className="header" role="banner">
      <div className="header-content">
        <div className="logo-container" aria-label="Gobierno de la Ciudad de Buenos Aires">
          <img 
            src="/logo-header.jfif" 
            alt="Observatorio y Datos"
            className="logo-ba"
          />
        </div>
        <div className="header-text">
          <h1 className="header-title">
            Desgrabador de video o audio a texto
          </h1>
          <p className="header-subtitle">
            GO Observatorio y Datos
          </p>
        </div>
        <div className="header-nav">
          <a href="#" className="nav-link">Transcribir</a>
          <a href="#" className="nav-link">Guía</a>
        </div>
      </div>
    </header>
  )
}

export default Header


