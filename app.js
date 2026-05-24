// ── Affixation engine ──────────────────────────────────────────────────────

function nasalForm(root, prefix) {
  const c = root[0].toLowerCase();
  const isVowel = 'aeiou'.includes(c);
  const base = prefix === 'me-' ? 'me' : 'pe';

  if ('pb'.includes(c))       return { nasal: base + 'm', drop: c === 'p', dropped: c === 'p' ? 'p' : null };
  if ('td'.includes(c))       return { nasal: base + 'n', drop: c === 't', dropped: c === 't' ? 't' : null };
  if ('kg'.includes(c))       return { nasal: base + 'ng', drop: c === 'k', dropped: c === 'k' ? 'k' : null };
  if (c === 's')               return { nasal: base + 'ny', drop: true, dropped: 's' };
  if ('cj'.includes(c))       return { nasal: base + 'n', drop: false, dropped: null };
  if (c === 'h')               return { nasal: base + 'ng', drop: false, dropped: null };
  if (isVowel)                 return { nasal: base + 'ng', drop: false, dropped: null };
  // sonorants: m, n, ng, l, r, w, y
  return { nasal: base, drop: false, dropped: null };
}

function applyAffix(root, awalan, akhiran) {
  let prefixText = '';
  let rootDisplay = root;
  let suffixText = akhiran ? akhiran.replace('-', '') : '';
  let dropped = null;
  let nasalNote = null;
  let prefixChanged = false;

  // ── Apply awalan ──
  if (awalan === 'me-' || awalan === 'pe-') {
    const { nasal, drop, dropped: d } = nasalForm(root, awalan);
    prefixText = nasal;
    dropped = d;
    rootDisplay = drop ? root.slice(1) : root;
    nasalNote = nasal;
    prefixChanged = nasal !== awalan.replace('-', '');
  } else if (awalan === 'ber-') {
    prefixText = root[0].toLowerCase() === 'r' ? 'be' : 'ber';
    rootDisplay = root;
  } else if (awalan === 'ter-') {
    prefixText = 'ter';
    rootDisplay = root;
  } else if (awalan === 'di-') {
    prefixText = 'di';
    rootDisplay = root;
  } else if (awalan === 'ke-') {
    prefixText = 'ke';
    rootDisplay = root;
  } else if (awalan === 'se-') {
    prefixText = 'se';
    rootDisplay = root;
  } else {
    rootDisplay = root;
  }

  const result = prefixText + rootDisplay + suffixText;

  // ── Build explanation ──
  const explanation = [];

  if (awalan === 'me-' || awalan === 'pe-') {
    const cLabel = root[0].toUpperCase();
    explanation.push(`Kata dasar "<strong>${root}</strong>" bermula dengan huruf '<strong>${cLabel}</strong>'.`);
    if (dropped) {
      explanation.push(`${awalan} + <strong>${cLabel}</strong> → <strong>${nasalNote}-</strong> &nbsp;(huruf '<strong>${cLabel}</strong>' <em>gugur</em>)`);
    } else if (prefixChanged) {
      explanation.push(`${awalan} + <strong>${cLabel}</strong> → <strong>${nasalNote}-</strong> &nbsp;(awalan berubah bentuk)`);
    } else {
      explanation.push(`${awalan} + <strong>${cLabel}</strong> → <strong>${nasalNote}-</strong> &nbsp;(tiada perubahan huruf)`);
    }
  } else if (awalan === 'ber-' && root[0].toLowerCase() === 'r') {
    explanation.push(`Kata dasar "<strong>${root}</strong>" bermula dengan '<strong>r</strong>'.`);
    explanation.push(`ber- + r → <strong>ber-</strong> menjadi <strong>be-</strong> (untuk mengelak pengulangan 'r')`);
  } else if (awalan) {
    explanation.push(`Awalan <strong>${awalan}</strong> ditambah terus pada kata dasar — tiada perubahan bunyi.`);
  }

  if (akhiran === '-kan') {
    explanation.push(`Akhiran <strong>-kan</strong> menjadikan kata kerja <em>transitif</em> atau <em>kausatif</em>.`);
  } else if (akhiran === '-an') {
    explanation.push(`Akhiran <strong>-an</strong> membentuk <em>kata nama</em> daripada perbuatan.`);
  } else if (akhiran === '-i') {
    explanation.push(`Akhiran <strong>-i</strong> menunjukkan perbuatan yang diarahkan kepada objek atau tempat.`);
  }

  // ── Build segments for colour display ──
  const segments = [];
  if (prefixText) segments.push({ text: prefixText, type: 'awalan' });
  if (dropped)    segments.push({ text: dropped, type: 'dropped' });
  segments.push({ text: rootDisplay, type: 'dasar' });
  if (suffixText) segments.push({ text: suffixText, type: 'akhiran' });

  return { result, segments, explanation, dropped, prefixText, rootDisplay, suffixText };
}

