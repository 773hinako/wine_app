# 📁 プロジェクト構成

## ディレクトリ構造

```
wine/
├── 📱 ルート（PWA版の実行に必要）
│   ├── index.html              # メインHTMLファイル
│   ├── app.js                  # アプリケーションロジック
│   ├── db.js                   # IndexedDB管理
│   ├── styles.css              # スタイルシート
│   ├── service-worker.js       # Service Worker
│   ├── manifest.json           # PWAマニフェスト
│   ├── icon-192.png            # PWAアイコン
│   └── icon-512.png            # PWAアイコン
│
├── 📄 wine-app-standalone.html # スタンドアロン版（単一ファイル）
│
├── 📚 docs/                    # ドキュメント
│   ├── APP-STORE-GUIDE.md      # App Store公開ガイド
│   ├── INSTALL.md              # PWAインストールガイド
│   ├── STANDALONE-GUIDE.md     # スタンドアロン版ガイド
│   └── PRIVACY-POLICY.md       # プライバシーポリシー
│
├── 🔧 scripts/                 # ユーティリティスクリプト
│   ├── start-server.bat        # サーバー起動（Windows）
│   ├── start-server.sh         # サーバー起動（Mac/Linux）
│   ├── generate-icons.py       # PWAアイコン生成
│   ├── generate-ios-icons.py   # iOSアイコン生成
│   └── create-icons.html       # ブラウザでアイコン生成
│
├── 🎨 assets/                  # 静的アセット
│   └── icons/                  # アイコンファイル
│       ├── icon-192.png
│       └── icon-512.png
│
├── 📱 pwa-src/                 # PWA版ソースコード（バックアップ）
│   ├── index.html
│   ├── app.js
│   ├── db.js
│   ├── styles.css
│   ├── service-worker.js
│   └── manifest.json
│
├── 📱 ios/                     # iOSアプリプロジェクト
│   └── App/
│       ├── App.xcworkspace     # Xcodeプロジェクト
│       ├── App/
│       │   ├── Info.plist      # アプリ設定
│       │   └── Assets.xcassets/ # アイコン等
│       └── Pods/               # CocoaPods依存関係
│
├── 🌐 www/                     # Capacitor用Webファイル
│   └── index.html              # スタンドアロン版のコピー
│
├── 📦 node_modules/            # npm依存関係
│
├── 📝 設定ファイル
│   ├── package.json            # npm設定
│   ├── capacitor.config.json   # Capacitor設定
│   ├── .gitignore              # Git除外設定
│   ├── CLAUDE.md               # 開発者向けガイド
│   └── README.md               # プロジェクト説明
│
└── PROJECT-STRUCTURE.md        # このファイル
```

## ファイルの役割

### 📱 PWA版（ルートディレクトリ）

ブラウザで動作するProgressive Web App。

- **実行方法**: `python -m http.server 8000` → http://localhost:8000
- **特徴**: Service Workerでオフライン対応、ホーム画面追加可能

### 📄 スタンドアロン版

サーバー不要の単一HTMLファイル。

- **ファイル**: `wine-app-standalone.html`
- **実行方法**: ブラウザで直接開く（`file://`プロトコル）
- **用途**: スマホに保存、メール添付で配布

### 📱 iOS App（ios/ディレクトリ）

App Store公開用のネイティブiOSアプリ。

- **Xcodeプロジェクト**: `ios/App/App.xcworkspace`
- **ソース**: `www/index.html`（スタンドアロン版のコピー）
- **ビルド**: Macが必要

## バージョン間の同期

### 更新の流れ

1. **PWA版を編集**
   - `pwa-src/` 内のファイルを更新
   - ルートディレクトリにコピー

2. **スタンドアロン版を更新**
   - `wine-app-standalone.html` にPWA版のコードを埋め込み

3. **iOS版を更新**
   ```bash
   cp wine-app-standalone.html www/index.html
   npm run sync:ios
   ```

## ディレクトリ別用途

| ディレクトリ | 用途 | 編集頻度 |
|------------|------|---------|
| ルート | PWA実行ファイル | 高 |
| docs/ | ドキュメント | 中 |
| scripts/ | 開発ツール | 低 |
| assets/ | 静的ファイル | 低 |
| pwa-src/ | PWAソースバックアップ | 高 |
| ios/ | iOSプロジェクト | 低 |
| www/ | Capacitor用 | 自動生成 |

## クリーンアップコマンド

```bash
# node_modules削除（再インストール: npm install）
rm -rf node_modules

# iOS Pods削除（再インストール: cd ios/App && pod install）
rm -rf ios/App/Pods

# ビルド成果物削除
rm -rf www dist build
```

## バックアップ推奨ファイル

本番環境にデプロイする前に以下をバックアップ：

- `pwa-src/` - PWAソースコード
- `wine-app-standalone.html` - スタンドアロン版
- `docs/` - ドキュメント
- `capacitor.config.json` - Capacitor設定
- `ios/App/App/Info.plist` - iOS設定
