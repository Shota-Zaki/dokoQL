const actions = document.querySelector('.topbar-actions');

if (actions && !document.getElementById('sqlReferenceLink')) {
  const link = document.createElement('a');
  link.id = 'sqlReferenceLink';
  link.className = 'secondary-button header-reference-link';
  link.href = './sql-reference.html';
  link.target = '_blank';
  link.rel = 'noopener';
  link.textContent = 'SQL語一覧 ↗';
  link.setAttribute('aria-label', 'SQL語の意味と使い方を別タブで開く');
  actions.prepend(link);
}
