let g_mp4_status='idle'; // busy/ok/error
let g_spriteBlob=null;    // готовый blob спрайта (глобальный)
let g_webpSupport=null;   // кэш поддержки webp-encode
let g_preloadCallback=null;

function log(t,o){ if(!o) o='';
 if(window['g_log']) g_log+= t+'/'+o+'\n';
 //if(o)console.log(''+t,o);else console.log(''+t);
}
function getMaxTextureSize(){// макс размер текстуры WebGL (или 4096)
  let c=document.createElement('canvas');
  let gl=c.getContext('webgl')||c.getContext('experimental-webgl');
  return gl?gl.getParameter(gl.MAX_TEXTURE_SIZE)||4096:4096;
}
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
  log('load_js: началась загрузка ' + name);
  const scriptLoaded = await new Promise(r => {
    const s = document.createElement('script');
    s.onload = () => r(1);
    s.onerror = () => r(0);
    s.src = name;
    document.head.appendChild(s);
  });
  return scriptLoaded;
}
var g_url='';
function get_url(){ //blob
 try {URL.revokeObjectURL(g_url);} catch(e){}
 g_url=URL.createObjectURL(g_spriteBlob);
 return g_url;
}

function fullCompare(a, b){//для четных длинн! у нечетных последний не сравнивается
  if(a.length !== b.length) return false;
  let i,q=a.length >> 1,qq=q+q; //делим на 2
  for(i = q; i < qq ; i++){
    if(a[i] !== b[i]) return false;
    if(a[qq-i] !== b[qq-i]) return false;
  }  
  return true;//одинаковые
}
  // --- быстрый hash (ещё дешевле)
function fastHash(data) {
 let h = 0;
 const len = data.length;
 const step = 13;//(len / 64) | 0;
 for(let i = 0; i < len; i += step) {  h = ((h << 5) - h + data[i]) | 0; }
 return h;
}
function isEmptyFrame(data) {
 for(let i = 0; i < data.length; i += 257) if(data[i] !== 0) return false; 
 return true;
}
 // --- ПРАВИЛЬНЫЙ waitSeek
