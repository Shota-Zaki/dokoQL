# task-list.md

このファイルは進行・Task状態・scope・Acceptance Criteria・残件の唯一の文書正本です。

## Current Task

- currentTask: `未設定`
- status: `waiting`
- completionPercentage: `0%`
- branch: `work`

ユーザーが次Taskを明示するまで、新しい実装Taskを推測して開始しません。

## Remaining Tasks

- Active: なし
- Ready: なし
- Planned: なし
- Blocked / Deferred: なし
- Unset: Repository ownerによる次Task設定

## Repository operation policy

- GitHub Actionsは使用しない。
- `work`へのcommit / push / scope内mergeは都度確認なしで実行可能。
- `main`へのmergeは必ず直前にユーザー確認を行う。
- READMEへ現在TaskやHEAD等のlive値を記録しない。
- **すべての作業で、このファイルと`NEXT_WORK.md`を必ず更新する。**
- 検証方法は既存Repository仕様に従い、この運用統一では変更しない。

## Repository Operations Log

### 2026-09-02 — ChatGPT/Codex検証入口

- `npm run verify:agent`を追加した。
- 既存の`check`と`build:pages`を順番に呼ぶbaselineとした。
- `VERIFY_AGENT.md`に固定SHA、Task固有追加検証、未実施の扱い、証拠記録ルールを定義した。
- ブラウザ操作などCurrent Task固有の検証はAcceptance Criteriaから追加実行する。

### 2026-09-06 — 全Repository静的監査に伴う限定修正

- ユーザーの全Repository監査指示に基づき、`work`の固定HEAD `05ef3bf187a1cf646679f81c584af395109227aa` から `audit/static-20260906` を分離した。通常のCurrent Task未設定・waiting・0%は変更しない。
- `app.js` の保存済みdataset選択で、継承プロパティを有効なdatasetと誤認しないよう `Object.hasOwn(DATASETS, state.session.datasetId)` に変更した。
- 最終コードHEAD `eb749fb01833a28b2a4e525cde01271087f6c51f` と修正前HEADのGitHub compareを読み、アプリ差分が上記1行のみであることを確認した。途中の編集で混入した不要行・文言変更・末尾改行差は後続commitで除去し、履歴は書き換えていない。
- この個別修正は `FIXED`（実修正・静的再レビュー済み）。全コード・教材・補助処理の監査完了を意味しない。
- 今回は実行検証を行わない。test、build、lint、formatter、typecheck、構文チェック、Actions、アプリ起動等を実行しておらず、PASSも要求しない。既存の通常運用の検証入口は変更しない。
- `main` / `work` / 公開サイト / 利用者PCへの反映は行っていない。`main`へのmergeは引き続き明示承認が必要。
- 詳細な監査根拠・変更履歴・未読範囲は、所有者の非公開監査正本 `ALL_REPOSITORIES_AUDIT.md` で管理する。新しい実装Taskは推測で開始しない。
