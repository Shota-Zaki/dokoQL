import { DATASETS } from './datasets.js';
import { EXERCISES_BY_DATASET } from './exercises.js';

const PREFIX_PATTERN = /^(使用テーブル|対象テーブル|作成・変更対象|参照対象):/;

function tableNamesFromSeed(datasetId) {
  const seed = DATASETS[datasetId]?.seedSql || '';
  const names = [];
  const pattern = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:"([^"]+)"|([^\s(]+))/gi;
  let match;
  while ((match = pattern.exec(seed))) {
    const name = (match[1] || match[2] || '').replace(/;$/, '').trim();
    if (name && !names.includes(name)) names.push(name);
  }
  return names;
}

function tablesUsedByExercise(exercise, knownTables) {
  const source = [
    exercise.prompt,
    exercise.answerSql,
    exercise.referenceAnswerSql,
    exercise.setupSql,
  ].filter(Boolean).join('\n');

  if (knownTables.length) {
    return knownTables.filter(name => source.includes(name));
  }

  const names = [];
  const patterns = [
    /\bFROM\s+(?:"([^"]+)"|([^\s,;()]+))/gi,
    /\bJOIN\s+(?:"([^"]+)"|([^\s,;()]+))/gi,
    /\bUPDATE\s+(?:"([^"]+)"|([^\s,;()]+))/gi,
    /\bINSERT\s+INTO\s+(?:"([^"]+)"|([^\s,;()]+))/gi,
    /\bDELETE\s+FROM\s+(?:"([^"]+)"|([^\s,;()]+))/gi,
    /\bALTER\s+TABLE\s+(?:"([^"]+)"|([^\s,;()]+))/gi,
    /\bCREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:"([^"]+)"|([^\s,;()]+))/gi,
    /\bTRUNCATE(?:\s+TABLE)?\s+(?:"([^"]+)"|([^\s,;()]+))/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(source))) {
      const name = (match[1] || match[2] || '').replace(/[";]/g, '').trim();
      if (name && !names.includes(name)) names.push(name);
    }
  }
  return names;
}

function labelFor(exercise) {
  if (exercise.type === 'select') return '使用テーブル';
  if (['insert', 'update', 'delete'].includes(exercise.type)) return '対象テーブル';
  if (exercise.type === 'ddl') return '作成・変更対象';
  return '参照対象';
}

function guideFor(exercise, tables) {
  const label = labelFor(exercise);
  if (tables.length) return `${label}: ${tables.join(' / ')}`;

  if (exercise.type === 'design') {
    return `${label}: 問題文に示された表・業務データ`;
  }

  return `${label}: 現在の題材データ`;
}

for (const [datasetId, exercises] of Object.entries(EXERCISES_BY_DATASET)) {
  const knownTables = tableNamesFromSeed(datasetId);
  for (const exercise of exercises) {
    if (!exercise?.prompt || PREFIX_PATTERN.test(exercise.prompt.trimStart())) continue;
    const tables = tablesUsedByExercise(exercise, knownTables);
    exercise.tableGuide = guideFor(exercise, tables);
    exercise.prompt = `${exercise.tableGuide}\n\n${exercise.prompt}`;
  }
}
