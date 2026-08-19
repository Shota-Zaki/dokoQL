const splitCss = document.createElement('link');
splitCss.rel = 'stylesheet';
splitCss.href = './editorSplit.css';
document.head.append(splitCss);

const editor = document.getElementById('sqlEditor');
const editorCard = editor?.closest('.editor-card');
const palette = editorCard?.querySelector('.sql-input-palette');
const COLLAPSE_STORAGE_KEY = 'sql-input-palette-collapsed-v1';

function clearLegacyCollapseState() {
  try { localStorage.removeItem(COLLAPSE_STORAGE_KEY); }
  catch { /* local storage may be unavailable */ }
}

function enforceExpandedPalette() {
  if (!palette) return;

  const collapseButton = palette.querySelector('.sql-palette-collapse');
  if (palette.classList.contains('is-collapsed') && collapseButton) {
    collapseButton.click();
  }

  palette.classList.remove('is-collapsed');
  palette.querySelector('.sql-palette-collapse')?.remove();
  clearLegacyCollapseState();
}

if (editorCard && palette) {
  clearLegacyCollapseState();
  enforceExpandedPalette();

  palette.classList.add('panel', 'sql-input-palette-card');
  palette.dataset.mobilePanel = 'editor';
  editorCard.before(palette);

  new MutationObserver(enforceExpandedPalette).observe(palette, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class'],
  });
}

const resultHeading = document.querySelector('.result-card .panel-heading > div');
resultHeading?.classList.add('result-title-inline');
