import { EXERCISES_BY_DATASET } from './exercises.js';
import { BANK_SOURCE_PROMPTS } from './content/source-prompts-bank.js';
import { STORE_SOURCE_PROMPTS } from './content/source-prompts-store.js';
import { RPG_SOURCE_PROMPTS } from './content/source-prompts-rpg.js';
import { NORMALIZATION_SOURCE_PROMPTS } from './content/source-prompts-normalization.js';
import { DESIGN_SOURCE_PROMPTS } from './content/source-prompts-design.js';

export const SOURCE_PROMPTS_BY_DATASET = Object.freeze({
  bank: BANK_SOURCE_PROMPTS,
  store: STORE_SOURCE_PROMPTS,
  rpg: RPG_SOURCE_PROMPTS,
  normalization: NORMALIZATION_SOURCE_PROMPTS,
  design: DESIGN_SOURCE_PROMPTS,
});

const expectedCounts = Object.freeze({
  bank: 75,
  store: 70,
  rpg: 70,
  normalization: 22,
  design: 16,
});

for (const [datasetId, prompts] of Object.entries(SOURCE_PROMPTS_BY_DATASET)) {
  const rows = EXERCISES_BY_DATASET[datasetId] || [];
  if (rows.length !== expectedCounts[datasetId]) {
    throw new Error(`Unexpected exercise count for ${datasetId}: ${rows.length}`);
  }
  if (Object.keys(prompts).length !== expectedCounts[datasetId]) {
    throw new Error(`Unexpected source prompt count for ${datasetId}: ${Object.keys(prompts).length}`);
  }

  for (const exercise of rows) {
    const sourcePrompt = prompts[exercise.number];
    if (typeof sourcePrompt !== 'string' || !sourcePrompt.trim()) {
      throw new Error(`Missing source prompt for ${exercise.id}`);
    }
    exercise.prompt = sourcePrompt;
  }
}

