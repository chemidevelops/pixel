#!/usr/bin/env python3
"""
Genera la versión de impresión del fanzine (imposición en cuadernillo).
Entrada:  PDF digital A5 (páginas individuales)
Salida:   PDF A4 apaisado con pares de páginas en orden de cuadernillo

Uso: python3 impose.py numero-1-digital.pdf numero-1-print.pdf
"""

import sys
from pypdf import PdfWriter, PdfReader, Transformation
from pypdf.generic import ArrayObject, FloatObject, NameObject

def impose(input_path, output_path):
    reader = PdfReader(input_path)
    n = len(reader.pages)

    # Rellenar hasta múltiplo de 4 con páginas en blanco
    while n % 4 != 0:
        n += 1

    # Orden de cuadernillo para n páginas
    order = []
    lo, hi = 0, n - 1
    while lo < hi:
        order.append((hi, lo))   # [back, front] -> izquierda=back, derecha=front
        lo += 1
        hi -= 1
        order.append((lo, hi))   # izquierda=front interior, derecha=back interior
        lo += 1
        hi -= 1

    writer = PdfWriter()

    # Tamaño A5 de las páginas fuente
    first = reader.pages[0]
    a5_w = float(first.mediabox.width)
    a5_h = float(first.mediabox.height)
    a4_w = a5_w * 2
    a4_h = a5_h

    def get_page(idx):
        if idx < len(reader.pages):
            return reader.pages[idx]
        return None

    for left_idx, right_idx in order:
        page = writer.add_blank_page(width=a4_w, height=a4_h)

        for idx, x_offset in [(left_idx, 0), (right_idx, a5_w)]:
            src = get_page(idx)
            if src is None:
                continue
            page.merge_transformed_page(
                src,
                Transformation().translate(x_offset, 0)
            )

    writer.write(output_path)
    print(f"Print PDF: {output_path} ({len(order)} hojas A4)")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Uso: impose.py <digital.pdf> <print.pdf>")
        sys.exit(1)
    impose(sys.argv[1], sys.argv[2])
