"""Composes the final icon sheet: the plugin tile plus the sidebar glyph."""
import os
import sys

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from render_panel_icon import render  # noqa: E402


def font(name, size):
    path = f'C:/Windows/Fonts/{name}'
    return ImageFont.truetype(path, size) if os.path.exists(path) else ImageFont.load_default()


def main():
    width, height = 760, 300
    sheet = Image.new('RGB', (width, height), (17, 19, 25))
    draw = ImageDraw.Draw(sheet)
    draw.text((28, 22), 'Create Skills — выбранная иконка', font=font('segoeuib.ttf', 20), fill=(238, 240, 246))

    tile = Image.open(os.path.join(HERE, 'option-c.png')).convert('RGBA').resize((128, 128), Image.LANCZOS)
    sheet.paste(tile, (28, 78), tile)
    draw.text((28, 216), 'icon.svg', font=font('segoeui.ttf', 13), fill=(150, 158, 172))
    draw.text((28, 234), 'карточка плагина', font=font('segoeui.ttf', 12), fill=(110, 118, 132))

    # Sidebar mock: a narrow panel with the glyph at the real 16/20/24 px sizes.
    panel_x = 230
    draw.rounded_rectangle((panel_x, 70, panel_x + 84, 258), radius=14, fill=(26, 29, 36))
    glyph = render(20, True, (255, 255, 255, 255), 'solid')
    sheet.paste(glyph, (panel_x + 32, 92), glyph)
    draw.text((panel_x + 30, 244), '16–24 px', font=font('segoeui.ttf', 11), fill=(120, 128, 142))

    x = 360
    for size in (16, 20, 24, 32):
        chip_w = max(size + 30, 56)
        draw.rounded_rectangle((x, 96, x + chip_w, 148), radius=10, fill=(28, 31, 38))
        icon = render(size, True, (255, 255, 255, 255), 'solid')
        sheet.paste(icon, (x + 14, 96 + (52 - size) // 2), icon)
        draw.text((x + 12, 154), f'{size} px', font=font('segoeui.ttf', 11), fill=(130, 138, 152))
        x += chip_w + 10

    draw.text((360, 196), 'глиф сайдбара (currentColor)', font=font('segoeui.ttf', 13), fill=(150, 158, 172))
    draw.text((360, 216), 'заливка + искра, вырез справа', font=font('segoeui.ttf', 12), fill=(110, 118, 132))

    sheet.save(os.path.join(HERE, 'final.png'))
    print('final.png written')


if __name__ == '__main__':
    main()
