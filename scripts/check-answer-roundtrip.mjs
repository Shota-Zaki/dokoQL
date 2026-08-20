import '../fixes.js';
import { EXERCISES } from '../exercises.js';
await import('../contentIntegration.js');
await import('../sourcePromptIntegration.js');

const failures = EXERCISES.filter((exercise) => {
  const copiedAnswer = exercise.referenceAnswerSql || exercise.answerSql || '';
  const judgeAnswer = exercise.answerSql || '';
  return copiedAnswer !== judgeAnswer;
});

if (failures.length) {
  console.error('Answer roundtrip invariant failed:');
  for (const exercise of failures) console.error(`- ${exercise.id}`);
  process.exit(1);
}

console.log(`Answer roundtrip invariant OK: ${EXERCISES.length} copied answers resolve to the same judge baseline.`);
