import { EXERCISES } from '../exercises.js';

const before = new Map(EXERCISES.map((exercise) => [exercise.id, exercise.prompt]));

await import('../tableGuideEnhancer.js');

const changed = EXERCISES.filter((exercise) => exercise.prompt !== before.get(exercise.id));

if (changed.length) {
  console.error('Exercise prompt mutation detected:');
  for (const exercise of changed) {
    console.error(`- ${exercise.id}`);
  }
  process.exit(1);
}

console.log(`Prompt integrity OK: ${EXERCISES.length} exercise prompts unchanged.`);
