const resetButton = document.getElementById('resetButton');
const exerciseList = document.getElementById('exerciseList');
const sqlEditor = document.getElementById('sqlEditor');

const nextButton = document.createElement('button');
nextButton.id = 'nextProblemButton';
nextButton.type = 'button';
nextButton.className = 'secondary-button next-problem-button';
nextButton.textContent = '次の問題 →';
nextButton.setAttribute('aria-label', '次の問題へ進む');

resetButton?.insertAdjacentElement('afterend', nextButton);

function visibleExercises() {
  return Array.from(exerciseList?.querySelectorAll('[data-exercise-id]') || []);
}

function activeIndex(rows) {
  return rows.findIndex(button => button.classList.contains('active'));
}

function syncNextButton() {
  const rows = visibleExercises();
  const index = activeIndex(rows);
  const dbBusy = document.getElementById('dbStatus')?.textContent?.includes('中');

  if (!rows.length) {
    nextButton.disabled = true;
    return;
  }

  if (index < 0) {
    nextButton.disabled = Boolean(dbBusy);
    return;
  }

  nextButton.disabled = Boolean(dbBusy) || index >= rows.length - 1;
}

nextButton.addEventListener('click', () => {
  if (nextButton.disabled) return;
  const rows = visibleExercises();
  const index = activeIndex(rows);
  const target = index < 0 ? rows[0] : rows[index + 1];
  target?.click();
  requestAnimationFrame(() => {
    sqlEditor?.focus();
    syncNextButton();
  });
});

if (exerciseList) {
  new MutationObserver(syncNextButton).observe(exerciseList, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class'],
  });
}

const dbStatus = document.getElementById('dbStatus');
if (dbStatus) {
  new MutationObserver(syncNextButton).observe(dbStatus, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['class'],
  });
}

document.getElementById('chapterSelect')?.addEventListener('change', () => queueMicrotask(syncNextButton));
document.getElementById('statusSelect')?.addEventListener('change', () => queueMicrotask(syncNextButton));
document.getElementById('datasetSelect')?.addEventListener('change', () => queueMicrotask(syncNextButton));

syncNextButton();
