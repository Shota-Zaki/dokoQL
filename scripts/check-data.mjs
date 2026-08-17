import '../fixes.js';
import { DATASETS, DATASET_ORDER } from '../datasets.js';
import { EXERCISES, EXERCISES_BY_DATASET } from '../exercises.js';
await import('../contentIntegration.js');

const expectedCounts = {
  bank: 75,
  store: 70,
  rpg: 70,
  normalization: 22,
  design: 16,
};

const errors = [];
const ids = new Set();

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
  if (!exercise.referenceExplanation?.trim()) errors.push(`${exercise.id}: detailed explanation is missing`);
  if (!DATASETS[exercise.datasetId]) errors.push(`${exercise.id}: unknown dataset ${exercise.datasetId}`);
}

if (EXERCISES.length !== Object.values(expectedCounts).reduce((sum, value) => sum + value, 0)) {
  errors.push(`unexpected total exercise count: ${EXERCISES.length}`);
}

if (errors.length) {
  console.error('Data check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Data check passed: ${EXERCISES.length} exercises across ${DATASET_ORDER.length} datasets.`);
