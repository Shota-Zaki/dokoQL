# SQL Practice Lab

ブラウザ上でSQLを書き、実行結果とテーブル内容を確認しながら学習する静的Webアプリです。SQLはブラウザ内のPostgreSQL互換エンジンで実行します。

## 収録範囲

- 銀行口座を題材にしたSQL演習: 75問
- 商店を題材にしたSQL演習: 70問
- RPG形式のSQL演習: 70問
- 正規化演習: 22問
- 予約管理データベースの設計・DDL・データ利用演習: 16問
- 合計: 253問

## 主な機能

- 問題、Chapter、回答状態による絞り込み
- SQLエディタとクリック入力
- SELECT / INSERT / UPDATE / DELETE / DDLのブラウザ内実行
- テーブルデータと定義の確認
- DB初期化、自動判定、解答例、ヒント
- 入力SQL、正誤、回答回数、見直し状態のローカル保存
- SQL語リファレンス

## 構成

リポジトリ直下のアプリファイルを正本とします。GitHub Pages用の公開コピーはGit管理せず、CIが `_site/` を毎回クリーン生成します。

```text
.
├── index.html
├── styles.css
├── boot.js
├── app.js
├── datasets.js
├── exercises.js
├── content/
├── DESIGN.md
├── scripts/
│   ├── check-data.mjs
│   └── build-pages.mjs
└── .github/workflows/pages.yml
```

## ローカル確認

ES Modulesを使用しているためHTTPサーバー経由で確認します。

```bash
python -m http.server 4173
```

ブラウザで `http://localhost:4173/` を開きます。

## 検査

Node.js 22以降で実行します。

```bash
npm run check
npm run build:pages
```

`npm run check` はJavaScript構文、問題数、ID重複、必須フィールド等を検査します。`npm run build:pages` は公開に必要なファイルだけを `_site/` へ生成します。

## 公開

`main` 更新時にGitHub Actionsが検査後、`_site/` をGitHub Pagesへデプロイします。`docs/` の手動同期は行いません。

## データ方針

- SQL実行はブラウザ内で完結し、入力SQLを外部サーバーへ送信しません。
- 学習進捗はLocal Storageへ保存します。
- 初期データと問題文は公開学習用に再構成しています。
- 正規化などの記述式問題は解答例との比較で学習します。
