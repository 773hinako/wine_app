# 🚀 クイックスタートガイド

## 📱 すぐに使い始める

### 方法1: PWA版（推奨）

1. **サーバーを起動**
   ```bash
   # Windows
   scripts\start-server.bat

   # Mac/Linux
   ./scripts/start-server.sh
   ```

2. **ブラウザで開く**
   - http://localhost:8000

3. **スマホからアクセス（オプション）**
   - 表示されたIPアドレスでアクセス
   - 例: http://192.168.x.x:8000

### 方法2: スタンドアロン版

1. **ファイルを開く**
   - `wine-app-standalone.html` をブラウザにドラッグ＆ドロップ

2. **スマホに転送（オプション）**
   - メール添付で送信
   - クラウドドライブ経由
   - 詳細: [docs/STANDALONE-GUIDE.md](docs/STANDALONE-GUIDE.md)

## 🛠️ 開発を始める

### 1. 依存関係のインストール

```bash
# npm パッケージ
npm install

# iOS用（Macのみ）
cd ios/App
pod install
cd ../..
```

### 2. PWA版の開発

```bash
# サーバー起動
./scripts/start-server.bat   # Windows
./scripts/start-server.sh    # Mac/Linux

# ファイル編集
# - pwa-src/ 内のファイルを編集
# - ルートにコピー: cp pwa-src/* .
```

### 3. iOS版の開発（Macのみ）

```bash
# Webファイルを同期
npm run sync:ios

# Xcodeで開く
npm run open:ios
```

## 📂 どこに何があるか

```
wine/
├── 📄 wine-app-standalone.html    # スタンドアロン版（単一ファイル）
├── 📱 index.html, app.js, etc.    # PWA版（ルート）
├── 📚 docs/                       # 各種ガイド
├── 🔧 scripts/                    # ツール
│   ├── start-server.bat/sh       # サーバー起動
│   └── generate-*.py             # アイコン生成
├── 📱 ios/                        # iOSアプリ
└── 📝 pwa-src/                    # PWAソースコード
```

## 📖 ドキュメント

| ファイル | 内容 |
|---------|------|
| [README.md](README.md) | プロジェクト概要 |
| [CLAUDE.md](CLAUDE.md) | 開発者向けガイド |
| [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md) | 詳細なファイル構成 |
| [docs/INSTALL.md](docs/INSTALL.md) | PWAインストール方法 |
| [docs/STANDALONE-GUIDE.md](docs/STANDALONE-GUIDE.md) | スタンドアロン版ガイド |
| [docs/APP-STORE-GUIDE.md](docs/APP-STORE-GUIDE.md) | App Store公開手順 |

## ❓ よくある質問

### Q: サーバーが起動しない
**A**: Python がインストールされているか確認
```bash
python --version
# または
python3 --version
```

### Q: カメラが動かない
**A**: HTTPSまたはlocalhostが必要です
- PWA版: サーバー経由でアクセス（localhost:8000）
- スタンドアロン版: ブラウザによっては制限あり

### Q: iOSアプリをビルドしたい
**A**: Macが必要です
1. Macにプロジェクトを転送
2. `npm install` と `pod install`
3. Xcodeで `ios/App/App.xcworkspace` を開く

### Q: データが消えた
**A**: ブラウザのデータをクリアすると消えます
- 定期的に📤エクスポートでバックアップを
- JSONファイルを安全な場所に保存

## 🎯 次のステップ

1. **基本的な使い方を試す**
   - ワインを記録
   - 検索機能を試す
   - エクスポート/インポート

2. **カスタマイズ**
   - `pwa-src/styles.css` で色を変更
   - アイコンを独自デザインに

3. **公開**
   - PWA: WebサーバーにデプロイしてHTTPS化
   - iOS: [docs/APP-STORE-GUIDE.md](docs/APP-STORE-GUIDE.md) 参照

---

困ったときは [CLAUDE.md](CLAUDE.md) を参照してください 🍷
