const rows = [
  ['検索','SELECT','取得する列や式を指定する。','SELECT 列1, 列2 FROM テーブル;','必要なデータを検索して結果として返す。','SELECT * は全列。実務では必要列を明示すると変更影響を把握しやすい。'],
  ['検索','FROM','データの取得元を指定する。','SELECT * FROM 口座;','検索対象のテーブルやサブクエリを決める。','複数表はJOINで関連付けるのが基本。'],
  ['検索','DISTINCT','検索結果から重複行を除外する。','SELECT DISTINCT 名義 FROM 口座;','ユニークな値や組み合わせだけを得る。','SELECTした列の組み合わせ全体で重複判定される。'],
  ['検索','AS','列やテーブルへ一時的な別名を付ける。','SELECT 残高 AS 現在残高 FROM 口座 AS a;','見出しを分かりやすくし、JOIN時の記述を短くする。','PostgreSQL系で空白を含む別名はダブルクォートで囲む。'],

  ['条件','WHERE','条件に一致する行だけを対象にする。','SELECT * FROM 口座 WHERE 残高 >= 1000000;','SELECT・UPDATE・DELETEの対象行を絞る。','UPDATEやDELETEで省略すると全行が対象になる。'],
  ['条件','AND','複数条件をすべて満たす行を選ぶ。','WHERE 残高 > 0 AND 更新日 IS NOT NULL','条件をさらに絞り込む。','ANDはORより優先される。複雑なら括弧で意図を明示する。'],
  ['条件','OR','複数条件のどれかを満たす行を選ぶ。',"WHERE 種別 = '1' OR 種別 = '2'",'複数候補のいずれかを対象にする。','同じ列の候補列挙ならINの方が読みやすい場合が多い。'],
  ['条件','NOT','条件の真偽を反転する。',"WHERE NOT 種別 = '1'",'特定条件を除外する。','NULLを含む条件は三値論理になるため注意。'],
  ['条件','IN','候補一覧のいずれかに一致するか判定する。',"WHERE 種別 IN ('1','2')",'複数の完全一致候補を簡潔に書く。','サブクエリ結果も候補として指定できる。'],
  ['条件','NOT IN','候補一覧のどれにも一致しないか判定する。',"WHERE 種別 NOT IN ('2','3')",'複数候補をまとめて除外する。','候補側にNULLが入ると期待どおりにならない場合がある。'],
  ['条件','BETWEEN','下限以上かつ上限以下か判定する。',"WHERE 更新日 BETWEEN '2024-01-01' AND '2024-01-31'",'数値や日付の範囲検索。','両端を含む。日時型では上限の時刻に注意。'],
  ['条件','LIKE','文字列をパターンで比較する。',"WHERE 名義 LIKE 'サカタ%'",'前方一致・後方一致・部分一致。','%は0文字以上、_は任意の1文字。'],
  ['条件','IS NULL','NULLかどうか判定する。','WHERE 更新日 IS NULL','未設定・不明の値を探す。','= NULLでは判定しない。'],
  ['条件','IS NOT NULL','NULLではないことを判定する。','WHERE 更新日 IS NOT NULL','値が設定済みの行を探す。','空文字とNULLは別物。'],

  ['並べ替え・件数','ORDER BY','検索結果の順序を指定する。','ORDER BY 残高 DESC, 口座番号 ASC','ランキング・時系列表示など。','省略時の行順は保証されない。'],
  ['並べ替え・件数','ASC','昇順を指定する。','ORDER BY 更新日 ASC','小さい順・古い順など。','通常の既定はASC。'],
  ['並べ替え・件数','DESC','降順を指定する。','ORDER BY 残高 DESC','大きい順・新しい順など。','複数列では左側の指定から優先される。'],
  ['並べ替え・件数','LIMIT','返す行数の上限を指定する。','LIMIT 10','上位N件や動作確認。','DB製品によってFETCH FIRSTなど別記法もある。'],
  ['並べ替え・件数','OFFSET','先頭から指定行数を読み飛ばす。','LIMIT 10 OFFSET 20','ページング。','大きなOFFSETは性能が悪化しやすい。'],

  ['集計','GROUP BY','同じ値を持つ行をグループ化する。','SELECT 種別, COUNT(*) FROM 口座 GROUP BY 種別;','分類ごとの件数・合計・平均を求める。','集計関数でないSELECT列は原則GROUP BYに含める。'],
  ['集計','HAVING','グループ化後の集計結果を絞る。','GROUP BY 種別 HAVING COUNT(*) >= 5','件数5件以上のグループだけ残す。','行を絞るWHEREと、集計後を絞るHAVINGを区別する。'],
  ['集計','COUNT()','行数またはNULLでない値の件数を数える。','COUNT(*) / COUNT(更新日)','件数集計。','COUNT(*)は行数、COUNT(列)はNULL以外の件数。'],
  ['集計','SUM()','数値の合計を求める。','SUM(残高)','売上・残高・数量などの合計。','NULLは通常集計対象から除外される。'],
  ['集計','AVG()','数値の平均を求める。','AVG(残高)','平均単価・平均残高など。','NULLは通常分母にも含まれない。'],
  ['集計','MAX()','最大値を求める。','MAX(残高)','最大金額・最新日付など。','日付や文字列にも利用できるDBが多い。'],
  ['集計','MIN()','最小値を求める。','MIN(残高)','最小金額・最古日付など。','NULLは通常無視される。'],

  ['結合','JOIN / INNER JOIN','結合条件に一致する行だけを表同士で結び付ける。','FROM 取引 t JOIN 取引事由 r ON t.取引事由ID = r.取引事由ID','別表に分かれた関連情報を1つの結果にする。','結合条件漏れは行数爆増の原因になる。'],
  ['結合','LEFT JOIN','左表を全行残し、右表は一致行だけ結合する。','FROM 口座 a LEFT JOIN 取引 t ON a.口座番号 = t.口座番号','関連データがない行も含めて調べる。','未一致時の右表列はNULL。右表条件をWHEREに置くと結果が変わることがある。'],
  ['結合','RIGHT JOIN','右表を全行残し、左表は一致行だけ結合する。','FROM A RIGHT JOIN B ON A.id = B.id','右表を基準に未一致行も残す。','LEFT JOINへ書き換えられることが多い。'],
  ['結合','FULL OUTER JOIN','左右両方の未一致行も残す。','FROM A FULL OUTER JOIN B ON A.id = B.id','2表の突合や差分確認。','DB製品によって未対応の場合がある。'],
  ['結合','CROSS JOIN','左右の全組み合わせを作る。','FROM 色 CROSS JOIN サイズ','組み合わせ表の生成。','行数が左表×右表になるため大量データでは注意。'],
  ['結合','ON','JOINの対応条件を指定する。','ON a.id = b.a_id','主キーと外部キーなどを関連付ける。','OUTER JOINではWHEREとの使い分けで結果が変わる。'],

  ['集合演算','UNION','2つの検索結果を縦結合し重複を除く。','SELECT 名義 FROM A UNION SELECT 名義 FROM B','複数の検索結果を1つにまとめる。','左右の列数と対応する型をそろえる。'],
  ['集合演算','UNION ALL','2つの検索結果を縦結合し重複も残す。','SELECT 名義 FROM A UNION ALL SELECT 名義 FROM B','重複を含む全件をまとめる。','重複除去がないため通常UNIONより軽い。'],
  ['集合演算','INTERSECT','両方の検索結果に存在する行だけを返す。','SELECT 名義 FROM A INTERSECT SELECT 名義 FROM B','共通部分を調べる。','DB製品によって対応状況が異なる。'],
  ['集合演算','EXCEPT','左側にあり右側にない行を返す。','SELECT 名義 FROM A EXCEPT SELECT 名義 FROM B','差集合・未登録データの抽出。','DBによってMINUSという名称を使う場合がある。'],

  ['登録・更新・削除','INSERT INTO','テーブルへ新しい行を追加する。',"INSERT INTO 口座 (口座番号, 名義) VALUES ('1234567','ヤマダ');",'新規データ登録。','列名を明示すると値の対応が読みやすく変更にも強い。'],
  ['登録・更新・削除','VALUES','INSERTする値の組を指定する。',"VALUES ('A001', 1200), ('A002', 1500)",'1行または複数行の追加。','列順・型・NOT NULL制約に注意。'],
  ['登録・更新・削除','UPDATE','既存行の値を変更する。',"UPDATE 口座 SET 残高 = 500000 WHERE 口座番号 = '0037651';",'既存レコードの修正。','WHEREなしは全行更新。'],
  ['登録・更新・削除','SET','UPDATEで変更後の値を指定する。','SET 残高 = 残高 + 1000, 更新日 = CURRENT_DATE','1列または複数列を更新する。','右辺に現在値を使った式や関数も書ける。'],
  ['登録・更新・削除','DELETE FROM','条件に一致する行を削除する。',"DELETE FROM 口座 WHERE 口座番号 = '1234567';",'不要レコードの削除。','WHEREなしは全行削除。'],
  ['登録・更新・削除','TRUNCATE','テーブルの全行を高速に削除する。','TRUNCATE TABLE 作業データ;','大量行の全削除。','DELETEとトランザクション・トリガー・権限などの挙動が異なる。'],

  ['NULL・条件分岐・変換','CASE','条件に応じて返す値を分岐する。',"CASE WHEN 残高 >= 1000000 THEN '高' ELSE '通常' END",'表示区分、条件付き集計など。','最初に真になったWHENが採用される。'],
  ['NULL・条件分岐・変換','COALESCE()','左から最初のNULLではない値を返す。','COALESCE(クーポン割引料, 0)','NULLを既定値へ置き換える。','引数同士は互換性のある型にする。'],
  ['NULL・条件分岐・変換','NULLIF()','2値が等しいとNULLを返す。','NULLIF(数量, 0)','0除算回避など。','合計 / NULLIF(件数, 0) のように使える。'],
  ['NULL・条件分岐・変換','CAST()','値を別のデータ型へ変換する。','CAST(残高 AS VARCHAR)','文字列化・数値化・日付変換など。','変換できない値ではエラーになる。'],

  ['サブクエリ・CTE','EXISTS','サブクエリが1行以上返すか判定する。','WHERE EXISTS (SELECT 1 FROM 取引 t WHERE t.口座番号 = a.口座番号)','関連レコードの存在確認。','存在だけを見るためSELECT 1と書くことが多い。'],
  ['サブクエリ・CTE','NOT EXISTS','サブクエリが1行も返さないことを判定する。','WHERE NOT EXISTS (SELECT 1 FROM 取引 t WHERE t.口座番号 = a.口座番号)','未関連・未登録データの抽出。','NULLを含むNOT INより意図が明確な場合がある。'],
  ['サブクエリ・CTE','WITH','名前付きの一時的な検索結果CTEを定義する。','WITH x AS (SELECT ... ) SELECT * FROM x;','複雑なSQLを段階的に読みやすくする。','CTEは通常そのSQL文の中だけで利用できる。'],
  ['サブクエリ・CTE','WITH RECURSIVE','再帰CTEを定義する。','WITH RECURSIVE tree AS (...) SELECT * FROM tree;','階層構造や連番などの再帰処理。','終了条件を誤ると大量行や無限再帰相当になる。'],

  ['DDL・制約','CREATE TABLE','新しいテーブルを定義する。','CREATE TABLE 商品 (商品コード CHAR(5) PRIMARY KEY, 商品名 VARCHAR(50) NOT NULL);','テーブル・列・型・制約を作成する。','データ型と制約はデータ品質に直結する。'],
  ['DDL・制約','ALTER TABLE','既存テーブル定義を変更する。','ALTER TABLE 商品 ADD COLUMN 備考 VARCHAR(200);','列追加、制約追加、型変更など。','既存データとの整合性やロック時間に注意。'],
  ['DDL・制約','DROP TABLE','テーブル自体を削除する。','DROP TABLE 商品;','不要なテーブル定義とデータを削除する。','通常は取り消せないため非常に注意。'],
  ['DDL・制約','PRIMARY KEY','行を一意に識別する主キーを定義する。','商品コード CHAR(5) PRIMARY KEY','重複・NULLを防ぎ、行を識別する。','複数列を組み合わせた複合主キーも可能。'],
  ['DDL・制約','FOREIGN KEY / REFERENCES','別テーブルのキーを参照する外部キーを定義する。','FOREIGN KEY (商品コード) REFERENCES 商品(商品コード)','参照整合性を保証する。','削除・更新時のCASCADE等の動作も設計対象。'],
  ['DDL・制約','NOT NULL','NULLを禁止する。','商品名 VARCHAR(50) NOT NULL','必須項目をDB側で保証する。','空文字はNULLではない。'],
  ['DDL・制約','UNIQUE','重複値を禁止する。','メールアドレス VARCHAR(255) UNIQUE','主キー以外の一意制約。','NULLの扱いはDB製品で差がある。'],
  ['DDL・制約','CHECK','列や行が条件を満たすことを要求する。',"CHECK (残高 >= 0)",'値の範囲やコード候補をDB側で保証する。','複雑な業務ルールを詰め込みすぎると保守が難しくなる。'],
  ['DDL・制約','DEFAULT','INSERT時に省略された列の既定値を定義する。','作成日 DATE DEFAULT CURRENT_DATE','初期値を自動設定する。','明示的にNULLを指定した場合はDEFAULTにならないことがある。'],

  ['代表関数','CURRENT_DATE','現在の日付を返す。','SELECT CURRENT_DATE;','登録日・更新日の設定など。','日時が必要ならCURRENT_TIMESTAMP等を使う。'],
  ['代表関数','CURRENT_TIMESTAMP','現在の日付と時刻を返す。','SELECT CURRENT_TIMESTAMP;','作成日時・更新日時の記録。','タイムゾーン型の扱いはDB設計で統一する。'],
  ['代表関数','LENGTH()','文字列の長さを返す。','LENGTH(商品名)','文字数チェックなど。','バイト数が必要な場合はDB固有関数と区別する。'],
  ['代表関数','LOWER() / UPPER()','英字を小文字・大文字へ変換する。','LOWER(email)','大小文字をそろえた比較や表示。','照合順序やロケールによって比較挙動が変わる。'],
  ['代表関数','SUBSTRING()','文字列の一部分を取り出す。','SUBSTRING(商品コード FROM 1 FOR 1)','コードの一部抽出など。','開始位置の仕様はDB方言を確認する。'],
  ['代表関数','ROUND()','数値を指定桁で丸める。','ROUND(AVG(単価), 0)','平均値や金額表示の丸め。','型によって戻り値や引数仕様が異なる場合がある。']
];

const body = document.getElementById('referenceBody');
const search = document.getElementById('referenceSearch');
const count = document.getElementById('resultCount');

function escapeHtml(value) {
  return String(value).replace(/[&<>\"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[ch]));
}

function render() {
  const keyword = (search?.value || '').trim().toLocaleLowerCase('ja');
  const filtered = !keyword ? rows : rows.filter(row => row.join(' ').toLocaleLowerCase('ja').includes(keyword));

  count.textContent = `${filtered.length} / ${rows.length} 語`;
  if (!filtered.length) {
    body.innerHTML = '<tr class="empty-row"><td colspan="5">一致するSQL語がありません。</td></tr>';
    return;
  }

  body.innerHTML = filtered.map(([category, term, meaning, syntax, use, note]) => `
    <tr>
      <td class="term-cell"><span class="term-code">${escapeHtml(term)}</span><span class="category-badge">${escapeHtml(category)}</span></td>
      <td class="meaning-cell">${escapeHtml(meaning)}</td>
      <td class="syntax-cell">${escapeHtml(syntax)}</td>
      <td class="use-cell">${escapeHtml(use)}</td>
      <td class="note-cell">${escapeHtml(note)}</td>
    </tr>`).join('');
}

search?.addEventListener('input', render);
render();
