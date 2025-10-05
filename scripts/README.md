# 🔧 スクリプト集

このディレクトリには開発・運用に便利なスクリプトが含まれています。

## サーバー起動

### Windows
```bash
start-server.bat
```

### Mac/Linux
```bash
./start-server.sh
```

サーバーを起動すると、自動的にローカルIPアドレスが表示されます。

## アイコン生成

### PWAアイコン（192x192, 512x512）
```bash
python generate-icons.py
```

### iOSアプリアイコン（全15サイズ + App Store用）
```bash
python generate-ios-icons.py
```

### ブラウザでアイコン生成
```bash
# ブラウザで開く
create-icons.html
```

## ファイル一覧

| ファイル | 用途 | 実行環境 |
|---------|------|---------|
| start-server.bat | サーバー起動 | Windows |
| start-server.sh | サーバー起動 | Mac/Linux |
| generate-icons.py | PWAアイコン生成 | Python |
| generate-ios-icons.py | iOSアイコン生成 | Python + Pillow |
| generate-icons.js | アイコン生成 | Node.js |
| create-icons.html | ブラウザでアイコン生成 | ブラウザ |
