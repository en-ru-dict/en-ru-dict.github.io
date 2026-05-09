function elv(id,v,d){
	var e=document.getElementById(''+id);
	if(!e){
	 if(v===0)return null;//mute tiho
	 alert('нет элемента='+id);return null;
	}
	if(v==='v' || v==='val'){if(!e.value)return 0;       if(d===undefined)return e.value;      e.value=''+d;      return 1;}
	if(v==='h' || v==='htm'){if(!e.innerHTML)return 0;   if(d===undefined)return e.innerHTML;  e.innerHTML=''+d;  return 1;} 
	if(v==='t' || v==='txt'){if(!e.textContent)return 0; if(d===undefined)return e.textContent;e.textContent=''+d;return 1;}
	return e;
}
function els(s,del){var e=document.querySelectorAll(''+s);if(del)e.forEach(b=>b.remove());return e;}
function css_var(v,d){document.documentElement.style.setProperty(''+v,''+d);}
function bg(x){document.body.style.backgroundColor=x;}
window.g_log='>';
function log(t,o){ if(!o) o='';
 if(window['g_log']) g_log+= t+'/'+o+'\n';
 //if(o)console.log(''+t,o);else console.log(''+t);
}
function del_video(e){ // Уничтожаем видеоэлемент
 try{e.removeAttribute('src'); e.load(); e.remove(); e = null;} // Принудительная выгрузка
 catch(e){}
}
function del_canvas(e){ // Очищаем холст
 try{e.width = 0; e.height = 0; e.remove();}
 catch(e){}
}
//Освобождаем Blob URL
function del_blob(url){try{URL.revokeObjectURL(url);} catch(e){}}
function getMaxTextureSize(){// макс размер текстуры WebGL (или 4096)
  let c=document.createElement('canvas');
  let gl=c.getContext('webgl')||c.getContext('experimental-webgl');
  return gl?gl.getParameter(gl.MAX_TEXTURE_SIZE)||4096:4096;
}
let g_webpSupport=null;   // кэш поддержки webp-encode
async function isWebpEncodeSupported(){ // проверка именно кодирования webp (не только показа)
  if(g_webpSupport!==null)return g_webpSupport;
  let tc=document.createElement('canvas');tc.width=tc.height=1;
  let tctx=tc.getContext('2d');tctx.fillStyle='#f00';tctx.fillRect(0,0,1,1);
  return new Promise(r=>{
    tc.toBlob(b=>{g_webpSupport=!!(b&&b.type==='image/webp');r(g_webpSupport);},'image/webp',0.5);
  });
}
function getUserDeviceParams(){ // просто лог устройства (для отладки)
  log('device: maxTex='+getMaxTextureSize()+' memGB='+(navigator.deviceMemory||'??'));
}
async function load_js(name){
  console.log('load_js: началась загрузка ' + name);
  var id='id_js_'+name;
  els('#'+id,'del');
  const scriptLoaded = await new Promise(r => {
    const s = document.createElement('script');
    s.onload = () => r(1);//ok
    s.onerror = () => r(0);//err
    s.id=id;
    s.src = name;
    document.head.appendChild(s);
  });
  return scriptLoaded;
}
function set_css_grid(w,h,t){
 css_var('--wz',w+'px');
 css_var('--hz',h+'px');
 css_var('--time',t+'s');
}
var g_url='';
function get_url(b){ //blob
 try {URL.revokeObjectURL(g_url);} catch(e){}
 g_url=URL.createObjectURL(b);
 return g_url;
}
async function pause(t){await new Promise(r => setTimeout(r, t));}
var g_timer_start=0;
function set_timer(){g_timer_start = performance.now();}
function get_timer(){return performance.now()-g_timer_start;}
// --- быстрый hash 
function fastHash(data) {
 let h=0, s=0;
 for(let i = 0; i < data.length; i += 123){s+=data[i]; h = ((h << 5) - h + data[i]);}
 if(s == 0) return 0;
 return h;
}

