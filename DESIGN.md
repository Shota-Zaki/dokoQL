# SQL Practice Lab — Design Policy

## 1. Purpose

ブラウザだけでSQLを入力・実行し、問題演習、結果確認、解答例の参照、学習進捗の保存まで完結できる自己学習用Webアプリとする。

主目的は「問題文を読む → テーブルを確認する → SQLを書く → 実行する → 結果を比較する → 解答例と解説で復習する」という学習ループを最短距離で回すこと。

## 2. UI direction

採用方針: **問題演習 + DBワークベンチ型**。

### Desktop / iPad landscape

3ペインを基本とする。

- 左: 問題ナビゲーション
  - 題材切替
  - Chapter切替
  - 問題一覧
  - 回答状態・正誤・見直し状態
- 中央: 問題 + SQLエディタ
  - 問題文
  - SQL入力欄
  - 実行 / 判定 / 解答例 / ヒント / リセット
- 右: データベース
  - テーブル一覧
  - テーブル定義
  - 初期データ / 現在データ
- 下部: 実行結果
  - 表形式
  - 更新件数
  - エラー
  - 判定理由

### Mobile / narrow layout

1カラム + タブ切替とする。

- 問題
- SQL
- DB
- 結果

SQL入力中に画面幅を消費しないことを優先する。

## 3. Visual language

- 学習用途を優先した情報密度高めの管理UI
- 背景は低彩度の明色
- 強調色は青緑系を1色のみ使用
- 正解 / 完了は緑、誤答 / エラーは赤、見直しは黄で状態を区別
- 大きな装飾画像は使用しない
- カードの角丸と影は控えめ
- SQL・DDL・実行結果は等幅フォント
- 本文は可読性を優先した日本語UI

## 4. Information architecture

```text
Home
├─ SQL Drill
│  ├─ Bank-like dataset
│  │  ├─ Chapter 2: basic syntax / CRUD
│  │  ├─ Chapter 3: filtering
│  │  ├─ Chapter 4: result processing
│  │  ├─ Chapter 5: expressions / functions
│  │  ├─ Chapter 6: aggregation / grouping
│  │  ├─ Chapter 7: subqueries
│  │  └─ Chapter 8: joins
│  ├─ Store-like dataset
│  └─ RPG-like dataset
├─ Normalization Drill
│  ├─ Basic 16 exercises
│  └─ Comprehensive 6 exercises
└─ Database Design Exercise
```

画面上では日本語名称を使用し、内部IDは英数字とする。

## 5. Core learning interactions

### Execute

SQLをブラウザ内DBで実行し、SELECT結果、更新件数、エラーを表示する。

### Judge

問題ごとに次のいずれかで判定する。

1. SELECT: 期待結果と行・列を正規化して比較
2. INSERT / UPDATE / DELETE: 対象テーブルの状態を期待状態と比較
3. DDL: schema metadataを比較
4. 正規化 / 設計問題: 自動判定せず解答例と観点を表示

SQL文字列の完全一致では判定しない。同じ結果を得る妥当な別解を許容する。

判定用の基準SQLと、学習画面で表示する詳細な解答例は分離できる構造とする。これにより解説を改善しても自動判定を不用意に壊さない。

### Reset

問題開始時のDBスナップショットに戻す。

### Answer example

- 初期状態では折りたたむ
- ユーザー操作でのみ表示
- 解答SQLまたは設計例
- SQLを構成する考え方
- 実行結果の確認ポイント
- 主要句・関数・正規化観点の説明
- 必要に応じて代表的な別解や注意点

## 6. Data model

問題データはアプリ本体から分離する。

```ts
interface Exercise {
  id: string;
  datasetId: string;
  chapter: number;
  number: number;
  title?: string;
  prompt: string;
  type: 'select' | 'insert' | 'update' | 'delete' | 'ddl' | 'design';
  hint?: string[];
  answerSql?: string;
  explanation?: string;
  referenceAnswerSql?: string;
  referenceExplanation?: string;
  referenceCheck?: string;
  validation?: ValidationRule;
}
```

初期DBもdataset単位のSQLとして分離する。

## 7. Persistence

ブラウザローカル保存を基本とする。

保存対象:

- 問題ごとの入力SQL
- 正誤
- 解答回数
- 最終実行日時
- 見直しフラグ
- 最後に開いた問題
- UIペイン状態

DBそのものは学習結果とは分離し、問題単位で初期化可能にする。

## 8. Technical policy

- 静的ホスティングで動作すること
- サーバー必須機能をMVPへ入れない
- ブラウザ内でPostgreSQL互換性の高いSQL実行環境を利用する
- 外部サービスへのSQL送信を行わない
- DB初期化SQL、問題、解答、判定ロジックをそれぞれ分離する
- 詳細解説データはアプリ本体から分離し、必要時にブラウザ内で展開する
- 将来的に別の学習ポータルへ統合しやすいよう、ルーティングとデータ層を疎結合にする

## 9. Responsive breakpoints

- >= 1180px: 3ペイン
- 768px–1179px: 2ペイン + DBドロワー
- < 768px: 1カラム + タブ

## 10. Accessibility

- キーボードだけで主要操作可能
- 実行: Ctrl/Cmd + Enter
- フォーカスリングを消さない
- 色だけで正誤を伝えない
- 実行結果テーブルに見出しを付与
- ボタンには動作を示すテキストを付ける

## 11. MVP completion criteria

