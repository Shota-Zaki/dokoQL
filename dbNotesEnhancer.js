import { DATASETS } from './datasets.js';

const TABLE_META = {
  bank: {
    '口座': {
      note: '現在有効な口座を管理する基本テーブル。',
      columns: {
        '口座番号': { rule: 'PK', note: '7桁の口座識別子。' },
        '名義': { rule: 'NOT NULL', note: '口座名義。' },
        '種別': { rule: 'NOT NULL / CHECK', note: '1: 普通預金、2: 当座預金、3: 別段預金。' },
        '残高': { rule: 'NOT NULL / CHECK >= 0', note: '現在残高。円単位。' },
        '更新日': { rule: 'NULL可', note: '口座情報の更新日。未登録の場合はNULL。' },
      },
    },
    '廃止口座': {
      note: '解約済み口座の最終状態を保持する履歴テーブル。',
      columns: {
        '口座番号': { rule: 'PK', note: '解約済み口座の7桁識別子。' },
        '名義': { rule: 'NOT NULL', note: '解約時の口座名義。' },
        '種別': { rule: 'NOT NULL / CHECK', note: '1: 普通預金、2: 当座預金、3: 別段預金。' },
        '解約時残高': { rule: 'NOT NULL / CHECK >= 0', note: '解約時点の残高。円単位。' },
        '解約日': { rule: 'NULL可', note: '口座を解約した日。' },
      },
    },
    '取引事由': {
      note: '取引の種類をコード化して管理するマスターテーブル。',
      columns: {
        '取引事由ID': { rule: 'PK', note: '取引事由を識別する数値ID。' },
        '取引事由名': { rule: 'NOT NULL', note: '給与、振込、手数料などの取引理由。' },
      },
    },
    '取引': {
      note: '口座で発生した入出金の履歴。入金と出金は該当する側に金額が入り、もう一方はNULLとなる。',
      columns: {
        '取引番号': { rule: 'PK', note: '取引を一意に識別する番号。' },
        '取引事由ID': { rule: 'FK → 取引事由', note: '取引理由。取引事由テーブルを参照する。' },
        '日付': { rule: 'NOT NULL', note: '取引日。' },
        '口座番号': { rule: 'NOT NULL', note: '取引対象の口座番号。DB上の外部キー制約は設定していない。' },
        '入金額': { rule: 'NULL可', note: '入金額。円単位。出金取引ではNULL。' },
        '出金額': { rule: 'NULL可', note: '出金額。円単位。入金取引ではNULL。' },
      },
    },
  },
  store: {
    '商品': {
      note: '現在取り扱っている商品を管理するテーブル。',
      columns: {
        '商品コード': { rule: 'PK', note: '5文字の商品識別コード。' },
        '商品名': { rule: 'NOT NULL', note: '商品名称。' },
        '単価': { rule: 'NOT NULL', note: '商品1個あたりの価格。円単位。' },
        '商品区分': { rule: 'NOT NULL / CHECK', note: '商品分類を表す1桁コード。許可値は1、2、3、9。' },
        '関連商品コード': { rule: 'NULL可', note: '関連する別商品のコード。DB上の自己参照外部キー制約は設定していない。' },
      },
    },
    '廃番商品': {
      note: '販売終了した商品の最終情報と累計情報を保持するテーブル。',
      columns: {
        '商品コード': { rule: 'PK', note: '廃番商品の識別コード。' },
        '商品名': { rule: 'NOT NULL', note: '廃番時の商品名称。' },
        '単価': { rule: 'NOT NULL', note: '廃番時の商品単価。円単位。' },
        '商品区分': { rule: 'NOT NULL', note: '商品分類コード。' },
        '廃番日': { rule: 'NOT NULL', note: '販売を終了した日。' },
        '売上個数': { rule: 'NOT NULL', note: '廃番までの売上個数。' },
      },
    },
    '注文': {
      note: '注文の明細行を管理するテーブル。同一注文番号でも枝番ごとに商品明細を持てる。',
      columns: {
        '注文日': { rule: '複合PK', note: '注文を受けた日。注文番号・注文枝番と合わせて主キー。' },
        '注文番号': { rule: '複合PK', note: '注文を識別する12文字の番号。注文日・注文枝番と合わせて主キー。' },
        '注文枝番': { rule: '複合PK', note: '同一注文内の明細番号。注文日・注文番号と合わせて主キー。' },
        '商品コード': { rule: 'NOT NULL', note: '注文対象の商品コード。履歴上の廃番商品も扱うためDB上の外部キー制約は設定していない。' },
        '数量': { rule: 'NOT NULL', note: '注文数量。' },
        'クーポン割引料': { rule: 'NULL可', note: 'クーポンによる値引き額。適用なしの場合はNULL。円単位。' },
      },
    },
  },
  rpg: {
    'パーティー': {
      note: 'キャラクターの基本状態を管理するテーブル。',
      columns: {
        'ID': { rule: 'PK', note: 'キャラクターを識別する3文字ID。' },
        '名称': { rule: 'NOT NULL', note: 'キャラクター名称。' },
        '職業コード': { rule: 'NOT NULL', note: '職業を表すコード。コードテーブルのコード種別1で意味を確認できる。DB上の外部キー制約は設定していない。' },
        'HP': { rule: 'NOT NULL', note: '現在のHP。' },
        'MP': { rule: 'NOT NULL', note: '現在のMP。' },
        '状態コード': { rule: 'NOT NULL', note: '状態異常を表すコード。コードテーブルのコード種別2で意味を確認できる。DB上の外部キー制約は設定していない。' },
      },
    },
    'イベント': {
      note: 'ゲーム内イベントと前後関係を管理するテーブル。',
      columns: {
        'イベント番号': { rule: 'PK', note: 'イベントを一意に識別する番号。' },
        'イベント名称': { rule: 'NOT NULL', note: 'イベント名称。' },
        'タイプ': { rule: 'NOT NULL / CHECK', note: 'イベント分類。許可値は1、2、3。' },
        '前提イベント番号': { rule: 'NULL可', note: '直前のイベント番号。DB上の自己参照外部キー制約は設定していない。' },
        '後続イベント番号': { rule: 'NULL可', note: '次のイベント番号。DB上の自己参照外部キー制約は設定していない。' },
      },
    },
    '経験イベント': {
      note: 'イベントのクリア状況と結果を管理するテーブル。',
      columns: {
        'イベント番号': { rule: 'PK', note: '対象イベント番号。イベントテーブルへの外部キー制約は設定していない。' },
        'クリア区分': { rule: 'NOT NULL / CHECK', note: '0: 未クリア、1: クリア。' },
        'クリア結果': { rule: 'NULL可', note: 'クリア時の結果コード。コードテーブルのコード種別4で意味を確認できる。未クリア時はNULL。' },
        'ルート番号': { rule: 'NULL可', note: '進行ルートを識別する番号。' },
      },
    },
    'コード': {
      note: '画面や業務データで使用するコード値と名称の対応表。コード種別1は職業、2は状態、3はイベント分類、4はクリア結果を表す。',
      columns: {
        'コード種別': { rule: '複合PK', note: 'コード体系の種類。コード値と合わせて主キー。' },
        'コード値': { rule: '複合PK', note: '各コード体系内の値。コード種別と合わせて主キー。' },
        'コード名称': { rule: 'NULL可', note: 'コード値の表示名称。' },
      },
    },
  },
};

