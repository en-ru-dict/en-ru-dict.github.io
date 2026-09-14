// ===================================
//  СИСТЕМА УЧЕТА СЛОВ (lib_known.js)
// ===================================
var g_kw_list = []; // Загрузим сюда выученные слова при старте
var g_kw_dirty = 0; // становится 1, когда добавили слово, и 0 после сохранения

function el(id,f){var e=document.getElementById(''+id);if(!e)if(!f)alert('нет элемента='+id); return e;}
function replace_all(s,a,b){return (''+s).split(''+a).join(''+b);}

function kw_clear_split(t){
  var s=replace_all(''+t,'\r','\n'); s=s.split('\n'); s=s.map(z=>z.trim());
  return s.filter(z=>z!=='');
}
function kw_add_arr(m1,m2){var i,m,s;//добавить массив m2 в m1 без дублей
  m=new Map();
  for(i=0;i<m1.length;i++){s=''+m1[i];s=s.trim();if(s!=='')m.set(s,1);}
  for(i=0;i<m2.length;i++){s=''+m2[i];s=s.trim();if(s!=='')m.set(s,1);}
  return Array.from(m.keys());
}
function kw_normWord(w){ return ('' + w).trim().toLowerCase().replace(/ /g, '-'); }
// knownEnglishWords — глобальный список (\n), lowercase + дефис вместо пробела
function loadKnownWords(){
  var v = localStorage.getItem('knownEnglishWords'); return (v)? v.split('\n') : [];
}
function saveKnownWords(words){
 var m=words.map(z=>kw_normWord(z)).filter(z=>z); //null,0,'',undefined,NaN
 try {localStorage.setItem('knownEnglishWords', m.join('\n'));return 1;}
 catch(er){alert('limit localStorage='+er);return 0;}
}
function addKnownWord(word){
  var w = kw_normWord(word); if(!w) return 0;
  if(g_kw_list.includes(w)) return 0; //уже есть такое слово
  g_kw_list.push(w); // Добавляем в память
  saveKnownWords(g_kw_list); // Пишем в localStorage, но не читаем его!
  window.onbeforeunload = kw_exit_save; g_kw_dirty = 1; //есть несохраненные данные
}
function delKnownWord(word){
  var w = kw_normWord(word); if(!w) return 0;
  g_kw_list = g_kw_list.filter(s => s !== w);
  saveKnownWords(g_kw_list); // Пишем в localStorage, но не читаем его!
  window.onbeforeunload = kw_exit_save; g_kw_dirty = 1; //есть несохраненные данные
}
// ===================
//  ЭКСПОРТ / ИМПОРТ
//====================
function save_to_my_words_js_txt(){// СОХРАНИТЬ ВЫУЧЕННЫЕ СЛОВА → my_words.js.txt
  if(!g_kw_list.length){ alert('пустой список'); return 0;}
  var text = 'var g_words=`\n' + g_kw_list.join('\n') + '\n`;\n';
  var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'my_words.js.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  g_kw_dirty = 0; // Сбрасываем флаг
  window.onbeforeunload = null; // Убираем системный вопрос, теперь можно выходить спокойно
}
function autoLoadMyWords(callback){// АВТОЗАГРУЗКА my_words.js.txt через <script>
  if(window.closeMenu)closeMenu();
  var old = el('id_mywords_script','mute'); if(old) old.remove(); //чтобы не засорять
  var sc = document.createElement('script');
  sc.id = 'id_mywords_script';
  sc.src = 'my_words.js.txt?' + Date.now();
  sc.onload = function(){
   if(typeof window.g_words === 'string'){
    var m = window.g_words.split('\n'); window.g_words = null;
    var le = g_kw_list.length; g_kw_list = kw_add_arr(g_kw_list,m);
    g_kw_list=g_kw_list.map(z=>kw_normWord(z)).filter(z=>z); //на всякий случай
    le=g_kw_list.length-le;
    if(le>0){
      saveKnownWords(g_kw_list); alert('Загружено из my_words.js.txt: '+le+' слов.');
      window.onbeforeunload = kw_exit_save; g_kw_dirty = 1; // есть несохраненные данные
    }
    else alert('Файл my_words.js.txt загружен, новых слов не найдено.');
   }
   else alert('Файл загружен, но g_words не найдена.');
  };
  sc.onerror = function(){alert('Файл my_words.js.txt не найден рядом с HTML.');};
  document.head.appendChild(sc);
}
// ================================================
//  ИМПОРТ ФАЙЛА ВЫУЧЕННЫХ СЛОВ (через диалог)
// ================================================
function kw_load(e){
 const file = e.files[0]; if(!file) return;
 const reader = new FileReader();
 reader.onload = (ev) => {
  var t = ''+ev.target.result;
  console.log('загружено из файла='+t.length);
  var m = kw_clear_split(t); m=m.filter(z=>z.indexOf('`')<0);
  var le=g_kw_list.length; g_kw_list=kw_add_arr(g_kw_list,m);
  g_kw_list=g_kw_list.map(z=>kw_normWord(z)).filter(z=>z); //на всякий случай
  le=g_kw_list.length-le;
  if(le>0){
   saveKnownWords(g_kw_list); alert('Загружено из файла '+le+' слов');
   window.onbeforeunload = kw_exit_save; g_kw_dirty = 1; // есть несохраненные данные
  }
  else alert('Новых слов для загрузки не найдено.');
  e.value = '';
 };
 reader.readAsText(file,'UTF-8');//a-z
}
function kw_load_file(){
 if(window.closeMenu)closeMenu();
 var fp = el('id_kw_load_file','mute');
 if(!fp){
  var h='<input id="id_kw_load_file" style="display:none;" accept=".txt,.js" type="file" onchange="kw_load(this)">';
  document.body.insertAdjacentHTML('beforeend', h);
  fp=el('id_kw_load_file');
 }
 fp.click();
}
// ==========================================
//  ДИНАМИЧЕСКИЙ ИНТЕРФЕЙС (Модалка и стили)
// ==========================================
function kw_inject_ui() {
 if(el('id_kw_style','mute')) return;
 var h =`
<style id="id_kw_style">
/* Save modal on exit */
#id_kw_save-modal { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.85); z-index:9999; display:none; -webkit-justify-content:center; justify-content:center; -webkit-align-items:center; align-items:center; padding:20px;}
#id_kw_save-modal.open { display:-webkit-flex; display:flex; }
#id_kw_save-modal-box { background:#1e293b; border-radius:14px; padding:24px 28px; max-width:420px; width:100%; color:#e2e8f0; text-align:center; border:1px solid rgba(255,255,255,0.1);}
#id_kw_save-modal-box h3 { color:#00f2fe; margin-bottom:12px; font-size:1.1rem; }
#id_kw_save-modal-box p { font-size:0.9rem; color:#94a3b8; margin-bottom:20px; }
.kw_mbtn { display:inline-block; padding:9px 22px; border-radius:20px; border:none; font-size:0.9rem; font-weight:bold; cursor:pointer; margin:4px; font-family:inherit;}
.kw_mbtn-yes { background:#10b981; color:#fff; }
.kw_mbtn-no  { background:rgba(255,255,255,0.1); color:#e2e8f0; border:1px solid rgba(255,255,255,0.2); }
</style>
<div id="id_kw_save-modal">
 <div id="id_kw_save-modal-box">
  <h3>💾 Сохранить выученные слова?</h3>
  <p>Вы выучили новые слова. Сохранить их в файл <b>my_words.js.txt</b>?</p>
  <button class="kw_mbtn kw_mbtn-yes" onclick="kw_save_and_leave()">💾 Да</button>
  <button class="kw_mbtn kw_mbtn-no"  onclick="kw_leave()">✕ Нет</button>
 </div>
</div>
`;
 document.body.insertAdjacentHTML('beforeend', h);
}
function kw_exit_save(e){// ПРЕДЛОЖИТЬ СОХРАНИТЬ ПРИ ВЫХОДЕ
  if(!g_kw_dirty) return; // Если всё сохранено, не мешаем
   kw_show_save_modal(); // Показываем красивую модалку "под" системным окном
   e.preventDefault();
   e.returnValue = ''; // Для Chrome
   return ''; // Для Firefox/Safari
}
function kw_show_save_modal(){kw_inject_ui();el('id_kw_save-modal').classList.add('open');}
function kw_save_and_leave(){ save_to_my_words_js_txt(); kw_leave();}
function kw_leave(){ el('id_kw_save-modal').classList.remove('open');}

// Инициализация
g_kw_list=loadKnownWords(); //из локал сторидж в память для скорости
console.log('lib_known.js загружен');
