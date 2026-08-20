import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

const specs = [
  {
    id: 'bank',
    file: 'content/official-bank-seed.sql',
    tables: ['口座', '廃止口座', '取引', '取引事由'],
    counts: { 口座: 30, 廃止口座: 4, 取引: 29, 取引事由: 7 },
    required: [
      "('0037651','キタムラ　ユウコ','1',1341107,'2024-01-03')",
      "('0351333','アイダ　ミユ','1',367911,'2024-01-06')",
      "(17,1,'2024-01-11','0351333',50000,NULL)",
      "(9,'その他')",
    ],
  },
  {
    id: 'store',
    file: 'content/official-store-seed.sql',
    tables: ['商品', '注文', '廃番商品'],
    counts: { 商品: 42, 注文: 68, 廃番商品: 9 },
    required: [
      "('W0156','あったかルームソックス',800,'1','W0746')",
      "('W0746','あったかルームウェアセット',3500,'1','W0156')",
      "('2024-03-15','202403150014',1,'B0113',1,NULL)",
      "('S1990','ラップスカート',6800,'1','2023-02-10',18)",
    ],
  },
  {
    id: 'rpg',
    file: 'content/official-rpg-seed.sql',
    tables: ['パーティー', 'イベント', '経験イベント', 'コード'],
    counts: { パーティー: 2, イベント: 26, 経験イベント: 7, コード: 26 },
    required: [
      "('C01','ミナト','01',89,35,'00')",
      "('C02','アサカ','11',74,66,'00')",
      "(26,'エンディング（2週目以降）','3',24,NULL)",
      "(1,'14','竜騎士')",
      "(1,'14','魔剣士')",
    ],
  },
];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function countRows(sql, table) {
  const pattern = new RegExp(`INSERT\\s+INTO\\s+${escapeRegex(table)}\\s+VALUES\\s*([\\s\\S]*?);`, 'gi');
  let count = 0;
  let match;
  while ((match = pattern.exec(sql))) {
    count += (match[1].match(/^\s*\(/gm) || []).length;
  }
  return count;
}

const errors = [];

for (const spec of specs) {
  const sql = await readFile(resolve(root, spec.file), 'utf8');
  if (/PRIMARY\s+KEY|FOREIGN\s+KEY|REFERENCES\s+/i.test(sql)) {
    errors.push(`${spec.id}: seed contains constraints that are not present in the source drill setup`);
  }

  for (const table of spec.tables) {
    const createPattern = new RegExp(`CREATE\\s+TABLE\\s+${escapeRegex(table)}\\s*\\(`, 'i');
    if (!createPattern.test(sql)) errors.push(`${spec.id}: missing CREATE TABLE ${table}`);
    const actual = countRows(sql, table);
    const expected = spec.counts[table];
    if (actual !== expected) errors.push(`${spec.id}: ${table} row count ${actual}, expected ${expected}`);
  }

  for (const required of spec.required) {
    if (!sql.includes(required)) errors.push(`${spec.id}: missing source compatibility row ${required}`);
  }
}

if (errors.length) {
  console.error('Official seed compatibility check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Official seed compatibility OK: bank/store/RPG schemas and key row counts match the 4th-edition drill setup.');
