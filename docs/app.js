import { PGlite } from 'https://cdn.jsdelivr.net/npm/@electric-sql/pglite@0.5.4/dist/index.js';
import { DATASETS, DATASET_ORDER } from './datasets.js';
import { EXERCISES_BY_DATASET, getChapters } from './exercises.js';

const STORAGE_KEY = 'sql-practice-progress-v1';
const SESSION_KEY = 'sql-practice-session-v1';

const $ = (id) => document.getElementById(id);
const els = {
  workspace: document.querySelector('.workspace'),
  datasetSelect: $('datasetSelect'), chapterSelect: $('chapterSelect'), statusSelect: $('statusSelect'),
  exerciseList: $('exerciseList'), progressText: $('progressText'), problemChapter: $('problemChapter'),
  problemTitle: $('problemTitle'), problemType: $('problemType'), problemPrompt: $('problemPrompt'),
  reviewButton: $('reviewButton'), hintArea: $('hintArea'), hintButton: $('hintButton'), answerButton: $('answerButton'),
  sqlEditor: $('sqlEditor'), runButton: $('runButton'), judgeButton: $('judgeButton'), resetButton: $('resetButton'),
  dbStatus: $('dbStatus'), resultSummary: $('resultSummary'), resultArea: $('resultArea'), judgeMessage: $('judgeMessage'),
  tableTabs: $('tableTabs'), dbInspector: $('dbInspector'), refreshDbButton: $('refreshDbButton'),
  answerDialog: $('answerDialog'), answerSql: $('answerSql'), answerExplanation: $('answerExplanation'), copyAnswerButton: $('copyAnswerButton'),
  filterToggle: $('filterToggle'), filterArea: $('filterArea'), toast: $('toast'),
};

const state = {
  db: null,
  datasetId: 'bank',
  exerciseId: null,
  chapter: 'all',
  statusFilter: 'all',
  table: null,
  dbView: 'data',
  busy: false,
  progress: loadJson(STORAGE_KEY, {}),
  session: loadJson(SESSION_KEY, {}),
};

function loadJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

function persistProgress() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress)); }
function persistSession() {
  state.session = { datasetId: state.datasetId, exerciseId: state.exerciseId, chapter: state.chapter, statusFilter: state.statusFilter };
  localStorage.setItem(SESSION_KEY, JSON.stringify(state.session));
}

function currentExercise() {
  return (EXERCISES_BY_DATASET[state.datasetId] || []).find(x => x.id === state.exerciseId) || null;
}

function progressFor(id) {
  return state.progress[id] ||= { draft: '', status: 'unanswered', review: false, attempts: 0, lastRun: null };
}

function setBusy(busy, text = '') {
  state.busy = busy;
  els.runButton.disabled = busy;
  els.judgeButton.disabled = busy || currentExercise()?.type === 'design';
  els.resetButton.disabled = busy || currentExercise()?.type === 'design';
  els.datasetSelect.disabled = busy;
  els.chapterSelect.disabled = busy;
  els.dbStatus.classList.toggle('ready', !busy && Boolean(state.db));
  els.dbStatus.classList.toggle('error', false);
  els.dbStatus.lastChild.textContent = busy ? (text || '処理中') : 'DB準備完了';
}

function setDbError(message) {
  els.dbStatus.classList.remove('ready');
  els.dbStatus.classList.add('error');
  els.dbStatus.lastChild.textContent = message;
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => els.toast.classList.remove('show'), 1800);
}

function initDatasetSelect() {
  els.datasetSelect.innerHTML = DATASET_ORDER.map(id => `<option value="${id}">${escapeHtml(DATASETS[id].label)}</option>`).join('');
}

function refreshChapterSelect() {
  const chapters = getChapters(state.datasetId);
  els.chapterSelect.innerHTML = `<option value="all">すべて</option>` + chapters.map(c => `<option value="${c.number}">Chapter ${c.number}｜${escapeHtml(c.name)}</option>`).join('');
  const valid = state.chapter === 'all' || chapters.some(c => String(c.number) === String(state.chapter));
  if (!valid) state.chapter = 'all';
  els.chapterSelect.value = String(state.chapter);
}

