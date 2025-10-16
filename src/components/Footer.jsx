import './Footer.css'

function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-content">
        <div className="footer-left">
          <div className="footer-logo">
            <img 
              src="/logo-footer.png" 
              alt="Gobierno de la Ciudad de Buenos Aires"
              className="footer-logo-img"
            />
          </div>
          <div className="footer-text">
            <p className="footer-claim">Gobierno de la Ciudad de Buenos Aires</p>
            <p className="footer-subtitle">
              Herramienta de transcripción de audio/video<br/>
              Desarrollado por GO Observatorio y Datos
            </p>
          </div>
        </div>
        <div className="footer-right">
          <a 
            href="https://buenosaires.gob.ar" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
          >
            BA.gob.ar
          </a>
          <a 
            href="https://buenosaires.gob.ar/jefedegobierno/legalytecnica/normativa" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-link"
          >
            Normativa
          </a>
        </div>
      </div>
      <div className="footer-copyright">
        <p>
          © {new Date().getFullYear()} Gobierno de la Ciudad de Buenos Aires. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}

export default Footer


