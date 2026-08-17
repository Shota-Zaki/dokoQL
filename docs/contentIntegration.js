import { EXERCISES, EXERCISES_BY_DATASET } from './exercises.js';
import { loadLearningContent } from './learningContent.js';

try {
  const { details = {}, extras = [] } = await loadLearningContent();

  for (const exercise of EXERCISES) {
    const detail = details[exercise.id];
    if (!detail) continue;
    exercise.referenceAnswerSql = detail.answer || exercise.answerSql || '';
    exercise.referenceExplanation = detail.explanation || exercise.explanation || '';
    exercise.referenceCheck = detail.check || '';
    if (detail.explanation) exercise.explanation = detail.explanation;
  }

  for (const extra of extras) {
    if (EXERCISES.some(item => item.id === extra.id)) continue;
    const exercise = {
      ...extra,
      referenceAnswerSql: extra.answerSql || '',
      referenceExplanation: extra.explanation || '',
      referenceCheck: '',
    };
    EXERCISES.push(exercise);
    (EXERCISES_BY_DATASET[exercise.datasetId] ||= []).push(exercise);
  }
} catch (error) {
  console.warn('詳細解説データを読み込めませんでした。基本問題データで起動します。', error);
}
