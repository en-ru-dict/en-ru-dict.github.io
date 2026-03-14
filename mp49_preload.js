let g_mp4_status='idle'; // busy/ok/error
let g_spriteBlob=null;    // готовый blob спрайта (глобальный)
let g_webpSupport=null;   // кэш поддержки webp-encode
let g_preloadCallback=null;
function getMaxTextureSize(){ // макс размер текстуры WebGL (или 4096)
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
  console.log('device: maxTex='+getMaxTextureSize()+' memGB='+(navigator.deviceMemory||'??'));
}
async function load_js(name){
  console.log('load_js: началась загрузка ' + name);
  const scriptLoaded = await new Promise(r => {
    const s = document.createElement('script');
    s.onload = () => r(1);
    s.onerror = () => r(0);
    s.src = name;
    document.head.appendChild(s);
  });
  return scriptLoaded;
}
async function preload(name,cols,rows,scale=1,bg=''){ // ОСНОВНАЯ ФУНКЦИЯ
  const start = performance.now();
  g_mp4_status='busy';
  console.log('preload start='+name);
  getUserDeviceParams();
  let video=null;

  try{
    video=document.createElement('video'); video.muted=true; video.playsInline=true;
     document.body.appendChild(video);
    if(location.protocol==='file:'){ // file:// режим: грузим .js с base64
      name+='.js';
      console.log('локальный режим file://, грузим запасной mp4.js');
      var rr=await load_js(name);
      if(!rr){alert('нет скрипта='+name); g_mp4_status = 'error'; return 0;}
      if(!window['g_mp4']){alert('нет внутри g_mp4');g_mp4_status = 'error'; return 0;}
      video.src=window['g_mp4'];window['g_mp4']=null;
    } else video.src=name; // обычный http/https
    video.onerror=(e)=>alert('video error'+e);
    video.load();
    await video.play().catch(()=>{});
    await new Promise(res=>{ if(video.readyState>=2) res(); else video.onloadeddata=res;});
    await video.pause();
    if(!video.videoWidth){alert('error videoWidth=0'); g_mp4_status = 'error'; return 0;}
    console.log('video loaded '+video.videoWidth+'×'+video.videoHeight+' time='+video.duration);
   
    let fW=video.videoWidth,fH=video.videoHeight;
    let frames=cols*rows;

    let effScale=scale;
    let effFW=Math.floor(fW*effScale),effFH=Math.floor(fH*effScale);
    let sW=cols*effFW,sH=rows*effFH;

    let maxT=getMaxTextureSize();
    if(sW>maxT||sH>maxT){
      let newS=Math.min(maxT/(cols*fW),maxT/(rows*fH),scale);
      console.log('scale reduced '+scale+'→'+newS+' (texture limit)');
      effScale=newS;effFW=Math.floor(fW*effScale);effFH=Math.floor(fH*effScale);
      sW=cols*effFW;sH=rows*effFH;
    }
console.log('sW='+sW+' sH='+sH);
    let canvas=document.createElement('canvas');
    canvas.width=sW;canvas.height=sH;
    let ctx=canvas.getContext('2d');
    if(!ctx){alert('no 2d context'); g_mp4_status = 'error'; return 0;}

    let dur=video.duration;
    let step=frames>1?dur/(frames-1):0;
console.log('step='+step);
    let col,row,i,j,t,last,d,prev=[1];
    col=0;row=0;
    for(i=0;i<frames;i++){progressBar(i,frames);
     t=i*step;video.currentTime=t;
     await new Promise(r=>video.onseeked=r);
     ctx.drawImage(video,0,0,fW,fH,col*effFW,row*effFH,effFW,effFH);
//проверка дублей кадров
 last=ctx.getImageData(col*effFW,row*effFH,effFW,effFH).data;
 d=1;
 for(j=0;j<prev.length;j++)if(prev[j]!==last[j]){d=0;break;}
 if(d)console.log('DUPLICATE FRAME='+i);
 prev=ctx.getImageData(col*effFW,row*effFH,effFW,effFH).data;

	 document.title=i;
	 col++;if(col==cols){row++;col=0;}
    }
console.log('all frames ready');progressBar(frames,frames);

    // chroma-key rgb (если передан bg) если webp не поддерживает то лучше сетку грузить
    if(bg){
      console.log('chroma-key '+bg);
      let r=0,g=0,b=0,tol=10;
      if(bg.startsWith('rgb')){let m=bg.match(/rgb\((\d+),(\d+),(\d+)\)/);if(m){r=+m[1];g=+m[2];b=+m[3];}}
      else if(bg[0]==='#'){let h=bg.slice(1);r=parseInt(h.slice(0,2),16)||0;g=parseInt(h.slice(2,4),16)||0;b=parseInt(h.slice(4,6),16)||0;}
      else if(bg.includes(',')){let p=bg.split(',');r=+p[0]||0;g=+p[1]||0;b=+p[2]||0;if(p[3])tol=+p[3];}
      let id=ctx.getImageData(0,0,sW,sH);
      let d=id.data;
      for(let j=0;j<d.length;j+=4){
        if(Math.abs(d[j]-r)<=tol&&Math.abs(d[j+1]-g)<=tol&&Math.abs(d[j+2]-b)<=tol)d[j+3]=0;
      }
      ctx.putImageData(id,0,0);
    }

    // выбираем лучший формат
    let mime='image/png',qual=1;
    if(!bg){mime='image/jpeg';qual=0.92;}
    else if(await isWebpEncodeSupported()){mime='image/webp';qual=0.85;}

    g_spriteBlob=await new Promise((ok,err)=>{
      canvas.toBlob(b=>b?ok(b):err(new Error('toBlob fail')),mime,qual);
    });
console.log('sprite ready '+g_spriteBlob.type+' '+Math.round(g_spriteBlob.size/1024)+'кб');
    // очистка
    del_video(video); del_canvas(canvas); g_mp4_status='ok';
    const end = performance.now();
    alert(`Время: ${(end-start).toFixed(0)}ms`);

    if(typeof g_preloadCallback==='function')g_preloadCallback();
    return 1;

  }catch(e){
    alert('PRELOAD ERROR:'+e);
    del_video(video); del_canvas(canvas); g_mp4_status='error';
  }

} //end preload

