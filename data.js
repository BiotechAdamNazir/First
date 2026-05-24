const KATA_DASAR = [
  { root: 'baca',   meaning: 'membaca teks atau tulisan',    en: 'read' },
  { root: 'tulis',  meaning: 'mencatat dengan tulisan',      en: 'write' },
  { root: 'kira',   meaning: 'mengira atau menganggar',      en: 'count/think' },
  { root: 'sapu',   meaning: 'membersihkan permukaan',       en: 'sweep' },
  { root: 'ambil',  meaning: 'mengambil sesuatu',            en: 'take' },
  { root: 'jalan',  meaning: 'bergerak dengan kaki',         en: 'walk' },
  { root: 'dengar', meaning: 'menerima bunyi',               en: 'hear' },
  { root: 'makan',  meaning: 'memasukkan makanan ke mulut',  en: 'eat' },
  { root: 'lari',   meaning: 'bergerak dengan pantas',       en: 'run' },
  { root: 'bantu',  meaning: 'memberi pertolongan',          en: 'help' },
  { root: 'datang', meaning: 'tiba di sesuatu tempat',       en: 'come' },
  { root: 'cari',   meaning: 'mencari sesuatu',              en: 'search' },
  { root: 'main',   meaning: 'bermain atau berseronok',      en: 'play' },
  { root: 'ajar',   meaning: 'memberi ilmu pengetahuan',     en: 'teach' },
  { root: 'hantar', meaning: 'membawa ke destinasi',         en: 'send' },
  { root: 'ikut',   meaning: 'mengikuti seseorang',          en: 'follow' },
  { root: 'goreng', meaning: 'memasak dalam minyak',         en: 'fry' },
  { root: 'nyanyi', meaning: 'mengeluarkan suara merdu',     en: 'sing' },
  { root: 'ubah',   meaning: 'mengubah atau menukar',        en: 'change' },
  { root: 'pergi',  meaning: 'menuju ke tempat lain',        en: 'go' },
];

const AWALAN = {
  'me-': {
    label: 'me-',
    level: ['pertengahan', 'lanjutan'],
    fungsi: 'Membentuk kata kerja aktif — subjek melakukan perbuatan',
    contoh: 'me- + baca = membaca',
  },
  'ber-': {
    label: 'ber-',
    level: ['asas', 'pertengahan', 'lanjutan'],
    fungsi: 'Membentuk kata kerja yang menyatakan keadaan atau perbuatan diri sendiri',
    contoh: 'ber- + jalan = berjalan',
  },
  'ter-': {
    label: 'ter-',
    level: ['asas', 'pertengahan'],
    fungsi: 'Menyatakan perbuatan tidak sengaja atau darjah paling tinggi (superlatif)',
    contoh: 'ter- + ambil = terambil (terjadi secara tidak sengaja)',
  },
  'di-': {
    label: 'di-',
    level: ['asas', 'pertengahan', 'lanjutan'],
    fungsi: 'Membentuk kata kerja pasif — subjek menerima perbuatan',
    contoh: 'di- + baca = dibaca',
  },
  'ke-': {
    label: 'ke-',
    level: ['asas'],
    fungsi: 'Biasanya digunakan bersama akhiran -an untuk membentuk kata nama',
    contoh: 'ke- + ... + -an = keadilan',
  },
  'se-': {
    label: 'se-',
    level: ['asas'],
    fungsi: 'Menyatakan kesamaan, keseluruhan, atau satu unit',
    contoh: 'se- + orang = seorang',
  },
  'pe-': {
    label: 'pe-',
    level: ['pertengahan', 'lanjutan'],
    fungsi: 'Membentuk kata nama — orang yang melakukan perbuatan (pelaku)',
    contoh: 'pe- + nulis = penulis (orang yang menulis)',
  },
};

const AKHIRAN = {
  '-kan': {
    label: '-kan',
    level: ['pertengahan', 'lanjutan'],
    fungsi: 'Membentuk kata kerja transitif atau kausatif — melakukan untuk orang lain atau menyebabkan sesuatu',
    contoh: 'baca + -kan = bacakan (baca untuk orang lain)',
  },
  '-an': {
    label: '-an',
    level: ['pertengahan', 'lanjutan'],
    fungsi: 'Membentuk kata nama — hasil perbuatan, benda, atau kolektif',
    contoh: 'tulis + -an = tulisan (hasil menulis)',
  },
  '-i': {
    label: '-i',
    level: ['pertengahan', 'lanjutan'],
    fungsi: 'Menunjukkan perbuatan yang diarahkan kepada sesuatu objek atau tempat',
    contoh: 'duduk + -i = duduki (duduk di atas sesuatu)',
  },
};

const LEVEL_CONFIG = {
  asas: {
    label: 'Asas',
    desc: 'Awalan mudah tanpa perubahan bunyi',
    awalan: ['ber-', 'ter-', 'di-', 'ke-', 'se-'],
    akhiran: [],
    apitan: false,
  },
  pertengahan: {
    label: 'Pertengahan',
    desc: 'Awalan me- dengan penyerapan nasal + akhiran',
    awalan: ['me-', 'ber-', 'ter-', 'di-', 'pe-'],
    akhiran: ['-kan', '-an', '-i'],
    apitan: false,
  },
  lanjutan: {
    label: 'Lanjutan',
    desc: 'Apitan (awalan + akhiran serentak)',
    awalan: ['me-', 'ber-', 'di-', 'ke-', 'pe-'],
    akhiran: ['-kan', '-an', '-i'],
    apitan: true,
  },
};
