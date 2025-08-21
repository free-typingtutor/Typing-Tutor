/* Shared utilities: storage, text bank, toggles, helpers */

// ---- THEME + KEYBOARD TOGGLE ----
function initThemeToggle(btnId){
  const btn = document.getElementById(btnId);
  const saved = localStorage.getItem('tt_theme') || 'light';
  if (saved === 'dark') document.body.classList.add('dark');
  if (btn) btn.textContent = document.body.classList.contains('dark') ? '☀️ Light' : '🌙 Dark';
  btn?.addEventListener('click', ()=>{
    document.body.classList.toggle('dark');
    localStorage.setItem('tt_theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    if (btn) btn.textContent = document.body.classList.contains('dark') ? '☀️ Light' : '🌙 Dark';
  });
}

function initKeyboardToggle(btnId, sectionId){
  const btn = document.getElementById(btnId);
  const sec = document.getElementById(sectionId);
  const saved = localStorage.getItem('tt_keyboard_visible');
  if (saved === 'hidden') sec.style.display = 'none';
  if (btn) btn.textContent = (sec.style.display === 'none') ? '⌨️ Show Keyboard' : '⌨️ Keyboard';
  btn?.addEventListener('click', ()=>{
    const hidden = sec.style.display === 'none';
    sec.style.display = hidden ? '' : 'none';
    localStorage.setItem('tt_keyboard_visible', hidden ? 'shown' : 'hidden');
    if (btn) btn.textContent = hidden ? '⌨️ Keyboard' : '⌨️ Show Keyboard';
  });
}

// ---- STORAGE (localStorage) ----
const Storage = (() => {
  const KEYS = {
    attempts: 'tt_attempts',
    totalWPM: 'tt_totalWPM',
    bestWPM:  'tt_bestWPM',
    history:  'tt_wpm_history',
    keyStats: 'tt_key_stats'
  };

  function getNum(k, def=0){ return Number(localStorage.getItem(k) ?? def) || 0; }
  function setNum(k, v){ localStorage.setItem(k, String(v)); }

  function getJSON(k, def){ try{ return JSON.parse(localStorage.getItem(k) ?? JSON.stringify(def)); }catch{return def;} }
  function setJSON(k, v){ localStorage.setItem(k, JSON.stringify(v)); }

  function recordAttempt(wpm){
    const attempts = getNum(KEYS.attempts) + 1;
    const totalWPM = getNum(KEYS.totalWPM) + wpm;
    const bestWPM  = Math.max(getNum(KEYS.bestWPM), wpm);
    setNum(KEYS.attempts, attempts);
    setNum(KEYS.totalWPM, totalWPM);
    setNum(KEYS.bestWPM, bestWPM);
  }

  function getSummary(){
    const attempts = getNum(KEYS.attempts);
    const totalWPM = getNum(KEYS.totalWPM);
    const bestWPM  = getNum(KEYS.bestWPM);
    const avgWPM   = attempts ? Math.round(totalWPM / attempts) : 0;
    return { attempts, totalWPM, bestWPM, avgWPM };
  }

  function pushHistoryWPM(wpm){
    const arr = getJSON(KEYS.history, []);
    arr.push(wpm);
    if (arr.length > 60) arr.shift();
    setJSON(KEYS.history, arr);
  }
  function getHistoryWPM(){ return getJSON(KEYS.history, []); }

  function getKeyStats(){ return getJSON(KEYS.keyStats, {}); }
  function setKeyStats(obj){ setJSON(KEYS.keyStats, obj); }
  function bumpKeyStats(label, {hit=false, error=false}={}){
    if (!label) return;
    const stats = getKeyStats();
    const s = stats[label] || {hits:0, errors:0};
    if (hit) s.hits++;
    if (error) s.errors++;
    stats[label] = s;
    setKeyStats(stats);
  }

  function resetAll(){
    Object.values(KEYS).forEach(k=>localStorage.removeItem(k));
  }

  return { recordAttempt, getSummary, pushHistoryWPM, getHistoryWPM, bumpKeyStats, getKeyStats, setKeyStats, resetAll };
})();

// ---- TEXT CONTENT ----
const TextBank = (() => {
  const WORDS = [
    "apple","ocean","brave","delta","quick","brown","fox","jumps","laser","orbit",
    "syntax","typing","keyboard","practice","rhythm","quiz","jazz","pizza","matrix","pixel",
    "alpha","gamma","sigma","lambda","rocket","garden","candle","window","violet","zenith"
  ];
  const SENTENCES = [
    "Practice makes progress, not perfection.",
    "The quick brown fox jumps over the lazy dog.",
    "Typing fast requires accuracy first, speed later.",
    "Focus on rhythm; let the words flow naturally.",
    "Breathe, relax your shoulders, and keep a steady pace."
  ];

  const LEVELS = {
    beginner:
      "asdf jkl; asdf jkl; fj fj dk dk sl sl aa ss dd ff jj kk ll ;; fjfj dkd ksl slf",
    intermediate:
      "Business casual is an ambiguously defined dress code that has been adopted by many professional and white-collar workplaces in Western countries. It entails neat yet casual attire and is generally more casual than informal attire but more formal than casual or smart casual attire. Casual Fridays preceded widespread acceptance of business casual attire in many offices.",
    advanced:
      "Developing effective study habits is crucial for academic success. This involves creating a dedicated study space that is free from distractions, setting aside regular study time, and using active learning strategies to engage with the material. Experiment with different study techniques to find what works best for you. Some students prefer to study alone, while others find group study sessions more productive. Taking regular breaks during study sessions can help prevent burnout and improve focus. Reviewing notes and summarizing key points after each class can help solidify your understanding of the material."
  };

  const LESSONS = {
    beginner:
      "Home row drills:\nffff jjjj fjfj fjfj asdf jkl; asdf jkl;\nfj dk sl ;'\nRepeat lines to build accuracy.",
    intermediate:
      "Words & punctuation:\nfast, faster, fastest. good, better, best.\nType smoothly; avoid overcorrecting.",
    advanced:
      "Complex sentences & symbols:\nTyping quickly and accurately requires consistent practice—focus & patience!\nTry: ! @ # $ % ^ & * ( ) and brackets [] {} <>."
  };

  function randomWords(n=20){
    const arr = [];
    for (let i=0;i<n;i++){
      arr.push(WORDS[Math.floor(Math.random()*WORDS.length)]);
    }
    return arr.join(' ');
  }
  function randomSentence(){
    return SENTENCES[Math.floor(Math.random()*SENTENCES.length)];
  }
  function getLevelText(level){
    return LEVELS[level] || LEVELS.beginner;
  }
  function getLesson(level){
    return LESSONS[level] || LESSONS.beginner;
  }

  return { randomWords, randomSentence, getLevelText, getLesson };
})();

// ---- HELPERS ----
function escapeHTML(s){
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
