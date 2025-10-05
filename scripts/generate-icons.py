#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont

def create_icon(size, filename):
    # 背景色 #8B4789
    img = Image.new('RGB', (size, size), color=(139, 71, 137))
    draw = ImageDraw.Draw(img)

    # テキスト（絵文字の代わりにシンプルなグラス形状を描画）
    # ワイングラスの形を描画
    glass_width = size // 3
    glass_height = size // 2
    x_center = size // 2
    y_top = size // 4

    # グラスのボウル（楕円）
    bowl_left = x_center - glass_width // 2
    bowl_top = y_top
    bowl_right = x_center + glass_width // 2
    bowl_bottom = y_top + glass_height // 2
    draw.ellipse([bowl_left, bowl_top, bowl_right, bowl_bottom], fill='white')

    # ステム（茎）
    stem_width = size // 20
    stem_left = x_center - stem_width // 2
    stem_top = bowl_bottom
    stem_right = x_center + stem_width // 2
    stem_bottom = bowl_bottom + glass_height // 3
    draw.rectangle([stem_left, stem_top, stem_right, stem_bottom], fill='white')

    # ベース（台座）
    base_width = glass_width // 2
    base_left = x_center - base_width // 2
    base_top = stem_bottom - size // 40
    base_right = x_center + base_width // 2
    base_bottom = stem_bottom + size // 40
    draw.ellipse([base_left, base_top, base_right, base_bottom], fill='white')

    img.save(filename, 'PNG')
    print(f'Created {filename}')

# アイコン生成
create_icon(192, 'icon-192.png')
create_icon(512, 'icon-512.png')

print('アイコン生成完了！')