function filteredExercises() {
  return (EXERCISES_BY_DATASET[state.datasetId] || []).filter(ex => {
    if (state.chapter !== 'all' && String(ex.chapter) !== String(state.chapter)) return false;
    const p = progressFor(ex.id);
    if (state.statusFilter === 'unanswered') return p.status === 'unanswered';
    if (state.statusFilter === 'correct') return p.status === 'correct';
    if (state.statusFilter === 'incorrect') return p.status === 'incorrect';
    if (state.statusFilter === 'review') return p.review;
    return true;
  });
}

function renderExerciseList() {
  const rows = filteredExercises();
  if (!rows.length) {
    els.exerciseList.innerHTML = `<div class="empty-state">条件に一致する問題はありません。</div>`;
    updateProgressSummary();
    return;
  }
  els.exerciseList.innerHTML = rows.map(ex => {
    const p = progressFor(ex.id);
    const stateMark = p.status === 'correct' ? '<span class="state-correct" title="正解">●</span>'
      : p.status === 'incorrect' ? '<span class="state-incorrect" title="要復習">●</span>'
      : p.review ? '<span class="state-review" title="見直し">★</span>' : '<span>○</span>';
    return `<button type="button" class="exercise-item ${ex.id === state.exerciseId ? 'active' : ''}" data-exercise-id="${ex.id}" role="listitem">
      <span class="exercise-number">${ex.number}</span>
      <span class="exercise-label"><strong>問題 ${ex.number}</strong><span>${escapeHtml(ex.chapterName)}</span></span>
      <span class="exercise-state">${stateMark}</span>
    </button>`;
  }).join('');
  els.exerciseList.querySelectorAll('[data-exercise-id]').forEach(button => button.addEventListener('click', () => selectExercise(button.dataset.exerciseId)));
  updateProgressSummary();
}

function updateProgressSummary() {
  const rows = EXERCISES_BY_DATASET[state.datasetId] || [];
  const correct = rows.filter(x => progressFor(x.id).status === 'correct').length;
  els.progressText.textContent = `${correct} / ${rows.length}`;
}

async function selectExercise(exerciseId, { reset = true } = {}) {
  if (state.busy) return;
  saveCurrentDraft();
  const ex = (EXERCISES_BY_DATASET[state.datasetId] || []).find(x => x.id === exerciseId);
  if (!ex) return;
  state.exerciseId = ex.id;
  persistSession();
  renderExerciseList();
  renderExercise(ex);
  if (reset && ex.type !== 'design') await resetDatabase({ silent: true });
}

function renderExercise(ex) {
  els.problemChapter.textContent = `CHAPTER ${ex.chapter}｜${ex.chapterName}`;
  els.problemTitle.textContent = `問題 ${ex.number}`;
  els.problemType.textContent = ex.type.toUpperCase();
  els.problemPrompt.textContent = ex.prompt;
  const p = progressFor(ex.id);
  els.sqlEditor.value = p.draft || '';
  els.reviewButton.textContent = p.review ? '★ 見直し中' : '☆ 見直し';
  els.reviewButton.classList.toggle('state-review', p.review);
  els.hintArea.classList.add('hidden');
  els.hintButton.textContent = 'ヒント';
  hideJudgeMessage();
  clearResult();

  const noteMode = ex.type === 'design';
  els.sqlEditor.placeholder = noteMode ? 'ここに自分の設計案・回答メモを書けます。' : 'SELECT ...;';
  els.runButton.disabled = noteMode || state.busy;
  els.judgeButton.disabled = noteMode || state.busy;
  els.resetButton.disabled = noteMode || state.busy;
  if (noteMode) {
    els.resultArea.className = 'result-area empty-state';
    els.resultArea.textContent = 'この問題は設計・記述問題です。自動判定は行わず、解答例と比較して確認します。';
    els.resultSummary.textContent = '記述問題';
  }
}