var g_seek_timer=null;
function waitSeekSafe(targetTime,el_video) {
  return new Promise(resolve => {
    let done = false;
    const finish = () => {
      if(done) return;
      done = true;
      el_video.removeEventListener('seeked', onSeeked);
      clearTimeout(g_seek_timer);
      resolve();
    };
    const onSeeked = () => {finish();};
    el_video.addEventListener('seeked', onSeeked, { once: true });
    el_video.currentTime = targetTime; 
    g_seek_timer=setTimeout(()=>{log('seek_timeout='+targetTime);finish();}, 500);
  });
}
//=============================================
var g_timer_start=0;
async function sprite_preload(name,cols,rows,scale=1,bg=''){ // ОСНОВНАЯ ФУНКЦИЯ
  g_timer_start = performance.now();
  g_mp4_status='busy';
  log('preload-start='+name);
  getUserDeviceParams();
  let video=null;

  try{
    video=els('video')[0];//document.createElement('video'); 
    video.muted=true; video.playsInline=true;
     //document.body.appendChild(video);
    if(location.protocol==='file:'){ // file:// режим: грузим .js с base64
      name+='.js';
      log('локальный режим file://, грузим запасной mp4.js');
      var rr=await load_js(name);
      if(!rr){alert('нет скрипта='+name); g_mp4_status = 'error'; return 0;}
      if(!window['g_mp4']){alert('нет внутри g_mp4');g_mp4_status = 'error'; return 0;}
      video.src=window['g_mp4'];window['g_mp4']=null;
    } else video.src=name; // обычный http/https

    video.onerror=(e)=>log('video error',e);
    video.onloadedmetadata=()=>log('video onloadedmetadata');    
    video.onloadeddata=()=>log('video onloadeddata');    
    video.onloadend=()=>log('video onloadend');    
    video.load();

    await video.play().catch(()=>{});
    await new Promise(res=>{ if(video.readyState>=2) res(); else video.onloadeddata=res;});
    await video.pause();
log('readyState4='+video.readyState);
    if(!video.videoWidth){alert('error videoWidth=0'); g_mp4_status = 'error'; return 0;}
    log('video loaded '+video.videoWidth+'×'+video.videoHeight+' time='+video.duration);
//уменьшение размеров спрайта для слабых телефонов
    let fW=video.videoWidth,fH=video.videoHeight;
    fW=Math.floor(fW*scale); fH=Math.floor(fH*scale);
    let sW=cols*fW,sH=rows*fH;

    let maxT=getMaxTextureSize();
    if(sW>maxT||sH>maxT){
      let newS=Math.min(maxT/sW,maxT/sH);
      log('scale reduced '+scale+'x'+newS+' (texture limit)');
      fW=Math.floor(fW*newS);fH=Math.floor(fH*newS);
      sW=cols*fW;sH=rows*fH;
    }
log('итоговый размер спрайта sW='+sW+'/sH='+sH+'/fW='+fW+'/fH='+fH);

//extractVideoFramesV2 
  video.pause();
  let canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d', { willReadFrequently: true });
  if(!ctx){alert('no 2d context'); g_mp4_status = 'error'; return 0;}
  canvas.width=sW;canvas.height=sH;
  let frames=cols*rows;
  let step=video.duration/frames || 0.1;
log('step='+step);
  let rawFrames = []; // для финальной проверки
  let prevHash = 0;
  let maxAttempts = 10;
  let dynamicDelay = 10;
 
for(let t = 0; t < frames; t++){progressBar(t,frames);
    const targetTime = step*t + 0.02; //поправка
    await waitSeekSafe(targetTime,video);

    let attempts = 0;
    let success = false;

    while(attempts < maxAttempts && !success) {
      attempts++;
      await new Promise(r => setTimeout(r, dynamicDelay));//=sleep=pause
      ctx.drawImage(video, 0, 0, fW, fH);
      const data = ctx.getImageData(0, 0, fW, fH).data;
      if(isEmptyFrame(data)){
        log('pusto='+t); 
        dynamicDelay += 10;
        continue;
      }
      const hash = fastHash(data);
      if(hash === prevHash){
        log('dubl='+t);
        dynamicDelay += 10;
        continue;
      }
      success = true;//ура нашли
      prevHash = hash; dynamicDelay = Math.max(5, dynamicDelay - 1);
      rawFrames.push(data);
    } //end while
  }//end for
  const end = performance.now();
log(`кадры нашла: ${(end - g_timer_start).toFixed(0)}ms/`+rawFrames.length);
  // --- очистка
  //del_video(video); 
  del_canvas(canvas); ctx=null;

  let finalRaw=[];
  finalRaw.push(rawFrames[0]);
  for (let i = 1; i < rawFrames.length; i++) {
    let duplicate = false;
    if(fullCompare(rawFrames[i], rawFrames[i-1])) {
        duplicate = true;log('dubl='+i);
        break;
    }
    if(!duplicate) finalRaw.push(rawFrames[i]);
  }
  rawFrames=[];
log('После полной проверки кадров=', finalRaw.length);
if(finalRaw.length<frames)alert('были дубли или пусто');

  const spriteCanvas = document.createElement('canvas');
  ctx = spriteCanvas.getContext('2d');
  spriteCanvas.width = fW * cols; 
  spriteCanvas.height = fH * rows;
  let x=0,y=0;
  for(let i=0; i < finalRaw.length; i++){
    const imgData = new ImageData(finalRaw[i], fW, fH);
    ctx.putImageData(imgData, fW*x, fH*y);
    x++; if(x==cols){y++;x=0;}
  }
  finalRaw=[];
log('спрайт готов='+frames);progressBar(frames,frames);

    // chroma-key rgb (если передан bg) если webp не поддерживает то лучше сетка
  if(bg){  
      log('замена='+bg+' на прозрачный цвет');
      let r=255,g=255,b=255,tol=10;
      if(bg[0]==='#'){let h=bg.slice(1);r=parseInt(h.slice(0,2),16)||0;g=parseInt(h.slice(2,4),16)||0;b=parseInt(h.slice(4,6),16)||0;}
      removeBgHSV(ctx, sW, sH, r,g,b); 
  }
  // выбираем лучший формат
  let mime='image/png',qual=1;
  if(!bg){mime='image/jpeg';qual=0.92;}
  else if(await isWebpEncodeSupported()){mime='image/webp';qual=0.85;}

  g_spriteBlob=await new Promise(res=>spriteCanvas.toBlob(res,mime,qual));
  del_canvas(spriteCanvas);
log('sprite ready '+g_spriteBlob.type+' '+Math.round(g_spriteBlob.size/1024)+'кб');
    g_mp4_status='ok';
    const end2 = performance.now();
    log(`Общее Время: ${(end2 - g_timer_start).toFixed(0)}ms`);
    return get_url();//ok
  }catch(e){
    alert('PRELOAD ERROR:'+e);
    g_mp4_status='error';
  }

} //end preload

