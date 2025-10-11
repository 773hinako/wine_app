# Git & GitHub 使い方ガイド

このプロジェクトのGit操作方法をまとめたガイドです。

## 📋 目次

- [基本的な流れ](#基本的な流れ)
- [よく使うコマンド](#よく使うコマンド)
- [通常の作業フロー](#通常の作業フロー)
- [Netlify自動デプロイ](#netlify自動デプロイ)
- [トラブルシューティング](#トラブルシューティング)
- [便利な設定](#便利な設定)

---

## 基本的な流れ

```
作業（ファイル編集） → 保存（コミット） → アップロード（プッシュ）
```

### 3つの基本操作

1. **コミット（Commit）**: ローカルに変更を保存
2. **プッシュ（Push）**: GitHubにアップロード
3. **プル（Pull）**: GitHubから最新版をダウンロード

---

## よく使うコマンド

### 📊 変更を確認

```bash
# 何が変更されたか確認
git status

# 変更内容の詳細を表示
git diff
```

### 💾 変更を保存（コミット）

```bash
# すべての変更を追加
git add -A

# コミット（変更の説明を書く）
git commit -m "変更の説明をここに書く"
```

**例：**
```bash
git add -A
git commit -m "ワインリストの表示を改善"
```

### 📤 GitHubにアップロード（プッシュ）

```bash
git push origin main
```

### 📥 GitHubから最新を取得（プル）

```bash
# 最新版をダウンロード
git pull origin main
```

### 📜 変更履歴を見る

```bash
# 最近のコミット履歴（シンプル）
git log --oneline -10

# 詳細な履歴
git log

# グラフ表示
git log --graph --oneline --all
```

---

## 通常の作業フロー

### 毎日の作業

```bash
# 1. 最新版を取得（朝一番）
git pull origin main

# 2. ファイルを編集...
#    （VSCodeなどで作業）

# 3. 変更を確認
git status

# 4. 変更を保存
git add -A
git commit -m "今日の作業内容"

# 5. GitHubにアップロード
git push origin main
```

### まとめて実行

```bash
# add + commit + push を一度に
git add -A && git commit -m "変更内容" && git push origin main
```

---

## Netlify自動デプロイ

### 仕組み

```
git push → GitHub → Netlify（自動ビルド） → 公開サイトに反映
```

### デプロイの流れ

1. **ローカルで変更**
   ```bash
   git add -A
   git commit -m "新機能追加"
   git push origin main
   ```

2. **GitHubに反映**
   - 自動的にGitHubリポジトリが更新される

3. **Netlifyが自動デプロイ**
   - GitHubの更新を検知
   - 自動的にビルド＆デプロイ
   - 通常1〜2分で完了

4. **公開サイトに反映**
   - https://your-app.netlify.app が更新される

### デプロイ状況の確認

1. [Netlifyダッシュボード](https://app.netlify.com/)にアクセス
2. "Deploys" タブで進行状況を確認
3. 緑色のチェックマーク = デプロイ成功

---

## トラブルシューティング

### ❌ プッシュが拒否された

**エラー例：**
```
! [rejected] main -> main (fetch first)
```

**原因：** リモート（GitHub）に新しい変更がある

**解決方法：**
```bash
# 1. 最新版を取得
git pull origin main

# 2. （必要なら）マージコミットを作成
# 3. 再度プッシュ
git push origin main
```

### ⚠️ コンフリクト（衝突）が起きた

**エラー例：**
```
CONFLICT (content): Merge conflict in src/js/app.js
```

**解決方法：**

1. **コンフリクトしたファイルを開く**
   ```
   <<<<<<< HEAD
   あなたの変更
   =======
   他の人の変更
   >>>>>>> origin/main
   ```

2. **手動で修正**
   - 必要な方を残す、または両方を統合

3. **解決後にコミット**
   ```bash
   git add -A
   git commit -m "コンフリクトを解決"
   git push origin main
   ```

### 🔄 変更を取り消したい

#### コミット前（まだ git add していない）

```bash
# 特定のファイルを元に戻す
git restore ファイル名

# すべての変更を元に戻す（注意！）
git restore .
```

#### コミット後（git commit した後）

```bash
# 最新のコミットを取り消す（変更は残る）
git reset --soft HEAD^

# 最新のコミットを完全に取り消す（変更も削除）
git reset --hard HEAD^
```

#### プッシュ後（git push した後）

```bash
# 1つ前に戻す（慎重に！）
git revert HEAD
git push origin main
```

---

## 便利な設定

### エイリアス（ショートカット）

長いコマンドを短縮：

```bash
# エイリアスを設定
git config --global alias.st status
git config --global alias.cm commit
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.pu push
git config --global alias.pl pull

# 使い方
git st              # git status と同じ
git cm -m "メッセージ"  # git commit -m と同じ
git pu origin main  # git push origin main と同じ
```

### よく使う便利なエイリアス

```bash
# すべてを add + commit + push
git config --global alias.acp '!git add -A && git commit -m "$1" && git push origin main && :'

# 使い方
git acp "変更内容"  # add → commit → push を一発で
```

### Git設定の確認

```bash
# 現在の設定を表示
git config --list

# 特定の設定を表示
git config user.name
git config user.email
```

---

## ブランチ操作（応用）

### ブランチとは

本番（main）に影響を与えずに新機能を開発できる仕組み。

### ブランチの作成と切り替え

```bash
# 新しいブランチを作成して切り替え
git checkout -b 新機能開発

# 作業...

# mainブランチに戻る
git checkout main

# 新機能をmainにマージ
git merge 新機能開発

# GitHubにプッシュ
git push origin main

# 不要なブランチを削除
git branch -d 新機能開発
```

### ブランチの確認

```bash
# ブランチ一覧
git branch

# リモートブランチも表示
git branch -a
```

---

## GitHubとの連携

### リポジトリ情報

- **リポジトリURL**: https://github.com/773hinako/wine_app
- **ブランチ**: main

### リモートの確認

```bash
# リモートリポジトリを確認
git remote -v

# 出力例：
# origin  https://github.com/773hinako/wine_app.git (fetch)
# origin  https://github.com/773hinako/wine_app.git (push)
```

### リモートの追加・変更

```bash
# リモートを追加
git remote add origin https://github.com/ユーザー名/リポジトリ名.git

# リモートURLを変更
git remote set-url origin https://github.com/ユーザー名/新リポジトリ名.git
```

---

## コミットメッセージのベストプラクティス

### 良いコミットメッセージの例

```bash
git commit -m "Add auto-backup feature"
git commit -m "Fix wine list sorting bug"
git commit -m "Update dark mode colors"
git commit -m "Remove unused dependencies"
```

### コミットメッセージの書き方

- **動詞で始める**: Add, Fix, Update, Remove
- **簡潔に**: 50文字以内
- **何をしたか**明確に

### プレフィックス（任意）

```bash
git commit -m "feat: 自動バックアップ機能を追加"
git commit -m "fix: ワインリストのソートバグを修正"
git commit -m "docs: READMEを更新"
git commit -m "style: CSSのインデントを修正"
```

---

## .gitignoreファイル

### 役割

Gitで管理しないファイルを指定。

### 例（プロジェクトに追加済み）

```
node_modules/
.DS_Store
*.log
.env
.vscode/
dist/
```

---

## よくある質問

### Q: git add -A と git add . の違いは？

- `git add -A`: **すべての変更**（削除も含む）
- `git add .`: **カレントディレクトリ以下**の変更のみ

→ 通常は `git add -A` を推奨

### Q: コミットメッセージを間違えた

```bash
# 直前のコミットメッセージを修正
git commit --amend -m "正しいメッセージ"

# すでにプッシュした場合（注意！）
git push origin main --force
```

### Q: 誰がいつ変更したか知りたい

```bash
# ファイルの履歴を表示
git log --follow ファイル名

# 行ごとに変更者を表示
git blame ファイル名
```

### Q: 特定のコミットに戻りたい

```bash
# コミットIDを確認
git log --oneline

# 特定のコミットに戻る（慎重に！）
git reset --hard コミットID
git push origin main --force
```

---

## チートシート（まとめ）

| 操作 | コマンド |
|------|---------|
| 変更確認 | `git status` |
| 変更追加 | `git add -A` |
| コミット | `git commit -m "メッセージ"` |
| プッシュ | `git push origin main` |
| プル | `git pull origin main` |
| 履歴表示 | `git log --oneline` |
| 変更取消（コミット前） | `git restore .` |
| ブランチ作成 | `git checkout -b ブランチ名` |
| ブランチ切替 | `git checkout main` |

---

## 参考リンク

- [Git公式ドキュメント](https://git-scm.com/doc)
- [GitHub Docs](https://docs.github.com/)
- [Netlifyドキュメント](https://docs.netlify.com/)
- [プロジェクトリポジトリ](https://github.com/773hinako/wine_app)

---

**困ったときは、まず `git status` を実行！**

何か問題があれば、このガイドを参照してください 🚀
