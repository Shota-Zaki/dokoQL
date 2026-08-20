import '../fixes.js';
import { DATASETS, DATASET_ORDER } from '../datasets.js';
import { EXERCISES, EXERCISES_BY_DATASET } from '../exercises.js';
await import('../contentIntegration.js');
await import('../sourcePromptIntegration.js');
await import('../tableGuideEnhancer.js');

const expectedCounts = {
  bank: 75,
  store: 70,
  rpg: 70,
  normalization: 22,
  design: 16,
};

const errors = [];
const ids = new Set();
const tableGuidePattern = /^(使用テーブル|対象テーブル|作成・変更対象|参照対象): .+$/;

for (const datasetId of DATASET_ORDER) {
  if (!DATASETS[datasetId]) errors.push(`dataset not found: ${datasetId}`);
  const rows = EXERCISES_BY_DATASET[datasetId] || [];
  if (rows.length !== expectedCounts[datasetId]) {
    errors.push(`${datasetId}: expected ${expectedCounts[datasetId]} exercises, got ${rows.length}`);
  }
}

for (const exercise of EXERCISES) {
  if (ids.has(exercise.id)) errors.push(`duplicate exercise id: ${exercise.id}`);
  ids.add(exercise.id);

  for (const key of ['id', 'datasetId', 'chapter', 'number', 'type', 'prompt']) {
    if (exercise[key] === undefined || exercise[key] === null || exercise[key] === '') {
      errors.push(`${exercise.id || '(unknown)'}: missing ${key}`);
    }
  }

  if (!exercise.answerSql?.trim()) errors.push(`${exercise.id}: answer example is missing`);
  if (!exercise.referenceAnswerSql?.trim()) errors.push(`${exercise.id}: detailed answer example is missing`);
  if (exercise.answerSql !== exercise.referenceAnswerSql) {
    errors.push(`${exercise.id}: displayed answer and judge answer differ`);
  }
  if (!exercise.referenceExplanation?.trim()) errors.push(`${exercise.id}: detailed explanation is missing`);
  if (!DATASETS[exercise.datasetId]) errors.push(`${exercise.id}: unknown dataset ${exercise.datasetId}`);
  if (!exercise.tableGuide?.trim()) errors.push(`${exercise.id}: table guidance metadata is missing`);
  else if (!tableGuidePattern.test(exercise.tableGuide)) errors.push(`${exercise.id}: invalid table guidance metadata`);
}

if (EXERCISES.length !== Object.values(expectedCounts).reduce((sum, value) => sum + value, 0)) {
  errors.push(`unexpected total exercise count: ${EXERCISES.length}`);
}

if (errors.length) {
  console.error('Data check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Data check passed: ${EXERCISES.length} exercises across ${DATASET_ORDER.length} datasets, with canonical prompts, separate table guidance metadata, and identical displayed/judged answers.`);
