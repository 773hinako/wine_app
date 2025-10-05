# 🍎 App Store公開ガイド - ワイン記録アプリ

このガイドでは、ワイン記録アプリをApp Storeに公開する手順を説明します。

## 📋 必要なもの

### 1. ハードウェア
- ✅ **Mac**（macOS搭載のコンピュータ）
  - iOSアプリのビルドにはXcodeが必須
  - XcodeはMacでのみ動作

### 2. ソフトウェア
- ✅ **Xcode**（最新版）
  - App Storeから無料でダウンロード
  - https://apps.apple.com/jp/app/xcode/id497799835
- ✅ **CocoaPods**（依存関係管理）
  - インストール: `sudo gem install cocoapods`

### 3. Apple Developer Account
- ✅ **Apple Developer Program メンバーシップ**
  - 費用: **$99/年（約14,000円）**
  - 登録: https://developer.apple.com/programs/
  - App Storeへのアプリ公開に必須

## 🚀 セットアップ手順

### ステップ1: プロジェクトをMacに転送

現在のプロジェクトをMacに転送します。

#### 方法1: Git経由（推奨）
```bash
# Windowsで
git init
git add .
git commit -m "Initial commit"
git remote add origin [your-repo-url]
git push -u origin main

# Macで
git clone [your-repo-url]
cd wine
```

#### 方法2: クラウド経由
- Google Drive / Dropbox / iCloud にプロジェクトフォルダをアップロード
- Macでダウンロード

#### 方法3: USB/ネットワーク経由
- プロジェクトフォルダをZIP圧縮
- USBメモリまたはネットワーク経由でMacに転送

### ステップ2: Macでの初期設定

```bash
# プロジェクトディレクトリに移動
cd wine

# 依存関係のインストール
npm install

# CocoaPodsの依存関係をインストール
cd ios/App
pod install
cd ../..
```

### ステップ3: Xcodeでプロジェクトを開く

```bash
# Xcodeプロジェクトを開く
npm run open:ios

# または直接開く
open ios/App/App.xcworkspace
```

⚠️ **重要**: `App.xcworkspace`を開いてください（`.xcodeproj`ではありません）

### ステップ4: 署名とBundle IDの設定

Xcodeで以下を設定：

1. **プロジェクトナビゲーター**で「App」を選択
2. **Signing & Capabilities**タブを開く
3. **Team**を選択（Apple Developer Accountでログイン済みの場合）
4. **Bundle Identifier**を確認/変更
   - 現在: `com.winerecord.app`
   - 一意である必要があります（例: `com.yourname.winerecord`）

### ステップ5: アプリ情報の設定

#### Info.plistの確認
以下の設定が含まれていることを確認（すでに設定済み）：

```xml
<key>NSCameraUsageDescription</key>
<string>ワインのラベル写真を撮影するためにカメラへのアクセスが必要です</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>ワインの写真を選択するためにフォトライブラリへのアクセスが必要です</string>
```

#### バージョン情報
- **Version**: 1.0.0（初回リリース）
- **Build**: 1

### ステップ6: テストビルド

#### シミュレーターでテスト
```bash
# Xcodeで
1. ターゲットデバイスを選択（例: iPhone 15 Pro）
2. ⌘ + R（Run）でビルド＆実行
```

#### 実機でテスト
```bash
1. iPhoneをMacに接続
2. Xcodeのデバイス一覧からiPhoneを選択
3. ⌘ + R（Run）でビルド＆実行
```

### ステップ7: App Store Connectでアプリを登録

1. **App Store Connect**にアクセス
   - https://appstoreconnect.apple.com/

2. **「マイApp」→「＋」→「新規App」**を選択

3. 必要情報を入力：
   - **プラットフォーム**: iOS
   - **名前**: ワイン記録
   - **主言語**: 日本語
   - **Bundle ID**: com.winerecord.app（設定したもの）
   - **SKU**: winerecord001（任意の一意な識別子）
   - **ユーザーアクセス**: フルアクセス

### ステップ8: アプリ情報の入力

#### 1. App情報
- **名前**: ワイン記録
- **サブタイトル**: お気に入りワインの記録・管理
- **カテゴリ**: フード＆ドリンク

#### 2. 価格と配信可能状況
- **価格**: 無料
- **配信可能状況**: すべての地域

#### 3. App情報
**プライバシーポリシーURL**が必要です：
- 無料ホスティング: GitHub Pages, Netlifyなど
- 内容: データはローカルに保存され、サーバーに送信されないことを明記

#### 4. スクリーンショット

必須サイズ：
- **6.7インチディスプレイ**（iPhone 15 Pro Max）: 1290 x 2796
- **6.5インチディスプレイ**（iPhone 11 Pro Max）: 1242 x 2688