function del_video(e){ // Уничтожаем видеоэлемент
 try{e.removeAttribute('src'); e.load(); e.remove(); e = null;} // Принудительная выгрузка
 catch(e){}
}
function del_canvas(e){ // Очищаем холст
 try{e.width = 0; e.height = 0; e.remove();}
 catch(e){}
}
//Освобождаем Blob URL
function del_blob(url){URL.revokeObjectURL(url);}

function set_css_grid(w,h,t){
 css_var('--wz',w+'px'); 
 css_var('--hz',h+'px');
 css_var('--time',t+'s');
}
//document.documentElement.style.getPropertyValue('--wz')
function gen_css_grid(nx,ny){
 var i;
 var css=`
:root {
  --wz: 500px; --hz: 500px;
  --time:5s;
`;
 for(i=1;i<nx;i++){ css+=`--w${i}: calc(var(--wz) * -${i});\n`;}
 for(i=1;i<ny;i++){ css+=`--h${i}: calc(var(--hz) * -${i});\n`;}

 css+=`
}
.mp49 {position:absolute; width: var(--wz); height: var(--hz); overflow:hidden;}
.mp49 img {
  position:absolute; width: ${nx*100}%; height:${ny*100}%; 
  animation: tr${nx*ny} var(--time) steps(1) infinite alternate;
}
.mp49 img[src='']{animation:none;}
`;
 var frames=nx*ny, step=100/frames,x=0,y=0,s='';
 css+='@keyframes tr'+frames +' {\n';
 for(i=0;i<frames;i++){
  s=`%  {transform: translate(var(--w${x}), var(--h${y}));}\n`;
  css+=' '+Math.round(i*step)+s;
  x++;if(x==nx){y++;x=0;css+='\n';}
 }
 css+= '100'+s;
 css+='}\n';
 css=css.replace(/var\(--w0\)/g,0);
 css=css.replace(/var\(--h0\)/g,0);
 return (css);
}
function load_css_htm(t){
 var st=document.createElement('style'); st.textContent=t;
 document.head.appendChild(st);
}

// === Progress Bar Utility ========================================
// Update progress bar based on done/total
window.g_progress = { el: null, timer: null, lastUpdate: 0, hideDelay: 5000 };

function progressBar(done, total) {
  if (!total || total <= 0) total = 1;

  const percent = Math.min(100, Math.floor((done / total) * 100));
  const text = `${done}/${total} (${percent}%)`;

  if (!g_progress.el) createProgressBar();

  const bar = g_progress.el.querySelector('.bar-fill');
  const label = g_progress.el.querySelector('.bar-label');

  label.textContent = text;
  bar.style.width = percent + '%';
  bar.style.background = colorByPercent(percent);
  g_progress.el.style.display = 'flex';
  g_progress.lastUpdate = Date.now();

  // Automatically hide after 3 seconds without updates
  clearTimeout(g_progress.timer);
  g_progress.timer = setTimeout(() => {
    const dt = Date.now() - g_progress.lastUpdate;
    if (dt > g_progress.hideDelay) hideProgressBar();
  }, g_progress.hideDelay);

  if (percent >= 100) setTimeout(hideProgressBar, 500);
}
// ================================================================
// Progress Bar Colors & Modal Display / Edit Utilities
// ================================================================