1. 静的配信で起動できる
2. SQL問題を選択できる
3. テーブル定義と初期データを確認できる
4. SQLを実行できる
5. SELECT結果を表で確認できる
6. 更新系SQLを実行できる
7. DBを初期状態へ戻せる
8. 問題の解答例・考え方・確認ポイントを表示できる
9. 学習進捗がブラウザに保存される
10. PC / iPad / iPhone幅で操作できる

## 12. Implementation priority

1. Shell / responsive layout
2. Browser DB engine
3. Dataset loader
4. Exercise loader
5. SQL execution / results
6. Reset
7. Answer / explanation
8. Progress persistence
9. Automatic judging
10. Remaining drills / design exercises

## 13. Progressive hint policy

ヒントは「答えを短く言い換える欄」ではなく、自力で次の一手を考えられるように段階的に開示する学習支援とする。

### SQL問題

1. **方針**: 何を取得・更新する問題か、どの表・行・集計単位を見るべきかを示す。SQL構文名や完成形はできるだけ出さない。
2. **使う道具**: 必要になる句・演算子・関数・結合方法の候補を示す。設問固有の値や完成SQLはまだ出さない。
3. **SQLの骨組み**: 解答例の構造だけを示し、文字列・数値などの条件値は伏せる。ここまで見ても分からない場合に解答例へ進める。

### 正規化・設計問題

1. **整理の順番**: 主キー、関数従属、繰り返し項目、多対多など、最初に確認する観点を示す。
2. **見る関係**: どの依存関係・エンティティ間関係を分離すべきかを示す。
3. **最終チェック**: 解答例を直接複製せず、分解後の表が満たすべき条件や不足しやすいキーを示す。

### Interaction

- 最初のクリックではヒント1だけを表示する。
- 「次のヒント」で2、3を順番に追加表示する。
- ヒント3まで表示した後にのみ「ヒントを閉じる」とする。
- 問題を移動したら開示段階をリセットする。
- ヒント表示だけでは正誤状態を変更しない。

## 14. Problem table guidance

SQLを書く前に対象範囲を迷わないよう、各問題文の先頭へ使用・対象テーブルを明示する。

- SELECT: `使用テーブル: ...`
- INSERT / UPDATE / DELETE: `対象テーブル: ...`
- DDL: `作成・変更対象: ...`
- JOIN、集合演算、副問い合わせでは必要な実テーブルをすべて列挙する。
- CTE名や一時的な別名は実テーブルとして表示しない。
- 正規化・設計問題のように実行用テーブルを使用しない場合は `参照対象: 問題文に示された表・業務データ` と明示する。
- テーブル案内はヒントではなく問題条件として常時表示し、正解・不正解やヒント閲覧状態に依存させない。

## 15. Click-to-insert SQL palette

SQL EDITORでは、キーボード入力に加えてクリックだけでもSQLを組み立てられる入力パレットを提供する。

### SQL parts

- 主要命令・句: `SELECT`, `FROM`, `WHERE`, `INSERT INTO`, `VALUES`, `UPDATE`, `SET`, `DELETE FROM`, `ORDER BY`, `ASC`, `DESC`, `AS` など。
- 絞り込み・結合・集計: `AND`, `OR`, `NOT`, `LIKE`, `IN`, `BETWEEN`, `IS NULL`, `GROUP BY`, `HAVING`, `JOIN`, `ON`, `LIMIT`, `OFFSET` など。
- 演算子・記号: `*`, `,`, `=`, `<>`, `>`, `<`, `>=`, `<=`, `(`, `)`, `;`。
- 集計関数は `COUNT()`, `SUM()`, `AVG()`, `MAX()`, `MIN()` の形で挿入し、括弧内へカーソルを移動する。

### Tables and columns

- 現在の題材で利用できるテーブル名をボタン表示する。
- 現在の問題で使用するテーブルを先頭・強調表示する。
- テーブル名をクリックするとSQL EDITORの現在カーソル位置へ挿入し、そのテーブルをカラム選択対象にする。
- 選択テーブルのカラム名をボタン表示し、クリックするとカーソル位置へ挿入する。
- JOIN時に同名カラムを区別できるよう、必要に応じて `テーブル名.カラム名` で挿入できる切替を用意する。

### Editor behavior

- クリック挿入は常に現在の選択範囲・カーソル位置を尊重する。
- 挿入後もSQL EDITORへフォーカスを戻す。
- クリック挿入も通常入力と同様に下書き保存対象とする。
- PCでは複数行パレット、狭い画面では横スクロールできるコンパクト表示とする。
- 記述式問題ではSQL入力パレットを表示しない。

## 16. Unlimited retry behavior

SQL演習では、構文エラー・実行エラー・不正解が発生しても学習セッションをロックせず、同じ問題で何度でも修正して再実行・再判定できることを必須とする。

- SQL実行エラー後も `実行` / `判定` / `DB初期化` を再度使用できる状態へ必ず戻す。
- SQL実行エラー時は、エラー表示を残したままDBを問題開始状態へ自動復旧し、次の試行が前回の失敗状態に影響されないようにする。
- 不正解判定後も入力SQLを保持し、その場で修正して再判定できるようにする。
- INSERT / UPDATE / DELETE / DDL の失敗や不正解でも、次回試行は問題開始時のDB状態から再開できるようにする。
- 再試行回数に上限を設けない。
- 正解済みの問題も、SQLを変更して再実行・再判定できる。
- DBエンジン自体の初期化不能など、演習SQLとは無関係な致命的エラーだけは通常の再試行対象から除外する。
