"""Rasterizes the icon variants into a preview sheet.

Pillow has no SVG renderer available here, so the same primitive list that
build-icons.mjs turns into SVG is drawn directly, at 8x supersampling.
"""
import json
import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
S = 8
SIZE = 64


def rgb(value):
    value = value.lstrip('#')
    return tuple(int(value[i:i + 2], 16) for i in (0, 2, 4))


def mix(a, b, t):
    t = max(0.0, min(1.0, t))
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def star_points(center, radius):
    cx, cy = center
    k = 0.24 * radius
    return [
        (cx, cy - radius), (cx + k, cy - k), (cx + radius, cy), (cx + k, cy + k),
        (cx, cy + radius), (cx - k, cy + k), (cx - radius, cy), (cx - k, cy - k),
    ]


def render(variant, size=256):
    canvas = Image.new('RGBA', (SIZE * S, SIZE * S), (0, 0, 0, 0))
    top, bottom = rgb(variant['from']), rgb(variant['to'])

    gradient = Image.new('RGBA', canvas.size)
    draw = ImageDraw.Draw(gradient)
    for y in range(canvas.size[1]):
        draw.line([(0, y), (canvas.size[0], y)], fill=mix(top, bottom, y / canvas.size[1] / 64 * 64) + (255,))

    mask = Image.new('L', canvas.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, canvas.size[0] - 1, canvas.size[1] - 1), radius=14 * S, fill=255)
    canvas.paste(gradient, (0, 0), mask)

    for shape in variant['shapes']:
        layer = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
        pen = ImageDraw.Draw(layer)
        if shape['fill'] == 'accent':
            color = rgb(variant['accent'])
        elif shape['fill'] == 'bg':
            color = mix(top, bottom, shape['c'][1] / 64)
        else:
            color = rgb(shape['fill'])
        if shape['t'] == 'rrect':
            x0, y0, x1, y1 = shape['box']
            pen.rounded_rectangle((x0 * S, y0 * S, x1 * S, y1 * S), radius=shape['r'] * S, fill=color + (255,))
        elif shape['t'] == 'circle':
            cx, cy = shape['c']
            r = shape['r'] * S
            pen.ellipse((cx * S - r, cy * S - r, cx * S + r, cy * S + r), fill=color + (255,))
        else:
            pen.polygon([(x * S, y * S) for x, y in star_points(shape['c'], shape['r'])], fill=color + (255,))
        alpha = shape.get('alpha', 1.0)
        if alpha < 1.0:
            layer.putalpha(layer.getchannel('A').point(lambda v: round(v * alpha)))
        canvas = Image.alpha_composite(canvas, layer)

    return canvas.resize((size, size), Image.LANCZOS)


def load_font(name, size):
    for path in (f'C:/Windows/Fonts/{name}', f'C:/Windows/Fonts/segoeui.ttf'):
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except OSError:
                continue
    return ImageFont.load_default()


def main():
    with open(os.path.join(HERE, 'variants.json'), encoding='utf-8') as handle:
        variants = json.load(handle)

    for variant in variants:
        render(variant, 256).save(os.path.join(HERE, f"option-{variant['id']}.png"))

    width, height = 1080, 400
    sheet = Image.new('RGB', (width, height), (18, 20, 26))
    draw = ImageDraw.Draw(sheet)
    title_font = load_font('segoeuib.ttf', 22)
    name_font = load_font('segoeuib.ttf', 16)
    note_font = load_font('segoeui.ttf', 13)
    small_font = load_font('segoeui.ttf', 11)
    draw.text((36, 28), 'Create Skills — варианты иконки', font=title_font, fill=(235, 238, 245))

    column = 340
    for index, variant in enumerate(variants):
        x = 36 + index * column
        big = render(variant, 96)
        sheet.paste(big, (x, 86), big)
        draw.text((x, 196), variant['title'], font=name_font, fill=(235, 238, 245))
        draw.text((x, 220), variant['note'], font=note_font, fill=(150, 158, 172))

        dark_chip = (x, 252, x + 200, 306)
        draw.rounded_rectangle(dark_chip, radius=10, fill=(27, 30, 36))
        icon32 = render(variant, 32)
        icon16 = render(variant, 16)
        sheet.paste(icon32, (x + 14, 263), icon32)
        sheet.paste(icon16, (x + 58, 271), icon16)
        draw.text((x + 88, 264), '32 px', font=small_font, fill=(150, 158, 172))
        draw.text((x + 88, 280), '16 px — сайдбар', font=small_font, fill=(110, 118, 132))

        light_chip = (x, 318, x + 200, 372)
        draw.rounded_rectangle(light_chip, radius=10, fill=(238, 240, 245))
        icon32_light = render(variant, 32)
        icon16_light = render(variant, 16)
        sheet.paste(icon32_light, (x + 14, 329), icon32_light)
        sheet.paste(icon16_light, (x + 58, 337), icon16_light)
        draw.text((x + 88, 330), '32 px', font=small_font, fill=(84, 92, 106))
        draw.text((x + 88, 346), 'светлая тема', font=small_font, fill=(120, 128, 142))

    sheet.save(os.path.join(HERE, 'preview.png'))
    print('preview.png written')


if __name__ == '__main__':
    main()
