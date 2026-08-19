import { DATASETS } from './datasets.js';
import { EXERCISES_BY_DATASET } from './exercises.js';

const editor = document.getElementById('sqlEditor');
const datasetSelect = document.getElementById('datasetSelect');
const exerciseList = document.getElementById('exerciseList');
const problemTitle = document.getElementById('problemTitle');
const COLLAPSE_KEY = 'sql-input-palette-collapsed-v1';
const desktopMedia = window.matchMedia('(min-width: 768px)');

if (editor) {
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = './sqlInputPalette.css';
  document.head.append(css);

  const palette = document.createElement('section');
  palette.className = 'sql-input-palette';
  palette.setAttribute('aria-label', 'SQLクリック入力');
  editor.before(palette);

  let selectedTable = '';
  let qualifiedColumns = false;
  let collapsed = loadCollapsedState();
  let fitFrame = 0;

  const keywordGroups = [
    {
      label: '基本',
      tokens: ['SELECT', 'FROM', 'WHERE', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'ORDER BY', 'ASC', 'DESC', 'AS'],
    },
    {
      label: '条件',
      tokens: ['AND', 'OR', 'NOT', 'LIKE', 'IN', 'BETWEEN', 'IS NULL', 'IS NOT NULL', 'DISTINCT'],
    },
    {
      label: '集計・結合',
      tokens: ['GROUP BY', 'HAVING', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'ON', 'LIMIT', 'OFFSET', 'UNION', 'UNION ALL', 'EXCEPT', 'INTERSECT'],
    },
    {
      label: '関数・記号',
      tokens: ['COUNT()', 'SUM()', 'AVG()', 'MAX()', 'MIN()', 'COALESCE()', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', '*', ',', '=', '<>', '>', '<', '>=', '<=', '(', ')', ';'],
    },
  ];

  const visualGroupStarts = new Set([
    'INSERT INTO', 'UPDATE', 'DELETE FROM', 'ORDER BY',
    'JOIN', 'LIMIT', 'UNION',
    'CASE', '*',
  ]);

  function loadCollapsedState() {
    try { return localStorage.getItem(COLLAPSE_KEY) === '1'; }
    catch { return false; }
  }

  function saveCollapsedState() {
    try { localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0'); }
    catch { /* local storage may be unavailable */ }
  }

  function activeExercise() {
    const active = document.querySelector('.exercise-item.active[data-exercise-id]');
    if (!active) return null;
    const id = active.dataset.exerciseId;
    const datasetId = datasetSelect?.value;
    return (EXERCISES_BY_DATASET[datasetId] || []).find(item => item.id === id) || null;
  }

  function unquoteIdentifier(value) {
    const trimmed = String(value || '').trim();
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) return trimmed.slice(1, -1).replaceAll('""', '"');
    return trimmed;
  }

  function splitTopLevel(value) {
    const parts = [];
    let start = 0;
    let depth = 0;
    let quote = null;
    for (let i = 0; i < value.length; i += 1) {
      const ch = value[i];
      if (quote) {
        if (ch === quote) {
          if (value[i + 1] === quote) i += 1;
          else quote = null;
        }
        continue;
      }
      if (ch === "'" || ch === '"') { quote = ch; continue; }
      if (ch === '(') depth += 1;
      else if (ch === ')') depth = Math.max(0, depth - 1);
      else if (ch === ',' && depth === 0) {
        parts.push(value.slice(start, i));
        start = i + 1;
      }
    }
    parts.push(value.slice(start));
    return parts;
  }

  function parseCreateTables(sql, catalog) {
    if (!sql) return;
    const pattern = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?("(?:""|[^"])+"|[^\s(]+)\s*\(/gi;
    let match;
    while ((match = pattern.exec(sql))) {
      const table = unquoteIdentifier(match[1]);
      const open = pattern.lastIndex - 1;
      let depth = 1;
      let quote = null;
      let close = -1;
      for (let i = open + 1; i < sql.length; i += 1) {
        const ch = sql[i];
        if (quote) {
          if (ch === quote) {
            if (sql[i + 1] === quote) i += 1;
            else quote = null;
          }
          continue;
        }
        if (ch === "'" || ch === '"') { quote = ch; continue; }
        if (ch === '(') depth += 1;
        else if (ch === ')') {
          depth -= 1;
          if (depth === 0) { close = i; break; }
        }
      }
      if (close < 0) continue;
      const columns = [];
      for (const part of splitTopLevel(sql.slice(open + 1, close))) {
        const line = part.trim();
        if (!line || /^(?:PRIMARY|FOREIGN|UNIQUE|CHECK|CONSTRAINT|EXCLUDE)\b/i.test(line)) continue;
        const col = line.match(/^("(?:""|[^"])+"|[^\s]+)/)?.[1];
        if (!col) continue;
        const name = unquoteIdentifier(col);
        if (!columns.includes(name)) columns.push(name);
      }
      const entry = catalog.get(table) || { name: table, columns: [] };
      for (const column of columns) if (!entry.columns.includes(column)) entry.columns.push(column);
      catalog.set(table, entry);
      pattern.lastIndex = Math.max(pattern.lastIndex, close + 1);
    }
  }

  function referencedTables(sql) {
    const found = [];
    if (!sql) return found;
    const pattern = /\b(?:FROM|JOIN|UPDATE|INTO|TABLE)\s+("(?:""|[^"])+"|[^\s,;()]+)/giu;
    let match;
    while ((match = pattern.exec(sql))) {
      const table = unquoteIdentifier(match[1]).replace(/\.$/, '');
      if (!table || /^(?:SELECT|VALUES)$/i.test(table)) continue;
      if (!found.includes(table)) found.push(table);
    }
    return found;
  }

  function buildCatalog(datasetId) {
    const catalog = new Map();
    parseCreateTables(DATASETS[datasetId]?.seedSql || '', catalog);
    for (const exercise of EXERCISES_BY_DATASET[datasetId] || []) {
      const sql = exercise.referenceAnswerSql || exercise.answerSql || '';
      parseCreateTables(sql, catalog);
      for (const table of referencedTables(sql)) {
        if (!catalog.has(table)) catalog.set(table, { name: table, columns: [] });
      }
    }
    return catalog;
  }

  function problemTables(exercise) {
    if (!exercise) return [];
    return referencedTables(exercise.referenceAnswerSql || exercise.answerSql || '');
  }

  function needsSpacing(token) {
    return /[\p{L}\p{N}_)]$/u.test(token) || token.includes(' ');
  }

  function insertToken(token, { functionCursor = false } = {}) {
    const start = editor.selectionStart ?? editor.value.length;
    const end = editor.selectionEnd ?? start;
    const before = editor.value.slice(0, start);
    const after = editor.value.slice(end);
    const punctuationOnly = /^[,;()=*<>]+$/.test(token);
    let text = token;

    if (!punctuationOnly && before && !/[\s(.,]$/.test(before)) text = ` ${text}`;
    if (!punctuationOnly && needsSpacing(token) && after && !/^[\s),.;]/.test(after)) text = `${text} `;
    if (!punctuationOnly && !after && !token.endsWith('()')) text = `${text} `;

    editor.setRangeText(text, start, end, 'end');
    let caret = start + text.length;
    if (functionCursor) {
      const close = editor.value.lastIndexOf(')', caret);
      if (close >= start) caret = close;
    }
    editor.setSelectionRange(caret, caret);
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    editor.focus();
  }

  function chip(text, className, onClick, title = '') {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `sql-palette-chip ${className}`;
    button.textContent = text;
    if (title) button.title = title;
    button.addEventListener('click', onClick);
    return button;
  }

  function displayLabel(label) {
    if (label === '集計・結合') return '集計\n結合';
    if (label === '関数・記号') return '関数\n記号';
    if (label.startsWith('カラム｜')) return `カラム\n${label.slice('カラム｜'.length)}`;
    return label;
  }

  function row(label, body) {
    const wrapper = document.createElement('div');
    wrapper.className = 'sql-palette-row';
    const heading = document.createElement('span');
    heading.className = 'sql-palette-label';
    heading.textContent = displayLabel(label);
    const items = document.createElement('div');
    items.className = 'sql-palette-items';
    items.append(...body);
    wrapper.append(heading, items);
    return wrapper;
  }

  function renderHeader() {
    const header = document.createElement('div');
    header.className = 'sql-palette-header';

    const heading = document.createElement('div');
    heading.className = 'sql-palette-heading';
    heading.innerHTML = '<strong>クリック入力</strong>';
    header.append(heading);

    const actions = document.createElement('div');
    actions.className = 'sql-palette-header-actions';

    if (!collapsed) {
      const qualify = document.createElement('label');
      qualify.className = 'sql-palette-qualify';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = qualifiedColumns;
      checkbox.addEventListener('change', () => { qualifiedColumns = checkbox.checked; render(); });
      qualify.append(checkbox, document.createTextNode(' テーブル名付きカラム'));
      actions.append(qualify);
    }

    const collapseButton = document.createElement('button');
    collapseButton.type = 'button';
    collapseButton.className = 'sql-palette-collapse';
    collapseButton.textContent = collapsed ? '展開' : '最小化';
    collapseButton.setAttribute('aria-expanded', String(!collapsed));
    collapseButton.title = collapsed ? 'クリック入力を展開' : 'クリック入力を最小化';
    collapseButton.addEventListener('click', () => {
      collapsed = !collapsed;
      saveCollapsedState();
      render();
    });
    actions.append(collapseButton);

    header.append(actions);
    return header;
  }

  function applyPaletteScale(scale) {
    const setPx = (name, value) => palette.style.setProperty(name, `${value.toFixed(2)}px`);
    setPx('--palette-title-size', 12 * scale);
    setPx('--palette-meta-size', 9.5 * scale);
    setPx('--palette-label-size', 10 * scale);
    setPx('--palette-chip-size', 10.5 * scale);
    setPx('--palette-chip-height', 27 * scale);
    setPx('--palette-chip-pad-x', 7 * scale);
    setPx('--palette-chip-pad-y', 3.5 * scale);
    setPx('--palette-row-gap', 4 * scale);
    setPx('--palette-item-gap-x', 4 * scale);
    setPx('--palette-item-gap-y', 3.5 * scale);
    setPx('--palette-section-pad', 3 * scale);
    setPx('--palette-header-gap', 7 * scale);
  }

  function paletteFits() {
    return palette.scrollHeight <= palette.clientHeight + 1 && palette.scrollWidth <= palette.clientWidth + 1;
  }

  function fitPaletteToCard() {
    fitFrame = 0;
    palette.classList.remove('palette-fitted', 'palette-needs-scroll');

    if (!desktopMedia.matches || collapsed || palette.classList.contains('hidden') || palette.clientHeight <= 0) {
      palette.style.removeProperty('--palette-title-size');
      palette.style.removeProperty('--palette-meta-size');
      palette.style.removeProperty('--palette-label-size');
      palette.style.removeProperty('--palette-chip-size');
      palette.style.removeProperty('--palette-chip-height');
      palette.style.removeProperty('--palette-chip-pad-x');
      palette.style.removeProperty('--palette-chip-pad-y');
      palette.style.removeProperty('--palette-row-gap');
      palette.style.removeProperty('--palette-item-gap-x');
      palette.style.removeProperty('--palette-item-gap-y');
      palette.style.removeProperty('--palette-section-pad');
      palette.style.removeProperty('--palette-header-gap');
      return;
    }

    const minScale = 0.78;
    const maxScale = 1.55;
    applyPaletteScale(minScale);

    if (!paletteFits()) {
      palette.classList.add('palette-needs-scroll');
      return;
    }

    let low = minScale;
    let high = maxScale;
    let best = minScale;

    for (let i = 0; i < 9; i += 1) {
      const mid = (low + high) / 2;
      applyPaletteScale(mid);
      if (paletteFits()) {
        best = mid;
        low = mid;
      } else {
        high = mid;
      }
    }

    applyPaletteScale(Math.max(minScale, best - 0.015));
    palette.classList.add('palette-fitted');
  }

  function scheduleFit() {
    if (fitFrame) cancelAnimationFrame(fitFrame);
    fitFrame = requestAnimationFrame(() => requestAnimationFrame(fitPaletteToCard));
  }

  function render() {
    const datasetId = datasetSelect?.value || 'bank';
    const exercise = activeExercise();
    if (exercise?.type === 'design') {
      palette.classList.add('hidden');
      scheduleFit();
      return;
    }
    palette.classList.remove('hidden');
    palette.classList.toggle('is-collapsed', collapsed);
    palette.replaceChildren(renderHeader());

    if (collapsed) {
      scheduleFit();
      return;
    }

    const catalog = buildCatalog(datasetId);
    const recommended = problemTables(exercise).filter(name => catalog.has(name));
    const allTables = [...catalog.keys()];
    const orderedTables = [...recommended, ...allTables.filter(name => !recommended.includes(name))];
    if (!catalog.has(selectedTable)) selectedTable = recommended[0] || orderedTables[0] || '';

    for (const group of keywordGroups) {
      palette.append(row(group.label, group.tokens.map(token => chip(
        token,
        `keyword-chip${visualGroupStarts.has(token) ? ' sql-chip-separator' : ''}`,
        () => insertToken(token, { functionCursor: token.endsWith('()') }),
      ))));
    }

    const tableButtons = orderedTables.map(name => chip(
      name,
      `${recommended.includes(name) ? 'recommended-table ' : ''}${selectedTable === name ? 'selected-table' : ''}`,
      () => {
        selectedTable = name;
        insertToken(name);
        render();
      },
      recommended.includes(name) ? 'この問題で使用するテーブル' : 'テーブル名を挿入',
    ));
    palette.append(row('テーブル', tableButtons.length ? tableButtons : [document.createTextNode('利用可能なテーブルはありません')]));

    const columns = catalog.get(selectedTable)?.columns || [];
    const columnButtons = columns.map(name => {
      const text = qualifiedColumns && selectedTable ? `${selectedTable}.${name}` : name;
      return chip(text, 'column-chip', () => insertToken(text), `${selectedTable} のカラム`);
    });
    const columnLabel = selectedTable ? `カラム｜${selectedTable}` : 'カラム';
    palette.append(row(columnLabel, columnButtons.length ? columnButtons : [document.createTextNode('カラム情報はありません')]));
    scheduleFit();
  }

  const scheduleRender = () => setTimeout(render, 0);
  datasetSelect?.addEventListener('change', () => { selectedTable = ''; scheduleRender(); });
  exerciseList?.addEventListener('click', scheduleRender, true);
  problemTitle && new MutationObserver(scheduleRender).observe(problemTitle, { childList: true, characterData: true, subtree: true });
  desktopMedia.addEventListener?.('change', scheduleFit);
  window.addEventListener('resize', scheduleFit, { passive: true });
  new ResizeObserver(scheduleFit).observe(palette);
  render();
}
