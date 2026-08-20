export const DATASETS = {
  bank: {
    id: 'bank',
    label: '銀行口座データ',
    description: '第4版 C.1.1 銀行口座データベース互換データ',
    seedFile: './content/official-bank-seed.sql',
    sourceRepository: 'miyabilink/sukkiri-sql4-codes',
    sourcePath: 'setup/chapac/pre_quizapx1.sql',
    sourceBlobSha: '0baf30135d746ca6629542ffdc6740559bbb5aed',
    seedSql: `
CREATE TABLE 口座 ( 口座番号 CHAR(7), 名義 VARCHAR(40), 種別 CHAR(1), 残高 INTEGER, 更新日 DATE );
CREATE TABLE 廃止口座 ( 口座番号 CHAR(7), 名義 VARCHAR(40), 種別 CHAR(1), 解約時残高 INTEGER, 解約日 DATE );
CREATE TABLE 取引 ( 取引番号 INTEGER, 取引事由ID INTEGER, 日付 DATE, 口座番号 CHAR(7), 入金額 INTEGER, 出金額 INTEGER );
CREATE TABLE 取引事由 ( 取引事由ID INTEGER, 取引事由名 VARCHAR(20) );
`,
  },

  store: {
    id: 'store',
    label: '商店データ',
    description: '第4版 C.1.2 商店データベース互換データ',
    seedFile: './content/official-store-seed.sql',
    sourceRepository: 'miyabilink/sukkiri-sql4-codes',
    sourcePath: 'setup/chapac/pre_quizapx2.sql',
    sourceBlobSha: '38cbcc01406ca2cd1f58f9b6eddd68c81eea4cd5',
    seedSql: `
CREATE TABLE 商品 ( 商品コード CHAR(5), 商品名 VARCHAR(100), 単価 INTEGER, 商品区分 CHAR(1), 関連商品コード CHAR(5) );
CREATE TABLE 注文 ( 注文日 DATE, 注文番号 CHAR(12), 注文枝番 INTEGER, 商品コード CHAR(5), 数量 INTEGER, クーポン割引料 INTEGER );
CREATE TABLE 廃番商品 ( 商品コード CHAR(5), 商品名 VARCHAR(100), 単価 INTEGER, 商品区分 CHAR(1), 廃番日 DATE, 売上個数 INTEGER );
`,
  },

  rpg: {
    id: 'rpg',
    label: 'RPGデータ',
    description: '第4版 C.1.3 RPGデータベース互換データ',
    seedFile: './content/official-rpg-seed.sql',
    sourceRepository: 'miyabilink/sukkiri-sql4-codes',
    sourcePath: 'setup/chapac/pre_quizapx3.sql',
    sourceBlobSha: '3ecc22b22aaa3e2330c568f079aaddc0feea65d4',
    seedSql: `
CREATE TABLE パーティー ( ID CHAR(3), 名称 VARCHAR(20), 職業コード CHAR(2), HP INTEGER, MP INTEGER, 状態コード CHAR(2) );
CREATE TABLE イベント ( イベント番号 INTEGER, イベント名称 VARCHAR(50), タイプ CHAR(1), 前提イベント番号 INTEGER, 後続イベント番号 INTEGER );
CREATE TABLE 経験イベント ( イベント番号 INTEGER, クリア区分 CHAR(1), クリア結果 CHAR(1), ルート番号 INTEGER );
CREATE TABLE コード ( コード種別 INTEGER, コード値 CHAR(2), コード名称 VARCHAR(100) );
`,
  },

  normalization: {
    id: 'normalization',
    label: '正規化ドリル',
    description: '非正規形から第3正規形までの分解を考える設計問題',
    seedSql: `SELECT 1;`,
  },

  design: {
    id: 'design',
    label: '予約管理DB設計',
    description: '概念設計からDDL・検索までを通して行う総合演習',
    seedSql: `SELECT 1;`,
  },
};

export const DATASET_ORDER = ['bank', 'store', 'rpg', 'normalization', 'design'];
