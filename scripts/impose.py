#!/usr/bin/env python3
"""
Imposición en cuadernillo para PIXEL fanzine.

Toma el PDF digital (A5, páginas sueltas) y genera un PDF A4 apaisado
listo para imprimir doble cara y doblar/grapar.

Estructura del digital PDF:
  página 0       = portada delantera
  páginas 1..N-2 = interior (índice + artículos)
  página N-1     = contraportada

Imposición resultante (cada página del print PDF es un A4 apaisado):
  Hoja 0 cara A:  [contraportada | portada]       ← exterior
  Hoja 0 cara B:  [p.2           | p.penúltima]   ← interior hoja 0
  Hoja 1 cara A:  [antepenúltima | p.3]
  ...

El total de páginas A5 debe ser múltiplo de 4.
Si no lo es, se insertan páginas en blanco ANTES de la contraportada.
"""

import sys
from pypdf import PdfWriter, PdfReader, Transformation, PageObject
from pypdf.generic import RectangleObject

def blank_page(width, height):
    page = PageObject.create_blank_page(width=width, height=height)
    return page

def impose(input_path, output_path):
    reader = PdfReader(input_path)
    pages = list(reader.pages)

    a5_w = float(pages[0].mediabox.width)
    a5_h = float(pages[0].mediabox.height)

    # Separar portada, interior, contraportada
    front_cover = pages[0]
    back_cover  = pages[-1]
    interior    = pages[1:-1]

    # Rellenar interior con blancos hasta que total sea múltiplo de 4
    total = 2 + len(interior)  # portada + interior + contraportada
    while total % 4 != 0:
        interior.append(None)  # None = página en blanco
        total += 1

    # Secuencia final de páginas A5 (índice 0-based)
    seq = [front_cover] + interior + [back_cover]
    n = len(seq)  # múltiplo de 4

    # Orden de impresión: pares de hojas A4
    # Hoja i cara A (front): página[n-1-2i] izq  +  página[2i] dcha
    # Hoja i cara B (back):  página[2i+1]  izq   +  página[n-2-2i] dcha
    num_sheets = n // 4
    spreads = []
    for i in range(num_sheets):
        spreads.append((seq[n - 1 - 2*i], seq[2*i]))        # cara A
        spreads.append((seq[2*i + 1],     seq[n - 2 - 2*i])) # cara B

    writer = PdfWriter()
    a4_w = a5_w * 2
    a4_h = a5_h

    for left_src, right_src in spreads:
        spread = writer.add_blank_page(width=a4_w, height=a4_h)
        for src, x_off in [(left_src, 0), (right_src, a5_w)]:
            if src is None:
                continue
            spread.merge_transformed_page(
                src,
                Transformation().translate(x_off, 0)
            )

    writer.write(output_path)
    print(f"Print PDF: {output_path} ({num_sheets} hojas A4, {n} páginas A5)")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Uso: impose.py <digital.pdf> <print.pdf>")
        sys.exit(1)
    impose(sys.argv[1], sys.argv[2])
