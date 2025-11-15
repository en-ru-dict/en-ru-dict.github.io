// Набор утилит
// - Логи через функцию `log()` (можно перенастроить режим вывода).
// - Глобальные переменные имеют префикс g_ или gm_ (map)
// - Используем let вместо const, чтобы было проще править.
// ================================================================
// Функция log — единая точка логирования (можно менять режим вывода)
// Универсальный лог: выводит в консоль, или ничего в зависимости от g_log_mode.
// Используется во всём коде — не менять место вызова, менять только поведение в одном месте.
window.g_log_mode=1;//0-no msg;
function log(msg,obj){
  if(!g_log_mode) return; //логи выключены, ошибки через алерт
  console.log(''+msg); if(obj)console.log(obj);
}
// ===DOM helpers
// Быстро возвращает элемент по id. Если нет — логирует и возвращает null.
function el(id){
  let e = document.getElementById(''+id);
  if(!e) log('el: нет элемента id=' + id);
  return e;
}
function elk(k){ //по классу CSS или селектору, только 1шт
  let e = document.querySelector(''+k);
  if(!e) log('elk: нет элемента class=' + k);
  return e;
}
// Безопасно пишет текст в элемент (textContent). Если элемента нет — молча логируем.
function putText(id,text){
  let e = el(id); if(!e)return 0;
  e.textContent = ''+text; return 1;
}
// Возвращает textContent или ?.
function getText(id){
  let e = el(id); if(!e) return '?';
  return ''+e.textContent;
}
// Таймеры (обёртка над console.time/timeEnd с ярлыком по имени функции)
function timerStart(name) {
  name = name || 'timer';
  if (window.console)if(typeof console.time === 'function') console.time(''+name);
}
// Завершает соответствующий timer (console.timeEnd) по имени функции.
function timerEnd(name) {
  name = name || 'timer';
  if (window.console)if(typeof console.timeEnd === 'function') console.timeEnd(''+name);
}
// Возвращает массив ключей Map или пустой массив.
function keysOfMap(m){
  if(!(m instanceof Map)){log('keysOfMap: не map массив');return [];}
  return Array.from(m.keys());
}
// Возвращает массив слов из с указанным состоянием:
// 1 — выученные, 2 — активные
function getWordsByState(m){
  let out=[]; for(let [key,val] of m)if(val)out.push(key);//0=выкл вместо удалить
  return out.join('\n');
}
function getLW(){return getWordsByState(gm_lw);}
function getAW(){return getWordsByState(gm_aw);}

