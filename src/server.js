const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
const { initDb, all, get, run } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/health', async (_req, res) => {
  const students = await get('SELECT COUNT(*) AS count FROM students');
  const classes = await get('SELECT COUNT(*) AS count FROM classes');
  res.json({
    status: 'ok',
    market: 'Subang Jaya, Malaysia',
    students: students.count,
    classes: classes.count,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/classes', async (_req, res) => {
  const classes = await all('SELECT * FROM classes ORDER BY id DESC');
  res.json(classes);
});

app.get('/api/students', async (_req, res) => {
  const students = await all('SELECT * FROM students ORDER BY id DESC');
  res.json(students);
});

app.post('/api/students', async (req, res) => {
  const { fullName, schoolLevel, parentName, parentEmail, goals } = req.body;
  if (!fullName || !schoolLevel || !parentName) {
    return res.status(400).json({ error: 'fullName, schoolLevel, parentName are required' });
  }

  const result = await run(
    `INSERT INTO students (full_name, school_level, parent_name, parent_email, goals)
     VALUES (?, ?, ?, ?, ?)`,
    [fullName, schoolLevel, parentName, parentEmail || '', goals || '']
  );

  await run(
    'INSERT INTO engagement_events (student_id, event_type, details, source_channel) VALUES (?, ?, ?, ?)',
    [result.lastID, 'student_registered', `Registered ${fullName}`, 'web_app']
  );

  const student = await get('SELECT * FROM students WHERE id = ?', [result.lastID]);
  res.status(201).json(student);
});

app.post('/api/enrollments', async (req, res) => {
  const { studentId, classId } = req.body;
  if (!studentId || !classId) {
    return res.status(400).json({ error: 'studentId and classId are required' });
  }

  const result = await run('INSERT INTO enrollments (student_id, class_id) VALUES (?, ?)', [studentId, classId]);
  const enrollment = await get('SELECT * FROM enrollments WHERE id = ?', [result.lastID]);
  res.status(201).json(enrollment);
});

app.post('/api/assessments', async (req, res) => {
  const { studentId, subject, examName, score, maxScore, satDate } = req.body;
  if (!studentId || !subject || !examName || score === undefined || !maxScore || !satDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const result = await run(
    `INSERT INTO assessments (student_id, subject, exam_name, score, max_score, sat_date)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [studentId, subject, examName, score, maxScore, satDate]
  );

  const percentage = Math.round((Number(score) / Number(maxScore)) * 100);
  const bonusPoints = Math.max(5, Math.round(percentage / 10));

  await run('UPDATE students SET points = points + ? WHERE id = ?', [bonusPoints, studentId]);
  await run(
    'INSERT INTO engagement_events (student_id, event_type, details, source_channel) VALUES (?, ?, ?, ?)',
    [studentId, 'assessment_recorded', `${examName}: ${percentage}% (+${bonusPoints} pts)`, 'teacher_portal']
  );

  const assessment = await get('SELECT * FROM assessments WHERE id = ?', [result.lastID]);
  res.status(201).json(assessment);
});

app.get('/api/dashboard', async (_req, res) => {
  const leaderboard = await all(
    `SELECT id, full_name, school_level, points
     FROM students
     ORDER BY points DESC, id ASC
     LIMIT 10`
  );

  const progress = await all(
    `SELECT s.full_name,
            AVG((CAST(a.score AS REAL) / CAST(a.max_score AS REAL)) * 100) AS average_percent,
            COUNT(a.id) AS exam_count
     FROM students s
     LEFT JOIN assessments a ON a.student_id = s.id
     GROUP BY s.id
     ORDER BY average_percent DESC`
  );

  const recentEvents = await all(
    'SELECT * FROM engagement_events ORDER BY created_at DESC LIMIT 12'
  );

  res.json({ leaderboard, progress, recentEvents });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

cron.schedule('0 7 * * *', async () => {
  const parents = await all(
    `SELECT DISTINCT parent_email, parent_name
     FROM students
     WHERE parent_email IS NOT NULL AND parent_email <> ''`
  );

  if (parents.length > 0) {
    console.log(`[AUTOMATION] ${new Date().toISOString()} - Prepared ${parents.length} parent progress digest emails.`);
  }
});

(async () => {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Tuition Growth Platform running on http://localhost:${PORT}`);
  });
})();
