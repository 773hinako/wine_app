#!/usr/bin/env python3
from PIL import Image, ImageDraw
import os

# アイコンサイズのリスト（iOSで必要なサイズ）
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

def create_icon(size, filename):
    """アイコン画像を作成"""
    # 背景色 #8B4789
    img = Image.new('RGB', (size, size), color=(139, 71, 137))
    draw = ImageDraw.Draw(img)

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
    stem_width = max(2, size // 20)
    stem_left = x_center - stem_width // 2
    stem_top = bowl_bottom
    stem_right = x_center + stem_width // 2
    stem_bottom = bowl_bottom + glass_height // 3
    draw.rectangle([stem_left, stem_top, stem_right, stem_bottom], fill='white')

    # ベース（台座）
    base_width = glass_width // 2
    base_height = max(2, size // 40)
    base_left = x_center - base_width // 2
    base_top = stem_bottom - base_height // 2
    base_right = x_center + base_width // 2
    base_bottom = stem_bottom + base_height // 2
    draw.ellipse([base_left, base_top, base_right, base_bottom], fill='white')

    img.save(filename, 'PNG')
    print(f'Created {filename}')

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
    create_icon(pixel_size, filepath)

    contents['images'].append({
        'filename': filename,
        'idiom': idiom,
        'scale': scale_str,
        'size': size_str
    })

# Contents.jsonを保存
import json
contents_path = os.path.join(output_dir, 'Contents.json')
with open(contents_path, 'w') as f:
    json.dump(contents, f, indent=2)

print(f'\nContents.json created at {contents_path}')
print('iOSアプリアイコン生成完了！')
