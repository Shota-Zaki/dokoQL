const splitCss = document.createElement('link');
splitCss.rel = 'stylesheet';
splitCss.href = './editorSplit.css';
document.head.append(splitCss);

const editor = document.getElementById('sqlEditor');
const editorCard = editor?.closest('.editor-card');
const palette = editorCard?.querySelector('.sql-input-palette');

if (editorCard && palette) {
  palette.classList.add('panel', 'sql-input-palette-card');
  palette.dataset.mobilePanel = 'editor';
  editorCard.before(palette);
}

const resultHeading = document.querySelector('.result-card .panel-heading > div');
resultHeading?.classList.add('result-title-inline');
