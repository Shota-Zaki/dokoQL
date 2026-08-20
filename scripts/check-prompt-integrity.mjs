import '../fixes.js';
import { EXERCISES, EXERCISES_BY_DATASET } from '../exercises.js';
await import('../contentIntegration.js');
const { SOURCE_PROMPTS_BY_DATASET } = await import('../sourcePromptIntegration.js');

const expectedCounts = { bank: 75, store: 70, rpg: 70 };
const errors = [];

for (const [datasetId, expectedCount] of Object.entries(expectedCounts)) {
  const rows = EXERCISES_BY_DATASET[datasetId] || [];
  const sourcePrompts = SOURCE_PROMPTS_BY_DATASET[datasetId] || {};

  if (rows.length !== expectedCount) {
    errors.push(`${datasetId}: expected ${expectedCount} exercises, got ${rows.length}`);
  }
  if (Object.keys(sourcePrompts).length !== expectedCount) {
    errors.push(`${datasetId}: expected ${expectedCount} source prompts, got ${Object.keys(sourcePrompts).length}`);
  }

  const numbers = new Set(rows.map((exercise) => exercise.number));
  for (const number of Object.keys(sourcePrompts).map(Number)) {
    if (!numbers.has(number)) errors.push(`${datasetId}: source prompt ${number} has no exercise`);
  }

  for (const exercise of rows) {
    const expected = sourcePrompts[exercise.number];
    if (exercise.prompt !== expected) {
      errors.push(`${exercise.id}: prompt differs from canonical source transcription`);
    }
  }
}

const beforeEnhancers = new Map(EXERCISES.map((exercise) => [exercise.id, exercise.prompt]));
await import('../tableGuideEnhancer.js');

for (const exercise of EXERCISES) {
  if (exercise.prompt !== beforeEnhancers.get(exercise.id)) {
    errors.push(`${exercise.id}: prompt mutated after canonical source integration`);
  }
}

if (errors.length) {
  console.error('Prompt integrity check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Prompt integrity OK: 215 SQL drill prompts exactly match canonical source transcriptions and remain unchanged after enhancers.');
