# Plan de pruebas — landing KOA HUB

Se ejecuta con `tests/run.js` (Playwright + Chromium) contra el Worker en local:

```bash
npx wrangler dev --port 8794 &
BASE_URL=http://localhost:8794/home/ NODE_PATH=$(npm root -g) node tests/run.js
```

Regla del proyecto: al terminar una fase se corre primero el plan de la fase anterior (sin cambiarlo) y luego el de la fase nueva.

## Fase 1 (sin cambios de criterio)
| ID | Prueba | Resultado 22-nov-2026 |
|----|--------|-----------------------|
| P1 | Carga sin errores de JS (oscuro, claro, móvil) | Pasa |
| P2 | Sin scroll horizontal en 1440, 820 y 390 px (ahora en es, en y ja) | Pasa |
| P3 | JS genera 3 tarjetas de fuerzas | Pasa |
| P4 | Un solo `h1`; todas las imágenes con `alt` y sin rotas | Pasa |
| P5 | El tema persiste al recargar y cambia el logo | Pasa |
| P6 | Todas las anclas internas existen | Pasa |
| P7 | Enlaces externos con `noopener`; eSPORTS → esports.koa-hub.com; sin `vercel` | Pasa |
| P8 | `prefers-reduced-motion` desactiva revelado y giro | Pasa |
| P9 | Sin JS se ve el `<noscript>` con 3 fuerzas | Pasa |
| P10 | Lighthouse móvil | Pendiente (requiere red) |
| P11 | Contenido ↔ KOA-dex | Parcial: ver `ANALISIS_LANDING.md` (hallazgos 1 y 2 siguen abiertos) |
| P12 | Rutas del Worker (200/404) y PDFs no publicados | Pasa |
| P13 | Encabezados de seguridad y caché | Pasa |

## Fase 2 (Bootstrap, idiomas, órbita, favicon)
| ID | Prueba | Resultado |
|----|--------|-----------|
| F2-1 | Bootstrap (grid + utilidades) cargado; `.row` es flex; hero en proporción 7/5 | Pasa |
| F2-2 | Grid responsive: 3/3/5 columnas en escritorio y 1/1/1 en móvil (fuerzas, pilares, valores) | Pasa |
| F2-3 | Diccionario completo: 130 claves × es/en/ja, sin claves huérfanas ni vacías | Pasa |
| F2-4 | El español del HTML (sin JS) coincide con el diccionario | Pasa |
| F2-5 | Selector de idioma: textos, `html[lang]`, título, `aria-pressed`, tarjetas generadas por JS y persistencia | Pasa |
| F2-6 | Frases de marca en inglés con `lang="en"`; la de SPORTS sigue al idioma | Pasa |
| F2-7 | El favicon cambia con el tema y persiste al recargar; los 6 archivos existen | Pasa |
| F2-8 | La órbita gira con el scroll: bajar 300 px ≈ +140°, subir 300 px ≈ −130° | Pasa |
| F2-9 | Móvil 390 px: idioma y tema visibles, sin solaparse ni desbordar | Pasa |
| F2-10 | Japonés: fuente CJK de respaldo y títulos sin recortar | Pasa |

## Fase 3 (redes con logo en el pie, estilo sitio eSPORTS)
| ID | Prueba | Resultado |
|----|--------|-----------|
| F3-1 | Lista "Síguenos" con Instagram, WhatsApp, TikTok y Discord (enlaces, `noopener`, textos es/en/ja, sin tarjetas antiguas ni claves sin traducir) | Pasa |
| F3-2 | Cada fila: recuadro de 34 px con esquinas cortadas e icono de 22 px | Pasa |
| F3-3 | Móvil 390 px: sin desbordar, "HUB" en una sola línea | Pasa |
| F3-4 | Cabecera móvil en japonés: "HUB" no se parte en letras | Pasa |
| F3-5 | Caché: CSS/JS con revalidación y misma versión `?v=` en HTML | Pasa |

Orden de ejecución al cerrar la Fase 3: Fase 1, Fase 2 y Fase 3 (26/26).

## Fase 4 (órbita fija con giro por scroll)
| ID | Prueba | Resultado |
|----|--------|-----------|
| F4-1 | Escritorio 1440×900: el hero no retiene el scroll (sin tramo fijo); la órbita gira al bajar y al revés al subir | Pasa |
| F4-2 | La cinta de palabras avanza al bajar, regresa al subir y no usa la animación CSS cuando hay JS | Pasa |
| F4-3 | Con "reducir movimiento": órbita y cinta no se mueven solas, pero sí con el scroll | Pasa |
| F4-4 | Los bloques entran ligados al scroll (`--enter` sube al bajar y baja al subir) y al final quedan visibles | Pasa |

Orden de ejecución al cerrar la Fase 4: Fases 1, 2, 3 y 4 (30/30).

## No cubierto
- Lighthouse / rendimiento y comprobación de que los destinos externos responden (sin red en el entorno).
- Safari y Firefox. En particular, Safari actualiza el favicon de forma menos fiable que Chrome/Firefox.
- Revisión de la traducción al japonés por una persona nativa.
