# Answer / Judge Contract

- The answer shown in the answer dialog, copied by the copy button, and executed internally as the judge baseline must be the same SQL string.
- `referenceAnswerSql` is the canonical answer when detailed content provides it.
- `answerSql` must be synchronized to the canonical answer before the UI and judge load.
- A regression check must fail CI if the displayed answer and judge baseline differ.
- This contract applies to every exercise; design exercises are not auto-judged but still keep a single canonical answer representation.