function saveCurrentDraft() {
  const ex = currentExercise();
  if (!ex) return;
  progressFor(ex.id).draft = els.sqlEditor.value;
  persistProgress();
}

async function initializeDb() {
  try {
    setBusy(true, 'DBエンジン読込中');
    state.db = await PGlite.create();
    await resetDatabase({ silent: true });
    setBusy(false);
  } catch (error) {
    console.error(error);
    state.busy = false;
    setDbError('DB初期化エラー');
    renderError(error);
  }
}

async function clearSchema() {
  await state.db.exec('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
}

async function resetDatabase({ silent = false } = {}) {
  if (!state.db) return;
  const ex = currentExercise();
  try {
    setBusy(true, 'DB初期化中');
    await clearSchema();
    await state.db.exec(DATASETS[state.datasetId].seedSql);
    if (ex?.setupSql) await state.db.exec(ex.setupSql);
    await refreshTables();
    if (!silent) {
      clearResult();
      hideJudgeMessage();
      toast('DBを問題開始状態へ戻しました');
    }
    setBusy(false);
  } catch (error) {
    console.error(error);
    state.busy = false;
    setDbError('初期データエラー');
    renderError(error);
  }
}

async function executeUserSql() {
  const ex = currentExercise();
  if (!ex || ex.type === 'design' || state.busy) return;
  const sql = els.sqlEditor.value.trim();
  if (!sql) { toast('SQLを入力してください'); return; }
  saveCurrentDraft();
  hideJudgeMessage();
  try {
    setBusy(true, 'SQL実行中');
    const started = performance.now();
    const result = await state.db.exec(sql);
    renderExecResults(result);
    const elapsed = Math.max(0, performance.now() - started);
    els.resultSummary.textContent = `${elapsed.toFixed(0)} ms`;
    const p = progressFor(ex.id);
    p.lastRun = new Date().toISOString();
    persistProgress();
    await refreshTables();
    setBusy(false);
  } catch (error) {
    console.error(error);
    renderError(error);
    state.busy = false;
    setDbError('SQLエラー');
    setTimeout(() => { if (state.db) { els.dbStatus.classList.remove('error'); els.dbStatus.classList.add('ready'); els.dbStatus.lastChild.textContent = 'DB準備完了'; } }, 1400);
  }
}

async function judgeUserSql() {
  const ex = currentExercise();
  if (!ex || ex.type === 'design' || state.busy) return;
  const userSql = els.sqlEditor.value.trim();
  if (!userSql) { toast('判定するSQLを入力してください'); return; }
  if (!ex.answerSql) { showJudge('info', 'この問題には自動判定用の解答例がまだありません。'); return; }

  saveCurrentDraft();
  try {
    setBusy(true, '判定中');
    const mutation = !['select'].includes(ex.type);

    await resetDatabase({ silent: true });
    let userResult;
    try { userResult = await state.db.exec(userSql); }
    catch (error) {
      const p = progressFor(ex.id); p.status = 'incorrect'; p.attempts += 1; persistProgress();
      renderExerciseList();
      showJudge('incorrect', `SQLエラーのため不正解です: ${friendlyError(error)}`);
      renderError(error);
      state.busy = false; setBusy(false);
      return;
    }
    const userSnapshot = mutation ? await snapshotDatabase() : normalizeExec(userResult, ex.ordered);

    await resetDatabase({ silent: true });
    const answerResult = await state.db.exec(ex.answerSql);
    const answerSnapshot = mutation ? await snapshotDatabase() : normalizeExec(answerResult, ex.ordered);
    const correct = deepEqual(userSnapshot, answerSnapshot);

    const p = progressFor(ex.id);
    p.status = correct ? 'correct' : 'incorrect';
    p.attempts += 1;
    p.lastRun = new Date().toISOString();
    persistProgress();
    renderExerciseList();
    showJudge(correct ? 'correct' : 'incorrect', correct ? '正解です。実行結果が解答例と一致しました。' : '結果が解答例と一致しません。列・行・更新対象を確認してください。');

    await resetDatabase({ silent: true });
    els.sqlEditor.value = p.draft;
    setBusy(false);
  } catch (error) {
    console.error(error);
    state.busy = false;
    setDbError('判定処理エラー');
    showJudge('incorrect', `判定処理でエラーが発生しました: ${friendlyError(error)}`);
  }
}

function normalizeExec(result, ordered) {
  const list = Array.isArray(result) ? result : [result];
  return list.map(item => {
    const fields = (item.fields || []).map(f => f.name);
    let rows = (item.rows || []).map(row => normalizeValue(row));
    if (!ordered) rows = rows.slice().sort((a,b) => stableString(a).localeCompare(stableString(b), 'ja'));
    return { fields, rows, affectedRows: item.affectedRows ?? 0 };
  });
}

async function snapshotDatabase() {
  const tables = await getTables();
  const snapshot = {};
  for (const table of tables) {
    const result = await state.db.query(`SELECT * FROM ${quoteIdent(table)}`);
    snapshot[table] = result.rows.map(normalizeValue).sort((a,b) => stableString(a).localeCompare(stableString(b), 'ja'));
  }
  return snapshot;
}

function normalizeValue(value) {
  if (value === null || value === undefined) return value ?? null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'bigint') return value.toString();
  if (Array.isArray(value)) return value.map(normalizeValue);
  if (typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value)) out[key] = normalizeValue(value[key]);
    return out;
  }
  return value;
}

