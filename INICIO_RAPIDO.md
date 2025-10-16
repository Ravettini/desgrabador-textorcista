# 🚀 Inicio Rápido - Textorcista GCBA

Guía express para poner en marcha la aplicación en 5 minutos.

## ⚡ Setup en 3 pasos

### 1️⃣ Instalar dependencias

```bash
# Dependencias del frontend
npm install

# Dependencias de las Netlify Functions
cd netlify/functions
npm install
cd ../..
```

### 2️⃣ Configurar variables de entorno (OPCIONAL)

**La app funciona gratis sin configurar nada** ✅

Si querés hacer muchas transcripciones, podés obtener un token gratis de Replicate:

```bash
# Windows (PowerShell)
Copy-Item env.example .env

# macOS/Linux
cp env.example .env
```

Editá `.env` y agregá tu token (opcional):

```env
REPLICATE_API_TOKEN=r8_tu-token-aqui
```

> 💡 **Obtener token gratis**: https://replicate.com/account/api-tokens

### 3️⃣ Ejecutar en desarrollo

```bash
# Opción A: Con Netlify Dev (recomendado - incluye functions)
npx netlify-cli dev

# Opción B: Solo frontend (sin transcripción)
npm start
```

Abrí tu navegador en: **http://localhost:8888** (Netlify Dev) o **http://localhost:3000** (solo frontend)

---

## 📦 Deploy a Netlify

### Método 1: Desde GitHub (Recomendado)

```bash
# 1. Crear repositorio en GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/textorcista.git
git push -u origin main

# 2. En Netlify:
# - Conectá tu repositorio
# - Agregá OPENAI_API_KEY en Environment Variables
# - Deploy automático ✅
```

### Método 2: Deploy manual

```bash
# 1. Instalar Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Deploy
netlify deploy --prod

# 4. Configurar variable
netlify env:set OPENAI_API_KEY "sk-tu-clave"
```

---

## ✅ Verificar funcionamiento

### Test básico
1. Abrí la aplicación
2. Seleccioná "Subir archivo"
3. Arrastrá un archivo `.mp3` de prueba (< 1 minuto)
4. Esperá la transcripción
5. Descargá el `.txt`

### Test completo
- [ ] Subir `.mp3` → Transcribe OK
- [ ] Subir `.mp4` → Extrae audio → Transcribe OK
- [ ] Pegar URL de YouTube → Transcribe OK
- [ ] Pegar URL de Vimeo → Transcribe OK
- [ ] Descargar `.txt` → Archivo descargado OK
- [ ] Responsive móvil → Se ve bien
- [ ] Colores GCBA → Correctos

---

## 🐛 Problemas comunes

### "Error de transcripción"
```bash
# La app funciona SIN configurar nada
# Si tenés rate limit, obtené un token gratis en replicate.com
# Agregá REPLICATE_API_TOKEN al .env
```

### "FFmpeg no carga"
```bash
# Recargá la página
# Probá en Chrome/Edge
# Verificá conexión a internet (descarga desde unpkg.com)
```

### "Function timeout"
```bash
# Videos muy largos pueden exceder 10s (plan gratis)
# Usá videos < 10 minutos
# O actualizá a Netlify Pro (timeout de 26s)
```

---

## 📚 Documentación completa

- **README.md**: Documentación técnica completa
- **DEPLOY_NETLIFY.md**: Guía detallada de deploy
- **MANUAL_MARCA_GCBA_CHECKLIST.md**: Validación de cumplimiento del manual

---

## 🎨 Manual de Marca GCBA

Esta app cumple estrictamente con:
- ✅ Paleta oficial: Amarillo `#FFCC00`, Cyan `#8DE2D6`, Azul `#153244`
- ✅ Tipografía: Archivo (Bold/Medium/Regular)
- ✅ Logo BA sin mezcla con Escudo
- ✅ Placas amarillas con border-radius 25% del alto
- ✅ Márgenes 5%/10% según señalética
- ✅ Accesibilidad WCAG AA

---

## 💡 Tips

### Desarrollo local
```bash
# Hot reload automático con Vite
npm start

# Ver logs de functions
netlify dev --live
```

### Producción
```bash
# Build local (verificar antes de deploy)
npm run build

# Preview del build
npm run preview
```

### Optimización
- Archivos MP4: Se procesan en el navegador (sin costo de servidor)
- URLs de video: Se descargan solo el audio (más rápido)
- Transcripciones: Gratis hasta ~500/mes con token de Replicate

---

## 📊 Costos estimados

### Netlify (Plan gratuito)
- ✅ Hosting: Gratis
- ✅ Functions: 125K invocaciones/mes gratis
- ✅ Bandwidth: 100GB/mes gratis

### OpenAI Whisper
- 💰 ~$0.006 por minuto de audio
- Ejemplo: 100 transcripciones de 5 min = $3 USD

---

## 🎉 ¡Listo!

Ya tenés tu desgrabador funcionando con:
- 🎤 Transcripción automática con Whisper
- 📱 Diseño GCBA responsive
- ♿ Totalmente accesible
- 🚀 Deploy en Netlify

**¿Dudas?** Consultá la documentación completa en `README.md`

