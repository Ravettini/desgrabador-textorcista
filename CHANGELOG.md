# 📝 Changelog - Textorcista

## Versión 1.0.0 - Inicial

### ✨ Nueva webapp desde cero
Conversión completa del script de Google Colab a webapp moderna deployable en Netlify.

### 🎨 Diseño GCBA
- Paleta oficial: Amarillo #FFCC00, Cyan #8DE2D6, Azul #153244
- Tipografía Archivo (Bold/Medium/Regular)
- Placas con border-radius 25% del alto
- Márgenes 5%/10% según señalética
- Logo BA sin mezcla con Escudo
- Cumplimiento 98% del Manual de Marca

### 🧠 Transcripción
- Modelo: Whisper "small" (mismo que Colab)
- Provider: Replicate API
- Idioma: Español (es)
- Gratis: ~500 transcripciones/mes con token gratis
- Sin configuración: ~50 transcripciones/mes

### 📁 Entrada de contenido
- Upload de archivos: .mp3 y .mp4 (hasta 100MB)
- Drag & drop funcional
- URLs de YouTube (ytdl-core)
- URLs de Vimeo (API pública)
- Validación de formatos y tamaños

### 🎬 Procesamiento
- Extracción MP4→MP3 en navegador (@ffmpeg/ffmpeg WASM)
- Sin dependencias de binarios en servidor
- Compatible con Netlify Functions (Node 18)
- Timeout: 10s (gratis) / 26s (Pro)

### 📥 Salida
- Visualización de transcripción en pantalla
- Descarga como .txt
- Estadísticas: palabras, caracteres, duración, tamaño
- Nombre de archivo con timestamp

### ♿ Accesibilidad
- WCAG AA contraste completo
- ARIA labels y roles
- Focus visible con outline cyan
- lang="es-AR"
- Navegación por teclado
- Soporte prefers-reduced-motion

### 📱 Responsive
- Mobile-first design
- Breakpoint: 768px
- Optimizado para iPhone, iPad, Desktop
- Touch-friendly (botones grandes)

### 🚀 Deploy
- Netlify automático desde Git
- Build command configurado
- Functions en /netlify/functions
- Variables de entorno opcionales
- CDN global automático

### 📚 Documentación
- README.md completo
- INICIO_RAPIDO.md (5 minutos)
- DEPLOY_NETLIFY.md (paso a paso)
- MANUAL_MARCA_GCBA_CHECKLIST.md (validación)
- DIFERENCIAS_CON_COLAB.md (comparación técnica)

### 🔧 Stack técnico
**Frontend**:
- React 18
- Vite 5
- @ffmpeg/ffmpeg (WASM)
- Axios
- CSS puro con variables

**Backend**:
- Netlify Functions (Node 18)
- Replicate SDK
- ytdl-core
- Busboy
- node-fetch

### 💰 Costos
- Hosting Netlify: Gratis
- Functions: 125K/mes gratis
- Transcripciones: ~500/mes gratis con token Replicate
- Sin configuración: ~50/mes gratis

### 🐛 Conocidos
- Timeout de 10s puede ser corto para videos muy largos (>10 min)
- FFmpeg WASM requiere navegador moderno (Chrome/Edge/Firefox)
- Vimeo API puede fallar con videos privados o con DRM

---

## Próximas versiones (roadmap)

### v1.1.0 (Planeado)
- [ ] Chunking de archivos grandes (>25MB)
- [ ] Cola de procesamiento para múltiples archivos
- [ ] Formato SRT/VTT para subtítulos
- [ ] Timestamps en la transcripción
- [ ] Detección automática de idioma

### v1.2.0 (Futuro)
- [ ] Editor de transcripciones
- [ ] Exportar a Word/PDF
- [ ] Historial de transcripciones (localStorage)
- [ ] Dark mode (respetando paleta GCBA)
- [ ] PWA (offline support)

### v2.0.0 (Exploración)
- [ ] Modelo Whisper "medium" o "large" (mayor precisión)
- [ ] Múltiples idiomas
- [ ] Traducción automática
- [ ] Identificación de speakers (diarización)
- [ ] Backend propio (para independencia de Replicate)



