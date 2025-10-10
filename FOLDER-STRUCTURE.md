# フォルダ構造ガイド

このドキュメントは、プロジェクトの新しいPWA特化フォルダ構造について説明します。

## 📁 プロジェクト構造

```
wine/
├── src/                    # ソースコード（開発）
│   ├── js/                # JavaScriptファイル
│   │   ├── app.js        # メインアプリケーションロジック
│   │   └── db.js         # IndexedDBラッパー
│   ├── css/              # スタイルシート
│   │   └── styles.css    # メインスタイル
│   └── workers/          # Service Worker
│       └── service-worker.js
│
├── public/               # 静的ファイル（そのまま配信）
│   ├── index.html       # メインHTMLファイル
│   ├── manifest.json    # PWAマニフェスト
│   └── icons/           # PWAアイコン
│       ├── icon-192.png
│       └── icon-512.png
│
├── docs/                 # ドキュメント
│   ├── INSTALL.md
│   ├── APP-STORE-GUIDE.md
│   ├── PRIVACY-POLICY.md
│   └── STANDALONE-GUIDE.md
│
├── scripts/              # 開発スクリプト
│   ├── start-server.bat
│   ├── start-server.sh
│   ├── generate-icons.py
│   └── create-icons.html
│
├── assets/               # ソースアセット
│   └── icons/
│
├── archive/              # アーカイブ（過去バージョン）
│   ├── ios/             # iOS版（非推奨）
│   ├── standalone/      # Standalone版（非推奨）
│   ├── www/             # Capacitor用ファイル
│   └── capacitor.config.json
│
├── node_modules/         # npm依存関係
│
├── package.json
├── netlify.toml         # デプロイ設定
├── CLAUDE.md            # AI開発ガイド
├── PROJECT-STRUCTURE.md # 詳細構造
├── README.md            # メインドキュメント
└── .gitignore
```

## 🎯 主要ディレクトリの役割

### `src/` - ソースコード
開発中のソースコードを格納。PWAアプリケーションのロジック、スタイル、Service Workerが含まれます。

- **`js/`**: アプリケーションのJavaScriptコード
  - `app.js`: メインロジック、画面遷移、イベントハンドリング
  - `db.js`: IndexedDBデータベース操作

- **`css/`**: スタイルシート
  - `styles.css`: アプリ全体のスタイル定義

- **`workers/`**: Service Worker
  - `service-worker.js`: オフライン対応、キャッシュ管理

### `public/` - 静的ファイル
ブラウザで直接配信される静的ファイル。このディレクトリがPWAのエントリーポイントです。

- `index.html`: アプリのメインHTMLファイル
- `manifest.json`: PWAマニフェスト（アプリ情報、アイコン設定）
- `icons/`: PWAアイコン（192x192, 512x512）

### `archive/` - アーカイブ
以前のマルチプラットフォーム版（iOS、Standalone）を保管。現在は開発対象外。

- `ios/`: Capacitorベースのネイティブiosアプリ
- `standalone/`: 単一HTMLファイル版
- `www/`: Capacitor用Webファイル

## 🔗 ファイルパス参照

### HTML内のパス（相対パス）
`public/index.html` から見た相対パス：

```html
<!-- CSS -->
<link rel="stylesheet" href="../src/css/styles.css">

<!-- JavaScript -->
<script src="../src/js/db.js"></script>
<script src="../src/js/app.js"></script>

<!-- アイコン -->
<link rel="apple-touch-icon" href="icons/icon-192.png">

<!-- マニフェスト -->
<link rel="manifest" href="manifest.json">
```

### Service Worker（絶対パス）
`src/workers/service-worker.js` でキャッシュするファイル：

```javascript
const urlsToCache = [
  '/',
  '/public/index.html',
  '/src/css/styles.css',
  '/src/js/app.js',
  '/src/js/db.js',
  '/public/manifest.json'
];
```

### Service Worker登録
`src/js/app.js` での登録：

```javascript
navigator.serviceWorker.register('/src/workers/service-worker.js');
```

## 🚀 開発開始方法

### 1. ローカルサーバー起動

```bash
# Windowsの場合
scripts\start-server.bat

# Mac/Linuxの場合
./scripts/start-server.sh

# または手動で
python -m http.server 8000
```

### 2. ブラウザでアクセス

```
http://localhost:8000/public/
```

### 3. 開発ツールで確認
- Chrome DevTools → Application → Service Workers
- Chrome DevTools → Application → Manifest

## 📝 変更履歴

### 以前の構造（マルチプラットフォーム）
```
wine/
├── index.html       # ルートに配置
├── app.js
├── db.js
├── styles.css
├── pwa-src/         # 重複コード
├── ios/             # iOS版
└── www/             # Capacitor用
```

### 新しい構造（PWA特化）
```
wine/
├── src/             # ソースコード整理
│   ├── js/
│   ├── css/
│   └── workers/
├── public/          # 静的ファイル
└── archive/         # 過去バージョン
```

## ✅ この構造のメリット

1. **明確な役割分担**: src（開発）とpublic（配信）の分離
2. **重複排除**: pwa-srcディレクトリを削除、単一ソース管理
3. **PWA開発に集中**: iOS/Standalone版をアーカイブ
4. **拡張性**: 将来的にビルドツール（Webpack、Viteなど）導入が容易
5. **保守性**: ファイルの役割が明確で、新規参加者にも分かりやすい

## 🔧 今後の開発指針

- **開発対象**: PWA版のみ
- **非推奨**: iOS版、Standalone版（archiveに保管）
- **主要ファイル**:
  - `src/js/app.js` - アプリロジック
  - `src/js/db.js` - データベース
  - `src/css/styles.css` - スタイル
  - `public/index.html` - HTML
  - `src/workers/service-worker.js` - オフライン対応

## 📚 関連ドキュメント

- [README.md](README.md) - プロジェクト概要
- [CLAUDE.md](CLAUDE.md) - AI開発ガイド
- [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md) - 詳細プロジェクト構造
- [docs/INSTALL.md](docs/INSTALL.md) - インストール手順
