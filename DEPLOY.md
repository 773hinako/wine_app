# 🌐 デプロイ手順（友人に配布する方法）

このアプリをインターネット上で公開し、友人たちに使ってもらう手順です。

## 📋 必要なもの

- GitHubアカウント（無料）
- Netlifyアカウント（無料）

## 🚀 デプロイ手順

### ステップ1: GitHubリポジトリの作成

1. **GitHubにアクセス**: https://github.com
2. **新規リポジトリを作成**:
   - 右上の「+」→「New repository」
   - Repository name: `wine-app`（任意）
   - Public / Private を選択（Publicがおすすめ）
   - 「Create repository」をクリック

3. **ローカルリポジトリとして初期化**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Wine tasting PWA"
   ```

4. **GitHubにプッシュ**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/wine-app.git
   git branch -M main
   git push -u origin main
   ```

### ステップ2: Netlifyでデプロイ

1. **Netlifyにアクセス**: https://www.netlify.com
2. **GitHubアカウントでサインアップ/ログイン**
3. **「Add new site」→「Import an existing project」**
4. **「Deploy with GitHub」を選択**
5. **作成したリポジトリを選択**
6. **デプロイ設定**（自動で設定されます）:
   - Build command: （空欄のままでOK）
   - Publish directory: `.`（ルートディレクトリ）
7. **「Deploy site」をクリック**

🎉 **完了！** 数分でデプロイが完了します。

### ステップ3: URLを確認

デプロイが完了すると、以下のようなURLが発行されます：

```
https://random-name-12345.netlify.app
```

このURLを友人に送れば、誰でもアプリが使えます！

### ステップ4: カスタムドメイン設定（オプション）

より覚えやすいURLにしたい場合：

1. Netlify の「Site settings」→「Domain management」
2. 「Options」→「Edit site name」
3. 好きな名前に変更（例: `my-wine-app`）

変更後のURL: `https://my-wine-app.netlify.app`

## 📱 友人への共有方法

### iPhoneユーザー向け

1. 共有したURLをSafariで開く
2. 共有ボタン（⎙）をタップ
3. 「ホーム画面に追加」を選択
4. アプリアイコンとして使える！

### Androidユーザー向け

1. 共有したURLをChromeで開く
2. メニュー（⋮）→「ホーム画面に追加」
3. アプリアイコンとして使える！

## 🔄 アプリを更新する方法

コードを変更したら：

```bash
git add .
git commit -m "Update: 機能追加/バグ修正"
git push
```

Netlifyが自動的に再デプロイします（約1分）。

## ✅ デプロイ後の確認事項

- [ ] アプリが正常に表示される
- [ ] カメラ機能が動作する（HTTPS必須 → Netlifyは自動対応）
- [ ] ワインの追加/編集/削除ができる
- [ ] オフラインで動作する（Service Worker）
- [ ] ホーム画面に追加できる
- [ ] データがローカルに保存される（IndexedDB）

## 💡 利点

✅ **無料** - Netlifyの無料プランで十分
✅ **簡単** - GitHubにpushするだけで自動デプロイ
✅ **高速** - CDN配信で世界中から高速アクセス
✅ **セキュア** - 自動HTTPS対応
✅ **クロスプラットフォーム** - iOS/Android両対応
✅ **インストール不要** - ブラウザで即使える
✅ **ホーム画面追加** - ネイティブアプリのような体験

## 🆚 App Storeとの比較

| 項目 | Netlify（PWA） | App Store |
|------|----------------|-----------|
| コスト | 無料 | $99/年 |
| Mac必要 | 不要 | 必須 |
| 審査 | 不要 | 必要（1週間） |
| 更新 | 即時反映 | 審査必要 |
| Android対応 | ✅ | ❌ |
| 公開速度 | 5分 | 1週間 |

## 📊 アクセス解析（オプション）

友人が何人使っているか知りたい場合：

1. Netlify ダッシュボード →「Analytics」
2. 訪問者数、ページビューなどが確認できます

## 🔧 トラブルシューティング

### デプロイが失敗する
→ `netlify.toml` が正しく配置されているか確認

### Service Workerが動かない
→ HTTPSでアクセスしているか確認（Netlifyは自動HTTPS）

### カメラが使えない
→ HTTPSが必要（Netlifyなら自動対応）

---

## 🎯 次のステップ

1. ✅ GitHubリポジトリ作成
2. ✅ Netlifyデプロイ
3. ✅ 友人にURL共有
4. ✅ フィードバックを受けて改善
5. ✅ 必要に応じてApp Store公開も検討

**今すぐ始めましょう！**
