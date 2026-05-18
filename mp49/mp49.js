
async function run_slow(name,x,y,z,bg){
 var info=elv('id_info'+(x*y));
 info.textContent='Ждите 4-9 сек (зависит от браузера и мощности)';
 g.cols=x; g.rows=y;
 var url=await preload_slow(name+'.mp4',z,bg);
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

async function preload_slow(name,scale=1,bg=''){ // ОСНОВНАЯ ФУНКЦИЯ
// try{
  set_timer();
  g.mp4_status='busy';
  log('preload start='+name);
  await loader_video(name,'id_video',0); // загрузка
  g.frames = g.cols * g.rows;
  best_size(scale);g.video.pause();
  g.step=g.video.duration/g.frames; //frames-1 ???
  g.canvas = document.createElement('canvas');
  await seek_frames(g.frames); 
  log(`кадры нашла: ${get_timer()}ms/`+g.rawFrames.length);
  // --- очистка
  del_video(g.video);
  del_canvas(g.canvas); 

  const spriteCanvas = document.createElement('canvas');
  let ctx = spriteCanvas.getContext('2d');
  spriteCanvas.width = g.w * g.cols;
  spriteCanvas.height = g.h * g.rows;
  let x=0,y=0;
  for(let i=0; i < g.rawFrames.length; i++){
    const imgData = new ImageData(g.rawFrames[i], g.w, g.h);
    ctx.putImageData(imgData, g.w*x, g.h*y);
    x++; if(x==g.cols){y++;x=0;}
  }
  g.rawFrames=[];
  log('спрайт готов='+g.frames);
  progressBar(g.frames,g.frames);
  // chroma-key rgb (если передан bg) если webp не поддерживает то лучше сетка
  if(bg)if(elv('id_pf').checked){
      log('замена='+bg+' на прозрачный цвет');
      let rr=255,gg=255,bb=255,tol=10; 
      if(bg[0]==='#'){let h=bg.slice(1);rr=parseInt(h.slice(0,2),16)||0;gg=parseInt(h.slice(2,4),16)||0;bb=parseInt(h.slice(4,6),16)||0;}
      removeBgHSV(ctx, spriteCanvas.width, spriteCanvas.height, rr,gg,bb);
  }
  // выбираем лучший формат
  let mime='image/png',qual=1;
  if(!bg){mime='image/jpeg';qual=0.92;}
  else if(await isWebpEncodeSupported()){mime='image/webp';qual=0.85;}

  g_spriteBlob=await new Promise(res=>spriteCanvas.toBlob(res,mime,qual));
  del_canvas(spriteCanvas);
  log('sprite ready '+g_spriteBlob.type+' '+Math.round(g_spriteBlob.size/1024)+'кб');
  g.mp4_status='ok';
  log(`Общее Время: ${get_timer()}ms`);
  return get_url(g_spriteBlob);//ok
 // }catch(e){ alert('PRELOAD ERROR:'+e); g.mp4_status='error'; }

} //end preload slow

