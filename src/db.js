const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '..', 'data', 'tuition.db');
const db = new sqlite3.Database(dbPath);

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function runCallback(err) {
      if (err) return reject(err);
      resolve(this);
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });

async function initDb() {
  await run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      school_level TEXT NOT NULL,
      parent_name TEXT NOT NULL,
      parent_email TEXT,
      goals TEXT,
      points INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      subject TEXT NOT NULL,
      level TEXT NOT NULL,
      schedule TEXT NOT NULL,
      max_capacity INTEGER DEFAULT 20
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      class_id INTEGER NOT NULL,
      status TEXT DEFAULT 'active',
      FOREIGN KEY(student_id) REFERENCES students(id),
      FOREIGN KEY(class_id) REFERENCES classes(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      exam_name TEXT NOT NULL,
      score INTEGER NOT NULL,
      max_score INTEGER NOT NULL,
      sat_date TEXT NOT NULL,
      FOREIGN KEY(student_id) REFERENCES students(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS engagement_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      event_type TEXT NOT NULL,
      details TEXT,
      source_channel TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(student_id) REFERENCES students(id)
    )
  `);

  const existingClasses = await get('SELECT COUNT(*) AS count FROM classes');
  if (!existingClasses || existingClasses.count === 0) {
    await run(
      'INSERT INTO classes (title, subject, level, schedule, max_capacity) VALUES (?, ?, ?, ?, ?)',
      ['Exam Sprint: Mathematics', 'Mathematics', 'UPSR/PT3/SPM', 'Sat 10:00-12:00', 30]
    );
    await run(
      'INSERT INTO classes (title, subject, level, schedule, max_capacity) VALUES (?, ?, ?, ?, ?)',
      ['Fun English Story Lab', 'English', 'Primary', 'Sun 09:00-10:30', 20]
    );
    await run(
      'INSERT INTO classes (title, subject, level, schedule, max_capacity) VALUES (?, ?, ?, ?, ?)',
      ['STEM Maker Challenge', 'Science', 'Lower Secondary', 'Wed 19:00-20:30', 24]
    );
  }
}

module.exports = {
  db,
  run,
  all,
  get,
  initDb,
};
