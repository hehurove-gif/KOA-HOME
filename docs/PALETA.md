# Paleta de la landing (BrandBook KOA 2026)

El BrandBook **no define una paleta fija**: pide priorizar blanco y negro y que el color dependa del contexto ("KOA no se limita a una paleta estática"). Los valores de abajo se muestrearon de las páginas del BrandBook, así que son los colores que la marca usa en sus propios ejemplos, no códigos oficiales. Si el cliente tiene HEX/Pantone oficiales, se cambian solo en `:root` de `public/home/css/styles.css`.

| Uso | Token | HEX | Origen en el BrandBook |
|-----|-------|-----|------------------------|
| Rojo maestro (marca, CTA) | `--koa-red` | `#E20714` | Portada y logotipo maestro blanco |
| Negro de marca (fondo noche) | `--koa-black` | `#050503` | Páginas negras (logo y merch) |
| Blanco / papel (fondo día) | `--koa-white` / `--koa-paper` | `#FFFFFF` / `#F6F4F5` | Logotipo maestro negro, páginas claras |
| eSPORTS | `--es-blue`, `--es-coral`, `--es-periwinkle` | `#4C659D`, `#FF545B`, `#8198C5` | Página de eSPORTS y su tipografía |
| SPORTS | `--sp-yellow`, `--sp-lime`, `--sp-charcoal` | `#CAB834`, `#E5EE65`, `#393738` | Páginas de SPORTS (patín, palo de hockey) |
| WELLNESS | `--we-sand`, `--we-sage`, `--we-cream`, `--we-taupe` | `#AB9F7A`, `#A0A384`, `#ECE5D3`, `#9C8B71` | Páginas de Wellness |

Derivados: los grises del tema noche (`--gray-*`) son mezclas de negro de marca y carbón; los acentos de texto en tema claro (`#C8061A`, `#7A6E10`, `#7A6B4A`) son versiones más oscuras para cumplir contraste AA.

Criterio de diseño tomado del BrandBook: superficies planas, sin brillos, degradados ni cuadrículas decorativas; el color de cada unidad solo aparece donde esa unidad es protagonista.
Favicons: tema noche = logo blanco sobre `#050503`; tema día = logo negro sobre `#F6F4F5`.
