# 🎧 Textorcista - Desgrabador de Audio/Video a Texto

Webapp moderna del Gobierno de la Ciudad de Buenos Aires para transcribir audio y video a texto usando OpenAI Whisper.

## ✨ Características

- 📁 **Subida de archivos**: Soporta `.mp3` y `.mp4` (hasta 100MB)
- 🔗 **Links de video**: YouTube y Vimeo (máximo 5 minutos por límites de Netlify)
- 🎬 **Extracción de audio**: Procesamiento en navegador con FFmpeg WebAssembly
- ✍️ **Transcripción**: Whisper (modelo "small") vía Replicate - **GRATIS** hasta 500/mes
- 🎨 **Diseño GCBA**: Cumplimiento estricto del Manual de Marca
- ♿ **Accesible**: WCAG AA, focus visible, ARIA labels
- 📱 **Responsive**: Optimizado para móviles y desktop

## 🎨 Manual de Marca GCBA

Esta aplicación respeta estrictamente las directrices del Manual de Marca del GCBA:

### Paleta de colores
- **Amarillo** `#FFCC00`: Placas y CTAs principales
- **Cyan** `#8DE2D6`: Elementos secundarios
- **Azul oscuro** `#153244`: Texto y logos
- **Gris** `#3C3C3B`: Texto secundario
- **Off-white** `#FCFCFC`: Fondos

### Tipografía
- Familia principal: **Archivo** (Bold/Medium/Regular)
- Jerarquía: Titular > Bajada (50%) > Cuerpo (50%)
- Fallback: Arial, Montserrat

### Elementos visuales
- **Placas amarillas**: Border-radius de 25% del alto
- **Márgenes señalética**: 5% horizontal, 10% vertical
- **Logo BA**: Azul oscuro sobre amarillo, sin mezclar con Escudo
- **Iconografía**: Puntas redondeadas, combinaciones cyan/azul

## 🚀 Deploy en Netlify

### Requisitos previos

