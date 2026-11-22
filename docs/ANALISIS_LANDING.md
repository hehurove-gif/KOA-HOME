# Análisis de la landing KOA HUB (Fase 1)

Fecha: 2026-11-22 · Alcance: `index.html`, `css/styles.css`, `js/main.js`, assets, `robots.txt`, `sitemap.xml`.
Método: lectura de código, render real con Chromium (Playwright) en 1440 px (oscuro/claro) y 390 px (móvil), y contraste del contenido contra el KOA-dex y el BrandBook. No se modificó ningún archivo del sitio.

## Resumen
Sitio estático (HTML + CSS + JS vanilla, sin build), bien estructurado y accesible. Los 3 renders cargan sin errores de JS, sin imágenes rotas, sin scroll horizontal y con las 3 tarjetas de "fuerzas" generadas. Los hallazgos son de contenido, SEO y pulido; ninguno bloquea publicar.

## Lo que está bien
- Semántica: 1 solo `h1`, `aria-labelledby` por sección, skip-link, `aria-label` en enlaces externos, `rel="noopener noreferrer"`.
- Tema claro/oscuro sin parpadeo (script inline en `<head>`), con `localStorage` protegido por `try/catch`.
- Respeta `prefers-reduced-motion` (revelado, paralaje y órbita).
- `<noscript>` con el contenido esencial.
- Contenido central fiel al KOA-dex: promesas por unidad ("momentos de conexión / superación / estados de transformación"), claims (*Play. Compete. Belong.*, *Tú después de tu límite.*, *Become More of You.*), "What we create" de Sports y Wellness, Return on Health, Modern Magic, Inner Balance, Train hard / Play smart / Stay human, "Las leyendas se sudan" y "Transforma. Supera. Conecta." (KOA HUB).
- Sin placeholders visibles; los pendientes están como comentarios HTML.

## Hallazgos
| # | Sev. | Hallazgo | Recomendación |
|---|------|----------|---------------|
| 1 | Alta | **Valores incompletos.** La sección dice "estos cinco valores", pero el KOA-dex define **siete**: Voluntad, Vitalidad, **Energía**, **Empoderamiento interno**, Evolución constante, Unión, Propósito. Faltan Energía y Empoderamiento interno. | Confirmar si es decisión editorial; si no, agregar los 2 valores y cambiar el texto a "siete". |
| 2 | Alta | **Afirmaciones de eSports sin fuente en el KOA-dex ni en los docs del proyecto:** "torneos rankeados en SuperMajor que suman al Top de México", "la entrada incluye alimentos y un precio pensado para que todos puedan jugar" y la cita "Llegas a jugar y te quedas por la gente". | Confirmar la fuente con el cliente. Si no existe, quitarlas (regla del proyecto: no inventar datos). |
| 3 | Media | **Tarjetas de valores con texto parafraseado.** Las definiciones de Voluntad, Vitalidad, etc. son resúmenes propios, no el texto del KOA-dex. Ej.: Evolución constante dice "sin buscar atajos ni compararse con nadie", que no aparece en el documento. | Usar la redacción del KOA-dex o validarla con el cliente. |
| 4 | Media | **Orden inconsistente.** El claim es Transforma (Wellness) · Supera (Sports) · Conecta (eSports), pero las secciones van Deporte · Gaming · Wellness / eSports · Sports · Wellness. Además "Deporte/Gaming" (pilares) vs. "eSPORTS/SPORTS" (resto) nombran lo mismo distinto. | Unificar nombres (usar los del BrandBook: eSPORTS, SPORTS, Wellness). El orden puede quedarse si es intencional. |
| 5 | Media | **SEO/compartir incompleto.** Sin Open Graph/Twitter Card, sin JSON-LD (Organization), sin `og:image`. `sitemap.xml` solo lista `/home/`. | Agregar OG/Twitter, imagen 1200×630 y JSON-LD. |
| 6 | Media | **Rutas dependientes del despliegue.** `canonical` y `sitemap` apuntan a `koa-hub.com/home/` pero los assets son relativos; solo funciona si el sitio se sirve dentro de `/home/`. Hoy `koa-hub.com/tickets/` es otro sitio (XHOCK). | Documentar el destino de despliegue (Cloudflare Worker con ruta `/home/`) y probar rutas en ese entorno. |
| 7 | Media | **PDFs de 30 MB en el repo sin uso.** `assets/docs/brandbook-koa.pdf` (23 MB) y `koa-dex.pdf` (7 MB) no están enlazados desde ningún archivo. Además son documentos internos, y quedarían públicos si se despliegan. | Sacarlos del repo/despliegue (o enlazarlos solo si el cliente quiere que sean públicos). |
| 8 | Media | **Enlace "KOA eSPORTS" provisional.** Apunta a `koasports.vercel.app` (el propio código lo marca como provisional). Se abre en pestaña nueva. | Cambiar a la URL final del dominio cuando exista. |
| 9 | Baja | **Contraste.** El rojo `#c62f33` sobre fondo oscuro da 3.45:1: pasa para texto grande/decorativo, no para texto pequeño (AA pide 4.5:1). El texto atenuado sí pasa (≥ 4.86:1 en ambos temas). | Verificar que el rojo no se use en texto pequeño; si se usa, aclararlo (hay `--pastel-red`). |
| 10 | Baja | **Fuentes externas** (Google Fonts) sin autohospedar: dependencia de terceros y trazabilidad de datos. En el entorno de prueba no cargaron (red restringida) y el sitio usó las fuentes de respaldo sin romperse. | Autohospedar Barlow Condensed y Manrope (woff2) si se quiere rendimiento/privacidad. |
| 11 | Baja | **`marquee` activo siempre** y 15 reglas con `font-size` < 0.7rem (etiquetas muy pequeñas en móvil). | Revisar legibilidad móvil; pausar marquee en reduced-motion si no está. |
| 12 | Baja | **Sin favicon `.ico` ni `manifest`**; el año del pie depende de JS (sin JS queda vacío). | Opcional: `favicon.ico` y año estático de respaldo. |
| 13 | Info | El tagline y claims en inglés están marcados con `lang="en"` (correcto). El logo cambia a negro en tema claro vía `data-logo-*`. | — |