function deepEqual(a,b) { return stableString(a) === stableString(b); }
function stableString(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableString).join(',')}]`;
  return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${stableString(value[k])}`).join(',')}}`;
}

async function getTables() {
  const result = await state.db.query(`SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`);
  return result.rows.map(r => r.tablename);
}

async function refreshTables() {
  if (!state.db) return;
  const tables = await getTables();
  if (!tables.includes(state.table)) state.table = tables[0] || null;
  els.tableTabs.innerHTML = tables.length ? tables.map(name => `<button type="button" data-table="${escapeAttr(name)}" class="${name === state.table ? 'active' : ''}">${escapeHtml(name)}</button>`).join('') : '';
  els.tableTabs.querySelectorAll('[data-table]').forEach(button => button.addEventListener('click', async () => {
    state.table = button.dataset.table;
    els.tableTabs.querySelectorAll('button').forEach(x => x.classList.toggle('active', x === button));
    await renderDbInspector();
  }));
  await renderDbInspector();
}

async function renderDbInspector() {
  if (!state.table) {
    els.dbInspector.className = 'db-inspector empty-state';
    els.dbInspector.textContent = 'この題材には実行用テーブルがありません。';
    return;
  }
  try {
    if (state.dbView === 'schema') {
      const result = await state.db.query(`
        SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema='public' AND table_name=$1
        ORDER BY ordinal_position`, [state.table]);
      els.dbInspector.className = 'db-inspector';
      els.dbInspector.innerHTML = `<table class="schema-list"><thead><tr><th>列名</th><th>型</th><th>NULL</th><th>既定値</th></tr></thead><tbody>${result.rows.map(r => `<tr><td>${escapeHtml(r.column_name)}</td><td>${escapeHtml(formatType(r))}</td><td>${r.is_nullable === 'YES' ? '可' : '不可'}</td><td>${escapeHtml(r.column_default ?? '')}</td></tr>`).join('')}</tbody></table>`;
    } else {
      const result = await state.db.query(`SELECT * FROM ${quoteIdent(state.table)} LIMIT 100`);
      els.dbInspector.className = 'db-inspector';
      els.dbInspector.innerHTML = tableHtml(result);
    }
  } catch (error) {
    els.dbInspector.className = 'db-inspector';
    els.dbInspector.innerHTML = `<div class="error-box">${escapeHtml(friendlyError(error))}</div>`;
  }
}

function formatType(row) {
  if (row.character_maximum_length) return `${row.data_type}(${row.character_maximum_length})`;
  return row.data_type;
}

function renderExecResults(result) {
  const list = Array.isArray(result) ? result : [result];
  if (!list.length) {
    els.resultArea.className = 'result-area empty-state';
    els.resultArea.textContent = '実行は完了しました。結果セットはありません。';
    return;
  }
  els.resultArea.className = 'result-area';
  els.resultArea.innerHTML = list.map((item, index) => {
    const rows = item.rows || [];
    const affected = item.affectedRows ?? 0;
    if (rows.length || (item.fields || []).length) {
      return `<div class="result-block"><h3>結果 ${index + 1}｜${rows.length}行</h3>${tableHtml(item)}</div>`;
    }
    return `<div class="result-block"><div class="affected-box">SQL ${index + 1}: 実行完了（影響 ${affected} 行）</div></div>`;
  }).join('');
}

function tableHtml(result) {
  const rows = result.rows || [];
  const fields = (result.fields || []).map(f => f.name);
  const columns = fields.length ? fields : (rows[0] ? Object.keys(rows[0]) : []);
  if (!columns.length) return `<div class="empty-state">0行</div>`;
  return `<table class="data-table"><thead><tr>${columns.map(c => `<th>${escapeHtml(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${columns.map(c => `<td>${formatCell(row[c])}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

function formatCell(value) {
  if (value === null || value === undefined) return '<span class="null-value">NULL</span>';
  if (value instanceof Date) return escapeHtml(value.toISOString());
  if (typeof value === 'object') return escapeHtml(JSON.stringify(normalizeValue(value)));
  return escapeHtml(String(value));
}

function renderError(error) {
  els.resultArea.className = 'result-area';
  els.resultArea.innerHTML = `<div class="error-box">${escapeHtml(friendlyError(error))}</div>`;
  els.resultSummary.textContent = 'エラー';
}

function friendlyError(error) {
  return error?.message?.replace(/^error:\s*/i, '') || String(error);
}

function clearResult() {
  els.resultArea.className = 'result-area empty-state';
  els.resultArea.textContent = 'SQLを実行すると、ここに結果が表示されます。';
  els.resultSummary.textContent = '未実行';
}

function showJudge(kind, message) {
  els.judgeMessage.className = `judge-message ${kind}`;
  els.judgeMessage.textContent = message;
}
function hideJudgeMessage() { els.judgeMessage.className = 'judge-message hidden'; els.judgeMessage.textContent = ''; }

function showHint() {
  const ex = currentExercise();
  if (!ex) return;
  const nowHidden = els.hintArea.classList.toggle('hidden');
  els.hintButton.textContent = nowHidden ? 'ヒント' : 'ヒントを閉じる';
  if (!nowHidden) {
    els.hintArea.innerHTML = ex.hint?.length ? `<strong>考えるポイント</strong><ul>${ex.hint.map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul>` : 'この問題には追加ヒントはありません。';
  }
}

function showAnswer() {
  const ex = currentExercise();
  if (!ex) return;
  els.answerSql.textContent = ex.answerSql || '解答例は準備中です。';
  els.answerExplanation.innerHTML = ex.explanation ? `<p>${escapeHtml(ex.explanation)}</p>` : '<p>問題の条件をSQLの句・式へ分解して確認してください。</p>';
  els.copyAnswerButton.disabled = !ex.answerSql;
  els.answerDialog.showModal();
}

function toggleReview() {
  const ex = currentExercise(); if (!ex) return;
  const p = progressFor(ex.id); p.review = !p.review; persistProgress();
  els.reviewButton.textContent = p.review ? '★ 見直し中' : '☆ 見直し';
  els.reviewButton.classList.toggle('state-review', p.review);
  renderExerciseList();
}

function setupMobile() {
  document.querySelectorAll('[data-mobile-view]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-mobile-view]').forEach(b => b.classList.toggle('active', b === button));
    els.workspace.dataset.mobileActive = button.dataset.mobileView;
  }));

  const mq = window.matchMedia('(min-width: 768px) and (max-width: 1179px)');
  const dbToggle = document.createElement('button');
  dbToggle.type = 'button'; dbToggle.className = 'secondary-button'; dbToggle.textContent = 'DBを見る';
  dbToggle.addEventListener('click', () => els.workspace.classList.toggle('db-open'));
  const toolbar = document.querySelector('.toolbar-right');
  function sync() {
    if (mq.matches && !dbToggle.isConnected) toolbar.prepend(dbToggle);
    if (!mq.matches && dbToggle.isConnected) dbToggle.remove();
    if (!mq.matches) els.workspace.classList.remove('db-open');
  }
  mq.addEventListener?.('change', sync); sync();
}

