# 🐛 Debug: Error 404 en Vercel Functions

## ❌ **Problema actual:**
```
/api/transcribe:1 Failed to load resource: the server responded with a status of 404
```

## 🔍 **Diagnóstico paso a paso:**

### **1. Verificar que Vercel detecte las funciones**

**Esperá 2-3 minutos** para que Vercel redeploye, luego:

1. Ir a: https://vercel.com
2. Tu proyecto: **desgrabador-textorcista**
3. **Functions** tab (sidebar izquierdo)
4. **Deberías ver:**
   ```
   /api/test.js
   /api/transcribe.js
   ```

**Si NO ves las funciones:**
- ❌ Vercel no detecta la carpeta `/api`
- 🔧 Problema de configuración

**Si SÍ ves las funciones:**
- ✅ Configuración correcta
- 🔍 Problema en la función específica

---

### **2. Probar endpoint de test**

**URL de test:** `https://tu-app.vercel.app/api/test`

**Resultado esperado:**
```json
{
  "message": "API funcionando correctamente",
  "method": "GET",
  "url": "/api/test",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Si funciona:**
- ✅ Vercel detecta funciones correctamente
- 🔍 Problema específico en `/api/transcribe`

**Si falla con 404:**
- ❌ Vercel no detecta funciones
- 🔧 Problema de configuración

---

### **3. Verificar logs de deploy**

En Vercel Dashboard:

1. **Deployments** tab
2. Clic en el deploy más reciente
3. **Build Logs**
4. **Buscar:**
   ```
   Building Functions...
   /api/test.js
   /api/transcribe.js
   ```

**Si NO aparece "Building Functions":**
- ❌ Vercel no detecta la carpeta `/api`
- 🔧 Problema de configuración

---

## 🛠️ **Soluciones aplicadas:**

### **1. vercel.json corregido**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

### **2. Endpoint de test agregado**
- `/api/test.js` - Función simple para verificar que Vercel detecte las funciones

---

## 🧪 **Testing después del redeploy:**

### **Test 1: Verificar que Vercel detecte funciones**
```
1. Vercel Dashboard → Functions
2. ¿Aparecen /api/test.js y /api/transcribe.js?
```

### **Test 2: Probar endpoint de test**
```
1. Ir a: https://tu-app.vercel.app/api/test
2. ¿Devuelve JSON con mensaje?
```

### **Test 3: Probar transcripción**
```
1. App → Subir archivo MP3
2. ¿Sigue dando 404 o cambia el error?
```

---

## 🔍 **Posibles resultados:**

### **Escenario A: Vercel NO detecta funciones**
**Síntomas:**
- Functions tab vacío
- `/api/test` da 404
- Build logs sin "Building Functions"

**Solución:**
- Verificar que la carpeta `/api` esté en la raíz
- Verificar que `vercel.json` esté en la raíz
- Redeploy manual

### **Escenario B: Vercel SÍ detecta funciones**
**Síntomas:**
- Functions tab muestra `/api/test.js` y `/api/transcribe.js`
- `/api/test` funciona
- `/api/transcribe` da 404 o 500

**Solución:**
- Problema específico en la función de transcripción
- Ver logs de la función específica

### **Escenario C: Todo funciona**
**Síntomas:**
- `/api/test` funciona
- `/api/transcribe` funciona
- Transcripción exitosa

**Resultado:**
- ✅ Problema resuelto
- 🎉 App lista para usar

---

## 📋 **Checklist de debugging:**

- [ ] Esperar 2-3 minutos para redeploy
- [ ] Verificar Functions tab en Vercel
- [ ] Probar `/api/test` endpoint
- [ ] Ver build logs del deploy
- [ ] Probar transcripción
- [ ] Ver logs específicos si falla

---

## 🚨 **Si sigue fallando:**

### **Opción 1: Redeploy manual**
1. Vercel Dashboard → Deployments
2. Clic en "Redeploy" en el último deploy
3. Esperar que termine

### **Opción 2: Verificar estructura**
```
Tu repo debe tener:
├── api/
│   ├── test.js
│   ├── transcribe.js
│   └── package.json
├── vercel.json
├── package.json
└── src/
```

### **Opción 3: Logs de build**
1. Vercel Dashboard → Deployments
2. Clic en el deploy más reciente
3. **Build Logs**
4. Buscar errores en la sección de Functions

---

## 💡 **Próximos pasos:**

1. **Esperar redeploy** (2-3 minutos)
2. **Verificar Functions tab** en Vercel
3. **Probar `/api/test`** endpoint
4. **Decirme qué ves** en cada paso

**Con esta información podré identificar exactamente dónde está el problema!** 🔍
