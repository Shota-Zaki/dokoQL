# NEXT_WORK.md

## Current pointer

- Active Task: `未設定`
- Status: `waiting`
- Next Role: `Repository owner`
- Branch: `work`
- Next Action: `次に進めるTaskを指定する`
- Blocking / unresolved: `currentTask未設定`
- Next Command: `なし`
- Verification entrypoint: `npm run verify:agent`

## Mandatory update rule

- **すべての作業で、最終報告前に必ずこのファイルを更新する。**
- 詳細なscope、Acceptance Criteria、残件は`task-list.md`を正とする。
- GitHub Actionsは使用しない。
- `main`へのmergeはユーザーの明示承認後のみ行う。

## 2026-09-06 静的監査の補足

- 通常のCurrent pointerは変更しない。今回の監査を理由に、新しい教材・機能Taskを開始しない。
- `audit/static-20260906` にdataset選択の限定修正を保存した。根拠と修正後コードHEADは `task-list.md` の同日Operations Logを参照する。
- 今回は実行検証なしで静的再レビューを行った。上記Verification entrypointを今回実行する指示ではなく、未実行を監査のBLOCKED理由にもしない。
- 監査branchから既存branchへの統合・公開は未実施。残りの静的監査範囲は所有者の非公開正本 `ALL_REPOSITORIES_AUDIT.md` で追跡する。
