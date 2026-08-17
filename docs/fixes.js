import { DATASETS } from './datasets.js';
import { EXERCISES } from './exercises.js';

// Runtime data corrections and dataset-specific setup that are easier to keep
// separate from the large exercise catalog.
const byId = new Map(EXERCISES.map((exercise) => [exercise.id, exercise]));

const bank22 = byId.get('bank-c3-q22');
if (bank22) {
  bank22.answerSql = `SELECT * FROM 口座
WHERE 口座番号 BETWEEN '2000000' AND '2999999'
   OR 名義 LIKE 'エ__　%コ';`;
  bank22.hint = ['LIKE の _ は任意の1文字。姓の3文字条件は「エ__」で表せる。'];
  bank22.explanation = bank22.hint.join(' ');
}

const rpg64 = byId.get('rpg-c8-q64');
if (rpg64) {
  rpg64.answerSql = `SELECT e.イベント番号, e.イベント名称,
       COALESCE(x.クリア区分::TEXT, '未クリア') AS クリア区分
FROM イベント e
LEFT JOIN 経験イベント x ON x.イベント番号 = e.イベント番号
WHERE e.タイプ = '1';`;
}

// Transaction-focused exercises are reviewed as written answers instead of
// being auto-judged. Keeping an open transaction inside a browser exercise
// would make per-question database reset ambiguous.
for (const id of ['design-c2-q6', 'design-c3-q11', 'design-c3-q12']) {
  const exercise = byId.get(id);
  if (exercise) exercise.type = 'design';
}

// The DDL exercise intentionally starts from an empty schema.
const designDdl = byId.get('design-c1-q5');
if (designDdl) {
  designDdl.setupSql = `DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;`;
}

DATASETS.design.seedSql = `
DROP TABLE IF EXISTS ReserveDetail CASCADE;
DROP TABLE IF EXISTS Reservation CASCADE;
DROP TABLE IF EXISTS Price CASCADE;
DROP TABLE IF EXISTS Menu CASCADE;
DROP TABLE IF EXISTS Stylist CASCADE;
DROP TABLE IF EXISTS Rank CASCADE;
DROP TABLE IF EXISTS Member CASCADE;

CREATE TABLE Member (
  MemberNo CHAR(4) PRIMARY KEY,
  MemberName VARCHAR(20) NOT NULL,
  Tel CHAR(11),
  Mail VARCHAR(100),
  JoinDate DATE NOT NULL
);

CREATE TABLE Rank (
  RankCD CHAR(1) PRIMARY KEY,
  Title VARCHAR(30)
);

CREATE TABLE Stylist (
  StylistNo CHAR(2) PRIMARY KEY,
  StylistName VARCHAR(20) NOT NULL,
  HireDate DATE NOT NULL,
  RankCD CHAR(1) REFERENCES Rank(RankCD)
);

CREATE TABLE Menu (
  MenuCD CHAR(1) PRIMARY KEY,
  MenuName VARCHAR(30) NOT NULL,
  Duration INTEGER NOT NULL CHECK (Duration > 0)
);

CREATE TABLE Price (
  MenuCD CHAR(1) REFERENCES Menu(MenuCD),
  RankCD CHAR(1) REFERENCES Rank(RankCD),
  MenuPrice INTEGER NOT NULL CHECK (MenuPrice >= 0),
  PRIMARY KEY (MenuCD, RankCD)
);

CREATE TABLE Reservation (
  ReserveNo INTEGER PRIMARY KEY,
  RegistDate TIMESTAMP NOT NULL,
  MemberNo CHAR(4) REFERENCES Member(MemberNo),
  First BOOLEAN,
  ReserveDate DATE NOT NULL,
  StartTime TIME NOT NULL,
  ServiceTime INTEGER,
  StylistNo CHAR(2) REFERENCES Stylist(StylistNo),
  Amount INTEGER,
  Remarks VARCHAR(200)
);

CREATE TABLE ReserveDetail (
  ReserveNo INTEGER REFERENCES Reservation(ReserveNo),
  MenuCD CHAR(1) REFERENCES Menu(MenuCD),
  PRIMARY KEY (ReserveNo, MenuCD)
);

INSERT INTO Member VALUES
('0001','吉川陽子','09001234567','yoshikawa@example.com','2004-04-10'),
('0002','荒木和子','09001234567','araki@example.com','2018-08-11'),
('0003','下田正子','09001234567','shimoda@example.com','2019-04-12'),
('0004','風間由美子','09001234567',NULL,'2019-06-13'),
('0005','秋山美奈','09001234567','akiyama@example.com','2021-01-14'),
('0006','木下博之','09001234567','kinoshita@example.com','2021-04-15'),
('0007','広瀬正隆',NULL,NULL,'2022-09-16'),
('0008','斉藤美紀','09001234567','saito@example.com','2024-04-17');

INSERT INTO Rank VALUES
('A','チーフ'),
('B','トップ'),
('C','スタンダード');

INSERT INTO Stylist VALUES
('01','秋葉ちか','2004-04-01','A'),
('02','佐藤茜','2006-06-01','B'),
('03','井上博之','2009-01-08','B'),
('04','小島正','2016-05-02','C'),
('05','山田雄介','2021-04-01','C'),
('06','市川紀子','2024-06-10',NULL);

INSERT INTO Menu VALUES
('C','カット',30),
('P','パーマ',60),
('R','カラー',60),
('T','トリートメント',30);

INSERT INTO Price VALUES
('C','A',12000),('P','A',18000),('R','A',9600),('T','A',14400),
('C','B',10000),('P','B',15000),('R','B',8000),('T','B',12000),
('C','C',8000),('P','C',12000),('R','C',6400),('T','C',9600);

INSERT INTO Reservation VALUES
(1,'2024-09-06 16:28:00','0002',FALSE,'2024-10-01','17:00',90,'01',21600,NULL),
(2,'2024-09-26 12:42:00','0004',FALSE,'2024-10-01','10:00',30,'03',10000,NULL),
(3,'2024-09-30 10:30:00','0008',TRUE,'2024-10-01','15:00',150,'05',26400,NULL),
(5,'2024-09-30 12:00:00','0005',FALSE,'2024-10-01','12:30',60,'03',15000,NULL);

INSERT INTO ReserveDetail VALUES
(1,'C'),(1,'R'),
(2,'C'),
(3,'C'),(3,'P'),(3,'R'),
(5,'P');
`;
