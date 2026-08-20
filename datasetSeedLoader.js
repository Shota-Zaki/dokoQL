import { DATASETS } from './datasets.js';

for (const dataset of Object.values(DATASETS)) {
  if (!dataset.seedFile) continue;

  const url = new URL(dataset.seedFile, import.meta.url);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load dataset seed: ${dataset.id} (${response.status})`);
  }

  const sql = await response.text();
  if (!sql.trim()) throw new Error(`Dataset seed is empty: ${dataset.id}`);
  dataset.seedSql = sql;
}
