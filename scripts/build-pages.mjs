import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, '_site');

const publicFiles = [
  'index.html',
  'styles.css',
  'layout-overrides.css',
  'boot.js',
  'app.js',
  'datasets.js',
  'exercises.js',
  'fixes.js',
  'contentIntegration.js',
  'sourcePromptIntegration.js',
  'learningContent.js',
  'tableGuideEnhancer.js',
  'dbNotesEnhancer.js',
  'headerReferenceEnhancer.js',
  'problemSelectEnhancer.js',
  'nextProblemEnhancer.js',
  'retryEnhancer.js',
  'sqlInputPalette.js',
  'sqlInputPalette.css',
  'editorLayoutEnhancer.js',
  'editorSplit.css',
  'hintEnhancer.js',
  'answerEnhancer.js',
  'sql-reference.html',
  'sql-reference.css',
  'sql-reference.js',
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const file of publicFiles) {
  await cp(resolve(root, file), resolve(output, file));
}
await cp(resolve(root, 'content'), resolve(output, 'content'), { recursive: true });
await writeFile(resolve(output, '.nojekyll'), '');

console.log(`Prepared ${publicFiles.length} public files plus content/ in _site/`);
