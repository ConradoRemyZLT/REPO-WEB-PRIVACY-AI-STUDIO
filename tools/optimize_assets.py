#!/usr/bin/env python3
"""
Regenera los recursos de la web desde las carpetas originales de Privacy AI Studio.

    python tools/optimize_assets.py "<ruta a Puzzle/Privacy AI Studio>"

Requisitos: Pillow, PyMuPDF (pip install pillow pymupdf) y ffmpeg en el PATH.

Qué hace (todo se escribe dentro del repo; los originales no se tocan):
  logos/      isologo claro y oscuro (PNG oficiales, solo se recorta el margen transparente),
              Puzzle AI e IALAB (extraídos del brochure, en blanco), y el .ai original en logos/original/
  graficos/   forma cromada y cinta de seda del universo gráfico (extraídas del brochure, WebP con alfa)
  premios/    laureles de los dos premios (sin el epígrafe: el texto va en HTML, en ES y EN)
  videos/     loop del hero (H.264, 1920 px, 60 fps interpolado, sin audio) + póster WebP
  brochures/  brochure general y one-pagers por sector (PDF tal cual)
  iconos/web/ favicon, ícono de iOS y Android, imagen para compartir (1200x630)

Reglas: nunca deformar (solo recortar / escalar proporcional), LANCZOS, PNG con alfa sin optimize=True.
"""
import os, sys, shutil, subprocess
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1] if len(sys.argv) > 1 else None
if not SRC or not os.path.isdir(SRC):
    sys.exit('Uso: python tools/optimize_assets.py "<ruta a Privacy AI Studio>"')

def out(*p):
    f = os.path.join(ROOT, *p)
    os.makedirs(os.path.dirname(f), exist_ok=True)
    return f