- Cuenta de [Netlify](https://netlify.com) (gratuita)
- **OPCIONAL**: Token de [Replicate](https://replicate.com) (gratis, solo para más uso)
- Node.js 18+ (solo para desarrollo local)

### Variables de entorno

**Opcional**: Para más uso, configurá un token de Replicate en Netlify:

```
REPLICATE_API_TOKEN=r8_...
```

**Nota**: La app funciona **gratis sin configurar nada**, usando el límite gratuito de Replicate. Solo necesitás token si vas a hacer muchas transcripciones.

### Deploy automático

1. **Conectar repositorio**:
   - Importá el repositorio en Netlify
   - Build command: `npm install && cd netlify/functions && npm install && cd ../.. && npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

2. **Configurar variable de entorno**:
   - Agregá `OPENAI_API_KEY` con tu clave de OpenAI

3. **Deploy**:
   - Netlify construirá y desplegará automáticamente

### Deploy manual

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

## 💻 Desarrollo local

### Instalación

```bash
# Instalar dependencias del frontend
npm install

# Instalar dependencias de las functions
cd netlify/functions
npm install
cd ../..
```

### Variables de entorno locales

Creá un archivo `.env` en la raíz:

```env
OPENAI_API_KEY=sk-...
```

### Ejecutar en desarrollo

```bash
# Instalar Netlify CLI (si no lo tenés)
npm install -g netlify-cli

# Iniciar dev server con functions
netlify dev
```

La aplicación estará disponible en `http://localhost:8888`

### Solo frontend (sin functions)

```bash
npm start
```

Disponible en `http://localhost:3000` (necesitarás un backend separado)

## 📦 Estructura del proyecto

```
textorcista/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Cabecera con logo BA
│   │   ├── MethodPicker.jsx    # Selector upload/URL
│   │   ├── Uploader.jsx        # Carga de archivos + FFmpeg
│   │   ├── UrlInput.jsx        # Input para YouTube/Vimeo
│   │   ├── Progress.jsx        # Barra de progreso
│   │   ├── TranscriptView.jsx  # Resultado y descarga
│   │   └── Footer.jsx          # Footer con firma BA
│   ├── App.jsx                 # Componente principal
│   ├── main.jsx                # Entry point
│   └── index.css               # Theme GCBA
├── netlify/
│   └── functions/
│       ├── transcribe.js       # API Whisper + ytdl + Vimeo
│       └── package.json
├── index.html
├── vite.config.js
├── netlify.toml                # Config Netlify
├── package.json
└── README.md
```

## 🔧 Tecnologías

### Frontend
- **React** 18: UI components
- **Vite**: Build tool y dev server
- **@ffmpeg/ffmpeg**: Extracción de audio en navegador (WASM)
- **Axios**: Cliente HTTP
- **Zod**: Validación de datos

### Backend (Netlify Functions)
- **Node.js** 18
- **Replicate SDK**: Whisper model (small) - mismo que Colab
- **ytdl-core**: Descarga de YouTube
- **Busboy**: Parseo multipart/form-data
- **node-fetch**: HTTP cliente para Vimeo

## 🎯 Flujo de uso

1. **Selección de método**:
   - Subir archivo local (.mp3/.mp4)
   - Pegar link (YouTube/Vimeo)

2. **Procesamiento**:
   - **MP4**: Extracción de audio en el navegador con FFmpeg WASM
   - **URL**: Descarga de audio en Netlify Function
   - Validación de tamaño y formato

3. **Transcripción**:
   - Envío a OpenAI Whisper API
   - Idioma: Español (es)
   - Estados: Descargando → Extrayendo → Transcribiendo → Listo

4. **Resultado**:
   - Visualización del texto transcrito
   - Información: duración, tamaño, palabras, caracteres
   - Descarga como `.txt`

## ♿ Accesibilidad

- `lang="es-AR"` en HTML
- ARIA labels y roles apropiados
- Focus visible con outline GCBA cyan
- Contraste AA mínimo
- Soporte para `prefers-reduced-motion`
- Navegación por teclado completa
- Mensajes de estado con `aria-live`

## 📝 Notas de implementación

### FFmpeg en el navegador
- Usa `@ffmpeg/ffmpeg` v0.12+ (WebAssembly)
- Solo para extracción de MP4 → MP3 en cliente
- Evita binarios en serverless (compatible con Netlify)

### Límites de tamaño
- **Upload**: 100MB (límite del cliente)
- **Whisper API**: 25MB máximo por archivo
- Videos largos pueden necesitar chunk o compresión adicional

### YouTube y Vimeo
- **YouTube**: `ytdl-core` (solo audio, quality: lowestaudio)
- **Vimeo**: API pública de player config + descarga progresiva
- **Límite**: Videos de máximo 5 minutos (por timeout de Netlify)
- **Validación**: Se verifica la duración antes de descargar
- **Timeout**: 8 segundos para descarga (falla si tarda más)
- Verificar que los videos sean públicos

### Timeouts
- Netlify Functions: 10 segundos (gratis) / 26 segundos (Pro)
- Videos muy largos pueden exceder el límite
- Considerar implementar queue o background job para producción

## 🐛 Troubleshooting

### Error: "OPENAI_API_KEY no configurada"
- Verificá que la variable esté en Netlify Environment Variables
- Re-desplegá el sitio después de agregar la variable

### Error: "Error al cargar FFmpeg"
- Recargá la página
- Verificá conexión a internet (CDN de unpkg.com)
- Probá con otro navegador (Chrome/Edge recomendados)

### Transcripción tarda mucho
- Verificá el tamaño del archivo (archivos grandes tardan más)
- YouTube/Vimeo dependen de la velocidad de descarga
- Netlify Functions tienen timeout de 10s (gratis) o 26s (Pro)

### Video de YouTube/Vimeo no funciona
- Verificá que el video sea público
- Algunos videos tienen restricciones regionales
- Videos con DRM no son compatibles

## 📄 Licencia

Gobierno de la Ciudad de Buenos Aires - Uso oficial

## 👥 Contacto

Para consultas sobre el Manual de Marca GCBA, consultá la documentación oficial.

---

**Desarrollado con ❤️ respetando el Manual de Marca del GCBA**

