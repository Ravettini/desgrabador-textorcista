# 🚀 Guía de Deploy en Netlify

## Paso a paso para deployar Textorcista en Netlify

### 1. Preparación previa

#### Requisitos
- Cuenta en [Netlify](https://app.netlify.com) (gratuita)
- **OPCIONAL**: Token de [Replicate](https://replicate.com) (gratis, solo para más uso)
- Repositorio en GitHub/GitLab (recomendado) o deploy manual

#### Obtener token de Replicate (OPCIONAL)
**La app funciona sin esto**, pero si querés hacer muchas transcripciones:

1. Ingresá a https://replicate.com
2. Creá una cuenta (gratis con GitHub)
3. Andá a https://replicate.com/account/api-tokens
4. Copiá el token (comienza con `r8_...`)

**Sin token**: ~50 transcripciones/mes gratis  
**Con token gratis**: ~500 transcripciones/mes gratis

### 2. Deploy desde repositorio Git (Recomendado)

#### A. Subir código a GitHub/GitLab
```bash
# Inicializar repositorio (si no lo hiciste)
git init
git add .
git commit -m "Initial commit: Textorcista GCBA"

# Conectar con GitHub
git remote add origin https://github.com/tu-usuario/textorcista.git
git push -u origin main
```

#### B. Conectar Netlify con el repositorio
1. Ingresá a https://app.netlify.com
2. Clic en "Add new site" → "Import an existing project"
3. Elegí tu proveedor Git (GitHub, GitLab, etc.)
4. Autorizá a Netlify a acceder a tus repositorios
5. Seleccioná el repositorio `textorcista`

#### C. Configurar Build Settings
Netlify debería detectar automáticamente la configuración desde `netlify.toml`, pero verificá:

```
Build command: npm install && cd netlify/functions && npm install && cd ../.. && npm run build
Publish directory: dist
Functions directory: netlify/functions
```

#### D. Configurar Variables de Entorno (OPCIONAL)

**Podés saltear este paso** - la app funciona sin configurar nada.

Si tenés un token de Replicate:
1. En la página de configuración del sitio, andá a "Site settings"
2. En el menú lateral, clic en "Environment variables"
3. Clic en "Add a variable"
4. Agregá:
   - **Key**: `REPLICATE_API_TOKEN`
   - **Value**: `r8_...` (tu token de Replicate)
   - **Scopes**: Marcá "Same value for all deploy contexts"
5. Clic en "Create variable"

#### E. Deploy
1. Clic en "Deploy site"
2. Netlify va a:
   - Instalar dependencias del frontend
   - Instalar dependencias de las functions
   - Construir la aplicación con Vite
   - Deployar automáticamente
3. Esperá 2-3 minutos

#### F. Verificar deploy
1. Netlify te dará una URL temporal: `https://random-name-123.netlify.app`
2. Abrí la URL y probá la aplicación
3. Si todo funciona, podés configurar un dominio personalizado

### 3. Deploy manual (sin Git)

#### A. Preparar build local
```bash
# Instalar dependencias
npm install
cd netlify/functions
npm install
cd ../..

# Crear build
npm run build
```

#### B. Deploy con Netlify CLI
```bash
# Instalar Netlify CLI globalmente
npm install -g netlify-cli

# Login en Netlify
netlify login

# Deploy (primera vez - draft)
netlify deploy

# Cuando funcione, deploy a producción
netlify deploy --prod
```

#### C. Configurar variables de entorno (OPCIONAL)
```bash
# Opcional: si tenés token de Replicate
netlify env:set REPLICATE_API_TOKEN "r8_tu-token-aqui"
```

### 4. Configuración de dominio personalizado (Opcional)

#### Usar dominio de Netlify
1. Site settings → Domain management
2. Clic en "Options" → "Edit site name"
3. Cambiá el nombre: `textorcista-gcba.netlify.app`

#### Usar dominio propio
1. Site settings → Domain management
2. Clic en "Add custom domain"
3. Ingresá tu dominio: `textorcista.buenosaires.gob.ar`
4. Seguí las instrucciones para configurar DNS

### 5. Verificación post-deploy

#### Checklist funcional
- [ ] La página carga correctamente
- [ ] El header muestra el logo BA y el título
- [ ] Se pueden seleccionar ambos métodos (Upload / URL)
- [ ] La subida de archivos funciona (.mp3 y .mp4)
- [ ] La validación de URLs de YouTube/Vimeo funciona
- [ ] La transcripción se completa correctamente
- [ ] Se puede descargar el archivo .txt
- [ ] Los colores GCBA se ven correctamente
- [ ] La tipografía Archivo se carga
- [ ] La aplicación es responsive en móvil

#### Checklist técnico
- [ ] No hay errores en la consola del navegador
- [ ] Las Netlify Functions responden correctamente
- [ ] El timeout de las functions es suficiente (verificar con videos largos)
- [ ] FFmpeg WASM carga correctamente

#### Probar funcionalidad
```bash
# Test 1: Subir archivo MP3 pequeño
# - Debería transcribir en ~10-30 segundos

# Test 2: Subir archivo MP4
# - Debería extraer audio en navegador
# - Luego transcribir

# Test 3: URL de YouTube
# - Ejemplo: https://www.youtube.com/watch?v=dQw4w9WgXcQ
# - Debería descargar y transcribir

# Test 4: URL de Vimeo
# - Ejemplo: https://vimeo.com/148751763
# - Debería descargar y transcribir
```

### 6. Monitoreo y logs

#### Ver logs de deploy
1. Deploys → Clic en el deploy actual
2. Ver "Deploy log" para errores de build

#### Ver logs de Functions
1. Functions → Clic en "transcribe"
2. Ver logs en tiempo real
3. Útil para debuggear errores de transcripción

#### Netlify Analytics (Opcional - Pago)
- Activá Analytics para ver:
  - Visitas
  - Tiempo de carga
  - Errores 4xx/5xx

### 7. Troubleshooting común

#### Error: "Build failed"
```bash
# Verificar que las dependencias se instalen correctamente
# Revisar el Deploy log en Netlify
# Común: falta Node 18+, verificar netlify.toml
```

#### Error: "Function invocation failed"
```bash
# Ver logs de la function en Netlify
# La app funciona SIN configurar variables (Replicate gratis)
# Si tenés rate limit, obtené token gratis en replicate.com
# Común: timeout (videos muy largos)
```

#### Error: "CORS"
```bash
# Las functions ya tienen CORS configurado
# Si persiste, verificar que la URL de la API sea correcta
# En producción: /api/transcribe
# En desarrollo local: http://localhost:8888/api/transcribe
```

#### FFmpeg no carga
```bash
# Verificar conexión a unpkg.com (CDN)
# Probar en otro navegador (Chrome/Edge)
# Verificar que no haya bloqueadores de contenido
```

### 8. Optimizaciones para producción

#### Performance
- Netlify automáticamente:
  - Minifica JS/CSS
  - Comprime assets
  - CDN global
  - HTTP/2

#### Mejorar tiempos de Function
```javascript
// Considera agregar timeout más largo si tenés plan Pro
// netlify.toml
[functions]
  node_bundler = "esbuild"
  
[functions.transcribe]
  timeout = 26  # Solo en plan Pro
```

#### Caché
- Assets estáticos ya tienen caché automático
- Las Functions no se cachean (correcto para transcripciones)

### 9. Costos y límites

#### Plan gratuito de Netlify
- ✅ 100 GB bandwidth/mes
- ✅ 300 minutos de build/mes
- ✅ Functions: 125,000 invocaciones/mes
- ⚠️ Function timeout: 10 segundos
- ⚠️ Function run time: 100 horas/mes

#### Límites de Replicate (Whisper)
- **Sin token**: ~50 transcripciones/mes GRATIS
- **Con token gratis**: ~500 transcripciones/mes GRATIS
- **Después del límite**: ~$0.0001 por segundo (~$0.006/minuto)
- Verificá precios actuales en: https://replicate.com/openai/whisper/versions

#### Estimación de costos
```
Ejemplo: 1000 transcripciones de 5 minutos cada una
- Netlify: Gratis (si estás bajo los límites)
- Replicate Whisper: 
  • Primeras 500 con token gratis: GRATIS
  • Restantes 500: 500 × 5 min × $0.006 = $15 USD/mes
  • Total: ~$15 USD/mes (vs $30 si todo fuera pago)
```

### 10. Mantenimiento

#### Actualizar dependencias
```bash
# Frontend
npm update

# Functions
cd netlify/functions
npm update
cd ../..

# Commit y push para re-deployar
git add .
git commit -m "chore: update dependencies"
git push
```

#### Monitorear uso de Replicate
1. Ingresá a https://replicate.com/account/billing
2. Verificá el consumo mensual (generalmente gratis)
3. Configurá límites de gasto si es necesario (solo si superás el plan gratis)

#### Backups
- Netlify guarda historial de deploys (rollback fácil)
- Mantené el código en Git (backup automático)
- Exportá transcripciones importantes

---

## 🎉 ¡Listo!

Tu aplicación Textorcista está deployada en Netlify con:
- ✅ UI moderna según Manual GCBA
- ✅ Transcripción con Whisper (modelo "small" vía Replicate)
- ✅ Soporte para archivos y URLs
- ✅ Responsive y accesible
- ✅ Deploy automático desde Git
- ✅ **GRATIS** sin configurar nada

**URL de ejemplo**: https://textorcista-gcba.netlify.app

### Soporte
- Documentación Netlify: https://docs.netlify.com
- Documentación Replicate: https://replicate.com/docs
- Manual de Marca GCBA: (consultar documentación oficial)