## Limitaciones de esta revisión
- Lighthouse/PageSpeed no se ejecutó (sin acceso a red externa en el entorno); las métricas de rendimiento quedan pendientes.
- No se probó en Safari/Firefox, solo Chromium.
- No se pudo verificar el sitio publicado, solo los archivos entregados.

## Plan de pruebas — Fase 1 (a reutilizar en Fase 2)
| ID | Prueba | Resultado esperado | Estado (22-nov-2026, Chromium) |
|----|--------|--------------------|---------------------|
| P1 | Carga sin errores de JS ni imágenes rotas (oscuro, claro, móvil) | 0 `pageerror`, 0 imágenes rotas | Pasa (solo falló Google Fonts por red del entorno) |
| P2 | Sin scroll horizontal en 1440 y 390 px | `scrollWidth == clientWidth` | Pasa |
| P3 | JS genera 3 tarjetas en `#fuerzas-lista` | 3 `.unit-card` | Pasa |
| P4 | Un solo `h1`; todas las imágenes con `alt` | 1 / 0 sin alt | Pasa |
| P5 | Cambio de tema persiste tras recargar | `data-theme` y logo coinciden | Pendiente (manual/automatizar) |
| P6 | Anclas del menú y footer llevan a su sección | 7 anclas válidas | Pendiente |
| P7 | Enlaces externos abren con `noopener` y responden 200 | Todos válidos | Pendiente (requiere red) |
| P8 | `prefers-reduced-motion` desactiva animaciones | Sin órbita/paralaje | Pendiente |
| P9 | Sin JS: se ve el `<noscript>` | Resumen de 3 fuerzas | Pendiente |
| P10 | Lighthouse móvil ≥ 90 en Performance/A11y/SEO | Reporte adjunto | Pendiente (requiere red) |
| P11 | Contenido ↔ KOA-dex (hallazgos 1–3) | Sin afirmaciones sin fuente | **Falla** hasta resolver 1–3 |