シミュレーターでスクリーンショットを撮影：
```bash
# Xcodeのシミュレーターで
1. アプリを起動
2. ⌘ + S でスクリーンショット保存
3. 各画面（ホーム、追加、詳細）を撮影
```

最低3枚、最大10枚必要。

#### 5. 説明文

**App説明**（例）：
```
🍷 ワイン記録 - お気に入りワインを簡単に管理

飲んだワインの情報を写真と一緒に記録・管理できるシンプルなアプリです。

【主な機能】
📷 ワインラベルを撮影して記録
⭐ 5段階評価とテイスティングメモ
🔍 ワイン名、産地、品種で検索
💾 データのエクスポート/インポート
📡 完全オフライン動作

【記録できる情報】
- ワイン名
- 生産者/ワイナリー
- 産地
- 品種
- ヴィンテージ
- 購入日/飲んだ日
- 評価（5段階）
- テイスティングメモ

レストランやワインショップで気に入ったワインを見つけたら、その場で撮影して記録。
後から簡単に見返せます。

すべてのデータはデバイス内に保存されるため、プライバシーも安心です。
```

**キーワード**（最大100文字、カンマ区切り）：
```
ワイン,記録,テイスティング,評価,メモ,ラベル,写真,管理,オフライン
```

### ステップ9: アーカイブとアップロード

#### 1. アーカイブの作成
```bash
# Xcodeで
1. Product → Scheme → Edit Scheme
2. Run → Build Configuration → Release に変更
3. Product → Archive
4. アーカイブが完成するまで待つ
```

#### 2. App Store Connectへアップロード
```bash
1. Organizer ウィンドウが自動で開く
2. 作成したアーカイブを選択
3. 「Distribute App」をクリック
4. 「App Store Connect」を選択
5. 「Upload」を選択
6. 署名オプションを確認
7. 「Upload」をクリック
```

### ステップ10: 審査の提出

1. **App Store Connect**でアプリを開く
2. **ビルド**セクションでアップロードしたビルドを選択
3. すべての必須項目を入力
4. **審査に提出**をクリック

#### 審査に必要な情報
- **年齢制限**: 4+（すべての年齢）
- **著作権**: © 2025 [Your Name]
- **連絡先情報**: メールアドレス、電話番号
- **レビュー用メモ**: アプリの使い方の説明

### ステップ11: 審査待ち

- **審査期間**: 通常1〜3日
- **ステータス確認**: App Store Connectで確認可能
- **通知**: 審査結果はメールで通知

## 📱 審査通過後

### アプリの公開
審査通過後、以下の選択肢があります：

1. **自動公開**: 承認後すぐにApp Storeで公開
2. **手動公開**: 承認後、任意のタイミングで公開

### アプリのURL
公開後、以下の形式でURLが割り当てられます：
```
https://apps.apple.com/jp/app/wine-record/id[APP_ID]
```

## 🔄 アップデート手順

アプリを更新する場合：

1. **コードを更新**
2. **バージョン番号を上げる**
   - Version: 1.0.0 → 1.1.0
   - Build: 1 → 2
3. **再度アーカイブ＆アップロード**
4. **App Store Connectで「新規バージョン」を作成**
5. **変更内容を記載して審査に提出**

## ⚠️ よくある問題と解決方法

### 問題1: "Bundle ID already exists"
**解決**: Bundle IDを変更（例: `com.yourname.winerecord`）

### 問題2: "Signing error"
**解決**:
- XcodeでApple IDでログイン
- 正しいTeamを選択
- 証明書を再生成

### 問題3: "Missing compliance"
**解決**:
- App Store Connectで「輸出コンプライアンス」を設定
- 暗号化を使用していない場合は「いいえ」を選択

### 問題4: スクリーンショットのサイズエラー
**解決**:
- 正確なサイズ（1290x2796など）で作成
- PNG形式で保存

## 💰 費用まとめ

| 項目 | 費用 |
|------|------|
| Apple Developer Program | $99/年 |
| Mac（必要な場合） | 購入費用 |
| その他 | 無料 |

## 📚 参考リンク

- [Apple Developer](https://developer.apple.com/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)

## ✅ チェックリスト

アプリ公開前の最終チェック：

- [ ] Macを準備
- [ ] Xcodeをインストール
- [ ] Apple Developer Programに登録（$99/年）
- [ ] プロジェクトをMacに転送
- [ ] CocoaPodsをインストール
- [ ] Xcodeでビルド成功
- [ ] 実機でテスト完了
- [ ] スクリーンショット準備（3〜10枚）
- [ ] プライバシーポリシーURL準備
- [ ] App Store Connectでアプリ登録
- [ ] アーカイブ作成
- [ ] App Store Connectへアップロード
- [ ] 審査に提出

## 🎉 完了！

審査が通れば、世界中のiPhoneユーザーがあなたのアプリをダウンロードできるようになります！

頑張ってください！🍷
