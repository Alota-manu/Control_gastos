# Configurar Supabase

1. Crea un proyecto en Supabase.
2. Entra a SQL Editor y ejecuta el contenido de `supabase-schema.sql`.
3. En Project Settings > API copia:
   - Project URL
   - anon public key
4. Abre `supabase-config.js` y pega esos valores:

```js
window.CONTROL_GASTOS_SUPABASE = {
  url: "https://TU-PROYECTO.supabase.co",
  anonKey: "TU_ANON_PUBLIC_KEY",
};
```

5. Abre la app, crea una cuenta o inicia sesion.
6. Si no hay datos en la nube, la app sube tus datos locales actuales.

La app sigue funcionando en modo local si `supabase-config.js` queda vacio.