const inspector = document.getElementById('dbInspector');
const datasetSelect = document.getElementById('datasetSelect');

function escapeHtml(value) {
  return String(value).replace(/[&<>\"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' }[ch]));
}

function currentTable() {
  return document.querySelector('#tableTabs [data-table].active')?.dataset.table || null;
}

function getMeta() {
  const datasetId = datasetSelect?.value;
  const table = currentTable();
  if (!datasetId || !table) return null;
  return {
    datasetId,
    table,
    dataset: DATASETS[datasetId],
    tableMeta: TABLE_META[datasetId]?.[table],
  };
}

let updating = false;

function enrichInspector() {
  if (!inspector || updating) return;
  const meta = getMeta();
  if (!meta?.tableMeta) return;

  updating = true;
  try {
    if (!inspector.querySelector('.db-context-card')) {
      const datasetDescription = meta.dataset?.description || '';
      inspector.insertAdjacentHTML('afterbegin', `
        <div class="db-context-card">
          <strong>${escapeHtml(meta.table)}｜備考</strong>
          <p>${escapeHtml(meta.tableMeta.note)}</p>
          ${datasetDescription ? `<p class="db-context-dataset">題材: ${escapeHtml(datasetDescription)}</p>` : ''}
        </div>`);
    }

    const schema = inspector.querySelector('.schema-list');
    if (schema && schema.dataset.notesEnhanced !== 'true') {
      const header = schema.querySelector('thead tr');
      if (header) header.insertAdjacentHTML('beforeend', '<th>キー / 制約</th><th>備考</th>');

      schema.querySelectorAll('tbody tr').forEach(row => {
        const columnName = row.cells[0]?.textContent?.trim() || '';
        const columnMeta = meta.tableMeta.columns?.[columnName] || {};
        row.insertAdjacentHTML('beforeend',
          `<td class="schema-rule-cell">${escapeHtml(columnMeta.rule || '—')}</td>` +
          `<td class="schema-note-cell">${escapeHtml(columnMeta.note || '—')}</td>`);
      });
      schema.dataset.notesEnhanced = 'true';
    }
  } finally {
    updating = false;
  }
}

if (inspector) {
  const observer = new MutationObserver(() => queueMicrotask(enrichInspector));
  observer.observe(inspector, { childList: true, subtree: true });

  document.addEventListener('click', event => {
    if (event.target.closest('[data-table], [data-db-view]')) setTimeout(enrichInspector, 0);
  });
  datasetSelect?.addEventListener('change', () => setTimeout(enrichInspector, 0));
  enrichInspector();
}
