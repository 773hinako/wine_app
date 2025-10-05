#!/usr/bin/env python3
from PIL import Image, ImageDraw
import os

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
    shadow_offset = size // 40
    draw.ellipse([bowl_left+shadow_offset, bowl_top+shadow_offset,
                  bowl_right+shadow_offset, bowl_bottom+shadow_offset],
                 fill=(255, 255, 255, 100))
    draw.ellipse([bowl_left, bowl_top, bowl_right, bowl_bottom], fill='white')

    # ステム（茎）
    stem_width = max(2, size // 20)
    stem_left = x_center - stem_width // 2
    stem_top = bowl_bottom
    stem_right = x_center + stem_width // 2
    stem_bottom = bowl_bottom + glass_height // 3

    draw.rectangle([stem_left+shadow_offset, stem_top+shadow_offset,
                   stem_right+shadow_offset, stem_bottom+shadow_offset],
                  fill=(255, 255, 255, 100))
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
                 fill=(255, 255, 255, 100))
    draw.ellipse([base_left, base_top, base_right, base_bottom], fill='white')

    # キラキラ星を追加（小さいサイズの場合はスキップ）
    if size >= 100:
        star_size = size // 15
        # 左上の星
        draw_star(draw, size // 5, size // 5, star_size, 'white')
        # 右下の星
        draw_star(draw, size * 4 // 5, size * 4 // 5, star_size // 2, 'white')

    img.save(filename, 'PNG')
    print(f'Created {filename}')

def draw_star(draw, x, y, size, color):
    """星を描画"""
    points = []
    for i in range(5):
        # 外側の点
        angle = i * 144 - 90  # 144度ずつ回転
        px = x + size * __import__('math').cos(__import__('math').radians(angle))
        py = y + size * __import__('math').sin(__import__('math').radians(angle))
        points.append((px, py))
        # 内側の点
        angle = i * 144 - 90 + 72
        px = x + (size // 2) * __import__('math').cos(__import__('math').radians(angle))
        py = y + (size // 2) * __import__('math').sin(__import__('math').radians(angle))
        points.append((px, py))

    draw.polygon(points, fill=color)

# PWAアイコン生成
create_kawaii_icon(192, 'icon-192.png')
create_kawaii_icon(512, 'icon-512.png')

# アセットフォルダにもコピー
os.makedirs('assets/icons', exist_ok=True)
create_kawaii_icon(192, 'assets/icons/icon-192.png')
create_kawaii_icon(512, 'assets/icons/icon-512.png')

print('\n✨ ゆめかわいいアイコン生成完了！')
