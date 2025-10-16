# ⚡ Cómo Deployar en Vercel - Paso a Paso

## 🎯 **Por qué Vercel**
- ✅ **Ver logs completos**: Mucho más fácil que Netlify
- ✅ **Debugging**: Console.log visibles en tiempo real
- ✅ **Gratis**: Igual que Netlify pero con mejores herramientas

---

## 🚀 **Paso 1: Ir a Vercel**

1. Abrí: **https://vercel.com**
2. Clic en **"Continue with GitHub"** (o tu método preferido)
3. Autorizá a Vercel a acceder a tus repos

---

## 📦 **Paso 2: Importar el Proyecto**

1. Clic en **"Add New..."** (botón arriba a la derecha)
2. Seleccioná **"Project"**
3. Buscá el repo: **`Ravettini/desgrabador-textorcista`**
4. Clic en **"Import"**

---

## ⚙️ **Paso 3: Configuración**

### **Framework Preset:**
- Vercel detectará **Vite** automáticamente ✅

### **Build & Output Settings:**
- **Build Command**: `npm run build` (ya configurado) ✅
- **Output Directory**: `dist` ✅
- **Install Command**: `npm install` ✅

**No cambies nada, deja todo como está** ✅

### **Root Directory:**
- Deja en blanco (`.`) ✅

---

## 🔑 **Paso 4: Variables de Entorno (OPCIONAL)**

### **Opción A: Sin configurar nada (GRATIS)**
- ✅ ~50 transcripciones/mes gratis
- ✅ No necesitás agregar nada
- **Recomendado para empezar**

### **Opción B: Con token gratis de Replicate**
1. Durante el deploy, expandí **"Environment Variables"**
2. Agregá:
   - **Name**: `REPLICATE_API_TOKEN`
   - **Value**: `r8_...` (obtené en https://replicate.com/account/api-tokens)
   - **Environment**: Marcá todas (Production, Preview, Development)
3. ✅ ~500 transcripciones/mes gratis

---

## 🎉 **Paso 5: Deploy**

1. Clic en **"Deploy"**
2. **Esperá 2-3 minutos**
3. Verás el progreso en tiempo real:
   - Installing dependencies... ✅
   - Building... ✅
   - Deploying... ✅
4. Cuando termine: **"Congratulations!"** 🎉

---

## 🌐 **Paso 6: Tu App Está Viva**

### **URL de producción:**
```
https://desgrabador-textorcista.vercel.app
```
(o similar, Vercel te asignará una)

### **Probá la app:**
1. Clic en **"Visit"** para abrir tu app
2. Elegí **"Subir archivo"**
3. Arrastrá un archivo .mp3
4. Clic en **"Transcribir"**
5. ✅ **Debería funcionar**

---

## 🔍 **Paso 7: Ver Logs (EL MEJOR FEATURE)**

### **Si funciona:**
¡Genial! Ya está todo listo ✅

### **Si falla:**

1. Volvé al **Vercel Dashboard**
2. Clic en tu proyecto
3. Tab **"Functions"** en el menú lateral
4. Vas a ver todas las invocaciones de `/api/transcribe`
5. Clic en cualquier invocación
6. **Ver logs completos** con todos los `console.log`:
   ```
   === Iniciando handler de transcripción ===
   HTTP Method: POST
   Content-Type: multipart/form-data
   Replicate inicializado
   Parseando multipart/form-data...
   Archivo recibido: mi-audio.mp3
   ...
   ```

7. **Si hay error**, vas a ver exactamente dónde falla

---

## 🐛 **Debugging en Vercel (súper fácil)**

### **Ver error específico:**
```
Dashboard → Functions → transcribe → [última invocación]

Logs:
✅ "Iniciando handler..."
✅ "Replicate inicializado"  
✅ "Archivo recibido..."
❌ "Error en transcripción: [MENSAJE EXACTO]"
```

### **Ventaja vs Netlify:**
- Netlify gratis: Logs limitados, difícil de acceder
- **Vercel gratis: Todos los logs, fácil de ver** ✅

---

## 🔄 **Deploy automático**

Cada vez que hagas push a `main`:
1. Vercel detecta el cambio automáticamente
2. Hace build y deploy
3. Te notifica en GitHub (opcional)
4. **Nuevo deploy en ~2 minutos**

---

## 💡 **Tips de Vercel**

### **Preview Deploys:**
```bash
# Crear branch para testing
git checkout -b test-feature
git push origin test-feature

# Vercel crea URL de preview automáticamente
# https://desgrabador-textorcista-git-test-feature-ravettini.vercel.app
```

### **Vercel CLI (local):**
```bash
# Instalar
npm i -g vercel

# Correr Functions localmente
vercel dev

# Abre en: http://localhost:3000
# Functions funcionan igual que en producción
```

---

## 📊 **Monitoreo**

### **Analytics (gratis):**
1. Dashboard → **Analytics**
2. Ver visitas, performance, etc.

### **Logs (gratis):**
1. Dashboard → **Functions**
2. Ver todas las invocaciones
3. Filtrar por fecha, status code, etc.

---

## 🎯 **Checklist de Deploy**

- [ ] Ir a vercel.com
- [ ] Importar repo `Ravettini/desgrabador-textorcista`
- [ ] Dejar configuración por defecto
- [ ] (Opcional) Agregar `REPLICATE_API_TOKEN`
- [ ] Clic en "Deploy"
- [ ] Esperar 2-3 minutos
- [ ] Probar con archivo MP3
- [ ] Si falla: Ver logs en Functions tab

---

## 🎉 **¡Listo!**

**Próximo paso:** Andá a https://vercel.com e importá el proyecto.

En 5 minutos vas a tener:
- ✅ App deployada
- ✅ Logs completos visibles
- ✅ Debugging fácil
- ✅ Deploy automático en cada push

**¿Necesitás ayuda con algún paso?** 🚀

