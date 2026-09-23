// Template library.
//
// Each template = { id, category, name, theme, fields[], render(f) }.
//   theme  : "dark" (primary background), "light" (paper background) or "accent".
//   fields : editable inputs shown in the editor; `value` is the default text.
//            type "text" | "rich" (multi-line, *stars* = highlight) | "list" | "image".
//   render : returns the HTML for the middle of the poster. The brand header and
//            contact footer are added around it automatically by the studio.
//            Inline SVG: colour shapes with fill/stroke="currentColor" attributes and set
//            `color` on the <svg> in CSS; CSS rules on SVG children are lost on PNG export.
//
// Text conventions (so you can type fast without any formatting UI):
//   *kata*          -> highlighted in the accent colour
//   one line = one item in list fields
//   "a | b | c"     -> columns (timetable rows, fee packages, student results)
(function () {
  "use strict";

  // ---------- helpers ----------
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const rich = (s) => esc(String(s || "").trim()).replace(/\*(.+?)\*/g, '<span class="hl">$1</span>').replace(/\n/g, "<br>");
  const lines = (s) => String(s || "").split("\n").map((l) => l.trim()).filter(Boolean);
  const cells = (l) => l.split("|").map((c) => c.trim());
  const has = (s) => String(s || "").trim() !== "";
  const when = (s, html) => (has(s) ? html : "");

  const svg = (body, extra = "") =>
    `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra}>${body}</svg>`;
  const ICON = {
    chat: svg('<path d="M20.5 11.5a8.5 8.5 0 0 1-12.7 7.4L3 20.5l1.6-4.7A8.5 8.5 0 1 1 20.5 11.5z"/><path d="M9 8.3c.3-.5.7-.5 1.1-.5l.7 1.6-.7.9c.5 1 1.3 1.8 2.3 2.3l.9-.7 1.6.7c0 .4-.1.8-.5 1.1-2.1 1.2-6.6-3.3-5.4-5.4z" fill="currentColor" stroke="none"/>'),
    camera: svg('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>'),
    pin: svg('<path d="M12 21.5s7-6.1 7-11.8a7 7 0 1 0-14 0c0 5.7 7 11.8 7 11.8z"/><circle cx="12" cy="9.7" r="2.6"/>'),
    globe: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
    calendar: svg('<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>'),
    check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 'stroke-width="3"'),
    arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>', 'stroke-width="2.6"'),
    star: svg('<path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z" fill="currentColor" stroke="none"/>'),
    quote: svg('<path d="M3.5 19v-6c0-4.8 2.6-7.7 6.3-8.6l.9 2c-2.3.9-3.4 2.6-3.5 5H10v7.6H3.5zm10.4 0v-6c0-4.8 2.6-7.7 6.3-8.6l.9 2c-2.3.9-3.4 2.6-3.5 5h2.8v7.6h-6.5z" fill="currentColor" stroke="none"/>'),
    bell: svg('<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>'),
  };

  function burstPoints(spikes, outer, inner) {
    const pts = [];
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 ? inner : outer;
      const a = (Math.PI * i) / spikes - Math.PI / 2;
      pts.push((50 + r * Math.cos(a)).toFixed(2) + "," + (50 + r * Math.sin(a)).toFixed(2));
    }
    return pts.join(" ");
  }

  // Deterministic confetti (same picture every export).
  function confetti(n) {
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    let out = "";
    for (let i = 0; i < n; i++) {
      const left = rnd() < 0.5 ? rnd() * 9 : 91 + rnd() * 9; // keep to the side edges
      out += `<i style="left:${left.toFixed(1)}%;top:${(rnd() * 100).toFixed(1)}%;transform:rotate(${Math.round(rnd() * 180)}deg);opacity:${(0.35 + rnd() * 0.6).toFixed(2)}" class="${rnd() < 0.55 ? "c-a" : "c-f"}${rnd() < 0.4 ? " c-round" : ""}"></i>`;
    }
    return `<div class="confetti">${out}</div>`;
  }

  function initials(name) {
    const words = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!words.length) return "?";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }

  const eyebrow = (s) => when(s, `<div class="eyebrow">${rich(s)}</div>`);
  const title = (s, cls = "") => `<h1 class="h1 ${cls}">${rich(s)}</h1>`;
  const en = (s) => when(s, `<div class="h-en">${rich(s)}</div>`);

  // ---------- categories ----------
  const CATEGORIES = [
    { id: "enrol", name: "Pendaftaran", en: "Enrolment" },
    { id: "results", name: "Keputusan & Testimoni", en: "Results & Testimonials" },
    { id: "promo", name: "Promosi & Acara", en: "Promos & Events" },
    { id: "tips", name: "Tips & Info", en: "Tips & Educational" },
    { id: "notice", name: "Makluman", en: "Notices" },
  ];

  // ---------- templates ----------
  const TEMPLATES = [
    // ===== ENROLMENT =====
    {
      id: "intake",
      category: "enrol",
      name: "Pendaftaran Dibuka",
      en: "Intake open",
      theme: "dark",
      fields: [
        { key: "eyebrow", label: "Label kecil · Eyebrow", type: "text", value: "Sesi 2027" },
        { key: "title", label: "Tajuk · Title", type: "rich", value: "Pendaftaran\n*Dibuka!*" },
        { key: "titleEn", label: "Tajuk (EN)", type: "text", value: "Enrolment is now open" },
        { key: "levels", label: "Tahap · Levels", type: "list", hint: "Satu baris satu tahap", value: "Tahun 1 – 6\nTingkatan 1 – 3\nTingkatan 4 – 5 (SPM)" },
        { key: "subjects", label: "Subjek · Subjects", type: "list", hint: "Satu baris satu subjek", value: "Bahasa Melayu\nEnglish\nMatematik\nSains\nSejarah\nMatematik Tambahan\nFizik\nKimia\nBiologi" },
        { key: "cta", label: "Butang · Call to action", type: "text", value: "WhatsApp untuk tempah tempat" },
        { key: "ctaSub", label: "Nota butang · CTA note", type: "text", value: "Tempat terhad · Limited seats per class" },
      ],
      render: (f) => `
        <div class="deco-circle"></div><div class="deco-dots"></div>
        ${eyebrow(f.eyebrow)}
        ${title(f.title, "xl")}
        ${en(f.titleEn)}
        <div class="levels">${lines(f.levels).map((l) => `<span>${esc(l)}</span>`).join("")}</div>
        <div class="chips">${lines(f.subjects).map((l) => `<span>${esc(l)}</span>`).join("")}</div>
        ${when(f.cta, `<div class="cta">${ICON.chat}<div><b>${esc(f.cta)}</b>${when(f.ctaSub, `<small>${esc(f.ctaSub)}</small>`)}</div></div>`)}`,
    },
    {
      id: "timetable",
      category: "enrol",
      name: "Jadual Kelas",
      en: "Class timetable",
      theme: "light",
      fields: [
        { key: "eyebrow", label: "Label kecil · Eyebrow", type: "text", value: "Sesi 2027" },
        { key: "title", label: "Tajuk · Title", type: "rich", value: "Jadual *Kelas*" },
        { key: "titleEn", label: "Tajuk (EN)", type: "text", value: "Class timetable" },
        { key: "headers", label: "Kepala jadual · Headers", type: "text", value: "Hari | Masa | Subjek | Tahap" },
        {
          key: "rows",
          label: "Baris jadual · Rows",
          type: "list",
          hint: "Format: Hari | Masa | Subjek | Tahap",
          value:
            "Isnin | 3.00 – 5.00 ptg | Matematik | Tahun 4 – 6\nSelasa | 8.00 – 10.00 mlm | Matematik Tambahan | Ting. 4 – 5\nRabu | 3.00 – 5.00 ptg | Sains | Tahun 4 – 6\nKhamis | 8.00 – 10.00 mlm | Fizik & Kimia | Ting. 4 – 5\nJumaat | 3.00 – 5.00 ptg | Bahasa Melayu | Ting. 1 – 3\nSabtu | 9.00 – 11.00 pg | English | Ting. 1 – 3\nAhad | 9.00 – 12.00 tgh | Ulang Kaji SPM | Ting. 5",
        },
        { key: "note", label: "Nota · Note", type: "text", value: "Kelas bermula 4 Januari 2027 · Classes start 4 Jan 2027" },
      ],
      render: (f) => {
        const head = cells(f.headers || "");
        const rows = lines(f.rows).map(cells);
        const cols = Math.max(head.length, ...rows.map((r) => r.length), 1);
        const tr = (r, tag) => `<tr>${Array.from({ length: cols }, (_, i) => `<${tag}>${esc(r[i] || "")}</${tag}>`).join("")}</tr>`;
        return `
        <div class="deco-band"></div>
        ${eyebrow(f.eyebrow)}
        ${title(f.title)}
        ${en(f.titleEn)}
        <table class="tt">${has(f.headers) ? `<thead>${tr(head, "th")}</thead>` : ""}<tbody>${rows.map((r) => tr(r, "td")).join("")}</tbody></table>
        ${when(f.note, `<div class="note">${ICON.calendar}<span>${esc(f.note)}</span></div>`)}`;
      },
    },
    {
      id: "fees",
      category: "enrol",
      name: "Pakej Yuran",
      en: "Fee packages",
      theme: "light",
      fields: [
        { key: "eyebrow", label: "Label kecil · Eyebrow", type: "text", value: "Sesi 2027" },
        { key: "title", label: "Tajuk · Title", type: "rich", value: "Pakej *Yuran*" },
        { key: "titleEn", label: "Tajuk (EN)", type: "text", value: "Tuition fee packages" },
        {
          key: "packages",
          label: "Pakej · Packages",
          type: "list",
          hint: "Format: Nama | Harga | Tempoh | ciri; ciri; ciri  — mula dengan * untuk pakej pilihan",
          value:
            "Asas | RM120 | sebulan | 1 subjek; 4 kelas sebulan; Nota & latihan\n*Popular | RM300 | sebulan | 3 subjek; 12 kelas sebulan; Kelas ulang kaji percuma; Laporan kemajuan\nIntensif SPM | RM450 | sebulan | 5 subjek; 20 kelas sebulan; Kem intensif percuma; Klinik soalan",
        },
        { key: "badge", label: "Lencana pakej pilihan · Badge", type: "text", value: "Paling popular" },
        { key: "note", label: "Nota · Note", type: "text", value: "Yuran pendaftaran RM50 · Diskaun 10% untuk adik-beradik" },
      ],
      render: (f) => {
        const pk = lines(f.packages).map((l) => {
          const featured = l.startsWith("*");
          const [name, price, per, feats] = cells(featured ? l.slice(1) : l);
          return { featured, name, price, per, feats: String(feats || "").split(";").map((s) => s.trim()).filter(Boolean) };
        });
        return `
        ${eyebrow(f.eyebrow)}
        ${title(f.title)}
        ${en(f.titleEn)}
        <div class="packs n${pk.length}">${pk
          .map(
            (p) => `<div class="pack${p.featured ? " featured" : ""}">
              ${p.featured && has(f.badge) ? `<div class="badge">${esc(f.badge)}</div>` : ""}
              <div class="pk-head"><div class="pk-name">${esc(p.name)}</div>
              <div class="pk-price">${esc(p.price)}<small>${esc(p.per || "")}</small></div></div>
              <ul>${p.feats.map((x) => `<li>${ICON.check}<span>${esc(x)}</span></li>`).join("")}</ul>
            </div>`
          )
          .join("")}</div>
        ${when(f.note, `<div class="note">${esc(f.note)}</div>`)}`;
      },
    },

    // ===== RESULTS & TESTIMONIALS =====
    {
      id: "results",
      category: "results",
      name: "Keputusan Cemerlang",
      en: "Exam results",
      theme: "dark",
      fields: [
        { key: "eyebrow", label: "Label kecil · Eyebrow", type: "text", value: "Keputusan SPM 2025" },
        { key: "title", label: "Tajuk · Title", type: "rich", value: "Tahniah, *Juara* Kami!" },
        { key: "titleEn", label: "Tajuk (EN)", type: "text", value: "Congratulations to our stars" },
        { key: "stat", label: "Angka utama · Big number", type: "text", value: "92%" },
        { key: "statLabel", label: "Maksud angka · Number label", type: "text", value: "pelajar lulus dengan kepujian · passed with credit" },
        {
          key: "students",
          label: "Pelajar · Students",
          type: "list",
          hint: "Format: Nama | Keputusan",
          value: "Aina Sofea | 10A\nMuhammad Irfan | 9A+\nLim Wei Jie | 9A\nNurul Huda | 9A\nArvind Raj | 8A\nSiti Aisyah | 8A",
        },
      ],
      render: (f) => `
        ${confetti(46)}
        ${eyebrow(f.eyebrow)}
        ${title(f.title)}
        ${en(f.titleEn)}
        ${when(f.stat, `<div class="stat"><div class="stat-n">${esc(f.stat)}</div><div class="stat-l">${esc(f.statLabel)}</div></div>`)}
        <div class="roll">${lines(f.students)
          .map(cells)
          .map(([n, g]) => `<div class="roll-i"><span>${esc(n)}</span>${g ? `<b>${esc(g)}</b>` : ""}</div>`)
          .join("")}</div>`,
    },
    {
      id: "spotlight",
      category: "results",
      name: "Bintang Pelajar",
      en: "Student spotlight",
      theme: "light",
      fields: [
        { key: "eyebrow", label: "Label kecil · Eyebrow", type: "text", value: "Bintang Kami · Student Spotlight" },
        { key: "photo", label: "Gambar pelajar · Photo", type: "image", value: "" },
        { key: "name", label: "Nama · Name", type: "text", value: "Muhammad Irfan" },
        { key: "school", label: "Sekolah · School", type: "text", value: "SMK Seri Cahaya · Kelas Fizik & Matematik Tambahan" },
        { key: "result", label: "Keputusan · Result", type: "text", value: "9A+" },
        { key: "exam", label: "Peperiksaan · Exam", type: "text", value: "SPM 2025" },
        { key: "quote", label: "Petikan · Quote", type: "rich", value: "Cikgu di sini ajar sampai *faham*, bukan sekadar hafal." },
      ],
      render: (f) => `
        <div class="deco-arc"></div>
        ${eyebrow(f.eyebrow)}
        <div class="sp-row">
          <div class="photo">${f.photo ? `<img src="${esc(f.photo)}" alt="">` : `<span>${esc(initials(f.name))}</span>`}</div>
          <div class="sp-result"><div class="sp-grade">${esc(f.result)}</div><div class="sp-exam">${esc(f.exam)}</div></div>
        </div>
        <h1 class="h1">${esc(f.name)}</h1>
        ${when(f.school, `<div class="h-en">${esc(f.school)}</div>`)}
        ${when(f.quote, `<blockquote class="sp-quote">${ICON.quote}<p>${rich(f.quote)}</p></blockquote>`)}`,
    },
    {
      id: "testimonial",
      category: "results",
      name: "Testimoni Ibu Bapa",
      en: "Parent testimonial",
      theme: "accent",
      fields: [
        { key: "eyebrow", label: "Label kecil · Eyebrow", type: "text", value: "Kata Ibu Bapa · What Parents Say" },
        { key: "quote", label: "Testimoni · Quote", type: "rich", value: "Dulu anak saya takut Matematik. Selepas 3 bulan di sini, dia yang ajak saya buat *latihan* setiap malam!" },
        { key: "quoteEn", label: "Terjemahan (EN) · Translation", type: "text", value: "My son used to fear Maths. Three months later, he's the one asking to practise every night!" },
        { key: "stars", label: "Bintang (0–5) · Stars", type: "text", value: "5" },
        { key: "author", label: "Nama · Name", type: "text", value: "Puan Rohana" },
        { key: "role", label: "Hubungan · Relation", type: "text", value: "Ibu kepada Adam, Tahun 5" },
      ],
      render: (f) => {
        const n = Math.max(0, Math.min(5, parseInt(f.stars, 10) || 0));
        return `
        <div class="deco-quote">${ICON.quote}</div>
        ${eyebrow(f.eyebrow)}
        <div class="t-card">
          ${n ? `<div class="stars">${ICON.star.repeat(n)}</div>` : ""}
          <p class="t-quote">${rich(f.quote)}</p>
          ${when(f.quoteEn, `<p class="t-en">${esc(f.quoteEn)}</p>`)}
        </div>
        <div class="t-author"><div class="t-av">${esc(initials(f.author))}</div><div><b>${esc(f.author)}</b><small>${esc(f.role)}</small></div></div>`;
      },
    },

    // ===== PROMOS & EVENTS =====
    {
      id: "promo",
      category: "promo",
      name: "Diskaun Early Bird",
      en: "Discount promo",
      theme: "dark",
      fields: [
        { key: "eyebrow", label: "Label kecil · Eyebrow", type: "text", value: "Tawaran Early Bird" },
        { key: "big", label: "Angka besar · Big number", type: "text", value: "30%" },
        { key: "bigLabel", label: "Bawah angka · Under number", type: "text", value: "DISKAUN" },
        { key: "title", label: "Tajuk · Title", type: "rich", value: "Yuran *bulan pertama*\nuntuk pendaftaran awal" },
        { key: "titleEn", label: "Tajuk (EN)", type: "text", value: "Off your first month when you register early" },
        { key: "deadline", label: "Tarikh tamat · Deadline", type: "text", value: "Sebelum 30 November 2026" },
        { key: "fine", label: "Nota kecil · Fine print", type: "text", value: "*Tertakluk kepada terma & syarat · T&C apply" },
      ],
      render: (f) => `
        <div class="deco-rays"></div>
        ${eyebrow(f.eyebrow)}
        <div class="burst">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none"><polygon fill="currentColor" points="${burstPoints(22, 50, 44)}"/></svg>
          <div class="burst-t"><b style="font-size:${(2.35 * Math.min(1, 3.2 / Math.max(1, String(f.big).trim().length))).toFixed(2)}em">${esc(f.big)}</b><span>${esc(f.bigLabel)}</span></div>
        </div>
        ${title(f.title)}
        ${en(f.titleEn)}
        ${when(f.deadline, `<div class="deadline">${ICON.clock}<span>${esc(f.deadline)}</span></div>`)}
        ${when(f.fine, `<div class="fine">${esc(f.fine)}</div>`)}`,
    },
    {
      id: "freetrial",
      category: "promo",
      name: "Kelas Percubaan Percuma",
      en: "Free trial class",
      theme: "light",
      fields: [
        { key: "eyebrow", label: "Label kecil · Eyebrow", type: "text", value: "Kupon · Coupon" },
        { key: "title", label: "Tajuk · Title", type: "rich", value: "Kelas Percubaan\n*PERCUMA*" },
        { key: "titleEn", label: "Tajuk (EN)", type: "text", value: "Free trial class — try before you enrol" },
        { key: "points", label: "Kelebihan · Points", type: "list", hint: "Satu baris satu perkara", value: "Tiada komitmen · No commitment\nKenali cikgu & rakan sekelas\nPenilaian tahap percuma · Free level check" },
        { key: "cta", label: "Butang · Call to action", type: "text", value: "Tempah sekarang · Book now" },
        { key: "limit", label: "Had · Limit", type: "text", value: "10 tempat sahaja minggu ini" },
      ],
      render: (f) => `
        <div class="deco-grid"></div>
        <div class="ticket">
          ${eyebrow(f.eyebrow)}
          ${title(f.title, "xl")}
          ${en(f.titleEn)}
          <ul class="checks">${lines(f.points).map((p) => `<li><i>${ICON.check}</i><span>${esc(p)}</span></li>`).join("")}</ul>
          ${when(f.cta, `<div class="btn">${esc(f.cta)} ${ICON.arrow}</div>`)}
          ${when(f.limit, `<div class="limit">${esc(f.limit)}</div>`)}
        </div>`,
    },
    {
      id: "event",
      category: "promo",
      name: "Kem / Program",
      en: "Event or camp",
      theme: "dark",
      fields: [
        { key: "eyebrow", label: "Label kecil · Eyebrow", type: "text", value: "Program Cuti Sekolah" },
        { key: "title", label: "Tajuk · Title", type: "rich", value: "Kem Intensif\n*SPM 2026*" },
        { key: "titleEn", label: "Tajuk (EN)", type: "text", value: "3-day intensive revision camp" },
        { key: "date", label: "Tarikh · Date", type: "text", value: "16 – 18 Oktober 2026" },
        { key: "time", label: "Masa · Time", type: "text", value: "9.00 pg – 5.00 ptg" },
        { key: "venue", label: "Tempat · Venue", type: "text", value: "Dewan Cahaya Ilmu, Shah Alam" },
        { key: "topics", label: "Pengisian · What's inside", type: "list", hint: "Satu baris satu perkara", value: "Teknik menjawab Kertas 2\nLatih tubi soalan ramalan\nKlinik Matematik Tambahan\nSesi motivasi & pengurusan masa" },
        { key: "price", label: "Harga · Price", type: "text", value: "RM150 · termasuk makan tengah hari" },
      ],
      render: (f) => `
        <div class="deco-stripes"></div>
        ${eyebrow(f.eyebrow)}
        ${title(f.title, "xl")}
        ${en(f.titleEn)}
        <div class="facts">
          ${when(f.date, `<div>${ICON.calendar}<span>${esc(f.date)}</span></div>`)}
          ${when(f.time, `<div>${ICON.clock}<span>${esc(f.time)}</span></div>`)}
          ${when(f.venue, `<div>${ICON.pin}<span>${esc(f.venue)}</span></div>`)}
        </div>
        <ol class="topics">${lines(f.topics).map((t, i) => `<li><i>${String(i + 1).padStart(2, "0")}</i><span>${esc(t)}</span></li>`).join("")}</ol>
        ${when(f.price, `<div class="price-tag">${esc(f.price)}</div>`)}`,
    },

    // ===== TIPS & EDUCATIONAL =====
    {
      id: "tips",
      category: "tips",
      name: "Tips Belajar",
      en: "Study tips list",
      theme: "light",
      fields: [
        { key: "eyebrow", label: "Label kecil · Eyebrow", type: "text", value: "Tips Belajar · Study Tips" },
        { key: "title", label: "Tajuk · Title", type: "rich", value: "5 Cara Hafal\n*Fakta Sejarah*" },
        { key: "titleEn", label: "Tajuk (EN)", type: "text", value: "5 ways to remember History facts" },
        {
          key: "tips",
          label: "Tips",
          type: "list",
          hint: "Format: Tajuk | penerangan ringkas",
          value:
            "Buat garis masa | Susun peristiwa ikut tahun supaya nampak sebab & akibat.\nGuna akronim | Gabungkan huruf pertama tokoh, tarikh dan tempat.\nAjar orang lain | Kalau boleh terangkan pada kawan, maknanya dah faham.\nUlang kaji berselang | Ulang pada hari ke-1, 3, 7 dan 14.\nBuat soalan sendiri | Tukar setiap subtopik jadi soalan esei pendek.",
        },
        { key: "cta", label: "Penutup · Closing line", type: "text", value: "Simpan & kongsi · Save this for later" },
      ],
      render: (f) => `
        <div class="deco-corner"></div>
        ${eyebrow(f.eyebrow)}
        ${title(f.title)}
        ${en(f.titleEn)}
        <ol class="steps">${lines(f.tips)
          .map(cells)
          .map(([h, d], i) => `<li><i>${i + 1}</i><div><b>${esc(h)}</b>${d ? `<span>${esc(d)}</span>` : ""}</div></li>`)
          .join("")}</ol>
        ${when(f.cta, `<div class="save">${esc(f.cta)}</div>`)}`,
    },
    {
      id: "countdown",
      category: "tips",
      name: "Kiraan Detik Peperiksaan",
      en: "Exam countdown",
      theme: "dark",
      fields: [
        { key: "eyebrow", label: "Label kecil · Eyebrow", type: "text", value: "Kiraan Detik · Countdown" },
        { key: "exam", label: "Peperiksaan · Exam", type: "rich", value: "*SPM* 2026" },
        { key: "days", label: "Bilangan hari · Days", type: "text", value: "45" },
        { key: "unit", label: "Unit", type: "text", value: "HARI LAGI" },
        { key: "unitEn", label: "Unit (EN)", type: "text", value: "days to go" },
        { key: "message", label: "Mesej · Message", type: "rich", value: "Jangan tunggu minggu terakhir.\nKelas ulang kaji *setiap Sabtu & Ahad*." },
      ],
      render: (f) => {
        const d = parseInt(f.days, 10);
        const frac = isNaN(d) ? 0.75 : Math.max(0.04, Math.min(1, 1 - d / 365));
        const C = 2 * Math.PI * 45;
        return `
        <div class="deco-dots"></div>
        ${eyebrow(f.eyebrow)}
        ${title(f.exam)}
        <div class="ring">
          <svg class="ring-bg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="7" stroke-opacity="0.14"/></svg>
          <svg class="ring-fg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-dasharray="${(C * frac).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 50 50)"/></svg>
          <div class="ring-t"><b>${esc(f.days)}</b><span>${esc(f.unit)}</span>${when(f.unitEn, `<small>${esc(f.unitEn)}</small>`)}</div>
        </div>
        ${when(f.message, `<p class="msg">${rich(f.message)}</p>`)}`;
      },
    },
    {
      id: "quicknote",
      category: "tips",
      name: "Nota Ringkas / Tahukah Anda",
      en: "Quick note / Did you know",
      theme: "light",
      fields: [
        { key: "eyebrow", label: "Label kecil · Eyebrow", type: "text", value: "Tahukah Anda? · Did you know?" },
        { key: "subject", label: "Subjek · Subject", type: "text", value: "Fizik · Tingkatan 4" },
        { key: "title", label: "Tajuk · Title", type: "rich", value: "Hukum Newton *Kedua*" },
        { key: "titleEn", label: "Tajuk (EN)", type: "text", value: "Newton's Second Law of Motion" },
        { key: "formula", label: "Formula / Fakta utama", type: "text", value: "F = ma" },
        { key: "terms", label: "Maksud simbol · Legend", type: "list", hint: "Format: Simbol | maksud", value: "F | Daya · Force (N)\nm | Jisim · Mass (kg)\na | Pecutan · Acceleration (m/s²)" },
        { key: "example", label: "Contoh · Example", type: "rich", value: "Kereta 1 000 kg memecut 2 m/s²\n*F = 1 000 × 2 = 2 000 N*" },
      ],
      render: (f) => `
        <div class="deco-paper"></div>
        <div class="qn-top">${eyebrow(f.eyebrow)}${when(f.subject, `<span class="tag">${esc(f.subject)}</span>`)}</div>
        ${title(f.title)}
        ${en(f.titleEn)}
        ${when(f.formula, `<div class="formula">${esc(f.formula)}</div>`)}
        <dl class="legend">${lines(f.terms)
          .map(cells)
          .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v || "")}</dd></div>`)
          .join("")}</dl>
        ${when(f.example, `<div class="example"><b>Contoh · Example</b><p>${rich(f.example)}</p></div>`)}`,
    },

    // ===== NOTICES =====
    {
      id: "notice",
      category: "notice",
      name: "Makluman Umum",
      en: "General notice",
      theme: "accent",
      fields: [
        { key: "eyebrow", label: "Label kecil · Eyebrow", type: "text", value: "Makluman · Notice" },
        { key: "title", label: "Tajuk · Title", type: "rich", value: "Kelas\n*Ditangguhkan*" },
        { key: "titleEn", label: "Tajuk (EN)", type: "text", value: "Classes postponed" },
        { key: "when", label: "Tarikh · Date", type: "text", value: "Sabtu, 17 Oktober 2026" },
        { key: "body", label: "Mesej · Message", type: "rich", value: "Semua kelas biasa ditangguhkan kerana Kem Intensif SPM. Kelas ganti akan dimaklumkan dalam grup WhatsApp." },
        { key: "bodyEn", label: "Mesej (EN)", type: "text", value: "Regular classes are postponed for the SPM camp. Replacement classes will be announced in our WhatsApp group." },
        { key: "sign", label: "Penutup · Sign-off", type: "text", value: "Terima kasih · Thank you" },
      ],
      render: (f) => `
        <div class="deco-bell">${ICON.bell}</div>
        ${eyebrow(f.eyebrow)}
        ${title(f.title, "xl")}
        ${en(f.titleEn)}
        ${when(f.when, `<div class="when">${ICON.calendar}<span>${esc(f.when)}</span></div>`)}
        ${when(f.body, `<p class="n-body">${rich(f.body)}</p>`)}
        ${when(f.bodyEn, `<p class="n-en">${esc(f.bodyEn)}</p>`)}
        ${when(f.sign, `<div class="sign">— ${esc(f.sign)}</div>`)}`,
    },
  ];

  window.POSTER = { TEMPLATES, CATEGORIES, ICON, esc, initials };
})();
