const runButton = document.getElementById('runButton');
const judgeButton = document.getElementById('judgeButton');
const resetButton = document.getElementById('resetButton');
const dbStatus = document.getElementById('dbStatus');
const problemType = document.getElementById('problemType');
const resultArea = document.getElementById('resultArea');
const resultSummary = document.getElementById('resultSummary');
const judgeMessage = document.getElementById('judgeMessage');

let recovering = false;
let lastRecoveryKey = '';

function isDesignExercise() {
  return problemType?.textContent?.trim().toUpperCase() === 'DESIGN';
}

function isDbReady() {
  return Boolean(dbStatus?.classList.contains('ready')) || /DB準備完了/.test(dbStatus?.textContent || '');
}

function enableRetryControls() {
  if (isDesignExercise()) return;
  if (runButton) runButton.disabled = false;
  if (judgeButton) judgeButton.disabled = false;
  if (resetButton) resetButton.disabled = false;
}

function captureFeedback() {
  return {
    resultClassName: resultArea?.className || '',
    resultHtml: resultArea?.innerHTML || '',
    resultSummary: resultSummary?.textContent || '',
    judgeClassName: judgeMessage?.className || '',
    judgeHtml: judgeMessage?.innerHTML || '',
  };
}

function addRetryNote() {
  if (!resultArea || resultArea.querySelector('[data-retry-note]')) return;
  const note = document.createElement('div');
  note.dataset.retryNote = 'true';
  note.textContent = 'DBを問題開始状態へ戻しました。SQLを修正して何度でも再実行できます。';
  note.style.marginTop = '10px';
  note.style.padding = '9px 10px';
  note.style.border = '1px solid var(--border)';
  note.style.borderRadius = '8px';
  note.style.background = 'var(--surface-muted)';
  note.style.color = 'var(--muted)';
  note.style.fontFamily = 'inherit';
  note.style.fontSize = '11px';
  note.style.lineHeight = '1.6';
  resultArea.append(note);
}

function restoreFeedback(snapshot) {
  if (!snapshot) return;
  if (resultArea) {
    resultArea.className = snapshot.resultClassName;
    resultArea.innerHTML = snapshot.resultHtml;
    addRetryNote();
  }
  if (resultSummary) resultSummary.textContent = snapshot.resultSummary;
  if (judgeMessage) {
    judgeMessage.className = snapshot.judgeClassName;
    judgeMessage.innerHTML = snapshot.judgeHtml;
  }
}

function waitForRecovery(snapshot, startedAt = performance.now()) {
  if (!recovering) return;
  if (isDbReady()) {
    restoreFeedback(snapshot);
    enableRetryControls();
    recovering = false;
    return;
  }

  if (performance.now() - startedAt > 6000) {
    enableRetryControls();
    recovering = false;
    return;
  }
  setTimeout(() => waitForRecovery(snapshot, startedAt), 50);
}

function scheduleRecovery(reason) {
  if (recovering || isDesignExercise() || !resetButton) return;
  const key = `${reason}|${resultArea?.textContent || ''}`;
  if (key === lastRecoveryKey) return;
  lastRecoveryKey = key;

  const snapshot = captureFeedback();
  recovering = true;

  setTimeout(() => {
    resetButton.disabled = false;
    resetButton.click();
    waitForRecovery(snapshot);
  }, 0);
}

function inspectState() {
  const statusText = dbStatus?.textContent || '';
  const hasSqlError = /SQLエラー|判定処理エラー/.test(statusText);
  const judgedSqlError = judgeMessage?.classList.contains('incorrect') && Boolean(resultArea?.querySelector('.error-box'));

  if (hasSqlError) {
    scheduleRecovery(statusText);
    return;
  }
  if (judgedSqlError) {
    scheduleRecovery(judgeMessage?.textContent || '判定SQLエラー');
    return;
  }

  if (!recovering && isDbReady()) enableRetryControls();
}

if (dbStatus) {
  new MutationObserver(inspectState).observe(dbStatus, {
    attributes: true,
    attributeFilter: ['class'],
    childList: true,
    characterData: true,
    subtree: true,
  });
}

if (judgeMessage) {
  new MutationObserver(inspectState).observe(judgeMessage, {
    attributes: true,
    attributeFilter: ['class'],
    childList: true,
    characterData: true,
    subtree: true,
  });
}

problemType && new MutationObserver(() => {
  lastRecoveryKey = '';
  if (isDbReady()) enableRetryControls();
}).observe(problemType, { childList: true, characterData: true, subtree: true });

inspectState();
