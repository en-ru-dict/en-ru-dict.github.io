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

async function run_slow(name,x,y,z,bg){
 var info=elv('id_info'+(x*y));
 info.textContent='Ждите 4-9 сек (зависит от браузера и мощности)';
 var url=await preload_slow(name+'.mp4',x,y,z,bg);
 if(url===0)return 0;//error
 gen_css_grid(x,y);
 if(y==7)set_css_grid(184,240,3);
 if(y==5)set_css_grid(240,320,3);

 els('.mp49 img').forEach(b=>b.src=url);
 els('#id_i0')[0].src=url;
 els('#id_t0')[0].textContent=g_log;

 css_var('--x',x); css_var('--y',y); css_var('--url','url("'+url+'")');
info.textContent='готово='+get_timer()+'ms';
}

async function preload_slow(name,cols,rows,scale=1,bg=''){ // ОСНОВНАЯ ФУНКЦИЯ
// try{
  set_timer();
  g.mp4_status='busy';
  log('preload start='+name);
  await loader_video(name,'id_video',0); // загрузка
  g.cols=cols; g.rows=rows; g.frames=cols*rows;
  //уменьшение размеров спрайта для слабых телефонов
  let fW=g.video.videoWidth,fH=g.video.videoHeight;
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

  g.video.pause();
  let canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d', { willReadFrequently: true });
  if(!ctx){alert('no 2d context'); g.mp4_status = 'error'; return 0;}
  canvas.width=sW;canvas.height=sH;
  let frames=cols*rows;
  let step=g.video.duration/frames; //frames-1 ???
log('step='+step);
  let rawFrames = []; 
  let prevHash = [];
  let maxAttempts = 10;
  let dynamicDelay = 10;

  for(let t = 0; t < frames; t++){progressBar(t,frames);
    await waitSeekSafe(step*t + 0.01);//поправка

    let attempts = 0;
    let success = false;

    while(attempts < maxAttempts && !success) {
      attempts++;
      await new Promise(r => setTimeout(r, dynamicDelay));//=sleep=pause
      ctx.drawImage(g.video, 0, 0, fW, fH);
      const data = ctx.getImageData(0, 0, fW, fH).data;
      const hash = fastHash(data);     
      if(hash==0){ log('pusto='+t); dynamicDelay += 10; continue;}
      if(prevHash.includes(hash)){ log('dubl='+t); dynamicDelay += 10; continue;}
      success = true;//ура нашли
      prevHash.push(hash);dynamicDelay = Math.max(5, dynamicDelay - 1);rawFrames.push(data);
    } //end while
  }//end for
  
log(`кадры нашла: ${get_timer()}ms/`+rawFrames.length);
  // --- очистка
  del_video(g.video);
  del_canvas(canvas); 

  const spriteCanvas = document.createElement('canvas');
  ctx = spriteCanvas.getContext('2d');
  spriteCanvas.width = fW * cols;
  spriteCanvas.height = fH * rows;
  let x=0,y=0;
  for(let i=0; i < rawFrames.length; i++){
    const imgData = new ImageData(rawFrames[i], fW, fH);
    ctx.putImageData(imgData, fW*x, fH*y);
    x++; if(x==cols){y++;x=0;}
  }
  rawFrames=[];
log('спрайт готов='+frames);progressBar(frames,frames);

    // chroma-key rgb (если передан bg) если webp не поддерживает то лучше сетка
  if(bg)if(elv('id_pf').checked){
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
    g.mp4_status='ok';
    const end2 = performance.now();
    log(`Общее Время: ${get_timer()}ms`);
    return get_url(g_spriteBlob);//ok
 // }catch(e){ alert('PRELOAD ERROR:'+e); g.mp4_status='error'; }

} //end preload slow
// --- ПРАВИЛЬНЫЙ waitSeek
var g_seek_timer=null;
function waitSeekSafe(targetTime) {
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