// Hide progress bar
function hideProgressBar() {
  if (g_progress.el) g_progress.el.style.display = "none";
}

// Return color based on percentage
function colorByPercent(p) {
  let color = 'black';
  if (0 <= p && p <= 20) color = '#FF4D4D';   // bright red
  if (20 < p && p <= 40) color = '#FF9933';   // orange-red
  if (40 < p && p <= 60) color = '#FFE600';   // yellow
  if (60 < p && p <= 80) color = '#99CC33';   // light green
  if (80 < p && p <= 100) color = '#00CC66';  // strong green
  return color;
}
// Create a visual progress.
function createProgressBar() {
  const div = document.createElement('div');
  div.className = 'progress-overlay';
  div.innerHTML = `
    <div class="progress-box">
      <div class="bar-label">[·Loading...·]<\/div>
      <div class="bar-frame">
        <div class="bar-fill"><\/div>
      <\/div>
    <\/div>
  `;
  document.body.appendChild(div);
  g_progress.el = div;
}
function rgbToHsl(r,g,b){
  r/=255;g/=255;b/=255;
  let max=Math.max(r,g,b),min=Math.min(r,g,b);
  let h,s,l=(max+min)/2;
  if(max===min){h=s=0}else{
    let d=max-min;
    s=l>0.5?d/(2-max-min):d/(max+min);
    switch(max){
      case r:h=(g-b)/d+(g<b?6:0);break;
      case g:h=(b-r)/d+2;break;
      case b:h=(r-g)/d+4;
    }h/=6;
  }
  return[h*360,s*100,l*100];
}

function removeBgHSV(ctx, w, h, r,g,b) {
//hsl(27,76,79),
 var [th,ts,tl]=rgbToHsl(r,g,b);
log('hsl='+th+'/'+ts+'/'+tl);
 var tolH=12,tolS=25,tolL=25;
  const img = ctx.getImageData(0,0,w,h);
  const src = img.data;

 for(let i=0;i<src.length;i+=4){
    const r=src[i],g=src[i+1],b=src[i+2];
  
    const [ph,ps,pl] = rgbToHsl(r,g,b);
    const dh = Math.min(Math.abs(ph-th), 360-Math.abs(ph-th));
    if(dh<=tolH && Math.abs(ps-ts)<=tolS && Math.abs(pl-tl)<=tolL) src[i+3]=0;
  //гладкие края?
//    if(dh<12 && ps>0.2){const alpha = 1 - (dh / 12); src[i+3] *= (1 - alpha);}
  }
  ctx.putImageData(img,0,0);
}
function rgb3(bg){
 let h=bg.slice(1);
 r=parseInt(h.slice(0,2),16)||0;
 g=parseInt(h.slice(2,4),16)||0;
 b=parseInt(h.slice(4,6),16)||0;
 return [r,g,b];
}