const answerOverrides = {
  'bank-c2-q5': {
    sql: `UPDATE 口座 SET 名義 = 'XXXXX';`,
  },
  'bank-c4-q32': {
    sql: `SELECT 口座番号, 残高 FROM 口座 WHERE 残高 = 0
UNION ALL
SELECT 口座番号, 解約時残高 FROM 廃止口座 WHERE 解約時残高 <> 0
ORDER BY 口座番号;`,
    ordered: true,
  },
  'bank-c5-q38': {
    sql: `SELECT 口座番号, 'カ)' || 名義 AS 名義
FROM 口座
WHERE 種別 = '3';`,
  },
  'bank-c5-q40': {
    sql: `SELECT 口座番号, 名義,
  CASE WHEN 残高 < 100000 THEN 'C'
       WHEN 残高 < 1000000 THEN 'B'
       ELSE 'A' END AS 残高ランク
FROM 口座;`,
  },
  'bank-c5-q44': {
    sql: `SELECT 口座番号, 残高, FLOOR(残高 * 0.0002) AS 利息
FROM 口座
ORDER BY 残高 DESC;`,
    ordered: true,
  },
  'bank-c5-q47': {
    sql: `SELECT 口座番号, 名義, 種別, 残高, TO_CHAR(更新日, 'YYYY年MM月DD日') AS 更新日
FROM 口座
WHERE 更新日 >= '2024-01-01';`,
  },
  'bank-c7-q63': {
    sql: `SELECT x.日付,
  (SELECT MAX(入金額) FROM 取引 WHERE 口座番号 = '3104451') AS 最大入金額,
  (SELECT MAX(出金額) FROM 取引 WHERE 口座番号 = '3104451') AS 最大出金額
FROM (
  SELECT 日付
  FROM 取引
  WHERE 口座番号 = '3104451'
  GROUP BY 日付
  HAVING COUNT(入金額) > 0 AND COUNT(出金額) > 0
) x;`,
  },
  'bank-c8-q65': {
    sql: `SELECT t.口座番号, t.日付, r.取引事由名,
       COALESCE(t.入金額, t.出金額) AS 取引金額
FROM 取引 t
JOIN 取引事由 r ON r.取引事由ID = t.取引事由ID
WHERE t.口座番号 IN ('0311240','1234161','2750902')
ORDER BY t.口座番号, t.取引番号;`,
    ordered: true,
  },
  'bank-c8-q67': {
    sql: `SELECT DISTINCT k.口座番号, k.名義, k.残高
FROM 口座 k
JOIN 取引 t ON t.口座番号 = k.口座番号
WHERE t.日付 = '2022-03-01';`,
  },
  'bank-c8-q68': {
    sql: `SELECT DISTINCT k.口座番号, k.名義, k.残高
FROM 口座 k
JOIN 取引 t ON t.口座番号 = k.口座番号
WHERE t.日付 = '2022-03-01'
UNION
SELECT DISTINCT h.口座番号, '解約済み' AS 名義, 0 AS 残高
FROM 廃止口座 h
JOIN 取引 t ON t.口座番号 = h.口座番号
WHERE t.日付 = '2022-03-01';`,
  },
  'bank-c8-q69': {
    sql: `SELECT t.取引番号, t.日付, t.口座番号,
       COALESCE(t.取引事由ID, r.取引事由ID)::TEXT || ':' || COALESCE(r.取引事由名, '不明') AS 取引事由,
       t.入金額, t.出金額
FROM 取引 t
FULL OUTER JOIN 取引事由 r ON r.取引事由ID = t.取引事由ID;`,
  },
  'bank-c8-q72': {
    sql: `SELECT k.口座番号, k.名義, k.残高, t.日付, t.取引事由ID, t.入金額, t.出金額
FROM 口座 k
JOIN 取引 t ON t.口座番号 = k.口座番号
WHERE k.残高 >= 5000000
  AND t.日付 >= '2024-01-01'
  AND (t.入金額 >= 1000000 OR t.出金額 >= 1000000);`,
  },
  'bank-c8-q73': {
    sql: `SELECT k.口座番号, k.名義, k.残高, t.日付, t.取引事由ID, t.入金額, t.出金額
FROM 口座 k
JOIN (
  SELECT * FROM 取引
  WHERE 日付 >= '2024-01-01'
    AND (入金額 >= 1000000 OR 出金額 >= 1000000)
) t ON t.口座番号 = k.口座番号
WHERE k.残高 >= 5000000;`,
  },
  'store-c2-q3': {
    sql: `SELECT * FROM 注文;`,
  },
  'store-c3-q8': {
    sql: `SELECT * FROM 商品 WHERE 単価 <= 1000;`,
  },
  'store-c4-q32': {
    sql: `SELECT 商品コード FROM 商品
INTERSECT
SELECT 商品コード FROM 注文
ORDER BY 商品コード DESC;`,
    ordered: true,
  },
  'store-c5-q36': {
    sql: `UPDATE 注文 SET 数量 = 数量 - 1
WHERE 注文番号 = '202402250126' AND 商品コード = 'W0156';`,
  },
  'store-c5-q40': {
    sql: `SELECT 商品名, LENGTH(商品名) AS 文字数
FROM 商品
WHERE LENGTH(商品名) > 10
ORDER BY 文字数;`,
    ordered: true,
  },
  'store-c6-q47': {
    sql: `SELECT 注文日, SUM(数量) AS 数量合計
FROM 注文
GROUP BY 注文日
ORDER BY 注文日;`,
    ordered: true,
  },
  'store-c6-q48': {
    sql: `SELECT 商品区分, MIN(単価) AS 最小額, MAX(単価) AS 最高額
FROM 商品
GROUP BY 商品区分
ORDER BY 商品区分;`,
    ordered: true,
  },
  'store-c6-q50': {
    sql: `SELECT 商品コード, SUM(数量) AS 販売数量
FROM 注文
GROUP BY 商品コード
ORDER BY 販売数量 DESC, 商品コード ASC
LIMIT 10;`,
    ordered: true,
  },
  'rpg-c2-q3': {
    sql: `SELECT * FROM イベント;`,
  },
  'rpg-c3-q20': {
    sql: `SELECT * FROM パーティー
WHERE ID LIKE 'A%' AND 職業コード LIKE '2%';`,
  },
  'rpg-c8-q66': {
    sql: `SELECT p.ID, COALESCE(p.名称, '（仲間になっていない！）') AS なまえ, c.コード名称 AS 職業
FROM コード c
LEFT JOIN パーティー p ON p.職業コード = c.コード値
WHERE c.コード種別 = 1;`,
  },
};

const byId = new Map(Object.values(EXERCISES_BY_DATASET).flat().map((exercise) => [exercise.id, exercise]));
for (const [id, override] of Object.entries(answerOverrides)) {
  const exercise = byId.get(id);
  if (!exercise) throw new Error(`Missing exercise for answer override: ${id}`);
  exercise.answerSql = override.sql;
  exercise.referenceAnswerSql = override.sql;
  if (override.ordered !== undefined) exercise.ordered = override.ordered;
}
