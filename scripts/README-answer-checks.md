# Answer consistency checks

`check-answer-baseline.mjs` ensures the displayed answer and judge baseline are identical after content integration.

`check-answer-copy-path.mjs` guards the current runtime paths so future refactors do not silently bypass that synchronization.
