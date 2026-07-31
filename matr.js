//=========matr.js========
// --- Simple Confetti ---
var g_canvas = document.getElementById('confetti');
if(!g_canvas){alert('нет канваса');}
var g_ctx = g_canvas.getContext('2d');
var g_cubs = [];

function resizeCanvas() {
  g_canvas.width = window.innerWidth; g_canvas.height = window.innerHeight;
}
//main
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function fireConfetti() {
  g_cubs = [];
  const colors = ['#00f2fe', '#4facfe', '#fcd34d', '#10b981', '#ef4444'];
  for(let i=0; i<80; i++) {
    g_cubs.push({
      x: g_canvas.width / 2,
      y: g_canvas.height,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 1) * 16 - 4,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * 360,
      rs: (Math.random() - 0.5) * 8
    });
  }
  animateConfetti();
}
function animateConfetti() {
  if(g_cubs.length === 0){g_ctx.clearRect(0,0,g_canvas.width,g_canvas.height); return;}
  g_ctx.clearRect(0,0,g_canvas.width,g_canvas.height);
  for (let i = g_cubs.length - 1; i >= 0; i--) {
    const p = g_cubs[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.4; p.rot += p.rs;// gravity
    g_ctx.save();
    g_ctx.translate(p.x, p.y);
    g_ctx.rotate(p.rot * Math.PI / 180);
    g_ctx.fillStyle = p.color;
    g_ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
    g_ctx.restore();
    if(p.y > g_canvas.height){g_cubs.splice(i, 1);}
  }
  requestAnimationFrame(animateConfetti);
}
//подсветка слова тр перевода и звуков
function zv_zagl(s,a){var le,i,w,out;
 s=''+s;
 //s=replace_all(s,'.','. ');
 s=replace_all(s,',',', ');
 s=replace_all(s,';','; ');
 s=replace_all(s,'!','! ');

 s=replace_all(s,'(',' (');
 s=replace_all(s,'[',' [');
 s=replace_all(s,'{',' {');

 s=replace_all(s,')',') ');
 s=replace_all(s,']','] ');
 s=replace_all(s,'}','} ');

 var ru1='-йцукенгшщзхъфывапролджэячсмитьбюё'
 var ru2='-ЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮЁ';
 var ru3=ru1+ru2;
 var en1='-qwertyuiopasdfghjklzxcvbnm';
 var en2='-QWERTYUIOPASDFGHJKLZXCVBNM';
 var en3=en1+en2;

 s=s+' ';le=s.length;out='';
 var f_a=0,f_b=0,f_i=0,f_en=0,f_tr1=0,f_tr2=0;
 if(a){out='<a>';f_a=1;}//первое слово выделяем

 for(i=0;i<le;i++){
  w=s.charAt(i);
  if(f_a){
   if(' /|'.indexOf(w)>=0){f_a=0;out+='</a>'+w;continue;}
   out+=w; continue; //остальное игнорим
  }
  if(!f_tr1)if(w==='['){f_tr1=1;out+='<span>[';continue;}
  if(f_tr1){//транскрипция внутри ФА []
   if(w===']'){f_tr1=0;out+=']</span>';continue;}
   out+=w; continue; //остальное игнорим
  }
  if(!f_tr2)if(w==='~'){f_tr2=1;out+='<span>~';continue;}
  if(f_tr2){//транскрипция внутри ФА ~)
   if(' )/|'.indexOf(w)>=0){f_tr2=0;out+='</span>'+w;continue;}
   out+=w; continue; //остальное игнорим
  }
  if(!f_en)if(en3.indexOf(w)>0){f_en=1;out+='<a>'+w;continue;}
  if(f_en){//англ слово внутри ФА
   if(en3.indexOf(w)<0){f_en=0;out+='</a>'+w;continue;}
   out+=w; continue; //остальное игнорим
  }
  if(!f_b)if(ru2.indexOf(w)>0){f_b=1;out+='<b>'+w;continue;}
  if(f_b){//загл рус внутри ФА это звуки
   if(ru2.indexOf(w)<0){f_b=0;out+='</b>'+w;continue;}
   out+=w; continue; //остальное игнорим
  }
  if(!f_i)if(w==='*'){f_i=1;out+='<i>*';continue;}
  if(f_i){//перевод внутри ФА *
   if(ru3.indexOf(w)<0){f_i=0;out+='</i>';}
  }
  out+=w;
 }
 out=one_sp(out);
 return out.trim();
}

// ═══════════════════════════════════════════════════
//  УТИЛИТЫ
// ═══════════════════════════════════════════════════
function el(id){var e=document.getElementById(''+id);if(!e)alert('нет элемента='+id); return e;}
function in_str(s,w){return (s.indexOf(w)<0)? 0:1;}
function in_arr(m,w){return (m.includes(w))? 1:0;}
function replace_all(s,a,b){return (''+s).split(''+a).join(''+b);}
function one_sp(s){return s.replace(/[ ]+/g,' ');}
function clear_arr(m){var s,i,out=[];
 for(i=0;i<m.length;i++){s=m[i].trim();if(s) out.push(s);}
 return out;
}
async function pause(t){await new Promise(r => setTimeout(r, t));}
function normWord(w){ return ('' + w).trim().toLowerCase().replace(/ /g, '-');}
// knownEnglishWords — глобальный список (\n), lowercase + дефис вместо пробела
function loadKnownWords(){
 var v = localStorage.getItem('knownEnglishWords'); return (v)? v.split('\n') : [];
}
function saveKnownWords(words){
 try {localStorage.setItem('knownEnglishWords', words.join('\n'));}
 catch(er){alert('limit localStorage='+er);}
}
function addKnownWord(word){
 var w = normWord(w); if(!w)return 0;
 var m=loadKnownWords();if(in_arr(m,w))return 0; 
 m.push(w);saveKnownWords(m); return 1;
}
function delKnownWord(word){var i,m,out;
 m=loadKnownWords();
 out=[];
 for(i=0;i<m.length;i++)if(m[i]!==word)out.push(m[i]);
 saveKnownWords(out);
}
function loadMatrKnown(){
  var v = localStorage.getItem('matr_known'); return (v)? v.split('\n') : [];
}
function saveMatrKnown(m){
  try {localStorage.setItem('matr_known', m.join('\n')); }
  catch(er){ alert('Ошибка localStorage:'+er); }
}

// ═══════════════════════════════════════════════════
//  ПАРСИНГ ДАННЫХ
// ═══════════════════════════════════════════════════
function parseMatrText(txt) {var m,out=[],i,s,p,ru,en,mn;
  m = txt.split('\n');
  for(i=0; i < m.length; i++) {
    s=m[i].trim(); if(!s) continue; if(in_str(s,'`')) continue;
    p=s.split('/'); if(p.length < 2) continue;
    ru = p.shift(); ru=replace_all(ru,',',', '); ru=one_sp(ru);
    en = p.shift().trim();
    mn = p.join('/').trim();
    if(ru && en) out.push({ ru: ru, en: en, mn: mn });
  }
  return out;
}

// Назначаем onclick на все <a> внутри контейнера
function attachSpeechToLinks(container) {
  var links = container.getElementsByTagName('a');
  for (var i = 0; i < links.length; i++) {
    (function(elm) {
      elm.onclick = function(e) {
        e.stopPropagation();
        var txt = elm.textContent || elm.innerText || '';
        speakWord(txt.trim());
      };
    })(links[i]);
  }
}

// ═══════════════════════════════════════════════════
//  ОЗВУЧКА
// ═══════════════════════════════════════════════════
// --- Speech Synthesis ---
function speakWord(enText){
  if (!('speechSynthesis' in window)) return;
  let cleanWord = enText.split('[')[0].split(',')[0].split(';')[0].trim();
  cleanWord = cleanWord.replace(/[^a-zA-Z\s\-]/g, '').trim();
  if(!cleanWord) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(cleanWord);
  utterance.lang = 'en-US';
  const voices = window.speechSynthesis.getVoices();
  const enVoice = voices.find(v => v.lang.startsWith('en'));
  if(enVoice) utterance.voice = enVoice;
  window.speechSynthesis.speak(utterance);
}
if('speechSynthesis' in window){
  window.speechSynthesis.getVoices();
  if(window.speechSynthesis.onvoiceschanged !== undefined){
    window.speechSynthesis.onvoiceschanged = function(){
      window.speechSynthesis.getVoices();
    };
  }
}

// ═══════════════════════════════════════════════════
//  СКАЧАТЬ СПИСОК (matr.txt)
// ═══════════════════════════════════════════════════
function downloadList() {
  var text = 'const matrWordsRaw = `\n';
  for (var i = 0; i < matrWords.length; i++) {
    var w = matrWords[i];
    text += w.ru + ' / ' + w.en + ' / ' + w.mn + '\n';
  }
  text += '`;\n';
  var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'matr.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════════════
//  СОХРАНИТЬ ВЫУЧЕННЫЕ СЛОВА → my_words.js.txt
// ═══════════════════════════════════════════════════
function saveWords() {
  var arr = loadKnownWords();
  if(!arr){alert('пустой список');return 0;}
  var text = 'var g_words = `\n' + arr.join('\n') + '\n`;\n';
  var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'my_words.js.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  g_newLearned = false;
}

// ═══════════════════════════════════════════════════
//  АВТОЗАГРУЗКА my_words.js.txt через <script>
// ═══════════════════════════════════════════════════
function autoLoadMyWords() {
  closeMenu();
  var old = el('__mywords_script');
  if (old) old.parentNode.removeChild(old);

  var scr = document.createElement('script');
  scr.id = '__mywords_script';
  // Без cache-bust для локальных файлов, чтобы не ломать file://
  var isFile = window.location.protocol === 'file:';
  scr.src = 'my_words.js.txt' + (isFile ? '' : '?' + Date.now()); 
  
  scr.onload = function() {
    if(typeof g_words !== 'undefined' && g_words) {
      var lines = ('' + g_words).split('\n');
      var arr = loadKnownWords();
      var changed = false, addedCount = 0;
      for(var i = 0; i < lines.length; i++) {
        var w = normWord(lines[i]); if(!w) continue;
        if(!in_arr(arr,w)){arr.push(w); changed = true; addedCount++; }
      }
      if(changed) {
        saveKnownWords(arr);
        alert('Загружено из my_words.js.txt: ' + addedCount + ' слов.');
      } else {alert('Файл my_words.js.txt загружен, новых слов не найдено.');}
    } else {alert('Файл загружен, но переменная g_words не найдена.');}
  };
  scr.onerror = function(){alert('Файл my_words.js.txt не найден рядом с HTML.');};
  document.head.appendChild(scr);
}

// ═══════════════════════════════════════════════════
//  ИМПОРТ ФАЙЛА ВЫУЧЕННЫХ СЛОВ (через диалог)
// ═══════════════════════════════════════════════════
function initFileUpload() {
  var fileInput = document.getElementById('load_file_input');
  if(!fileInput) return;
  fileInput.addEventListener('change', function(e){
    closeMenu();
    var file = e.target.files[0]; if(!file) return;
    var reader = new FileReader();
    reader.onload = function(evt){var txt,m,i,w,words=[],addedCount=0;
      txt = evt.target.result + ''; txt = replace_all(txt,'\r','\n');
      m = content.split('\n');
      for(i = 0; i < m.length; i++) {
        w=m[i].trim(); if(!w) continue; if(in_str(w,'`')) continue;
        w=normWord(w); words.push(w);
      }
      m = loadKnownWords();
      for(i=0; i < words.length; i++) {
        w=words[i]; if(!w) continue;
        if(!in_arr(m,w)){m.push(w); addedCount++;}
      }
      if(addedCount){saveKnownWords(m); alert('Загружено слов: ' + addedCount);} 
      else {alert('Новых слов для загрузки не найдено.'); }
      e.target.value = '';
    };
    reader.readAsText(file, 'UTF-8');
  });
}

// ═══════════════════════════════════════════════════
//  ПЕРЕМЕШАТЬ массив случайно
// ═══════════════════════════════════════════════════
function shuffle(array){var i,j,s;
  for (i = array.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    s = array[i]; array[i] = array[j]; array[j] = s;
  }
}

function find_en_words(txt,f){var i,j,m,s,out=[];
 var en='-qwertyuiopasdfghjklzxcvbnm';
 txt=replace_all(txt,';','\n');
 txt=replace_all(txt,'+','\n');
 m=txt.split('\n');
 for(i=0;i<m.length;i++){
   s=m[i].toLowerCase().trim(); 
   for(j=0; j<s.length; j++)if(!in_str(en,s.charAt(j)))break;
   s=s.substring(0,j);
   if(s && s!=='-')out.push(s);
 }
 if(f==='add'){//добавим в выученные слова
   m=loadKnownWords();j=m.length;
   for(i=0;i<out.length;i++)if(!in_arr(m,out[i]))m.push(out[i]);
   if(m.length>j)saveKnownWords(m);
 }
 if(f==='del'){//удалим из выученных слов
   m=loadKnownWords();j=m.length;
   for(i=0;i<m.length;i++)if(in_arr(out,m[i]))m[i]='';
   m=clear_arr(m);
   if(m.length<j)saveKnownWords(m);
 }
  
 return out;
}
 

