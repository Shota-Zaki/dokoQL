import { EXERCISES_BY_DATASET } from './exercises.js';

const answerButton = document.getElementById('answerButton');
const copyButton = document.getElementById('copyAnswerButton');
const answerSql = document.getElementById('answerSql');
const answerExplanation = document.getElementById('answerExplanation');

function activeExercise() {
  const active = document.querySelector('.exercise-item.active[data-exercise-id]');
  if (!active) return null;
  const id = active.dataset.exerciseId;
  for (const rows of Object.values(EXERCISES_BY_DATASET)) {
    const found = rows.find(item => item.id === id);
    if (found) return found;
  }
  return null;
}

function addSection(title, text) {
  if (!text) return;
  const section = document.createElement('section');
  section.className = 'answer-detail-section';
  const heading = document.createElement('h3');
  heading.textContent = title;
  const body = document.createElement('p');
  body.textContent = text;
  section.append(heading, body);
  answerExplanation.append(section);
}

function enhanceAnswer() {
  const exercise = activeExercise();
  if (!exercise) return;

  const referenceAnswer = exercise.referenceAnswerSql || exercise.answerSql || '';
  if (referenceAnswer) answerSql.textContent = referenceAnswer;

  answerExplanation.replaceChildren();
  addSection('考え方', exercise.referenceExplanation || exercise.explanation || '');
  addSection('実行結果の確認ポイント', exercise.referenceCheck || '');
}

answerButton?.addEventListener('click', enhanceAnswer);
copyButton?.addEventListener('click', async event => {
  const exercise = activeExercise();
  const referenceAnswer = exercise?.referenceAnswerSql || exercise?.answerSql || '';
  if (!referenceAnswer) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  await navigator.clipboard.writeText(referenceAnswer);
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = '解答例をコピーしました';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1800);
  }
}, true);