def trim(im, pad=0):
    im = ImageOps.exif_transpose(im).convert('RGBA')
    bb = im.split()[3].point(lambda v: 255 if v > 8 else 0).getbbox()
    im = im.crop(bb)
    if pad:
        c = Image.new('RGBA', (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
        c.paste(im, (pad, pad))
        im = c
    return im

def fit(im, maxside):
    if max(im.size) > maxside:
        r = maxside / max(im.size)
        im = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
    return im

def webp(im, dst, q=90):
    im.save(dst, 'WEBP', quality=q, method=6)
    print('  ', os.path.relpath(dst, ROOT), im.size, os.path.getsize(dst) // 1024, 'KB')

def png(im, dst):
    im.save(dst, 'PNG')  # sin optimize=True: no cuantizar a paleta
    print('  ', os.path.relpath(dst, ROOT), im.size, os.path.getsize(dst) // 1024, 'KB')

S = lambda *p: os.path.join(SRC, *p)
brochure = S('Brochure', '2026', 'Brochure Privacy AI Studio .pdf')

print('logos')
png(trim(Image.open(S('Logos', '16.png'))), out('logos', 'privacy-ai-studio-claro.png'))
png(trim(Image.open(S('Logos', '15.png'))), out('logos', 'privacy-ai-studio-oscuro.png'))
shutil.copy2(S('Logos', 'LOGO PRIVACY AI STUDIO.ai'), out('logos', 'original', 'LOGO PRIVACY AI STUDIO.ai'))

# Recursos que solo existen dentro del brochure de Canva (xref de cada imagen + su máscara)
import pymupdf as fitz
doc = fitz.open(brochure)
def pdf_img(xref):
    for page in doc:
        for it in page.get_images(full=True):
            if it[0] == xref:
                pix = fitz.Pixmap(doc, xref)
                if pix.n - pix.alpha > 3:
                    pix = fitz.Pixmap(fitz.csRGB, pix)
                if it[1]:
                    pix = fitz.Pixmap(pix, fitz.Pixmap(doc, it[1]))
                return Image.frombytes('RGBA' if pix.alpha else 'RGB', (pix.width, pix.height), pix.samples)
    raise SystemExit('No encontré la imagen %d en el brochure (¿cambió el PDF?)' % xref)

png(trim(pdf_img(34)), out('logos', 'puzzle-ai.png'))      # wordmark Puzzle AI (blanco); la web usa puzzle-ai.svg (tools/puzzle_svg.py)
png(trim(pdf_img(33)), out('logos', 'ialab-uba.png'))      # escudo UBA + IALAB (blanco)

print('graficos')
webp(fit(trim(pdf_img(504)), 1200), out('graficos', 'forma-cromada.webp'))
webp(fit(trim(pdf_img(598)), 1600), out('graficos', 'cinta-seda.webp'))

print('texturas claras (BrandBook)')
bb = fitz.open(S('Manual de marca', 'BrandBook Privacy AI Studio.pdf'))
def bb_img(xref):
    pix = fitz.Pixmap(bb, xref)
    if pix.n - pix.alpha > 3:
        pix = fitz.Pixmap(fitz.csRGB, pix)
    return Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
webp(bb_img(228), out('graficos', 'textura-seda-clara.webp'), q=78)            # página 9: seda clara
webp(fit(bb_img(234), 1400), out('graficos', 'textura-ondas-claras.webp'), q=78)  # página 10: ondas claras

print('premios')
# 1.png = Premio RIPD / AEPD 2025 · 2.png = 1° LatamDigital 2026. Se corta arriba del epígrafe.
for src, name, cut in (('1.png', 'premio-ripd-aepd-2025', 1881), ('2.png', 'premio-latamdigital-2026', 1865)):
    im = Image.open(S('Premios', src)).convert('RGBA')
    im = im.crop((0, 0, im.width, cut + 2))
    webp(fit(trim(im), 520), out('premios', name + '.webp'))

print('video')
mp4 = out('videos', 'fondo-hero.mp4')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', S('Fondos', 'fondo web 4k.mp4'), '-an',
                '-vf', 'scale=1920:-2:flags=lanczos,minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1',  # original 24 fps -> 60 fps
                '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21',
                '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4], check=True)
print('  ', os.path.relpath(mp4, ROOT), os.path.getsize(mp4) // 1024, 'KB')
poster = Image.open(S('Fondos', 'fondo web.png')).convert('RGB')
webp(fit(poster, 1920), out('videos', 'fondo-hero-poster.webp'), q=78)

print('brochures')
for src, dst in ((brochure, 'privacy-ai-studio-brochure-es.pdf'),
                 (S('OnePagers', '2026', 'One Pager - Poder Judicial- Privacy AI Studio  .pdf'), 'one-pager-poder-judicial.pdf'),
                 (S('OnePagers', '2026', 'One Pager - Estado- Privacy AI Studio .pdf'), 'one-pager-organismos-publicos.pdf'),
                 (S('OnePagers', '2026', 'One Pager - RRHH Privacy AI Studio .pdf'), 'one-pager-rrhh.pdf')):
    shutil.copy2(src, out('brochures', dst))
    print('  ', 'brochures/' + dst, os.path.getsize(out('brochures', dst)) // 1024, 'KB')

print('iconos')
NAVY = (2, 20, 68, 255)
shape = trim(pdf_img(504))
def icon(size, radius_ratio, dst):
    c = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    from PIL import ImageDraw
    m = Image.new('L', (size, size), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, size - 1, size - 1), radius=int(size * radius_ratio), fill=255)
    bg = Image.new('RGBA', (size, size), NAVY)
    s = shape.copy(); s.thumbnail((int(size * .78), int(size * .78)), Image.LANCZOS)
    bg.alpha_composite(s, ((size - s.width) // 2, (size - s.height) // 2))
    c.paste(bg, (0, 0), m)
    png(c, out('iconos', 'web', dst))
icon(32, .22, 'favicon-32.png')
icon(180, .0, 'apple-touch-icon-180.png')
icon(512, .22, 'icon-512.png')
og = poster.copy(); og = ImageOps.fit(og, (1200, 630), Image.LANCZOS, centering=(0.5, 0.5)).convert('RGBA')
logo = trim(Image.open(S('Logos', '16.png'))); logo.thumbnail((520, 520), Image.LANCZOS)
og.alpha_composite(logo, (90, (630 - logo.height) // 2))
og.convert('RGB').save(out('iconos', 'web', 'og-privacy-ai-studio.jpg'), 'JPEG', quality=86)
print('   iconos/web/og-privacy-ai-studio.jpg')
print('listo')