// Безопасная потоковая без split join замена всех вхождений s1 → s2 в строке str.
function replaceAllSafe(str,s1,s2){
  str = ''+str; s1 = ''+s1; s2 = ''+s2;
  if(!str) { log('replaceAllSafe: пустая str'); return ''; }
  if(!s1) { log('replaceAllSafe: пустой s1'); return str; }
  if(typeof str.replaceAll === 'function') return str.replaceAll(s1,s2); //2021
  let out='',i=0,p=0,le=s1.length;
  while((p=str.indexOf(s1,i)) >= 0){out+=str.slice(i,p)+s2;i=p+le;}
  return out + str.slice(i);//=substring
}
// Приводит ключ к нормализованной форме: строчные, trim, look for -> look-for
function normKey(k){
  if(!k)log('normKey: пустой ключ?');
  k=''+k; k=k.trim().toLowerCase().replace(/\s+/g,'-');
  return k.replace(/[^a-z-']/g,''); //убираем неправильные символы
}
// Разбивает текст на массив строк. разделители: (; \n \r) Убирает пустые строки и пробелы.
function tSplit(text){
  text = ''+text;
  text = text.replace(/\r/g,'\n').replace(/\t/g,' ').replace(/;/g,'\n');
  return text.split('\n').map(s => s.trim()).filter(s => s); // убираем пустые
}
// Возвращает строку с заглавной первой буквой.
function firstUp(s){ s = ''+s;
  if(!s){log('firstUp: пустая строка?');return '';}
  return s.slice(0,1).toUpperCase() + s.slice(1);
}
// Приводит текст к нормальной форме: убирает диакритику, нормализует кавычки и тире
// обрезает слишком длинные тексты, заменяет составные слова из gm_sost
function normText(t){
  t=''+t; t=t.trim(); if(!t)return '';
  if(t.length > 50000){log('normText: текст длиннее 50k — обрезаю');t=t.slice(0,50000);}
  t = replaceAllSafe(t, '\\', '/');
  // замена диакритики (для слов типа café) для англ.яз только!
  t=t.replace(/á|à|â|ä/g,'a').replace(/é|è|ê/g,'e').replace(/í|ì|î/g,'i');
  t=t.replace(/ó|ò|ô|ö/g,'o').replace(/ú|ù|û|ü/g,'u').replace(/ñ/g,'n').replace(/ç/g,'c');
  // кавычки, тире, пробелы
  t=t.replace(/‘|’|‛|′|‵/g,"'");//\u2018|\u2019|\u201B|\u2032|\u2035
  t=t.replace(/“|”|‟|″|‶/g,'"');//\u201C|\u201D|\u201F|\u2033|\u2036
  t=t.replace(/–|—|‒|‐/g,'-');//\u2013|\u2014|\u2012|\u2010
  t=t.replace(/\t/g,' ').replace(/\u00A0/g,' '); //хитрый пробел
  t=t.replace(/\r/g,'\n').replace(/[ ]+/g,' ').replace(/[\n]+/g,'\n');

  // заменяем составные слова через регулярку быстро
  return replaceCompoundWords(t); //look for -> look-for
  /* запасная если выше плохо работает
  if(gm_sost.size > 0) {
    for(let [k,v] of gm_sost){
      v = k.replace(/-/g,' ');
      t = replaceAllSafe(t, v, k);
      t = replaceAllSafe(t,firstUp(v),firstUp(k));
    }
  }
  return t;
  */
}
// Заменяет составные слова в тексте  из словаря gm_sost
// gm_sost: Map(key -> 1), key='look-for' (для поиска и перевода как одно слово)
function replaceCompoundWords(text){
 for(let [key,val] of gm_sost)if(key){
  // Регулярка: границы слова (\b), пробелы и переносы (\s+)
  let re1 = new RegExp(`\\b${key.replace(/-/g,'\\s+')}\\b`,'g'); //\blook\s+for\b
  text = text.replace(re1,key);// Заменяем маленькими буквами
  key = key.charAt(0).toUpperCase() + key.slice(1);
  let re2 = new RegExp(`\\b${key.replace(/-/g,'\\s+')}\\b`,'g');
  text = text.replace(re2,key);// Заменяем с заглавной первой буквой
 }
 return text;
}
// Устанавливает флаг занятости. Возвращает 1, если уже занят.

function startBusy(name, text, delay) {
  name = name || 'noname'; text = text || '';  delay = delay || 0;
  
  let b = gm_busy.get(name);
  if(b){
	log(`${name}: - Функция еще занята=${b}). Ставим=2`);
	gm_busy.set(name, 2);
	return 1; // Нельзя
  }
  
  let t = gm_busy.get(name + '__timer') || 0;
  t = delay - (Date.now() - t);
  if(t > 0){
	log(`${name}: - Слишком рано. Ждем ${t}ms`);
	let tm = gm_busy.get(name + '__tm') || 0;
	if(tm) clearTimeout(tm);
	tm = setTimeout((z)=>{
	  log(`Попытка отложенного запуска: ${name}`);
	  gm_busy.set(name + '__tm',0);
	  window[name](); // Вызываем *главную* функцию
	}, t);
	gm_busy.set(name + '__tm', tm);
	return 1; // занято
  }

  gm_busy.set(name + '__timer', Date.now());//начало работы
  gm_busy.set(name, 1);
  log(`${text}/${name}: Начало работы. Ставим=1`);
  return 0; // Можно
}

function endBusy(name, text){
  name = name || 'noname'; text = text || '';
  let t = gm_busy.get(name + '__timer') || 0;
  if(!t){alert('endBusy: таймер не был запущен! /' + name); return 0;}
  t = Date.now() - t;
  log(`${text}/${name}: Конец работы. (время работы=${t}ms). сбросим флаг занято=0`);
  let s = gm_busy.get(name);
  gm_busy.set(name, 0); // free

  if (s == 2) {
	log(`${name}: Был пропущен вызов=2). Запускаем повторно.`);
	setTimeout((z) => {
	  log(`${name}: Повторный запуск из endBusy`);
	  window[name]();
	}, 0);
  }
}
function showTimer(name){
  let t=gm_busy.get(name+'__timer') || 0;
  if(!t){log('showTimer: таймер не был запущен!='+name);return;}
  t=Date.now()-t; log(name+': Прошло времени='+t);
}
//задержка перед выполнением чтобы часто не запускалось
function debounce(fn,wait){
  let tm;
  return function(){
    let that = this;
    clearTimeout(tm);
    tm = setTimeout((z)=>fn.apply(that),wait);
  };
}
// Динамически загружает <script>
function loadScript(vPath,fCallBack,args){ vPath = ''+vPath; //долгая
  if(!vPath){log('loadScript: пустой путь'); return 0;}
  log('загружаем скрипт='+vPath);
  let script = document.createElement('script');
  script.async = true; script.src = vPath;
  script.onload = (z)=>{
    log('скрипт загружен='+vPath);
    if(typeof fCallBack === 'function') setTimeout(fCallBack,0,args);
  }
  script.onerror = (e)=>{log('loadScript: ошибка загрузки='+e);}
  document.head.appendChild(script);
}
// Сохраняет текст в файл через Blob и <a download>.
function saveToFile(filename = 'file.txt',text = '//no text') {
  try {
    let blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    let a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename; a.style.display = 'none';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    log('saveToFile: сохранён ' + filename);
    return 1;
  } catch (e){ log('saveToFile: ошибка='+e); return 0;}
}
// Диалог выбора файла, чтение текста, вызов callback(content)
function loadFromFile(fCallBack,accept){
  if(typeof fCallBack !== 'function'){log('loadFromFile: не функция');return 0;}
  let input = document.createElement('input');
  input.type = 'file'; input.accept = accept || '.txt'; input.style.display = 'none';
  document.body.appendChild(input);
  input.addEventListener('change', (e)=>{
    let file = e.target.files[0];
    if(!file){
      log('loadFromFile: файл не выбран'); //передумали
      document.body.removeChild(input);
      return;
    }
    let reader = new FileReader();
    reader.onerror = (e)=>{log('loadFromFile: ошибка чтения='+e); document.body.removeChild(input);}
    reader.onload = (e)=>{
      let content = ''+e.target.result;
      log('loadFromFile: файл загружен, длина=' + content.length);
      setTimeout(fCallBack,0,content);
      document.body.removeChild(input);
    }
    reader.readAsText(file, 'UTF-8');
  });
  input.click();
}
 //Копирует текст в буфер. navigator.clipboard + fallback.
function copyToClipboard(text,fCallBack){ text = ''+text;
  if(navigator)if(navigator.clipboard)if(navigator.clipboard.writeText){
    navigator.clipboard.writeText(text)
      .then((e)=>{if(typeof fCallBack === 'function')fCallBack(e);})
      .catch((e)=>{log('copy1 err='+e);});
    return 1;
  }
  // fallback
  let ta = document.createElement('textarea');
  ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-10000px';
  document.body.appendChild(ta); ta.select();
  try {
    let ok = document.execCommand('copy');
    document.body.removeChild(ta);
    if(ok){if(typeof fCallBack === 'function')fCallBack();}
    else log('copyToClipboard: execCommand вернул false');
  } catch (e){ document.body.removeChild(ta); log('copy2 err='+e);}
  return 2;
}
//грузим мал.словарь уровня 1,2,3 (цель выучить его, если в тексте много слов не из него,
//значит текст слишком сложный, надо искать для текущего уровня юзера)
function loadDict(){ let d,m,s,k,v; //на входе текст в g_dict= `word|tr/n`
  if(!window.g_dict){log('loadDict: g_dict нет/пустой');return 0;}
  m=g_dict.split('\n'); g_dict=null; //free mem
  gm_dict.clear(); //можно не чистить, тогда догрузятся и перезапишут на новый перевод
  for(s of m)if(s){
    [k,v]=s.split('|'); k=normKey(k); v= v || '?'; v=v.trim();
    if(k){
      if(gm_dict.has(k))log('loadDict: dubl_key='+k);
      else gm_dict.set(k,v); //уник массив ключ-знач, дубли надо объединять!
      if(k.indexOf('-')>0)gm_sost.set(k,1); //wake-up возможны накладки, но так понятней что это одно слово по смыслу!
    }
  }
  log('словарь загружен='+gm_dict.size);
  setTimeout(render,0);//обновить разметку
}
//динамически загрузить выуч.слова из скрипта рядом my_words.txt
function loadLWS(){log('loadLWS'); loadScript('my_words.txt',loadLW);}
//калбек после выбора файла, текст из файла загружен
function loadLWF(txt){
  txt=''+txt; log('loadLWF: len='+txt.length);
  txt=txt.replace('g_words=`','').replace('`;','');
  window.g_words=txt;//если нет g_words, то создаем тут
  loadLW(); //text->dict из файла или внеш.скрипта
}
//калбэк после выбора файла, текст из файла загружен
function addLWF(txt){
  txt=''+txt;
  log('addLWF: len='+txt.length);
  txt=txt.replace('g_words=`','').replace('`;','');
  txt=txt+'\n'+getLW(); //добавляем
  window.g_words=txt;//если нет g_words, то создаем тут
  loadLW(); //text->dict из файла или внеш.скрипта
}
//загр списка выуч слов из файла/скрипта на входе g_words - строка , на выходе gm_lw
function loadLW(){
  if(!window.g_words){log('loadLW: ошибка: нет g_words');return;}
  let m=tSplit(g_words); gm_lw.clear(); g_words=null;//free mem
  for(let k of m){k=normKey(k); if(k)gm_lw.set(k,1);}//уник массив ключ-знач=1
  log('выученные слова загружены='+gm_lw.size);
  saveLWL();
  setTimeout(render,0);//обновить разметку
}
// загр активные слова из поля, можно запятые
function loadAW(){ //долгая
  if(startBusy('loadAW','начало загрузки активных из поля',999))return 0;
  gm_aw.clear();
  let t=''+el('id_aw').value; t=t.replace(/,/g,';'); t=tSplit(t);
  for(let k of t){k=normKey(k); if(k)gm_aw.set(k,1);}
  log('активные слова загружены='+gm_aw.size+'/'+getAW().replace(/\s/g,','));
  endBusy('loadAW','конец загрузки активных из поля');
  setTimeout(render,0);//обновить разметку
}


function getWordKey(wb){ return normKey(''+wb.children[0].textContent); }
function getWordStatus(key){
 if(gm_lw.get(key)) return 1;
 if(gm_aw.get(key)) return 2;
 if(gm_dict.get(key)) return 0;
 return 3;//нет в словаре значит редкое
}
// ========== Смена статуса слова по дв.клику ==========
function changeWordStatus(wb){
  let key=getWordKey(wb);
  let cur = getWordStatus(key);
  let next = 1;
  if(cur===1){gm_lw.set(key,0);next=0;}// забыли слово
  if(cur===0){gm_lw.set(key,1);next=1;}// знаю это слово
  if(cur===2){gm_lw.set(key,1);next=1;}// активное в выученные, но из поля снова перебьет?
  if(cur===3){gm_lw.set(key,1);next=1;}// редкое или имя и знаю это слово
  let classes = ['uw','lw','aw','rw'];
  log(`changeWordStatus: ${key}: ${classes[cur]}→${classes[next]}`);
  //обновим статус для всех слов
  miniRender(key,'',classes[next]);
}
function miniRender(key,val,word_status){//мини рендер по слову
  log('miniRender:'+key+'/'+val+'/'+word_status); //key=word, val=tran
  let class_key='w-'+key.replace(/[^a-z]/g,''); //убираем -'
  val=cutTran(val);
  document.querySelectorAll('#id_out .wb.'+class_key).forEach((wb)=>{
   if(word_status)wb.className='wb '+word_status+' '+class_key;
   if(val){
    wb.children[1].textContent = '('+val+')'; //safe tr
    wb.children[0].title = escapeAttr(val);
   }
  });
  statWords();
  saveLWL();
}
function escapeHTML(s){
 s=''+s;
 s=s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
 return s;
}
function escapeAttr(s){ s=''+s; //для title !надо делать unescape или заменять на ?
 s=s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/["'`]/g,'/');
 return s;
}
function cutTran(v){v=v.split(',').slice(0,3).join(',');if(v.length>30)v=v.slice(0,30)+'..';return v;}
function getTran(key){ //only for norm word (key)
  let v = gm_dict.get(key); if(v)return cutTran(v);
  v = gm_dict2.get(key); if(v)return cutTran(v);
  return '??';
}
function getModeTr(){return ''+el('id_mode').value;}
function statWords(){
  let lw=0,aw=0,rw=0,s=0;
  for(let [k,v] of gm_words){
    s = getWordStatus(k);
    if(s === 1) lw++;
    if(s === 2) aw++;
    if(s === 3) rw++;
  }
  putText('id_statAll', gm_words.size);
  putText('id_statLW', lw);
  putText('id_statAW', aw);
  putText('id_statRW', parseInt(100*rw/gm_words.size)+'%');
}
// УНИВЕРСАЛЬНЫЙ ОБРАБОТЧИК КЛИКА/ТАПА
function tap(e,wb){
  const now = new Date().getTime();
  const timeSinceLastTap = now - g_lastTapTime;

  if(timeSinceLastTap < 300){   // --- ДВОЙНОЙ КЛИК / ДВОЙНОЙ ТАП ---
    e.preventDefault(); // Предотвратить выделение текста (для ПК)
    log('двойной клик был'); showModalTr(wb);
    g_lastTapTime = 0; // Сброс
  } else {
    // --- ОДИНОЧНЫЙ КЛИК / ОДИНОЧНЫЙ ТАП ---
    // Таймер для проверки, был ли это одиночный клик/тап (чтобы не сработать перед dblclick)
    setTimeout((z)=>{
      // Если g_lastTapTime не сброшен (т.е. dblclick не сработал), то это одиночный клик
      if (g_lastTapTime !== 0) {
          log('одиночный клик был');changeWordStatus(wb);
      }
      g_lastTapTime = 0; // Сброс после выполнения
    }, 300);

    g_lastTapTime = now;
  }
}

// == Открыть БД
async function openIDB(){
  return new Promise((ok,er)=>{
    if(g_IDB){ok(1);return;}
    const r=indexedDB.open('MyDB',1);
    r.onupgradeneeded= (e)=>{const db=e.target.result;if(!db.objectStoreNames.contains('store'))db.createObjectStore('store');}
    r.onsuccess= (e)=>{g_IDB=e.target.result; ok(1);}  //=resolve
    r.onerror= (e)=>{alert('openIDB: er='+e); er(0);} //=reject
  });
}
// == Закрыть БД
function closeIDB(){if(g_IDB){g_IDB.close(); log('IndexedDB закрыт вручную');}}
// == Очистить хранилище фоном
function clearIDB(){
  openIDB().then((z)=>{
   return new Promise((ok,er)=>{
    const tx = g_IDB.transaction('store', 'readwrite');
    const store = tx.objectStore('store');
    const req = store.clear();
    req.onsuccess = (z)=>{alert('IndexedDB cleared');ok(1);}
    req.onerror = (e)=>{alert('clearIDB: err1='+e);er(0);}
   });
  }).catch((e)=>{alert('clearIDB: err2='+e);});
}
// == Количество записей пишет кол-во в лог
function countIDB(msg){
  openIDB().then((z)=>{
   return new Promise((ok,er)=>{
    const tx = g_IDB.transaction('store', 'readonly');
    const store = tx.objectStore('store');
    const req = store.count();
    req.onsuccess = (z)=>{
    log('Найдено записей в IDB='+req.result);
    if(req.result>0) el('id_tools').children[6].disabled=false;//разблокируем кнопку
    else alert(msg);
    ok(1);
  }
    req.onerror = (e)=>{alert('countIDB: err1='+e);er(0);}
   });
  }).catch((e)=>{alert('countIDB: err2='+e);});
}
// == Записать одну пару
function saveToIDB(key,val){
  openIDB().then((z)=>{
   return new Promise((ok,er)=>{
    const tx = g_IDB.transaction('store', 'readwrite');
    const store = tx.objectStore('store');
    store.put(val,key);
    tx.oncomplete =(z)=>{log(`записано в IDB=${key}/${val}`);ok(1);}
    tx.onerror =(e)=>{alert('saveToIDB: err1='+e);er(0);}
   });
  }).catch((e)=>{alert('saveToIDB: err2='+e);});
}
// == Прочитать одну запись async
async function readFromIDB(key){
  await openIDB();  //try?
  return new Promise((ok,er)=>{
    const tx = g_IDB.transaction('store','readonly');
    const store = tx.objectStore('store');
    const req = store.get(key);
    req.onsuccess = (z)=>ok(req.result);
    req.onerror = (e)=>{alert('readFromIDB: err1='+e);er(0);}
  });
}
// ========== Чтение пачкой в gm_dict2 флаги занято не надо, вызывается рендером2
async function readIDB(words){ // меньше 3к слов в тексте 10к/ ???-если тут не нашла
  await openIDB();
  return new Promise((ok,er)=>{
    log('начинаем чтение из IndexedDB');timerStart('readIDB');
    const tx=g_IDB.transaction('store','readonly');
    const store=tx.objectStore('store');
    let count=0;
    for(let k of words){
      const rq=store.get(k); const key=k; //без этого не работает!
      rq.onsuccess= (z)=>{gm_dict2.set(key,rq.result || '???');count++;} //кэш бол.словаря
      rq.onerror = (e)=>{alert('readIDB: err1='+e);er(0);}
    }
    tx.oncomplete= (z)=>{timerEnd('readIDB');log('readIDB прочитал='+count);ok(1);}
    tx.onerror= (e)=>{alert('readIDB: err2='+e);er(0);}
  });
}
// ========== Запись пачкой ==========
async function writeBatchToIDB(batch) {
  await openIDB();//log('пишем батч='+batch.length);
  return new Promise((ok,er) => {
    const tx = g_IDB.transaction('store', 'readwrite');
    const store = tx.objectStore('store');
    for(const [k,v] of batch) store.put(v,k);
    tx.oncomplete = (z)=>{ok(1);}
    tx.onerror = (e)=>{alert('writeBatchToIDB: er='+e);er(0);}
  });
}
// === Прогресс бар ========================================
function progressBar(done, total) {
  if(!total || total <= 0) total = 1;
  const percent = Math.min(100, Math.floor((done / total) * 100));
  const text = `${done}/${total} (${percent}%)`;
  if(!g_progress.el) createProgressBar();
  const bar = g_progress.el.querySelector('.bar-fill');
  const label = g_progress.el.querySelector('.bar-label');
  label.textContent = text;
  bar.style.width = percent + '%';
  bar.style.background = colorByPercent(percent);
  g_progress.el.style.display = 'flex';
  g_progress.lastUpdate = Date.now();
  // Автоматически скрыть через 3 сек без обновлений
  clearTimeout(g_progress.timer);
  g_progress.timer = setTimeout((z)=>{
    const dt = Date.now() - g_progress.lastUpdate;
    if (dt > g_progress.hideDelay) hideProgressBar();
  }, g_progress.hideDelay);
  if (percent >= 100) setTimeout(hideProgressBar, 500);
}

function hideProgressBar(){if(g_progress.el)g_progress.el.style.display = "none";}
function colorByPercent(p){
 let color='black';
 if(00<p && p<=20) color= '#FF4D4D'; //Яркий красный
 if(20<p && p<=40) color= '#FF9933'; //Оранжево-красный
 if(40<p && p<=60) color= '#FFE600'; //Жёлтый
 if(60<p && p<=80) color= '#99CC33'; //Светло-зелёный
 if(80<p && p<=99) color= '#00CC66'; //Насыщенный зелёный
 return color;
}

function show_msg_center(text){ //для экрана 1280*800 полосы прокрутки нет!
 let w='50%', le=text.length;
 if(le>500)w='70%';
 if(le>1000)w='96%';
 if(le>1500)text=text.slice(0,1500)+'(ещё..)';
 const modalContent = elk('.modal-content');if (modalContent) modalContent.style.maxWidth = w;
 const modalText = elk('.modal-text');if (modalText) modalText.textContent = text;
}
function showModalTr(wb){ // Закрытие по клику на оверлей
  let key=getWordKey(wb);
  let text = gm_dict2.get(key) || '???';
  log('showModalTr: '+ key+'/'+text);
  if(text==='???'){showModalEd(key);return 1;}
  text=text.replace(/,/g,', ').replace(/[ ]+/g,' ');
  show_msg_center(text);
  const modalWord = elk('.modal-word'); if(modalWord) modalWord.innerHTML = '' + key;
  g_modal = el('id_show_big_tr'); if (g_modal) g_modal.classList.add('visible');
  return 2;
}
function hideModal(){if(g_modal) g_modal.classList.remove('visible');}
function showModalEd(key){
  putText('id_modal-word',key);
  const input = el('id_modal-input'); if(input) input.value = getTran(key);
  g_modal=el('id_edit_big_tr'); if(g_modal) g_modal.classList.add('visible');
}
function saveModalEd(){
  let key = getText('id_modal-word'); key=normKey(key);
  let val = ''+el('id_modal-input').value; val=normText(val);
  if(key)if(val){
    gm_dict2.set(key,val);
    miniRender(key,val,'');
    saveToIDB(key,val);
  }
  hideModal();
}
//Выводит список слов из текста с подробным переводом из gm_dict2
function closeWordList(){
  el('id_dict_container').innerHTML='';
  el('id_mainGrid').classList.remove('hide');
  el('id_wordsList').classList.add('hide');
}
function showListWords(){ //долгая
  if(startBusy('showListWords','начало рендера3='+gm_dict2.size,1000))return 0;
  el('id_mainGrid').classList.add('hide');
  el('id_wordsList').classList.remove('hide');
  const container = el('id_dict_container');
  container.innerHTML='';
  let keys=keysOfMap(gm_dict2); keys.sort(); //нужна сортировка
// --- Рендерим все карточки
  // --- Шаг 1: Массовая генерация HTML (ОПТИМИЗАЦИЯ №1) ---
  // Собираем одну гигантскую строку вместо 2000+ вставок в DOM.
  // "магическая" длина для быстрой проверки. 200 - хорошее начало.
  const OVERFLOW_CHECK_LENGTH = 200;
  let htmlBatch = '';
  container.className='dict-word';
  let hb=container.clientHeight;
  for(let key of keys){
    const word = escapeHTML(key);
    const tran = escapeHTML(gm_dict2.get(key));

    let h=`<b>${word}<\/b>${tran}`;
    let o='dict-word';
    if(h.length > OVERFLOW_CHECK_LENGTH || h.includes('\n')){
      container.innerHTML = h;
      if(container.scrollHeight > hb)o='dict-word over';
    }
    if(gm_lw.get(key))o+=' lw';
    h=`<div class="${o}">${h}<\/div>`;
    htmlBatch +=h ;
  }
  // --- Шаг 2: Единая вставка в DOM ---
  container.className='';
  container.innerHTML = htmlBatch;
  endBusy('showListWords','конец рендера3');
}
  // --- Шаг 4: Единый обработчик событий ---
  // Вешаем ОДИН клик на весь контейнер. Он будет ловить клики
function container_click(event){
 event.preventDefault();
 const target = event.target;
 // Ищем ближайшего родителя с классом .dict-entry/ Это и есть "карточка", на которую кликнули
 const entry = target.closest('.dict-word');
 if(!entry) return; // Если клик был мимо (например, по пустому месту в grid)
 // --- Логика кликов (ОПТИМИЗАЦИЯ 5) ---
 if(entry.classList.contains('full')){
  log('Случай 2: Клик по уже раскрытому полю (сворачивание)');
  entry.classList.add('over');
  entry.classList.remove('full');
  return;
 }
 if(entry.classList.contains('over')){
  log('случай 3: Клик по свернутому полю, но *не* по кнопке.');
  entry.classList.add('full');
  entry.classList.remove('over');
  return;
 }
}
 // Поиск и прокрутка
 function search_word(){
  const searchTerm = el('id_search_input').value.toLowerCase();
  if(!searchTerm)return;
  const container = el('id_dict_container');
  const pairs = container.children;
  for(let pair of pairs){
    const word = pair.textContent.toLowerCase();
    if(word.startsWith(searchTerm)){
     //pair.scrollIntoView({ behavior: 'smooth' }); //плавно
     pair.scrollIntoView();
     pair.style.backgroundColor = 'aquamarine';
     setTimeout((z)=>{pair.style.backgroundColor = '';}, 2000);
     break;
    }
  }
}

