# Control de gastos

App web personal para controlar ingresos, gastos, ahorros, tarjetas de credito y metas mensuales.

## Publicar en GitHub Pages

1. Crea un repositorio en GitHub.
2. Sube estos archivos:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `supabase-config.js`
3. En GitHub entra a `Settings > Pages`.
4. En `Build and deployment`, selecciona:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
5. Guarda y espera el link de GitHub Pages.
6. En Supabase, agrega ese link en:
   - `Authentication > URL Configuration > Site URL`
   - `Authentication > URL Configuration > Redirect URLs`

Supabase guarda los datos sincronizados. GitHub Pages solo publica la interfaz.
