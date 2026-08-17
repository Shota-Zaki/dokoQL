import { EXERCISES_BY_DATASET } from './exercises.js';

const hintButton = document.getElementById('hintButton');
const hintArea = document.getElementById('hintArea');

let activeId = null;
let revealed = 0;

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

function has(sql, pattern) {
  return pattern.test(sql || '');
}

function sqlFeatures(sql) {
  const checks = [
    [/\bDISTINCT\b/i, 'DISTINCT'],
    [/\bWHERE\b/i, 'WHERE'],
    [/\bIS\s+NOT\s+NULL\b/i, 'IS NOT NULL'],
    [/\bIS\s+NULL\b/i, 'IS NULL'],
    [/\bBETWEEN\b/i, 'BETWEEN'],
    [/\bNOT\s+IN\b/i, 'NOT IN'],
    [/\bIN\s*\(/i, 'IN'],
    [/\bLIKE\b/i, 'LIKE'],
    [/\bEXISTS\b/i, 'EXISTS'],
    [/\bCASE\b/i, 'CASE'],
    [/\bCOALESCE\b/i, 'COALESCE'],
    [/\bFULL(?:\s+OUTER)?\s+JOIN\b/i, 'FULL OUTER JOIN'],
    [/\bLEFT(?:\s+OUTER)?\s+JOIN\b/i, 'LEFT JOIN'],
    [/\bRIGHT(?:\s+OUTER)?\s+JOIN\b/i, 'RIGHT JOIN'],
    [/\b(?:INNER\s+)?JOIN\b/i, 'JOIN'],
    [/\bGROUP\s+BY\b/i, 'GROUP BY'],
    [/\bHAVING\b/i, 'HAVING'],
    [/\bCOUNT\s*\(/i, 'COUNT'],
    [/\bSUM\s*\(/i, 'SUM'],
    [/\bAVG\s*\(/i, 'AVG'],
    [/\bMAX\s*\(/i, 'MAX'],
    [/\bMIN\s*\(/i, 'MIN'],
    [/\bSTRING_AGG\s*\(/i, 'STRING_AGG'],
    [/\bEXTRACT\s*\(/i, 'EXTRACT'],
    [/\bCAST\s*\(/i, 'CAST'],
    [/\bUNION\s+ALL\b/i, 'UNION ALL'],
    [/\bUNION\b/i, 'UNION'],
    [/\bEXCEPT\b/i, 'EXCEPT'],
    [/\bINTERSECT\b/i, 'INTERSECT'],
    [/\bORDER\s+BY\b/i, 'ORDER BY'],
    [/\bLIMIT\b/i, 'LIMIT'],
    [/\bOFFSET\b/i, 'OFFSET'],
    [/\bBEGIN\b/i, 'BEGIN'],
    [/\bROLLBACK\b/i, 'ROLLBACK'],
    [/\bCOMMIT\b/i, 'COMMIT'],
  ];

  const found = [];
  for (const [pattern, label] of checks) {
    if (pattern.test(sql || '') && !found.includes(label)) found.push(label);
  }
  const selectCount = (sql?.match(/\bSELECT\b/gi) || []).length;
  if (selectCount >= 2) found.unshift('副問い合わせ');
  return found.slice(0, 8);
}

function firstSentence(text) {
  if (!text) return '';
  const cleaned = String(text).replace(/\s+/g, ' ').trim();
  const match = cleaned.match(/^.*?[。！？](?:\s|$)/);
  return (match?.[0] || cleaned).trim();
}

function originalHint(ex) {
  const rows = Array.isArray(ex.hint) ? ex.hint : (ex.hint ? [ex.hint] : []);
  return rows.map(x => String(x).trim()).filter(Boolean).slice(0, 2).join(' ');
}

function maskedSql(sql) {
  if (!sql) return '';
  return sql
    .replace(/--.*$/gm, '')
    .replace(/'(?:''|[^'])*'/g, "'…'")
    .replace(/\b\d+(?:\.\d+)?\b/g, '?')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function selectDirection(ex, sql) {
  if (has(sql, /\bGROUP\s+BY\b|\bCOUNT\s*\(|\bSUM\s*\(|\bAVG\s*\(|\bMAX\s*\(|\bMIN\s*\(/i)) {
    return 'まず「結果の1行を何の単位にするか」を決めます。その単位ごとに集計する列を分け、集計前に除外する条件と集計後に判定する条件を混同しないようにします。';
  }
  if (has(sql, /\bJOIN\b/i)) {
    return 'まず、最終的に表示したい各列がどのテーブルにあるかを確認します。次に基準となる表を1つ決め、同じ意味を持つキー同士を順に結びます。';
  }
  if ((sql.match(/\bSELECT\b/gi) || []).length >= 2) {
    return '外側の検索だけで一気に書こうとせず、「先に求める集合」と「その結果を使って絞る外側の検索」に分けて考えます。内側だけを先に実行して結果を確認すると整理しやすくなります。';
  }
  if (has(sql, /\bUNION\b|\bEXCEPT\b|\bINTERSECT\b/i)) {
    return '2つの検索結果を別々に作り、それぞれの列数と型が対応しているか確認します。そのうえで、和・差・共通部分のどれが問題文の意味に合うかを考えます。';
  }
  if (has(sql, /\bWHERE\b/i)) {
    return '最初に「返す列」と「読む表」だけを書き、その後で問題文の条件を1つずつ真偽条件へ置き換えます。文字列・日付・NULLは通常の数値比較と扱いが違う点に注意します。';
  }
  if (has(sql, /\bORDER\s+BY\b|\bLIMIT\b|\bOFFSET\b/i)) {
    return 'まず必要な行を取得できるSELECTを完成させます。その後で「並び順」と「何件目から何件取るか」を別々に追加していくと混乱しにくくなります。';
  }
  return '問題文から「どの表から」「どの列を返すか」の2点だけを先に抜き出します。まず最小のSELECTを作り、実行結果を見てから必要な加工を足します。';
}

function mutationDirection(ex) {
  if (ex.type === 'insert') {
    return 'まず、追加する1行について「どの列へ」「どの値を入れるか」を対応させます。列順・データ型・NULLの有無をテーブル定義と照合してからSQLへ落とします。';
  }
  if (ex.type === 'update') {
    return '「変更する列」と「変更してよい行」を分離して考えます。先にWHERE条件だけをSELECTで試すと、更新対象を誤るリスクを減らせます。';
  }
  if (ex.type === 'delete') {
    return '削除SQLを書く前に、同じWHERE条件をSELECTへ置き換えて対象行を確認します。全行削除なのか一部削除なのかを最初に確定させます。';
  }
  if (ex.type === 'ddl') {
    return '表ごとに「主キー」「NOT NULL」「外部キー」「データ型」を先に整理します。外部キーがある場合は、参照される親テーブルから作る順序も確認します。';
  }
  return '問題文を「対象」「変更内容」「条件」の3つへ分け、1つずつSQLへ対応させます。';
}

function designDirection(ex) {
  if (ex.datasetId === 'normalization') {
    if (Number(ex.chapter) === 1) {
      return 'まず主キーを確認し、主キー以外の列の中に「別の非キー列が決まれば自動的に決まる列」がないか探します。そこが推移的従属を分離する候補です。';
    }
    if (Number(ex.chapter) === 2) {
      return '複合主キーを構成する列を分解して見ます。主キー全体ではなく、その一部だけで値が決まる列があれば部分関数従属なので、別表へ分ける候補です。';
    }
    if (Number(ex.chapter) === 3) {
      return '1つの行やセルの中に、複数回繰り返される属性の組がないか探します。繰り返し集合を1行1値になる形へ展開することから始めます。';
    }
    return 'いきなり第3正規形を作らず、非正規形 → 第1正規形 → 第2正規形 → 第3正規形の順に、各段階で何を分離したかを確認します。';
  }
  return '最初に業務上の「もの」と「出来事」を分けて候補を挙げます。その後、1対多・多対多・主キー・外部キーを順に決め、最後に物理的な型と制約へ落とします。';
}

function toolHint(ex, sql) {
  if (ex.type === 'design') {
    const base = originalHint(ex);
    const ref = firstSentence(ex.referenceExplanation || ex.explanation || '');
    return [base, ref].filter(Boolean).join(' ') || '主キー、関数従属、繰り返し項目、外部キーの順に確認してください。';
  }

  const features = sqlFeatures(sql);
  const base = originalHint(ex);
  const featureText = features.length
    ? `候補になる構文・機能は「${features.join(' / ')}」です。全部を使う必要はありませんが、問題文の各条件がどれに対応するか考えてください。`
    : 'まず基本構文だけで最小形を作り、条件を1つずつ追加してください。';
  return [featureText, base].filter(Boolean).join(' ');
}

function finalHint(ex, sql) {
  if (ex.type === 'design') {
    const check = ex.referenceCheck || '';
    if (check) return `最後に確認する観点: ${check}`;
    const ref = ex.referenceExplanation || ex.explanation || originalHint(ex);
    return ref ? `分解後の表・キー・関係がこの観点を満たすか確認してください: ${ref}` : '分解後に重複した事実が残っていないか、主キーと外部キーで元の情報を再構成できるか確認してください。';
  }

  const skeleton = maskedSql(sql);
  if (!skeleton) return 'SQLの骨組みを「命令 → 対象 → 条件 → 並び/集計」の順に書いてみてください。';
  return skeleton;
}

function buildHints(ex) {
  const answer = ex.referenceAnswerSql || ex.answerSql || '';
  const direction = ex.type === 'select'
    ? selectDirection(ex, answer)
    : ex.type === 'design'
      ? designDirection(ex)
      : mutationDirection(ex);

  return [
    { title: ex.type === 'design' ? '整理の順番' : '方針', text: direction, code: false },
    { title: ex.type === 'design' ? '見る関係' : '使う道具', text: toolHint(ex, answer), code: false },
    { title: ex.type === 'design' ? '最終チェック' : 'SQLの骨組み', text: finalHint(ex, answer), code: ex.type !== 'design' },
  ];
}

function renderHints(hints) {
  const visible = hints.slice(0, revealed);
  hintArea.classList.remove('hidden');
  hintArea.innerHTML = `<div class="hint-progress">${visible.map((hint, index) => `
    <section class="hint-step">
      <div class="hint-step-heading"><span class="hint-step-index">${index + 1}</span><strong>${escapeHtml(hint.title)}</strong></div>
      ${hint.code
        ? `<pre class="hint-skeleton"><code>${escapeHtml(hint.text)}</code></pre>`
        : `<p>${escapeHtml(hint.text)}</p>`}
    </section>`).join('')}</div>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>\"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
}

function handleHint(event) {
  const ex = activeExercise();
  if (!ex || !hintArea || !hintButton) return;
  event.preventDefault();
  event.stopImmediatePropagation();

  if (activeId !== ex.id) {
    activeId = ex.id;
    revealed = 0;
    hintArea.classList.add('hidden');
  }

  const hints = buildHints(ex);
  if (!hintArea.classList.contains('hidden') && revealed >= hints.length) {
    revealed = 0;
    hintArea.classList.add('hidden');
    hintArea.replaceChildren();
    hintButton.textContent = 'ヒント';
    return;
  }

  revealed = Math.min(revealed + 1, hints.length);
  renderHints(hints);
  hintButton.textContent = revealed < hints.length
    ? `次のヒント（${revealed + 1}/${hints.length}）`
    : 'ヒントを閉じる';
}

hintButton?.addEventListener('click', handleHint, true);
