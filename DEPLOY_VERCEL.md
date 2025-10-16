# 🚀 Deploy en Vercel - Textorcista

## Por qué Vercel en lugar de Netlify

- ✅ **Mejor logging**: Logs en tiempo real fáciles de ver
- ✅ **Sin límites de logs**: Vercel gratis muestra todos los logs
- ✅ **Timeout más largo**: 10s (Hobby) / 60s (Pro)
- ✅ **Mejor debugging**: Consola más clara y accesible

---

## 📋 **Deploy rápido**

### **1. Conectar con GitHub**

1. Andá a: **https://vercel.com**
2. Clic en **"Add New..."** → **"Project"**
3. Importá el repositorio: **`Ravettini/desgrabador-textorcista`**
4. Clic en **"Import"**

### **2. Configuración (auto-detectada)**

Vercel detectará automáticamente:
- ✅ Framework: **Vite**
- ✅ Build Command: `npm run build` (desde package.json)
- ✅ Output Directory: `dist`
- ✅ Install Command: `npm install`

**No cambies nada**, solo clic en **"Deploy"**

### **3. Variables de entorno (OPCIONAL)**

Si querés más de 50 transcripciones/mes:

1. Durante el deploy, en **"Environment Variables"**
2. Agregá:
   - **Name**: `REPLICATE_API_TOKEN`
   - **Value**: `r8_...` (tu token de https://replicate.com)
3. O dejalo vacío para usar el límite gratis

### **4. Deploy**

1. Clic en **"Deploy"**
2. Esperá **1-2 minutos**
3. ✅ Tu app estará en: `https://tu-proyecto.vercel.app`

---

## 🔍 **Ver logs en Vercel (súper fácil)**

### **Durante el deploy:**
1. Verás los logs de build en tiempo real
2. Si falla, te muestra exactamente dónde

### **En producción (Functions):**
1. Vercel Dashboard → Tu proyecto
2. **Functions** tab
3. Clic en cualquier invocación
4. **Ver logs completos** con todos los `console.log`

Mucho más fácil que Netlify gratis! 🎉

---

## 🆚 **Vercel vs Netlify**

| Característica | Netlify Gratis | Vercel Gratis |
|----------------|----------------|---------------|
| **Logs de Functions** | ❌ Limitados | ✅ Completos |
| **Consola accesible** | ❌ Difícil | ✅ Fácil |
| **Function timeout** | 10s | 10s (Hobby) / 60s (Pro) |
| **Bandwidth** | 100GB/mes | 100GB/mes |
| **Builds** | 300 min/mes | 6000 min/mes |
| **Deploy automático** | ✅ Sí | ✅ Sí |

**Vercel es mejor para debugging** ✅

---

## 📝 **Estructura para Vercel**

```
textorcista/
├── api/                    ← Vercel Serverless Functions
│   ├── transcribe.js       ← API de transcripción
│   └── package.json        ← Dependencias de la API
├── src/                    ← Frontend React
├── dist/                   ← Build output
├── vercel.json             ← Config de Vercel
└── package.json            ← Dependencias del frontend
```

---

## 🧪 **Después del deploy**

### **Ver logs en tiempo real:**
1. Deploy exitoso → Abrí tu app
2. Probá subir un archivo
3. Vercel Dashboard → **Functions** → Ver logs
4. **Todos los console.log visibles** ✅

### **Debugging fácil:**
```javascript
// En api/transcribe.js
console.log('Estado:', variable)
// Inmediatamente visible en Vercel Dashboard
```

---

## 🚀 **Ventajas adicionales de Vercel**

- ✅ **Preview deploys**: Cada push a branch = URL de preview
- ✅ **Edge Functions**: Más rápido (opcional)
- ✅ **Analytics**: Vercel Analytics gratis
- ✅ **CLI mejor**: `vercel dev` funciona perfecto
- ✅ **Integración GitHub**: Comentarios en PRs

---

## ⚡ **Deploy desde CLI (opcional)**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy a producción
vercel --prod
```

---

## 🎯 **Próximos pasos**

1. **Importá el repo en Vercel** (1 minuto)
2. **Deploy automático** (2 minutos)
3. **Probá la app** con archivos
4. **Revisá los logs** en el dashboard
5. **Debuggeá el error 500** viendo exactamente qué falla

---

¿Querés que te ayude con algún paso específico del deploy en Vercel? 🚀