// ── UI state ───────────────────────────────────────────────────────────────

let state = {
  level: 'pertengahan',
  root: 'tulis',
  awalan: 'me-',
  akhiran: '',
};

// ── Render helpers ─────────────────────────────────────────────────────────

function renderLevels() {
  const container = document.getElementById('level-buttons');
  container.innerHTML = '';
  Object.entries(LEVEL_CONFIG).forEach(([key, cfg]) => {
    const btn = document.createElement('button');
    btn.className = 'level-btn' + (state.level === key ? ' active' : '');
    btn.textContent = cfg.label;
    btn.title = cfg.desc;
    btn.onclick = () => { state.level = key; state.awalan = ''; state.akhiran = ''; render(); };
    container.appendChild(btn);
  });
}

function renderWordSelector() {
  const sel = document.getElementById('kata-dasar-select');
  sel.innerHTML = '';
  KATA_DASAR.forEach(w => {
    const opt = document.createElement('option');
    opt.value = w.root;
    opt.textContent = `${w.root} — ${w.en}`;
    if (w.root === state.root) opt.selected = true;
    sel.appendChild(opt);
  });
}

function renderAwalanButtons() {
  const container = document.getElementById('awalan-buttons');
  container.innerHTML = '';
  const cfg = LEVEL_CONFIG[state.level];
  cfg.awalan.forEach(a => {
    const btn = document.createElement('button');
    btn.className = 'affix-btn awalan-btn' + (state.awalan === a ? ' active' : '');
    btn.textContent = a;
    btn.onclick = () => { state.awalan = state.awalan === a ? '' : a; render(); };
    container.appendChild(btn);
  });
}

function renderAkhiranButtons() {
  const container = document.getElementById('akhiran-buttons');
  container.innerHTML = '';
  const cfg = LEVEL_CONFIG[state.level];
  if (cfg.akhiran.length === 0) {
    container.innerHTML = '<span class="muted">Tiada akhiran pada peringkat ini</span>';
    return;
  }
  cfg.akhiran.forEach(a => {
    const btn = document.createElement('button');
    btn.className = 'affix-btn akhiran-btn' + (state.akhiran === a ? ' active' : '');
    btn.textContent = a;
    btn.onclick = () => { state.akhiran = state.akhiran === a ? '' : a; render(); };
    container.appendChild(btn);
  });
}

