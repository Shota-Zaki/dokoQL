const navPanel = document.querySelector('.nav-panel');
const exerciseList = document.getElementById('exerciseList');

if (navPanel && exerciseList) {
  const field = document.createElement('label');
  field.className = 'field compact-nav-field problem-select-field';

  const label = document.createElement('span');
  label.textContent = '問題';

  const select = document.createElement('select');
  select.id = 'exerciseSelect';
  select.setAttribute('aria-label', '問題を選択');

  field.append(label, select);
  const filterArea = navPanel.querySelector('.filter-area');
  navPanel.insertBefore(field, filterArea || exerciseList);

  function buttons() {
    return Array.from(exerciseList.querySelectorAll('[data-exercise-id]'));
  }

  function stateMark(button) {
    if (button.querySelector('.state-correct')) return '✓';
    if (button.querySelector('.state-incorrect')) return '△';
    if (button.querySelector('.state-review')) return '★';
    return '○';
  }

  function optionText(button) {
    const title = button.querySelector('.exercise-label strong')?.textContent?.trim() || '問題';
    const chapter = button.querySelector('.exercise-label span')?.textContent?.trim() || '';
    return `${stateMark(button)} ${title}${chapter ? `｜${chapter}` : ''}`;
  }

  function syncSelect() {
    const rows = buttons();
    const active = rows.find(button => button.classList.contains('active'));

    select.replaceChildren(...rows.map(button => {
      const option = document.createElement('option');
      option.value = button.dataset.exerciseId || '';
      option.textContent = optionText(button);
      return option;
    }));

    select.disabled = rows.length === 0;
    if (!rows.length) {
      const option = document.createElement('option');
      option.textContent = '条件に一致する問題なし';
      option.value = '';
      select.append(option);
      return;
    }

    select.value = active?.dataset.exerciseId || rows[0].dataset.exerciseId || '';
  }

  select.addEventListener('change', () => {
    const target = buttons().find(button => button.dataset.exerciseId === select.value);
    target?.click();
  });

  const observer = new MutationObserver(syncSelect);
  observer.observe(exerciseList, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class'],
  });

  syncSelect();
}