// Запусти это ДО preload() чтобы понять, что происходит
async function diagnose_video_api(videoFile) {
  console.log('=== VIDEO API DIAGNOSIS ===');
  
  const video = document.createElement('video');
  video.muted = true;
  video.crossOrigin = 'anonymous';
  //document.body.appendChild(video);
  
  // 1. Проверяем поддержку кодеков
  console.log('📹 Supported Codecs:');
  const codecs = {
    'video/mp4': video.canPlayType('video/mp4; codecs="avc1.42E01E"'),
    'video/mp4 (h265)': video.canPlayType('video/mp4; codecs="hev1.1.6.L93.B0"'),
    'video/webm': video.canPlayType('video/webm; codecs="vp9"'),
    'video/webm (vp8)': video.canPlayType('video/webm; codecs="vp8"'),
    'video/ogg': video.canPlayType('video/ogg; codecs="theora"')
  };
  Object.entries(codecs).forEach(([name, support]) => {
    console.log(`  ${name}: ${support || 'NOT SUPPORTED'}`);
  });
  
  // 2. Проверяем readyState
  console.log('\n📊 Video ReadyState:');
  console.log('  HAVE_NOTHING:', video.HAVE_NOTHING);
  console.log('  HAVE_METADATA:', video.HAVE_METADATA);
  console.log('  HAVE_CURRENT_DATA:', video.HAVE_CURRENT_DATA);
  console.log('  HAVE_FUTURE_DATA:', video.HAVE_FUTURE_DATA);
  console.log('  HAVE_ENOUGH_DATA:', video.HAVE_ENOUGH_DATA);
  
  // 3. Загружаем видео и смотрим события
  console.log('\n⏱️ Event Timeline:');
  const eventLog = [];
  
  const logEvent = (e) => {
    const time = performance.now();
    console.log(`  [${time.toFixed(0)}ms] ${e.type} | readyState=${video.readyState} | currentTime=${video.currentTime.toFixed(3)}`);
    eventLog.push({ type: e.type, time, readyState: video.readyState });
  };
  
  ['loadstart', 'progress', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough', 'playing', 'pause', 'seeking', 'seeked', 'timeupdate'].forEach(evt => {
    video.addEventListener(evt, logEvent);
  });
  
  video.src = videoFile;
  video.load();
  
  // 4. Ждём loadedmetadata и проверяем видео
  await new Promise(r => video.addEventListener('loadedmetadata', r));
  
  console.log('\n🎬 Video Properties:');
  console.log(`  Duration: ${video.duration.toFixed(2)}s`);
  console.log(`  Width x Height: ${video.videoWidth} x ${video.videoHeight}`);
  console.log(`  ReadyState: ${video.readyState}`);
  console.log(`  NetworkState: ${video.networkState}`);
  console.log(`  Buffered: ${video.buffered.length} ranges`);
  
  // 5. Тестируем seek на разные позиции
  console.log('\n🎯 Seek Test (50ms intents):');
  for(let t = 0.1; t <= Math.min(1, video.duration - 0.2); t += 0.3) {
    console.log(`\n  → Seeking to ${t.toFixed(2)}s:`);
    video.currentTime = t;
    
    // Ждём события
    let seeked = false;
    const seekTimeout = new Promise(r => {
      const onSeeked = () => {
        console.log(`    ✅ seeked event at ${video.currentTime.toFixed(3)}s`);
        seeked = true;
        video.removeEventListener('seeked', onSeeked);
        r();
      };
      video.addEventListener('seeked', onSeeked, { once: true });
      setTimeout(() => {
        if(!seeked) {
          console.log(`    ⏱️  timeout, currentTime is ${video.currentTime.toFixed(3)}s`);
          video.removeEventListener('seeked', onSeeked);
          r();
        }
      }, 500);
    });
    
    await seekTimeout;
  }
  
  // 6. Тестируем draw в canvas
  console.log('\n🖼️ Canvas Draw Test:');
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  
  video.currentTime = 0.5;
  await new Promise(r => setTimeout(r, 100));
  
  try {
    ctx.drawImage(video, 0, 0, 100, 100);
    const imageData = ctx.getImageData(0, 0, 10, 10).data;
    const hasPixels = imageData.some(p => p > 0);
    console.log(`  ✅ Draw successful, has pixels: ${hasPixels}`);
    console.log(`  First 4 pixels (RGBA): ${Array.from(imageData.slice(0, 4)).join(',')}`);
  } catch(e) {
    console.log(`  ❌ Draw failed: ${e.message}`);
  }
  
  // 7. Система
  console.log('\n💻 System Info:');
  console.log(`  UserAgent: ${navigator.userAgent}`);
  console.log(`  Platform: ${navigator.platform}`);
  console.log(`  HW Concurrency: ${navigator.hardwareConcurrency}`);
  console.log(`  Device Memory: ${navigator.deviceMemory}GB`);
  console.log(`  Connection: ${navigator.connection?.effectiveType || 'unknown'}`);
  console.log(`  Screen: ${window.innerWidth}x${window.innerHeight}`);
  

  document.body.removeChild(canvas);
  
  return { eventLog, videoProps: { duration: video.duration, width: video.videoWidth, height: video.videoHeight } };
}

// Запускаем диагностику
//diagnose_video_api('mirror.mp4');

async function pause(t){await new Promise(r => setTimeout(r, t));}
