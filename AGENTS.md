# Repository Operating Rules

## 1. 基本原則

- `task-list.md`をTask状態、scope、Acceptance Criteria、残件の唯一の文書正本とする。
- `NEXT_WORK.md`を次担当が行う直近1工程のポインタとする。
- 現在Taskが未設定の場合、ユーザーの明示指示なしに新規Taskを作成・開始しない。
- `DESIGN.md`、既存コード、既存データ契約、既存検査コマンドは保持する。この運用統一では検証方法そのものを変更しない。

## 2. GitHub Actions

- GitHub Actionsは使用しない。
- workflowの起動・再実行・結果確認・Artifact取得を、作業、検証、レビュー、完了判定、公開判定に使用しない。
- `.github/workflows/`を新規追加・再追加しない。

## 3. Git操作

- 恒久作業Branchは`work`とする。
- `work`へのcommit / pushはcurrentTaskのscope内なら都度確認なしで実行してよい。
- 既存作業Branchから`work`へのmergeもscope内なら都度確認なしで実行してよい。
- **`main`へのmergeは、実行直前に必ずユーザーへ確認し、明示承認後のみ行う。**
- `main`への直接push、force push、rebase、共有履歴の書き換えは禁止する。
- deploy、外部公開、課金、破壊的変更、重大な仕様変更はユーザーの明示承認または既存ルールに従う。

## 4. 管理文書

- **すべての作業で、最終報告前に必ず`task-list.md`を更新する。**
- **すべての作業で、最終報告前に必ず`NEXT_WORK.md`を更新する。**
- 次Taskが未設定なら勝手に作らず`未設定`と記録する。
- liveなbranch / PR / HEADは必要時にGitHubから取得し、READMEへ固定しない。

## 5. README

- READMEには現在Task、Current HEAD、Review HEAD、現在PR、liveな進捗率を書かない。
- READMEはプロジェクト概要、構成、セットアップ、静的な運用説明、管理文書への案内に限定する。

## 6. 最終報告

最終返答には最低限、次を含める。

1. `今回の作業内容`
2. `検証結果`
3. `現在の状態`
4. `残タスク一覧` — Active / Ready / Planned / Blocked / Deferred等を区別して省略しない
5. `完成度` — **必ずXX%形式**。原則 `完了Acceptance Criteria数 ÷ Acceptance Criteria総数 × 100` の整数丸め。別基準なら根拠を併記する
6. `問題・残件`
7. `次の作業`
8. `ユーザー確認が必要な操作` — 少なくとも`main`へのmerge
