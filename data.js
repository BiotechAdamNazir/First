const KATA_DASAR = [
  {
    root: 'baca', meaning: 'membaca teks atau tulisan', en: 'read',
    terbitan: {
      'me-|':     { dbp: 'melihat serta memahami isi daripada apa yang tertulis atau tercetak', en: 'to read; to look at and understand written or printed material' },
      'me-|-kan': { dbp: 'membaca sesuatu dengan kuat untuk didengar orang lain', en: 'to read aloud; to read something out for others to hear' },
      'me-|-i':   { dbp: 'membaca berulang-ulang atau membaca seluruh isi sesuatu', en: 'to read through; to read repeatedly or thoroughly' },
      'di-|':     { dbp: 'telah dilihat dan difahami isinya oleh seseorang', en: 'read; having been looked at and understood' },
      'pe-|':     { dbp: 'orang yang gemar membaca; pembaca teks atau berita', en: 'reader; a person who reads or whose role is to read' },
      '|-an':     { dbp: 'bahan atau teks yang dibaca; sesuatu yang dikhaskan untuk dibaca', en: 'reading material; a piece of text; something to read' },
    },
  },
  {
    root: 'tulis', meaning: 'mencatat dengan tulisan', en: 'write',
    terbitan: {
      'me-|':     { dbp: 'mencatat atau melukis huruf-huruf, angka-angka, dsb. dengan pen, pensil, dll.', en: 'to write; to put words or marks on a surface using a pen or pencil' },
      'me-|-kan': { dbp: 'menulis sesuatu untuk orang lain atau menyatakan sesuatu dalam bentuk tulisan', en: 'to write something down for someone; to put into writing' },
      'me-|-i':   { dbp: 'menulis pada permukaan atau objek tertentu', en: 'to write on or upon a surface or object' },
      'di-|':     { dbp: 'telah dicatat atau dihasilkan dalam bentuk tulisan', en: 'written; recorded in written form' },
      'pe-|':     { dbp: 'orang yang menulis atau yang pekerjaannya menulis; pengarang', en: 'writer; author; a person whose profession is writing' },
      '|-an':     { dbp: 'sesuatu yang ditulis; hasil daripada perbuatan menulis; karangan', en: 'writing; script; a piece of text; something written' },
    },
  },
  {
    root: 'kira', meaning: 'mengira atau menganggar', en: 'count/think',
    terbitan: {
      'me-|':     { dbp: 'membilang atau mengira jumlah sesuatu; menganggarkan', en: 'to count; to calculate; to estimate or reckon' },
      'me-|-kan': { dbp: 'menganggap atau memandang sesuatu sebagai sesuatu yang lain', en: 'to consider as; to regard or deem something to be' },
      'di-|':     { dbp: 'telah dibilang atau dikira jumlahnya', en: 'counted; calculated; having been reckoned' },
      '|-an':     { dbp: 'hasil pengiraan atau anggaran; jumlah yang telah dikira', en: 'a count; a calculation; an estimate; a figure' },
    },
  },
  {
    root: 'sapu', meaning: 'membersihkan permukaan', en: 'sweep',
    terbitan: {
      'me-|':     { dbp: 'membersihkan lantai atau sesuatu permukaan dengan sapu atau yang seumpamanya', en: 'to sweep; to clean a surface with a broom or similar tool' },
      'me-|-kan': { dbp: 'menggunakan sesuatu untuk menyapu atau membersihkan permukaan bagi pihak orang lain', en: 'to sweep something for someone; to use something to wipe or clean' },
      'me-|-i':   { dbp: 'menyapu seluruh permukaan sesuatu atau menyapu dengan teliti', en: 'to sweep over; to clean all parts of a surface thoroughly' },
      'di-|':     { dbp: 'telah dibersihkan dengan sapu atau seumpamanya', en: 'swept; cleaned with a broom or similar' },
      '|-an':     { dbp: 'perbuatan menyapu; hasil atau kesan daripada menyapu', en: 'a sweep; a wipe; the result of sweeping' },
    },
  },
  {
    root: 'ambil', meaning: 'mengambil sesuatu', en: 'take',
    terbitan: {
      'me-|':     { dbp: 'memegang dan membawa sesuatu; mendapatkan sesuatu daripada suatu tempat', en: 'to take; to pick up; to fetch or get something from somewhere' },
      'me-|-kan': { dbp: 'mengambil sesuatu untuk orang lain; menyebabkan sesuatu diambil', en: 'to fetch something for someone; to cause something to be taken' },
      'me-|-i':   { dbp: 'mengambil sesuatu daripada seseorang atau sesuatu tempat secara berulang', en: 'to take from; to repeatedly take or draw from a source' },
      'di-|':     { dbp: 'telah dipegang dan dibawa oleh seseorang', en: 'taken; fetched; having been picked up by someone' },
      '|-an':     { dbp: 'sesuatu yang diambil; bahan atau item yang didapati', en: 'something taken; a sample; a pickup' },
    },
  },
  {
    root: 'jalan', meaning: 'bergerak dengan kaki', en: 'walk',
    terbitan: {
      'ber-|':    { dbp: 'bergerak dari satu tempat ke tempat lain dengan menggunakan kaki; berfungsi atau beroperasi', en: 'to walk; to move on foot; (also) to function or operate' },
      'me-|':     { dbp: 'menjalani atau meneruskan sesuatu proses atau perkara', en: 'to undergo; to carry out; to proceed along a course' },
      'me-|-kan': { dbp: 'mengendalikan atau mengoperasikan sesuatu; menjalankan sesuatu tugas', en: 'to run or operate something; to carry out or execute a task' },
      'di-|':     { dbp: 'telah dilalui atau dioperasikan', en: 'operated; run; having been carried out or traversed' },
      '|-an':     { dbp: 'laluan yang dilalui; kawasan jalan raya atau lorong', en: 'a road; a pathway; a street or lane' },
    },
  },
  {
    root: 'dengar', meaning: 'menerima bunyi', en: 'hear',
    terbitan: {
      'me-|':     { dbp: 'menerima bunyi atau suara melalui telinga; memperhatikan dengan teliti apa yang diperkatakan', en: 'to hear; to perceive sound through the ears; to listen' },
      'me-|-kan': { dbp: 'mendengar sesuatu dengan penuh perhatian; memperdengarkan sesuatu kepada orang lain', en: 'to listen to carefully; to play or broadcast something for others to hear' },
      'me-|-i':   { dbp: 'mendengar secara menyeluruh; memberi telinga kepada seseorang', en: 'to lend an ear to; to hear out someone completely' },
      'di-|':     { dbp: 'telah diterima atau diketahui melalui pendengaran', en: 'heard; perceived through hearing' },
      '|-an':     { dbp: 'sesuatu yang didengar; deria atau kemampuan untuk mendengar', en: 'something heard; hearing; auditory perception' },
    },
  },
  {
    root: 'makan', meaning: 'memasukkan makanan ke mulut', en: 'eat',
    terbitan: {
      'me-|':     { dbp: 'memasukkan makanan ke dalam mulut, mengunyah, dan menelannya', en: 'to eat; to put food in the mouth, chew, and swallow' },
      'me-|-kan': { dbp: 'memberi makan kepada seseorang; menyebabkan seseorang makan', en: 'to feed someone; to give food to; to cause someone to eat' },
      'me-|-i':   { dbp: 'memakan sesuatu secara menyeluruh atau memakan bahagian tertentu', en: 'to eat up; to consume a particular part of something' },
      'di-|':     { dbp: 'telah dimasukkan ke dalam mulut dan ditelan', en: 'eaten; consumed; having been ingested' },
      '|-an':     { dbp: 'segala benda yang dimakan; hidangan yang disediakan untuk dimakan', en: 'food; meal; anything edible; nourishment' },
    },
  },
  {
    root: 'lari', meaning: 'bergerak dengan pantas', en: 'run',
    terbitan: {
      'ber-|':    { dbp: 'bergerak dengan pantas menggunakan kaki; melarikan diri daripada sesuatu', en: 'to run; to move quickly on foot; to flee or escape' },
      'me-|':     { dbp: 'melarikan diri; pergi dengan tergesa-gesa meninggalkan sesuatu tempat', en: 'to run away; to flee; to escape quickly' },
      'me-|-kan': { dbp: 'menyebabkan seseorang lari atau melarikan sesuatu', en: 'to cause someone to run; to smuggle or make off with something' },
      'di-|':     { dbp: 'telah dilarikan atau dibawa lari oleh seseorang', en: 'run away with; taken away; having been made to flee' },
      '|-an':     { dbp: 'perbuatan berlari; perlumbaan lari; jarak yang dilari', en: 'a run; a race; the act of running; a running distance' },
    },
  },
  {
    root: 'bantu', meaning: 'memberi pertolongan', en: 'help',
    terbitan: {
      'me-|':     { dbp: 'memberi pertolongan, sokongan, atau bantuan kepada seseorang', en: 'to help; to give assistance or support to someone' },
      'me-|-kan': { dbp: 'menolong seseorang mendapatkan sesuatu; menjadikan sesuatu lebih mudah', en: 'to help someone get something; to facilitate or make easier' },
      'me-|-i':   { dbp: 'membantu seseorang dalam melakukan sesuatu', en: 'to assist someone in doing something; to help throughout' },
      'di-|':     { dbp: 'telah diberi pertolongan atau sokongan', en: 'helped; assisted; having received aid or support' },
      '|-an':     { dbp: 'pertolongan atau sokongan yang diberikan; sumbangan yang membantu', en: 'help; assistance; aid; a contribution or support given' },
    },
  },
  {
    root: 'datang', meaning: 'tiba di sesuatu tempat', en: 'come',
    terbitan: {
      'me-|':     { dbp: 'akan tiba atau berlaku pada masa hadapan; menuju ke sesuatu tempat', en: 'upcoming; forthcoming; to arrive or approach' },
      'me-|-kan': { dbp: 'membawa atau menyebabkan sesuatu atau seseorang hadir; mengimport', en: 'to bring; to cause something or someone to come; to import' },
      'di-|':     { dbp: 'telah dihadiri atau diperolehi daripada tempat lain', en: 'brought; imported; having been caused to arrive' },
      '|-an':     { dbp: 'sesuatu yang datang atau diterima; hasil atau pendapatan', en: 'income; arrival; something received or incoming' },
    },
  },
  {
    root: 'cari', meaning: 'mencari sesuatu', en: 'search',
    terbitan: {
      'me-|':     { dbp: 'berusaha untuk mendapatkan atau menemukan sesuatu yang dikehendaki', en: 'to search for; to look for; to seek something' },
      'me-|-kan': { dbp: 'mencari sesuatu untuk orang lain; mencari dan mendapatkan', en: 'to search for something on behalf of someone; to find and bring' },
      'me-|-i':   { dbp: 'mencari di dalam atau melalui sesuatu tempat atau objek', en: 'to search through; to look throughout a place or object' },
      'di-|':     { dbp: 'telah dicari atau diusahakan untuk ditemukan', en: 'searched for; sought after; having been looked for' },
      '|-an':     { dbp: 'sesuatu yang dicari; hasil atau proses mencari', en: 'a search; something sought; findings from a search' },
    },
  },
  {
    root: 'main', meaning: 'bermain atau berseronok', en: 'play',
    terbitan: {
      'ber-|':    { dbp: 'melakukan sesuatu kegiatan sebagai hiburan atau rekreasi; melakukan sesuatu permainan', en: 'to play; to engage in an activity for fun or recreation' },
      'me-|-kan': { dbp: 'mempertunjukkan atau mempertontonkan sesuatu; mengendalikan permainan', en: 'to play or perform something; to put on a show; to operate a game' },
      'di-|-kan': { dbp: 'telah dipertunjukkan atau dimainkan untuk penonton', en: 'played; performed; having been put on for an audience' },
      '|-an':     { dbp: 'benda yang digunakan untuk bermain; alat permainan; benda tiruan untuk kanak-kanak', en: 'a toy; a plaything; an object used for play' },
    },
  },
  {
    root: 'ajar', meaning: 'memberi ilmu pengetahuan', en: 'teach',
    terbitan: {
      'me-|':     { dbp: 'memberi pengetahuan atau kemahiran kepada seseorang; mendidik atau melatih', en: 'to teach; to give knowledge or skills to someone; to educate' },
      'me-|-kan': { dbp: 'mengajar sesuatu ilmu atau kemahiran kepada seseorang', en: 'to teach something to someone; to impart knowledge of a subject' },
      'me-|-i':   { dbp: 'mengajar seseorang secara berterusan; mendidik seseorang', en: 'to teach someone; to instruct a person continuously' },
      'di-|':     { dbp: 'telah dididik atau diberikan ilmu pengetahuan', en: 'taught; instructed; having been educated' },
      'pe-|':     { dbp: 'orang yang mengajar di sekolah atau institusi; guru', en: 'teacher; instructor; a person who teaches' },
      '|-an':     { dbp: 'pelajaran atau ilmu yang diajar; doktrin; panduan', en: 'teaching; doctrine; lesson; a piece of instruction' },
    },
  },
  {
    root: 'hantar', meaning: 'membawa ke destinasi', en: 'send',
    terbitan: {
      'me-|':     { dbp: 'membawa atau menyampaikan sesuatu atau seseorang ke destinasi tertentu', en: 'to send; to deliver; to take something or someone to a destination' },
      'me-|-kan': { dbp: 'menghantar sesuatu bagi pihak atau untuk orang lain', en: 'to send or deliver something on behalf of someone' },
      'me-|-i':   { dbp: 'menghantar sesuatu kepada seseorang; membekalkan sesuatu ke destinasi', en: 'to send something to someone; to deliver to a recipient' },
      'di-|':     { dbp: 'telah dibawa atau disampaikan ke destinasi tertentu', en: 'sent; delivered; having been taken to a destination' },
      '|-an':     { dbp: 'barang atau sesuatu yang dihantar sebagai pemberian atau kiriman', en: 'a gift; something sent or delivered; a parcel or delivery' },
    },
  },
  {
    root: 'ikut', meaning: 'mengikuti seseorang', en: 'follow',
    terbitan: {
      'me-|':     { dbp: 'berjalan atau bergerak di belakang seseorang; mematuhi atau menurut arahan', en: 'to follow; to go behind someone; to comply with a rule or order' },
      'me-|-i':   { dbp: 'mengikut dengan teliti; menyertai atau menghadiri sesuatu', en: 'to follow closely; to participate in; to attend or keep up with' },
      'me-|-kan': { dbp: 'menyertakan atau membawa seseorang bersama; mengikutkan', en: 'to bring someone along; to include someone in something' },
      'di-|':     { dbp: 'telah diikuti atau dipatuhi oleh seseorang', en: 'followed; complied with; having been accompanied or obeyed' },
    },
  },
  {
    root: 'goreng', meaning: 'memasak dalam minyak', en: 'fry',
    terbitan: {
      'me-|':     { dbp: 'memasak sesuatu bahan makanan dalam minyak atau lemak yang panas', en: 'to fry; to cook food in hot oil or fat' },
      'me-|-kan': { dbp: 'menggoreng sesuatu untuk orang lain; menyediakan makanan goreng', en: 'to fry something for someone; to prepare fried food' },
      'di-|':     { dbp: 'telah dimasak dalam minyak atau lemak yang panas', en: 'fried; cooked in hot oil; having been deep-fried or stir-fried' },
      '|-an':     { dbp: 'makanan yang telah digoreng; hasil daripada proses menggoreng', en: 'fried food; something that has been fried' },
    },
  },
  {
    root: 'nyanyi', meaning: 'mengeluarkan suara merdu', en: 'sing',
    terbitan: {
      'ber-|':    { dbp: 'mengeluarkan suara yang merdu mengikut irama dan melodi tertentu', en: 'to sing; to produce musical sounds or melody with the voice' },
      'me-|':     { dbp: 'mengeluarkan lagu atau melodi dengan suara; berseni suara', en: 'to sing; to produce a song or melody vocally' },
      'me-|-kan': { dbp: 'menyanyikan sebuah lagu; memperdengarkan nyanyian kepada orang lain', en: 'to sing a song; to perform a song for an audience' },
      'di-|-kan': { dbp: 'telah diperdengarkan atau dinyanyikan untuk orang ramai', en: 'sung; performed vocally; having been rendered as a song' },
      '|-an':     { dbp: 'lagu yang dinyanyikan; bunyi atau hasil daripada perbuatan menyanyi', en: 'a song; singing; a piece of music performed vocally' },
    },
  },
  {
    root: 'ubah', meaning: 'mengubah atau menukar', en: 'change',
    terbitan: {
      'me-|':     { dbp: 'menjadikan sesuatu berbeza daripada keadaan sebelumnya; menukar atau memperbaiki', en: 'to change; to alter; to make something different from before' },
      'me-|-kan': { dbp: 'melakukan perubahan pada sesuatu; menyebabkan sesuatu berubah', en: 'to change or alter something; to cause a modification' },
      'me-|-i':   { dbp: 'mengubah sesuatu secara menyeluruh atau berulang kali', en: 'to revise; to change something throughout or repeatedly' },
      'di-|':     { dbp: 'telah ditukar atau dijadikan berbeza daripada keadaan asal', en: 'changed; altered; having been made different' },
      '|-an':     { dbp: 'perubahan yang telah dibuat; perkara yang telah diubah; modifikasi', en: 'a change; an alteration; a modification; something revised' },
    },
  },
  {
    root: 'pergi', meaning: 'menuju ke tempat lain', en: 'go',
    terbitan: {
      'me-|-kan': { dbp: 'menyebabkan seseorang atau sesuatu pergi; menghantar seseorang ke suatu tempat', en: 'to send someone away; to cause someone or something to go' },
      'di-|-kan': { dbp: 'telah dihantar atau disuruh pergi ke sesuatu tempat', en: 'sent away; dispatched; caused to go somewhere' },
      '|-an':     { dbp: 'perjalanan atau perpindahan ke tempat lain; pemergian seseorang', en: 'a departure; going away; the act of leaving or travelling' },
    },
  },
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
