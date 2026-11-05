"""Renders the sidebar line glyph for the chosen puzzle icon.

Draws the same 24x24 geometry the client component uses, so the preview shows
what the sidebar will actually get at 16/20/24/32 px.
"""
import math
import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
S = 16
GRID = 24
STROKE = 1.7


def point(center, radius, degrees):
    angle = math.radians(degrees)
    return (center[0] + radius * math.cos(angle), center[1] + radius * math.sin(angle))


def arc_points(center, radius, start, end, steps=48):
    return [point(center, radius, start + (end - start) * i / steps) for i in range(steps + 1)]


def puzzle_outline():
    path = [(8.2, 8.0)]
    path += arc_points((10.7, 8.0), 2.5, 180, 360)          # bump over the top
    path += [(16.0, 8.0)]
    path += arc_points((16.0, 10.0), 2.0, 270, 360)          # top-right corner
    path += [(18.0, 11.2)]
    path += arc_points((18.0, 13.2), 2.0, 270, 90)           # notch into the right edge
    path += [(18.0, 18.0)]
    path += arc_points((16.0, 18.0), 2.0, 0, 90)             # bottom-right corner
    path += [(8.0, 20.0)]
    path += arc_points((8.0, 18.0), 2.0, 90, 180)            # bottom-left corner
    path += [(6.0, 10.0)]
    path += arc_points((8.0, 10.0), 2.0, 180, 270)           # top-left corner
    path += [(8.2, 8.0)]
    return path


def star(center, radius):
    cx, cy = center
    k = 0.26 * radius
    return [
        (cx, cy - radius), (cx + k, cy - k), (cx + radius, cy), (cx + k, cy + k),
        (cx, cy + radius), (cx - k, cy + k), (cx - radius, cy), (cx - k, cy - k),
    ]


def render(size, with_spark, color=(255, 255, 255, 255), style='solid'):
    canvas = Image.new('RGBA', (GRID * S, GRID * S), (0, 0, 0, 0))
    pen = ImageDraw.Draw(canvas)
    path = [(x * S, y * S) for x, y in puzzle_outline()]
    if style == 'solid':
        pen.polygon(path, fill=color)
    else:
        width = max(1, round(STROKE * S))
        pen.line(path, fill=color, width=width, joint='curve')
        for cap in (path[0], path[-1]):
            r = width / 2
            pen.ellipse((cap[0] - r, cap[1] - r, cap[0] + r, cap[1] + r), fill=color)
    if with_spark:
        pen.polygon([(x * S, y * S) for x, y in star((20.0, 4.0), 2.5)], fill=color)
    return canvas.resize((size, size), Image.LANCZOS)


def font(name, size):
    path = f'C:/Windows/Fonts/{name}'
    return ImageFont.truetype(path, size) if os.path.exists(path) else ImageFont.load_default()


def main():
    sizes = [16, 20, 24, 32]
    width, height = 900, 420
    sheet = Image.new('RGB', (width, height), (17, 19, 25))
    draw = ImageDraw.Draw(sheet)
    draw.text((30, 22), 'Create Skills — глиф сайдбара (пазл)', font=font('segoeuib.ttf', 20), fill=(238, 240, 246))
    label = font('segoeui.ttf', 12)

    for row, (with_spark, style, title, top) in enumerate(
        [
            (True, 'solid', 'заливка + искра', 70),
            (False, 'solid', 'заливка', 190),
            (False, 'line', 'контур', 310),
        ]
    ):
        draw.text((30, top - 18), title, font=label, fill=(150, 158, 172))
        x = 30
        for size in sizes:
            chip_w = max(size + 34, 62)
            draw.rounded_rectangle((x, top, x + chip_w, top + 52), radius=9, fill=(28, 31, 38))
            icon = render(size, with_spark, (255, 255, 255, 255), style)
            sheet.paste(icon, (x + 14, top + (52 - size) // 2), icon)
            draw.text((x + 14 + size + 8, top + 20), f'{size}', font=label, fill=(140, 148, 162))
            x += chip_w + 12

        x = 330
        for size in sizes:
            chip_w = max(size + 34, 62)
            draw.rounded_rectangle((x, top, x + chip_w, top + 52), radius=9, fill=(238, 240, 245))
            icon = render(size, with_spark, (32, 38, 52, 255), style)
            sheet.paste(icon, (x + 14, top + (52 - size) // 2), icon)
            draw.text((x + 14 + size + 8, top + 20), f'{size}', font=label, fill=(90, 98, 112))
            x += chip_w + 12

    sheet.save(os.path.join(HERE, 'panel-icon.png'))
    for size in sizes:
        render(size, True, (255, 255, 255, 255)).save(os.path.join(HERE, f'panel-icon-{size}.png'))
    print('panel-icon.png written')


if __name__ == '__main__':
    main()