function del_video(e){ // Уничтожаем видеоэлемент
 try{e.removeAttribute('src'); e.load(); e = null;} // Принудительная выгрузка
 catch(e){}
}
function del_canvas(e){ // Очищаем холст
 try{e.width = 0; e.height = 0; e.remove();}
 catch(e){}
}
//Освобождаем Blob URL
function del_blob(url){URL.revokeObjectURL(url);}
function get_url(){return URL.createObjectURL(g_spriteBlob);}

function set_css_grid(w,h,t){
 css_var('--wz',w+'px'); 
 css_var('--hz',h+'px');
 css_var('--time',t+'s');
}

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
.mp49 {
  position: absolute; width: var(--wz); height: var(--hz); overflow: hidden;
}
.mp49 img {
  position: absolute; width: ${nx*100}%; height:${ny*100}%; 
  animation: tr${nx*ny} var(--time) steps(1) infinite alternate;
}
.mp49 img[src='']{animation:none;}
`;

 var frames=nx*ny;
 var step=100/frames;

 css+='@keyframes tr'+frames +' {\n';
 var x=0,y=0,s='';
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
 var st=document.createElement('style');
 st.textContent=t;
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
// Create a visual progress bar overlay
function createProgressBar() {
  const div = document.createElement('div');
  div.className = 'progress-overlay';
  div.innerHTML = `
    <div class="progress-box">
      <div class="bar-label">[·Loading...·]</div>
      <div class="bar-frame">
        <div class="bar-fill"></div>
      </div>
    </div>
  `;
  document.body.appendChild(div);
  g_progress.el = div;
}