function renderOutput() {
  const { result, segments, explanation } = applyAffix(
    state.root,
    state.awalan || null,
    state.akhiran || null
  );

  // Word meaning
  const wordData = KATA_DASAR.find(w => w.root === state.root);
  document.getElementById('root-meaning').textContent = wordData ? `"${wordData.meaning}"` : '';

  // Colour-coded segments
  const segContainer = document.getElementById('word-segments');
  segContainer.innerHTML = '';

  if (!state.awalan && !state.akhiran) {
    const span = document.createElement('span');
    span.className = 'segment dasar';
    span.textContent = state.root;
    segContainer.appendChild(span);
  } else {
    segments.forEach(seg => {
      if (seg.type === 'dropped') {
        const span = document.createElement('span');
        span.className = 'segment dropped';
        span.title = 'Huruf ini gugur';
        span.innerHTML = `<s>${seg.text}</s>`;
        segContainer.appendChild(span);
      } else {
        const span = document.createElement('span');
        span.className = `segment ${seg.type}`;
        span.textContent = seg.text;
        segContainer.appendChild(span);
      }
    });
  }

  // Result word (large display)
  document.getElementById('result-word').textContent = result.toUpperCase();

  // Formula line
  let formula = state.root;
  if (state.awalan) formula = state.awalan + ' + ' + formula;
  if (state.akhiran) formula = formula + ' + ' + state.akhiran;
  if (state.awalan || state.akhiran) formula += ' = ' + result;
  document.getElementById('formula-line').textContent = formula;

  // Explanation
  const expContainer = document.getElementById('explanation-list');
  expContainer.innerHTML = '';
  if (!state.awalan && !state.akhiran) {
    expContainer.innerHTML = '<li>Pilih awalan atau akhiran untuk melihat proses pengimbuhan.</li>';
  } else {
    explanation.forEach(txt => {
      const li = document.createElement('li');
      li.innerHTML = txt;
      expContainer.appendChild(li);
    });
    // Add final meaning
    const li = document.createElement('li');
    const awalanInfo = state.awalan ? AWALAN[state.awalan] : null;
    const akhiranInfo = state.akhiran ? AKHIRAN[state.akhiran] : null;
    if (awalanInfo) {
      li.innerHTML = `<strong>Fungsi:</strong> ${awalanInfo.fungsi}`;
      expContainer.appendChild(li);
    }
    if (akhiranInfo && akhiranInfo !== awalanInfo) {
      const li2 = document.createElement('li');
      li2.innerHTML = `<strong>Akhiran:</strong> ${akhiranInfo.fungsi}`;
      expContainer.appendChild(li2);
    }
  }

  // Definition lookup
  const defKey = `${state.awalan || ''}|${state.akhiran || ''}`;
  const def = wordData?.terbitan?.[defKey];
  renderDefinisi(def, result, !!(state.awalan || state.akhiran));
}

function renderDefinisi(def, word, hasAffix) {
  const card = document.getElementById('definisi-card');
  const content = document.getElementById('definisi-content');

  if (!hasAffix) {
    card.hidden = true;
    return;
  }

  card.hidden = false;
  const prpmUrl = `https://prpm.dbp.gov.my/Cari1?keyword=${encodeURIComponent(word)}`;

  if (def) {
    content.innerHTML = `
      <div class="def-blocks">
        <div class="def-block bm">
          <div class="def-label">Bahasa Melayu &nbsp;·&nbsp; PRPM DBP</div>
          <div class="def-text">"${def.dbp}"</div>
        </div>
        <div class="def-block en">
          <div class="def-label">English</div>
          <div class="def-text">"${def.en}"</div>
        </div>
      </div>
      <div class="def-attribution">
        Berdasarkan <a href="${prpmUrl}" target="_blank" rel="noopener">PRPM DBP</a>
        &nbsp;·&nbsp; Semak definisi penuh di prpm.dbp.gov.my
      </div>`;
  } else {
    content.innerHTML = `
      <div class="def-fallback">
        Tiada definisi tersimpan untuk kombinasi ini.
        Sila semak di
        <a href="${prpmUrl}" target="_blank" rel="noopener">PRPM DBP → <em>${word}</em></a>
      </div>`;
  }
}

function render() {
  renderLevels();
  renderWordSelector();
  renderAwalanButtons();
  renderAkhiranButtons();
  renderOutput();
}

// ── Init ───────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('kata-dasar-select').addEventListener('change', e => {
    state.root = e.target.value;
    render();
  });
  render();
});
