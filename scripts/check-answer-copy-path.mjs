import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const enhancer = await readFile(new URL('../answerEnhancer.js', import.meta.url), 'utf8');

const errors = [];

if (!app.includes("await state.db.exec(ex.answerSql)")) {
  errors.push('judge no longer executes exercise.answerSql; update the contract check intentionally');
}
if (!app.includes("currentExercise()?.answerSql || ''")) {
  errors.push('base copy path no longer uses exercise.answerSql; update the contract check intentionally');
}
if (!enhancer.includes("exercise.referenceAnswerSql || exercise.answerSql || ''")) {
  errors.push('enhanced answer display/copy resolver changed; update the contract check intentionally');
}

if (errors.length) {
  console.error('Answer copy path check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Answer copy path OK: runtime paths are covered by canonical answer synchronization.');