function quoteIdent(name) { return `"${String(name).replaceAll('"','""')}"`; }
function escapeHtml(value) { return String(value).replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch])); }
function escapeAttr(value) { return escapeHtml(value).replace(/'/g, '&#39;'); }

function bindEvents() {
  els.datasetSelect.addEventListener('change', async () => {
    if (state.busy) return;
    saveCurrentDraft();
    state.datasetId = els.datasetSelect.value;
    state.chapter = 'all'; state.statusFilter = 'all'; els.statusSelect.value = 'all';
    refreshChapterSelect();
    const first = (EXERCISES_BY_DATASET[state.datasetId] || [])[0];
    state.exerciseId = first?.id || null;
    persistSession(); renderExerciseList(); if (first) renderExercise(first);
    if (first?.type !== 'design') await resetDatabase({ silent: true }); else { await clearSchema(); await refreshTables(); }
  });
  els.chapterSelect.addEventListener('change', () => { state.chapter = els.chapterSelect.value; persistSession(); renderExerciseList(); });
  els.statusSelect.addEventListener('change', () => { state.statusFilter = els.statusSelect.value; persistSession(); renderExerciseList(); });
  els.sqlEditor.addEventListener('input', () => { saveCurrentDraft(); });
  els.sqlEditor.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); executeUserSql(); } });
  els.runButton.addEventListener('click', executeUserSql);
  els.judgeButton.addEventListener('click', judgeUserSql);
  els.resetButton.addEventListener('click', () => resetDatabase());
  els.refreshDbButton.addEventListener('click', refreshTables);
  els.hintButton.addEventListener('click', showHint);
  els.answerButton.addEventListener('click', showAnswer);
  els.reviewButton.addEventListener('click', toggleReview);
  els.copyAnswerButton.addEventListener('click', async () => { await navigator.clipboard.writeText(currentExercise()?.answerSql || ''); toast('解答例をコピーしました'); });
  els.filterToggle.addEventListener('click', () => els.filterArea.classList.toggle('hidden'));
  document.querySelectorAll('[data-db-view]').forEach(button => button.addEventListener('click', async () => {
    state.dbView = button.dataset.dbView;
    document.querySelectorAll('[data-db-view]').forEach(b => b.classList.toggle('active', b === button));
    await renderDbInspector();
  }));
}

async function boot() {
  initDatasetSelect();
  bindEvents();
  setupMobile();

  const savedDataset = DATASETS[state.session.datasetId] ? state.session.datasetId : 'bank';
  state.datasetId = savedDataset;
  els.datasetSelect.value = savedDataset;
  state.chapter = state.session.chapter ?? 'all';
  state.statusFilter = state.session.statusFilter ?? 'all';
  els.statusSelect.value = state.statusFilter;
  refreshChapterSelect();

  const rows = EXERCISES_BY_DATASET[state.datasetId] || [];
  const savedExercise = rows.find(x => x.id === state.session.exerciseId);
  state.exerciseId = savedExercise?.id || rows[0]?.id || null;
  renderExerciseList();
  if (currentExercise()) renderExercise(currentExercise());
  persistSession();
  await initializeDb();
}

boot();
