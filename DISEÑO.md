# PIXEL — Documento de diseño

## Tipografía

- **Cuerpo:** Lora (serif). Elegante, legible, clásica de revista literaria.
- **UI / mono:** JetBrains Mono. Cabeceras, metadatos, etiquetas.
- **Tamaño base:** 18px (ajustable desde el panel de ajustes: 15 / 18 / 21px).

## Paleta

| Variable | Valor | Uso |
|---|---|---|
| `--bg` | `#f8f8f0` | Fondo principal (blanco Gwern — elegido) |
| `--text` | `#111111` | Texto principal |
| `--text-muted` | `#555555` | Metadatos, pies, UI secundaria |
| `--red` | `#cc0000` | Acento — subrayados, drop cap, badges |
| `--border` | `#d0ccc4` | Líneas y bordes |

### Alternativas de fondo consideradas

- **`#fff9d6`** — Amarillo cálido. Muy personal, recuerda al papel de cuaderno. Buena opción si se quiere diferenciarse más de otros blogs/revistas literarias. Quedó finalista.
- **`#faf8f3`** — Crema neutro. El original. Más cercano a papel envejecido.
- **`#f8f8f0`** — Blanco Gwern. Casi blanco con poquísimo amarillo. Limpio, serio, no cansa. **Elegido.**

## Links

Subrayado rojo grueso, inspirado en Anait Games pero con nuestro rojo `#cc0000`:

```css
text-decoration-color: var(--red);
text-decoration-thickness: 3.5px;
text-underline-offset: 2px;
```

## Imágenes

Todas en blanco y negro vía CSS (`filter: grayscale(100%)`). No se procesa el archivo original — es una decisión puramente visual que se puede revertir por artículo si hiciera falta.

## Estructura de página

- **Header:** `PIXEL.` + nav. Borde inferior discontinuo (`dashed`).
- **Footer:** RSS + Contacto. Borde superior discontinuo.
- **Panel ⚙:** Fijo en esquina inferior derecha. Modo oscuro + tamaño de fuente. Gira al pulsarse. Preferencias en `localStorage`.

### Modo oscuro

```css
--bg: #1a1917
--text: #e8e4dc
--text-muted: #888580
--border: #333128
```

## Artículos

- **Drop cap:** Primera letra del primer párrafo a 4.2em, flotada.
- **TOC sidebar:** Aparece automáticamente si el artículo tiene ≥ 2 secciones `##`. Solo visible en pantallas >980px. Título «ÍNDICE» en rojo.
- **Comillas:** Siempre españolas — « » para citas largas, ‹ › para citas dentro de citas.

## Fanzine

Artículos agrupados en números. Cada número se exporta a PDF A5 imprimible mediante Pandoc + LaTeX (pendiente de configurar). Los suscriptores reciben el PDF antes de la publicación general.
