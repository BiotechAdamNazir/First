async function fetchJson(url, options) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

function renderList(node, items) {
  node.innerHTML = '';
  if (!items.length) {
    node.innerHTML = '<li>No data yet.</li>';
    return;
  }
  items.forEach((item) => {
    const li = document.createElement('li');
    li.innerHTML = item;
    node.appendChild(li);
  });
}

async function refreshStudents() {
  const students = await fetchJson('/api/students');
  const select = document.getElementById('studentSelect');
  select.innerHTML = '<option value="">Select student</option>';
  students.forEach((student) => {
    const option = document.createElement('option');
    option.value = student.id;
    option.textContent = `${student.full_name} (${student.school_level})`;
    select.appendChild(option);
  });
  return students;
}

async function refreshDashboard() {
  const dashboard = await fetchJson('/api/dashboard');

  renderList(
    document.getElementById('leaderboard'),
    dashboard.leaderboard.map((s, index) => `#${index + 1} ${s.full_name} — ${s.points} pts`)
  );

  renderList(
    document.getElementById('progress'),
    dashboard.progress.map((p) => `${p.full_name}: ${Math.round(p.average_percent || 0)}% across ${p.exam_count} exam(s)`)
  );

  renderList(
    document.getElementById('events'),
    dashboard.recentEvents.map((e) => `${new Date(e.created_at).toLocaleDateString()}: ${e.event_type} (${e.details || 'n/a'})`)
  );
}

document.getElementById('studentForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const payload = Object.fromEntries(formData.entries());
  await fetchJson('/api/students', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  event.target.reset();
  await refreshStudents();
  await refreshDashboard();
});

document.getElementById('assessmentForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const payload = Object.fromEntries(formData.entries());
  payload.score = Number(payload.score);
  payload.maxScore = Number(payload.maxScore);
  payload.studentId = Number(payload.studentId);

  await fetchJson('/api/assessments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  event.target.reset();
  await refreshDashboard();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
}

refreshStudents().then(refreshDashboard);
