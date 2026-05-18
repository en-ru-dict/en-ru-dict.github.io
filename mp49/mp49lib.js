//общая либа для всех режимов
let g={};
g.mp4_status='idle'; // busy/ok/error
g.rawFrames=[];
g.num_frame=0;
g.prevHash=[];
g.dubli=0;
g.speed=0;
g.video=null;
g.step=0;
g.rows=0;
g.cols=0;
g.frames=0;
g.canvas=null;
g.ctx=null;
g.w=0;
g.h=0;
let g_spriteBlob=null;    // готовый blob спрайта (глобальный)
var g_time=[];


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
function make_canvas(){//для скорости делаем заранее
  for(let i=0;i<=g.frames;i++){
   let c = document.createElement('canvas');
   c.width=g.w; c.height=g.h;
   g.rawFrames.push(c);
  }
}
function grab_frame(){
      g.ctx.drawImage(g.video, 0, 0, g.w, g.h);
      const data = g.ctx.getImageData(0, 0, g.w, g.h).data;
      const hash = fastHash(data);
      if(hash == 0){ log('pusto='+g.video.currentTime); return 0; }
      if(g.prevHash.includes(hash)){ g.dubli++; g.speed++; return 0; }
      //ура нашли
      g.prevHash.push(hash);g_time.push(g.video.currentTime);
      g.rawFrames[g.num_frame].getContext('2d').drawImage(g.canvas, 0, 0, g.w, g.h);
      g.speed--;
      g.num_frame++;
      return 1;
}
// --- ПРАВИЛЬНЫЙ waitSeek
var g_seek_timer=null;
function waitSeekSafe(targetTime){
  return new Promise(resolve => {
    let done = false;
    const finish = () => {
      if(done) return;
      done = true;
      g.video.removeEventListener('seeked', onSeeked);
      clearTimeout(g_seek_timer);
      resolve();
    };
    const onSeeked = () => {finish();};
    g.video.addEventListener('seeked', onSeeked, { once: true });
    g.video.currentTime = targetTime;
    g_seek_timer=setTimeout(()=>{log('seek_timeout='+targetTime);finish();}, 500);
  });
}
async function seek_frames(frames,v=1){
  let ctx = g.canvas.getContext('2d', { willReadFrequently: true });
  if(!ctx){alert('no 2d context'); g.mp4_status = 'error'; return 0;}
  g.canvas.width=g.w; g.canvas.height=g.h;
  
  log('step='+g.step);
  
  g.rawFrames = []; 
  g.prevHash = [];
  let maxAttempts = 10;
  let dynamicDelay = 10;

  for(let t = 0; t < frames; t++){
	if(v)progressBar(t,frames);
    await waitSeekSafe(g.step*t + 0.01);//поправка

    let attempts = 0;
    let success = false;

    while(attempts < maxAttempts && !success) {
      attempts++;
      await new Promise(r => setTimeout(r, dynamicDelay));//=sleep=pause
      ctx.drawImage(g.video,0,0,g.w,g.h);
      const data = ctx.getImageData(0,0,g.w,g.h).data;
      const hash = fastHash(data);     
      if(hash==0){ log('pusto='+t); dynamicDelay += 10; continue;}
      if(g.prevHash.includes(hash)){ log('dubl='+t); dynamicDelay += 10; continue;}
      success = true;//ура нашли
      g.prevHash.push(hash);dynamicDelay = Math.max(5, dynamicDelay - 1);
      g.rawFrames.push(data);
    } //end while
  }//end for
}
function best_size(scale){
  //уменьшение размеров спрайта для слабых телефонов
  let fW=g.video.videoWidth,fH=g.video.videoHeight;
  fW=Math.floor(fW*scale); fH=Math.floor(fH*scale);
  let sW=g.cols*fW,sH=g.rows*fH;
  let maxT=getMaxTextureSize();
  if(sW>maxT||sH>maxT){
    let newS=Math.min(maxT/sW,maxT/sH);
    log('scale reduced '+scale+'x'+newS+' (texture limit)');
    fW=Math.floor(fW*newS); fH=Math.floor(fH*newS);
    sW=g.cols*fW; sH=g.rows*fH;
  }
  log('итоговый размер спрайта sW='+sW+'/sH='+sH+'/fW='+fW+'/fH='+fH);
  g.w=fW; g.h=fH;
}
