import { EXERCISES } from './exercises.js';

const byId = new Map(EXERCISES.map((exercise) => [exercise.id, exercise]));

const setupOverrides = {
  'rpg-c3-q7': `INSERT INTO パーティー VALUES ('A01','スガワラ','21',131,232,'03');`,
  'rpg-c5-q34': `INSERT INTO パーティー VALUES
('A01','スガワラ','21',131,232,'03'),
('A03','イズミ','20',84,190,'00');`,
};

for (const [id, setupSql] of Object.entries(setupOverrides)) {
  const exercise = byId.get(id);
  if (!exercise) throw new Error(`Missing exercise for setup compatibility override: ${id}`);
  exercise.setupSql = setupSql;
}
