import '../fixes.js';
import { EXERCISES } from '../exercises.js';
await import('../contentIntegration.js');
await import('../sourcePromptIntegration.js');

const errors = [];
let autoJudged = 0;

for (const exercise of EXERCISES) {
  const displayed = exercise.referenceAnswerSql || exercise.answerSql || '';
  const judged = exercise.answerSql || '';

  if (exercise.type !== 'design') autoJudged += 1;
  if (!displayed.trim()) errors.push(`${exercise.id}: displayed answer is empty`);
  if (!judged.trim()) errors.push(`${exercise.id}: judge answer is empty`);
  if (displayed !== judged) errors.push(`${exercise.id}: displayed answer differs from judge baseline`);
}

if (errors.length) {
  console.error('Answer baseline check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Answer baseline OK: ${EXERCISES.length} displayed answers equal judge baselines (${autoJudged} auto-judged exercises).`);
