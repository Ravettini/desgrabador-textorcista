# 🚀 Usar Google Colab como Backend de Transcripción

Esta es una solución alternativa y MÁS SIMPLE que usar Netlify Functions.

## 📋 Pasos para configurar:

### 1. Subir el notebook a Google Colab

1. Ve a [colab.research.google.com](https://colab.research.google.com)
2. **File → Upload notebook**
3. Selecciona `google_colab_api.ipynb` de este repositorio

### 2. Ejecutar el notebook

1. **Runtime → Run all** (o Ctrl+F9)
2. Espera a que se instalen las dependencias (~2 minutos)
3. Espera a que se cargue el modelo Whisper (~1 minuto)
4. **COPIA LA URL** que aparece (algo como `https://xxxx-xx-xx-xx-xx.ngrok-free.app`)

### 3. Actualizar tu aplicación

Agrega esta variable de entorno en Netlify:

- **Key:** `VITE_COLAB_API_URL`
- **Value:** `https://xxxx-xx-xx-xx-xx.ngrok-free.app` (la URL que copiaste)

### 4. Actualizar el código

El código ya está preparado para usar la variable de entorno. Solo necesitas:

```javascript
// En Uploader.jsx, cambiar:
const API_URL = import.meta.env.VITE_COLAB_API_URL || '/api/transcribe'
const response = await axios.post(`${API_URL}`, formData, { ... })
```

## ✅ Ventajas de usar Google Colab:

- ✅ **100% GRATIS** - GPU de Google incluida
- ✅ **MÁS RÁPIDO** - GPU acelera Whisper
- ✅ **MÁS CONFIABLE** - Sin límites de Replicate
- ✅ **FÁCIL DE DEBUGGEAR** - Logs visibles en Colab
- ✅ **SIN DEPENDENCIAS** - No necesitas configurar nada más

## ⚠️ Consideraciones:

- La URL de ngrok expira cada 2 horas (renovar ejecutando nuevamente)
- Google Colab desconecta después de 12 horas de inactividad
- Para producción 24/7, considera Colab Pro ($9.99/mes)

## 🎯 Uso en producción:

Para una solución más permanente:

1. **Google Colab Pro** ($9.99/mes) - Sesiones más largas
2. **Google Cloud Run** - Servicio serverless de Google
3. **Railway.app** - Deploy fácil de Python

## 🔧 Troubleshooting:

### Error: "Tunnel not found"
- Ejecuta nuevamente la celda del servidor

### Error: "ngrok not authenticated"
- Crea cuenta gratuita en [ngrok.com](https://ngrok.com)
- Obtén tu authtoken
- Agrega una celda con: `!ngrok authtoken TU_TOKEN`

### Error: "GPU not available"
- Runtime → Change runtime type → GPU

## 📝 Logs:

Todos los logs aparecen directamente en el notebook de Colab, puedes ver en tiempo real:
- Archivos recibidos
- Progreso de transcripción
- Errores si los hay

---

**¡Esta es la solución más simple y confiable para tu proyecto!** 🎉

