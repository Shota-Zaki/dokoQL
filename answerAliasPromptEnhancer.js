import { EXERCISES } from './exercises.js';

const AS_NOTE_PREFIX = '【列別名（AS句）の指定】';

function isWordChar(ch) {
  return /[A-Za-z0-9_一-龯ぁ-んァ-ヶー]/u.test(ch || '');
}

function readWord(sql, start) {
  let i = start;
  while (i < sql.length && isWordChar(sql[i])) i += 1;
  return { value: sql.slice(start, i), end: i };
}

function readQuotedIdentifier(sql, start) {
  let i = start + 1;
  while (i < sql.length) {
    if (sql[i] === '"') {
      if (sql[i + 1] === '"') {
        i += 2;
        continue;
      }
      return { value: sql.slice(start, i + 1), end: i + 1 };
    }
    i += 1;
  }
  return { value: sql.slice(start), end: sql.length };
}

export function extractTopLevelSelectAliases(sql = '') {
  const aliases = [];
  let depth = 0;
  let inTopLevelSelectList = false;
  let i = 0;

  while (i < sql.length) {
    const ch = sql[i];

    if (ch === "'") {
      i += 1;
      while (i < sql.length) {
        if (sql[i] === "'") {
          if (sql[i + 1] === "'") { i += 2; continue; }
          i += 1;
          break;
        }
        i += 1;
      }
      continue;
    }

    if (ch === '"') {
      i = readQuotedIdentifier(sql, i).end;
      continue;
    }

    if (ch === '-' && sql[i + 1] === '-') {
      const end = sql.indexOf('\n', i + 2);
      i = end === -1 ? sql.length : end + 1;
      continue;
    }

    if (ch === '/' && sql[i + 1] === '*') {
      const end = sql.indexOf('*/', i + 2);
      i = end === -1 ? sql.length : end + 2;
      continue;
    }

    if (ch === '(') { depth += 1; i += 1; continue; }
    if (ch === ')') { depth = Math.max(0, depth - 1); i += 1; continue; }
    if (ch === ';' && depth === 0) { inTopLevelSelectList = false; i += 1; continue; }

    if (depth === 0 && /[A-Za-z_]/.test(ch)) {
      const token = readWord(sql, i);
      const upper = token.value.toUpperCase();

      if (upper === 'SELECT') {
        inTopLevelSelectList = true;
        i = token.end;
        continue;
      }
      if (upper === 'FROM' && inTopLevelSelectList) {
        inTopLevelSelectList = false;
        i = token.end;
        continue;
      }
      if (upper === 'AS' && inTopLevelSelectList) {
        let j = token.end;
        while (j < sql.length && /\s/.test(sql[j])) j += 1;
        let alias;
        if (sql[j] === '"') {
          alias = readQuotedIdentifier(sql, j);
        } else {
          alias = readWord(sql, j);
        }
        if (alias.value && !aliases.includes(alias.value)) aliases.push(alias.value);
        i = alias.end;
        continue;
      }

      i = token.end;
      continue;
    }

    i += 1;
  }

  return aliases;
}

export function buildAsClauseNote(exercise) {
  if (!exercise || exercise.type !== 'select') return '';
  const aliases = extractTopLevelSelectAliases(exercise.answerSql || exercise.referenceAnswerSql || '');
  if (!aliases.length) return '';
  return `${AS_NOTE_PREFIX}\n${aliases.map(alias => `AS ${alias}`).join(' / ')} を使用すること。`;
}

for (const exercise of EXERCISES) {
  exercise.sourcePrompt = exercise.sourcePrompt || exercise.prompt;
  const note = buildAsClauseNote(exercise);
  exercise.requiredAsClauses = note
    ? extractTopLevelSelectAliases(exercise.answerSql || exercise.referenceAnswerSql || '').map(alias => `AS ${alias}`)
    : [];
  exercise.prompt = note ? `${exercise.sourcePrompt}\n\n${note}` : exercise.sourcePrompt;
}

export { AS_NOTE_PREFIX };
