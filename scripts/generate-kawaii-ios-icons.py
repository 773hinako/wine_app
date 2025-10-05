#!/usr/bin/env python3
from PIL import Image, ImageDraw
import os
import json

icon_sizes = [
    (20, 1),   # 20pt @1x
    (20, 2),   # 20pt @2x
    (20, 3),   # 20pt @3x
    (29, 1),   # 29pt @1x
    (29, 2),   # 29pt @2x
    (29, 3),   # 29pt @3x
    (40, 1),   # 40pt @1x
    (40, 2),   # 40pt @2x
    (40, 3),   # 40pt @3x
    (60, 2),   # 60pt @2x
    (60, 3),   # 60pt @3x
    (76, 1),   # 76pt @1x (iPad)
    (76, 2),   # 76pt @2x (iPad)
    (83.5, 2), # 83.5pt @2x (iPad Pro)
    (1024, 1), # App Store
]

def create_kawaii_icon(size, filename):
    """ゆめかわいいアイコンを作成"""
    # パステルピンクからラベンダーのグラデーション背景
    img = Image.new('RGB', (size, size), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    # グラデーション背景
    for y in range(size):
        # ピンク(#FFB6D9)からラベンダー(#D4B5F2)へのグラデーション
        r = int(255 - (255 - 212) * y / size)
        g = int(182 - (182 - 181) * y / size)
        b = int(217 + (242 - 217) * y / size)
        draw.rectangle([0, y, size, y+1], fill=(r, g, b))

    # ワイングラスのデザイン（白で）
    glass_width = size // 3
    glass_height = size // 2
    x_center = size // 2
    y_top = size // 4

    # グラスのボウル（楕円）
    bowl_left = x_center - glass_width // 2
    bowl_top = y_top
    bowl_right = x_center + glass_width // 2
    bowl_bottom = y_top + glass_height // 2

    # 白い影付きグラス
    shadow_offset = max(1, size // 40)
    draw.ellipse([bowl_left+shadow_offset, bowl_top+shadow_offset,
                  bowl_right+shadow_offset, bowl_bottom+shadow_offset],
                 fill=(200, 200, 200))
    draw.ellipse([bowl_left, bowl_top, bowl_right, bowl_bottom], fill='white')

    # ステム（茎）
    stem_width = max(2, size // 20)
    stem_left = x_center - stem_width // 2
    stem_top = bowl_bottom
    stem_right = x_center + stem_width // 2
    stem_bottom = bowl_bottom + glass_height // 3

    draw.rectangle([stem_left+shadow_offset, stem_top+shadow_offset,
                   stem_right+shadow_offset, stem_bottom+shadow_offset],
                  fill=(200, 200, 200))
    draw.rectangle([stem_left, stem_top, stem_right, stem_bottom], fill='white')

    # ベース（台座）
    base_width = glass_width // 2
    base_height = max(2, size // 40)
    base_left = x_center - base_width // 2
    base_top = stem_bottom - base_height // 2
    base_right = x_center + base_width // 2
    base_bottom = stem_bottom + base_height // 2

    draw.ellipse([base_left+shadow_offset, base_top+shadow_offset,
                  base_right+shadow_offset, base_bottom+shadow_offset],
                 fill=(200, 200, 200))
    draw.ellipse([base_left, base_top, base_right, base_bottom], fill='white')

    # キラキラ星を追加（小さいサイズの場合はスキップ）
    if size >= 100:
        import math
        star_size = size // 15
        # 左上の星
        draw_star(draw, size // 5, size // 5, star_size, 'white', math)
        # 右下の星
        draw_star(draw, size * 4 // 5, size * 4 // 5, star_size // 2, 'white', math)

    img.save(filename, 'PNG')
    print(f'Created {filename}')

def draw_star(draw, x, y, size, color, math):
    """星を描画"""
    points = []
    for i in range(5):
        # 外側の点
        angle = i * 144 - 90  # 144度ずつ回転
        px = x + size * math.cos(math.radians(angle))
        py = y + size * math.sin(math.radians(angle))
        points.append((px, py))
        # 内側の点
        angle = i * 144 - 90 + 72
        px = x + (size // 2) * math.cos(math.radians(angle))
        py = y + (size // 2) * math.sin(math.radians(angle))
        points.append((px, py))

    draw.polygon(points, fill=color)

# 出力ディレクトリ
output_dir = 'ios/App/App/Assets.xcassets/AppIcon.appiconset'
os.makedirs(output_dir, exist_ok=True)

# Contents.jsonを作成
contents = {
    "images": [],
    "info": {
        "author": "xcode",
        "version": 1
    }
}

# 各サイズのアイコンを生成
for pt_size, scale in icon_sizes:
    pixel_size = int(pt_size * scale)

    if pt_size == 1024:
        # App Store用
        filename = 'AppIcon-1024.png'
        idiom = 'ios-marketing'
        scale_str = '1x'
        size_str = '1024x1024'
    else:
        filename = f'AppIcon-{pt_size}@{scale}x.png'
        if pt_size >= 76:
            idiom = 'ipad'
        else:
            idiom = 'iphone'
        scale_str = f'{scale}x'
        size_str = f'{int(pt_size)}x{int(pt_size)}'

    filepath = os.path.join(output_dir, filename)
    create_kawaii_icon(pixel_size, filepath)

    contents['images'].append({
        'filename': filename,
        'idiom': idiom,
        'scale': scale_str,
        'size': size_str
    })

# Contents.jsonを保存
contents_path = os.path.join(output_dir, 'Contents.json')
with open(contents_path, 'w') as f:
    json.dump(contents, f, indent=2)

print(f'\nContents.json created at {contents_path}')
print('Kawaii iOS icons generated!')
