#!/usr/bin/env python3
"""
Vectoriza el wordmark de Puzzle AI (logos/puzzle-ai.png) a logos/puzzle-ai.svg, sin cambiar su forma ni sus proporciones.
El PNG sale del brochure en baja resolución; en SVG se ve nítido a cualquier tamaño y toma el color con currentColor.

    pip install pillow numpy potracer
    python tools/puzzle_svg.py

Si llega el logo oficial de Puzzle AI en SVG, reemplazar logos/puzzle-ai.svg por ese archivo (con fill="currentColor").
"""
import os
import numpy as np
import potrace
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
a = Image.open(os.path.join(ROOT, 'logos', 'puzzle-ai.png')).convert('RGBA').getchannel('A')
a = a.crop(a.point(lambda v: 255 if v > 8 else 0).getbbox())
S, P = 10, 20                                    # escala uniforme (no deforma) y margen para el trazado
big = a.resize((a.width * S, a.height * S), Image.LANCZOS)
arr = np.zeros((big.height + 2 * P, big.width + 2 * P), bool)
arr[P:-P, P:-P] = np.array(big) > 127
path = potrace.Bitmap(arr).trace(turdsize=20, alphamax=1.0, opticurve=True, opttolerance=0.2)
f = lambda p: '%.1f,%.1f' % (p.x - P, p.y - P)
d = []
for c in path:
    xs = [s.end_point.x for s in c.segments]
    if min(xs) < 1 and max(xs) > arr.shape[1] - 2:
        continue                                 # marco exterior del bitmap
    d.append('M' + f(c.start_point))
    for s in c.segments:
        d.append(('L' + f(s.c) + 'L' + f(s.end_point)) if s.is_corner else ('C' + f(s.c1) + ' ' + f(s.c2) + ' ' + f(s.end_point)))
    d.append('Z')
svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" role="img" aria-label="Puzzle AI">'
       '<path fill="currentColor" fill-rule="evenodd" d="%s"/></svg>') % (big.width, big.height, ''.join(d))
open(os.path.join(ROOT, 'logos', 'puzzle-ai.svg'), 'w').write(svg)
print('logos/puzzle-ai.svg', big.size)
