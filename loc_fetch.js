//XingSoft*2026 /либа делает подмену fetch() и правит CORS + MIME
// --- LocFetch Engine (v7) /Protocol: Data[0...N-1] + Checksum[N]
// Checksum Algorithm: Rolling Hash (s * 31 + val) & 255
// Без кэширования. Максимальная совместимость (2020+, Mobile, Opera Mini)

window.g_mode_fetch = 3; // online
if(window.location.protocol === 'file:') g_mode_fetch = 1;
if(window.location.host === 'localhost' || location.host === '127.0.0.1') g_mode_fetch = 2;

// Глобальные настройки управления
if(window.g_fch_FLAG === undefined)           window.g_fch_FLAG = {};
if(window.g_fch_FLAG.log === undefined)       window.g_fch_FLAG.log = 1;
if(window.g_fch_FLAG.alert === undefined)     window.g_fch_FLAG.alert = 1;

//режим одного источника всегда ищет .js
if(window.g_fch_FLAG.file === undefined) window.g_fch_FLAG.file = 0;
window.g_fch_msg = '/'; //если пусто, то не пишет
window.g_fch_busy = 0;

// --- Секция: Логирование и Ошибки ---
function fch_msg(s,o){
  if(!g_fch_FLAG.log) return;
  var t = '[' + new Date().toLocaleTimeString() + '] ' + s;
  if(g_fch_msg) g_fch_msg += t + '\n';
  if(o) console.log(t, o); else console.log(t);
}
function fch_err(s){
  var t = 'Fetch Error: ' + s; fch_msg(t);
  if(g_fch_FLAG.alert) alert(t);
  else {throw new Error(t);}
}
// --- Контроль целостности ---
function fch_ks(u8){ var i=0, sum=0;
  // Классический цикл - самый быстрый для мобильных движков
  for(i=0; i < u8.length; i++) sum = (sum * 31 + u8[i]) & 255;
  return sum & 255;
}
function fch_check_ks(u8,mode){
  if(!u8 || u8.length < 1) {alert('пустой массив?'); return null;}
  var res = u8.slice(0, -1), ks = u8[u8.length - 1];
  if(fch_ks(res) !== ks){
    fch_msg(`Ошибка КС: ${mode} (ожидали=${ks})`);
    return null;
  }
  return res;
}
// --- Парсинг и MIME ---
function fch_get_tabl(t,v,d){ var m, i, r;
  m = t.split('\n').map(z=>z.trim()).filter(z=>z);
  for(i=0; i<m.length; i++){
    r = m[i]+'|'; r = r.split('|').map(z=>z.trim());
    if(r[0] === v) return r[1];
  }
  return d;
}
function fch_mime(url){//таблица - легко добавить строку
 var p = fch_full_url(url); p = p.toLowerCase();
 if(p.endsWith('.txt.js')) return 'text/javascript';
 var ext = p.split('.').pop();
 var types = `
wasm|  application/wasm
js|    text/javascript
css|   text/css
htm|   text/html
html|  text/html
png|   image/png
jpg|   image/jpeg
jpeg|  image/jpeg
gif|   image/gif
svg|   image/svg+xml
mp4|   video/mp4
mp3|   audio/mpeg
`;
 return fch_get_tabl(types,ext,'application/octet-stream');
}
function fch_make_NativeResponse(data,url){
  var mimeType = fch_mime(url);
  // Blob - лучший выбор для совместимости с медиа и WASM
  var blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
  var headers = new Headers({
    'Content-Type': mimeType,
    'Access-Control-Allow-Origin': '*',
    'Accept-Ranges': 'bytes'
  });
  var res = new Response(blob, { status: 200, statusText: 'OK', headers: headers });
  // Критично для совместимости с библиотеками (sql-wasm, pyodide и др.)
  try {
    Object.defineProperty(res, 'url', {
      value: url, writable: false, configurable: true, enumerable: true
    });
  }
  catch(e){ fch_msg('Object.defineProperty fail (non-critical)'); }
  return res;
}
// --- Секция: Декодеры нормальная (из fetch_sidecar_js)---
function fch_dec64(s){var b,le,u,i;
  b = atob(s); le = b.length; u = new Uint8Array(le);
  for(i = 0; i < le; i++) u[i] = b.charCodeAt(i);
  return u;
}
function fch_dec85(s){ var i,j,m,r,o,dv,p,t;
  t = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#";
  m = new Uint8Array(128); for(i=0;i<85;i++) m[t.charCodeAt(i)]=i;
  r = s.length % 5; p = s + (r ? "#".repeat(5 - r) : "");
  o = new Uint8Array(p.length / 5 * 4); dv = new DataView(o.buffer);
  for(i=0,j=0; i < p.length; i+=5,j+=4) dv.setUint32(j, m[p.charCodeAt(i)] * 52200625 + m[p.charCodeAt(i + 1)] * 614125 + m[p.charCodeAt(i + 2)] * 7225 + m[p.charCodeAt(i + 3)] * 85 + m[p.charCodeAt(i + 4)]);
  return r ? o.slice(0, r-5) : o;
}
function fch_dec122(s){var i,p,d,di,bb,bc,c,il,m;
  m = new Uint8Array([0,10,13,34,38,92]);
  d = new Uint8Array(s.length * 2);
  di = 0; bb = 0; bc = 0;
  p = (b)=>{ bb = (bb << 7) | b; bc += 7; if(bc >= 8){ bc -= 8; d[di++] = (bb >>> bc) & 255; bb &= (1 << bc) - 1; } };
  for(i = 0; i < s.length; i++){ c = s.charCodeAt(i); if(c > 127){ il = (c >>> 8) & 7; if(il !== 7) p(m[il]); p(c & 127); } else p(c); }
  return d.slice(0,di);
}
// Обработка Sidecar (Данные из внешних скриптов) ---
function fch_decode_from_globals(name){ var d,n;
  n=(name)? name+'_':''; n='g_'+n+'base';
  if(window[n+'64']){d=fch_dec64(window[n+'64']);window[n+'64']='';d=fch_check_ks(d,'Base64');if(d)return d;}
  if(window[n+'85']){d=fch_dec85(window[n+'85']);window[n+'85']='';d=fch_check_ks(d,'Base85');if(d)return d;}
  if(window[n+'122']){d=fch_dec122(window[n+'122']);window[n+'122'] = '';d=fch_check_ks(d,'Base122');if(d)return d;}
  return null;
}
// Публичный метод для декодирования и получения URL (если скрипт был загружен вручную)
function locFetchDecodeUrl(name,url){var data,mime,blob;
  data = fch_decode_from_globals(name); mime = fch_mime(url);
  if(data) blob = new Blob([data], { type: mime });
  return URL.createObjectURL(blob);
}
// Загрузка sidecar.js через динамический скрипт
async function fch_load_sidecar(url){
  var u=fch_full_url(url); u= u+'.js';
  return new Promise((ok,er)=>{
    var sc = document.createElement('script');
    sc.src = u;
    window.g_base64=window.g_base85=window.g_base122 = ''; // очистка и создание
    sc.onload = ()=>{
      sc.remove();
      var d = fch_decode_from_globals(); if(d) ok(fch_make_NativeResponse(d,url));
      else er('Ошибка загрузки sidecar=' + u);
    };
    sc.onerror = ()=>{sc.remove(); er('Sidecar.js пропал?: ' + scriptUrl);};
    document.head.appendChild(sc);
  });
}
function fch_full_url(url){var p;
  p = '' + url; 
  try {p = new URL(p, location.href).href;}
  catch(e){ p = '' + url;}
  p = p.split('?')[0]; p = p.split('#')[0];
  return p;
}
// --- ПЕРЕХВАТЧИК FETCH ---
(function(){
 if(window.fetch === undefined){alert('fetch не поддерживается, обновите браузер'); return;}
 if(window.fch_orig === undefined) window.fch_orig = window.fetch;

 window.fetch = async function(url,init){var res,b,full;
  // если fetch(new Request(url)) то вызываем сразу оригигальный fetch, значит не хотим через перехватчик!
  if(typeof url !== 'string') return fch_orig(url,init);
  // Проверка состояния (только один запрос за раз)
  if(g_fch_busy){
    alert("LocFetch BUSY: вызывать только через await! или грузить нес-ко sidecar.js вручную и декодировать, но имена переменных должны быть разные");
    return new Response(null, {status: 503, statusText: 'BUSY'});
  }
  g_fch_busy = 1;
  try {
   full = fch_full_url(url);
   // 1. РЕЖИМ ЛОКАЛЬНОГО SIDECAR (file:// или принудительно через флаг один источник)
   if(g_mode_fetch === 1 || g_fch_FLAG.file){res = await fch_load_sidecar(full);return res;}
   // 2. СЕТЕВОЙ ЗАПРОС
   try {
    res = await fch_orig(url,init); if(!res.ok) return res;
    b = await res.arrayBuffer();
    return fch_make_NativeResponse(b,full);
   }
   catch(e1){//а вот тут если нету, то можно еще sidecar.js поискать вдруг есть на сервере
    fch_msg('По сети такого нету, поищем sidecar: ' + url);
    try { res = await fch_load_sidecar(full); }
    catch(e2) { res = new Response(null, {status: 404, statusText: e2}); }
    return res;
   }
  }
  catch(e){alert('случилась фигня какая-то='+e);}
  finally { g_fch_busy = 0; }
  };
})();
