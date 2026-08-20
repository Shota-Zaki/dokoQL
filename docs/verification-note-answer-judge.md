# Answer judge verification scope

This change specifically prevents a displayed/copyable answer example from being judged against a different SQL baseline.

The regression checks verify that:

1. Every exercise has a displayed answer and judge baseline.
2. `answerSql` and `referenceAnswerSql` are identical after content integration.
3. Existing runtime display/copy/judge paths continue to consume those synchronized fields.

This does not replace SQL-engine execution testing for syntax or dataset-specific semantics; those remain separate checks.
