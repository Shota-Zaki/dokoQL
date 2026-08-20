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

function enforceExpandedPaletteOnce() {
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
  enforceExpandedPaletteOnce();

  palette.classList.add('panel', 'sql-input-palette-card');
  palette.dataset.mobilePanel = 'editor';
  editorCard.before(palette);

  // sqlInputPalette.js calculates its scale before this enhancer moves the panel
  // into the final grid. Re-run the existing resize-driven fit once after the
  // browser has committed the final layout. Do not observe palette mutations:
  // fitting itself changes classes/styles and would create avoidable feedback.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
  });
}

const resultHeading = document.querySelector('.result-card .panel-heading > div');
resultHeading?.classList.add('result-title-inline');
