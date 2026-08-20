import '../fixes.js';
import { EXERCISES, EXERCISES_BY_DATASET } from '../exercises.js';
await import('../contentIntegration.js');
const { SOURCE_PROMPTS_BY_DATASET } = await import('../sourcePromptIntegration.js');
await import('../answerAliasPromptEnhancer.js');

const expectedCounts = {
  bank: 75,
  store: 70,
  rpg: 70,
  normalization: 22,
  design: 16,
};
const errors = [];

for (const [datasetId, expectedCount] of Object.entries(expectedCounts)) {
  const rows = EXERCISES_BY_DATASET[datasetId] || [];
  const sourcePrompts = SOURCE_PROMPTS_BY_DATASET[datasetId] || {};

  if (rows.length !== expectedCount) errors.push(`${datasetId}: expected ${expectedCount} exercises, got ${rows.length}`);
  if (Object.keys(sourcePrompts).length !== expectedCount) errors.push(`${datasetId}: expected ${expectedCount} source prompts, got ${Object.keys(sourcePrompts).length}`);

  for (const exercise of rows) {
    const expected = sourcePrompts[exercise.number];
    if (exercise.sourcePrompt !== expected) errors.push(`${exercise.id}: canonical source prompt changed`);
    if (!exercise.prompt.startsWith(expected)) errors.push(`${exercise.id}: displayed prompt no longer preserves canonical source text`);
  }
}

const beforeEnhancers = new Map(EXERCISES.map((exercise) => [exercise.id, exercise.prompt]));
await import('../tableGuideEnhancer.js');
for (const exercise of EXERCISES) {
  if (exercise.prompt !== beforeEnhancers.get(exercise.id)) errors.push(`${exercise.id}: prompt mutated after AS requirement integration`);
}

if (errors.length) {
  console.error('Prompt integrity check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Prompt integrity OK: ${EXERCISES.length} canonical prompts are preserved, with only explicit AS requirements appended where needed.`);
