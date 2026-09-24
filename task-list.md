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
### 2026-09-24 — Japan-Learning-Lab境界整理

- 本Repositoryを独立SQL Practice Labとして維持し、`Shota-Zaki/Japan-Learning-Lab` のDB / SQL laneとの自動同期・双方向同期を行わない契約をREADMEへ追加した。
- 再利用時はID / 出典 / license / expected result / 保存契約の対応表を先に作り、移管または参照として扱う。
- 製品実装Taskは新設していない。currentTaskは`未設定`のまま。

