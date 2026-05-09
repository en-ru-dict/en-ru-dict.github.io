const SPEED=true;
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
var g_time=[];
async function run_fast(name,x,y,z){
 elv("id_info",'t',"Ждите 0.5-1.5 сек (зависит от браузера и телефона/ПК)");
 g_time=[];
 var url=await preload_fast(name+'.mp4',x,y,z,0);
 if(url===0)return 0;//error
 gen_css_grid_px(g.cols,g.rows,184,240);
 els('.mp49 img').forEach(b=>b.src=url);
 els('#id_i0')[0].src=url;
 for(let i=1;i<g_time.length;i++)g_log+=i+'/'+Math.round(1000*(g_time[i]-g_time[i-1]))+'\n';
 els('#id_t0')[0].textContent=g_log;
 css_var('--x',g.cols); css_var('--y',g.rows); css_var('--url','url("'+url+'")');
 elv("id_info",'t','готово='+get_timer()+'ms');
}
async function preload_fast(name,cols,rows,scale,bg){ // ОСНОВНАЯ ФУНКЦИЯ
  elv('vse').className="hide";
  set_timer();
  g.mp4_status='busy';
  log('preload start='+name);
  await loader_video(name,'id_video',0); // загрузка
  g.cols=cols; g.rows=rows; g.frames=cols*rows;
  let url= await extractVideoFrames_fast(scale);
  elv('vse').className="";
  log('preload Время:'+get_timer()+'ms дублей='+g.dubli);
  return url;
}
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
async function waitTime() {
  if(g.video.currentTime<g.video.duration) await g.video.play();
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
function make_canvas(){
  for(let i=0;i<=g.frames;i++){
   let c = document.createElement('canvas');
   c.width=g.w; c.height=g.h;
   g.rawFrames.push(c);
  }
}
async function make_sprite(){
  let [n,xx,yy]=miss49(g.num_frame);
  log(`новая сетка=${n} ${xx}*${yy}`);
  const grid = document.getElementById('framesGrid');
  const spriteCanvas = document.createElement('canvas');
  const spriteCtx = spriteCanvas.getContext('2d');
  spriteCanvas.width = g.w * xx;
  spriteCanvas.height = g.h * yy;
  var x=0,y=0;
  for (let i = 0; i < n; i++) {
    spriteCtx.drawImage(g.rawFrames[i], g.w*x, g.h*y);
    x++;if(x==xx){y++;x=0;}
  }
  const spriteBlob = await new Promise(res =>spriteCanvas.toBlob(res, 'image/jpeg', 0.9));
  const spriteURL = URL.createObjectURL(spriteBlob);
  del_canvas(spriteCanvas); g.cols=xx;g.rows=yy;
  return spriteURL;
}
//await play быстро
async function extractVideoFrames_fast(scale) {
  g.video.playbackRate=1;
  g.w = Math.floor(g.video.videoWidth * scale);
  g.h = Math.floor(g.video.videoHeight * scale);
  g.canvas = document.createElement('canvas');
  g.canvas.width = g.w; g.canvas.height = g.h;
  g.ctx = g.canvas.getContext('2d', { willReadFrequently: true });
g.step=g.video.duration/(g.frames-1);
  log('step='+g.step,'/f='+g.frames+'/z='+scale);
  if(g.video.currentTime>0.01)log('видео не в начале='+g.video.currentTime);
g.dubli=0;g.num_frame=0;g.rawFrames = []; g.prevHash = [];
make_canvas();

  while(g.video.currentTime<g.video.duration){
    await waitTime();
    grab_frame();if(g.num_frame>=g.frames)break;
    if(SPEED){
     if(g.speed>1){if(g.video.playbackRate<3)g.video.playbackRate+=0.05;}
     if(g.speed<0){if(g.video.playbackRate>0.7)g.video.playbackRate-=0.05;}
    }
    if(g.num_frame & 8)g.speed=0;
  }

   //последний кадр проблемный
 if(g.num_frame<g.frames){
  log('последний кадр')
  await waitSeekSafe(g.video.duration+0.02);;
  if(grab_frame())log('посл.кадр есть');
 }
 if(g.num_frame<g.frames){
  log('первый кадр')
  await waitSeekSafe(0);;
  if(grab_frame()){
    log('перв.кадр есть');
    let x=g.rawFrames[g.num_frame-1];
    for(let i=g.num_frame-1;i>0;i--) g.rawFrames[i]=g.rawFrames[i-1];
    g.rawFrames[0]=x;
  }
 }
  // --- очистка
  del_video(g.video);
  del_canvas(g.canvas);
  log('После полной проверки кадров='+ g.num_frame+'/'+get_timer());
  var url=await make_sprite();
log('после grid='+get_timer());
  g.rawFrames.forEach(b=>del_canvas(b));
  return url;

}

//исправляем пропуски кадров - они не равномерно!!!
function miss49(n){
 if(n==49){return [49,7,7];}
 if(n==48){return [48,8,6];}
 if(n==47){add0();return [48,8,6];}
 if(n==46){delN(23);return [45,9,5];}
 if(n==45){return [45,9,5];}
 if(n==44){add0();return [45,9,5];}
 if(n==43){delN(21);return [42,7,6];}
 if(n==42){return [42,7,6];}
 if(n==41){delN(20);return [40,8,5];}
 if(n==40){return [40,8,5];}
   //равномерно удалять нет смысла, там как попало пропускает
 if(n>=36){cut36();return [36,6,6];}
 if(n>=25){cut25();return [25,5,5];}  
 return [1,1,1];//error грузим сетку16 300кб с сервера
}
function add0(){
 let m=[];
 m.push(g.rawFrames[0]);
 for(let i=0;i<g.num_frame;i++)m.push(g.rawFrames[i]);
 g.rawFrames=m; g.num_frame++;
}
function delN(n){
 let m=[];
 for(let i=0;i<g.num_frame;i++)if(i!=n)m.push(g.rawFrames[i]);
 g.rawFrames=m; g.num_frame--;
}
function cut36(){
 let m=[];
 let n=g.num_frame-36; n=n>>1;
 for(let i=0;i<36;i++)m.push(g.rawFrames[n+i]);
 g.rawFrames=m; g.num_frame=36;
}
function cut25(){//обрезаем начало и конец
 let m=[];
 let n=g.num_frame-25; n=n>>1;
 for(let i=0;i<25;i++)m.push(g.rawFrames[n+i]);
 g.rawFrames=m; g.num_frame=25;
}
