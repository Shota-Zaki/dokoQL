import '../fixes.js';
import { EXERCISES } from '../exercises.js';
await import('../contentIntegration.js');
await import('../sourcePromptIntegration.js');
const { extractTopLevelSelectAliases } = await import('../answerAliasPromptEnhancer.js');

const errors = [];
let aliasExerciseCount = 0;

for (const exercise of EXERCISES) {
  if (exercise.type !== 'select') continue;
  const aliases = extractTopLevelSelectAliases(exercise.answerSql || exercise.referenceAnswerSql || '');
  if (!aliases.length) continue;
  aliasExerciseCount += 1;

  for (const alias of aliases) {
    const clause = `AS ${alias}`;
    if (!exercise.prompt.includes(clause)) {
      errors.push(`${exercise.id}: prompt is missing required clause ${clause}`);
    }
  }
}

if (errors.length) {
  console.error('AS alias prompt check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`AS alias prompt check passed: ${aliasExerciseCount} SELECT exercises explicitly state every required top-level AS clause.`);
