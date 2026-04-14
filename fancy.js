//==========fancy.js====Xing*2026=======
var g_log='>';//вкл лог
var g_timer_start=0;
var o_items = [];
var o_busy=0;
var g_zerk=[];
var g_zerk_img=[];
var el_sr=el('id_sr');
var el_sl=el('id_sl');
var g_video='<video muted playsinline loop></video>';
var g_img='<img src="" alt="" >';

function el(id){var e=document.getElementById(''+id);if(!e)alert('нет элемента='+id); return e;}
function els(s){return document.querySelectorAll(''+s);}
function int(n){return Math.round(n);}
function css_var(v,d){document.documentElement.style.setProperty(''+v, ''+d);}
function set_img(url){el('id_i0').src=''+url;}
function set_log(){el('id_t0').textContent=g_log;}
function min_max(v,vmin,vmax){if(v<vmin)v=vmin;if(v>vmax)v=vmax;return v;}
function get_wh(){//служебная
  const w = window.innerWidth, h = window.innerHeight;
  const orient = w > h ? 'landscape' : 'portrait';
  return ('w='+w+' h='+h+' :'+orient);
}
function hide(e){if(e)e.classList.add('hidden');}
function show(e){if(e)e.classList.remove('hidden');}
function is_vert(){return (window.innerHeight>window.innerWidth);}
function zerk_img_url(url){g_zerk_img.forEach(b=>b.src=''+url);}
function zerk_add_class(s){g_zerk.forEach(b=>b.classList.add(''+s));}
function zerk_del_class(s){g_zerk.forEach(b=>b.classList.remove(''+s));}
function set_timer(){g_timer_start=performance.now();}
function get_timer(){return performance.now()-g_timer_start;}
//==new observer==
function o_update(){
 if(o_busy)return; o_busy=1;//скрол сбросит
 const h=window.innerHeight, y=window.scrollY, m=Math.ceil(h * 0.1);
 const top = y + m, bottom = y + h - m;
 for(let i of o_items){if(i.b > top && i.t < bottom)show(i.e); else hide(i.e);}
}
function o_resizer(){
 o_busy=1; o_items=[]; console.log('o_resizer');
 g_zerk.forEach(e=>{
	 hide(e.firstChild);//img
   show(e);
   const r=e.getBoundingClientRect(), top=r.top+window.scrollY;
   o_items.push({ e:e, t:top, b: top+r.height });
   hide(e);
   show(e.firstChild);
 });
 o_busy=0; o_update();
}
function o_run(){//once
  o_resizer();
  setInterval(o_update, 300);
  window.onscroll= ()=>{o_busy=0;};
}
function getPerspectiveAngle(contW, contH, p){
  const w = contH / 2;// Половина ширины картинки (квадрат)
  const d = contW / 2;// Половина ширины видимого окна
  if (w <= d) return 0;// Если картинка уже и так меньше окна, не крутим
  let numerator = d * p;
  let denominator = Math.sqrt((p*w)*(p*w) + (d*w)*(d*w));
  if (!denominator) return 0;
  let v = numerator / denominator; if(v<-1)v = -1; if(v>1)v = 1;
  let angleRad = Math.acos(v) - Math.atan(d/p);
  if (!isFinite(angleRad)) return 0;
  let angleDeg = angleRad * (180/Math.PI);
  return Math.max(0, Math.floor(angleDeg));
}
function resizer() {
  const p = 1000;
  const targetSection = el('id_sl');// ширина LEFT секции, она жива всегда
  var w = targetSection.offsetWidth;
  var h = targetSection.offsetHeight;
  const calculatedAngle = getPerspectiveAngle(w, h, p);
  css_var('--angle1',       calculatedAngle + 'deg');
  css_var('--angle2', '-' + calculatedAngle + 'deg');
  console.log(`Ширина окна: ${w}px, Угол: ${calculatedAngle} гр`);
  const r = targetSection.offsetWidth - targetSection.offsetHeight;
  const q = Math.floor(r/2);
  css_var('--shift1', r + 'px'); css_var('--shift2', q + 'px');
  console.log(`Ширина сдвига: ${r}px, ${q}px`);
  //зеркало 184*240 33%
  w=min_max(Math.floor(w/3),92,368); css_var('--wz',w+'px');
  h=min_max(Math.floor(h/3),120,480); css_var('--hz',h+'px');

  var v=is_vert();
  console.log(`Вертикальный: ${v} /овал w=${w} h=${h}`);
  o_resizer();
}
// Слушаем изменение размера и ориентации
var g_resizeTimer=null;
function debounceResize(){
 clearTimeout(g_resizeTimer); g_resizeTimer=setTimeout(resizer,200);
}
window.addEventListener('resize',debounceResize)

//==background==
function del_bg(v){
 if(v==1) css_var('--bg2','none');
 if(v==2) els('.fon2 img').forEach(b => b.remove());
 if(v==3) els('.fon2 video').forEach(b => del_video(b));
}
function stop_bg(){set_ef(0);del_bg(1);del_bg(2);del_bg(3);stopFairy();}
function set_bg(u){ var e; //фон2 бэкграунд, img1/img2/video
  u=''+u;
  els('select')[0].value=u;
  enable_ef(u);
  if(u=='0'){stop_bg();return;}
  start_loading();
  if(u.endsWith('.mp4')){
   set_ov('png');del_ov(0);stop_bg();set_snow(0);
   el_sl.innerHTML=g_video;
   el_sr.innerHTML=is_vert()? '': g_video;
   e = document.createElement('video');
   e.muted = true; e.loop = true; e.playsInline = true; e.preload = 'auto';
   e.onerror = (er)=> {alert('ошибка загрузки='+u);}
   e.oncanplaythrough = ()=>{
     els('.fon2 video').forEach(b=>{b.src=u; b.play();});
     e.remove();
     end_loading();
   }
   e.src = u; e.load();
   return;
  }
  var bg2s='cover', n=1;;
  if(u=='1'){u='bg.png';bg2s='auto';set_ef(0);startFairy();}
  if(u=='2'){u='bg.jpg';bg2s='auto';set_ef(0);stopFairy()}
  if(u=='3')u='mir1.jpg';
  if(u=='4')u='mir2.jpg';
  if(u=='5')u='mir3.jpg';
  if(u=='6')u='mir4.jpg';
  if(u=='7')u='mir5.jpg';
  if(u=='8'){u='mir2.jpg'; n=2; el_sl.innerHTML=g_img; el_sr.innerHTML=is_vert()? '':g_img;}
  if(u=='9'){u='mir4.jpg'; n=2; el_sl.innerHTML=g_img; el_sr.innerHTML=is_vert()? '':g_img;}
  e = new Image();
  e.onerror = (er)=> {alert('ошибка загрузки='+u); end_loading();}
  e.onload = ()=>{
    css_var('--wh',e.naturalWidth/e.naturalHeight);
    if(n==1){del_bg(2);del_bg(3); css_var('--bg2',`url("${u}")`);css_var('--bg2s',bg2s);}
    if(n==2){del_bg(1);del_bg(3); els('.fon2 img').forEach(b=>b.src=u);}
    e.remove(); end_loading();
  }
  e.src = u;
}
//==effect==
function set_o(s){document.body.className='oval v'+s;}
function set_ef(n){
  n=''+n;
  if(['4','5','6','7'].includes(n))set_o(1);//синхронизация половинок для анимации 2x
  els('select')[1].value=n;
  setTimeout(set_o,100,n);
}
function enable_ef(u){//u=3-7 1x 0,8/ u=8-9 2x 0-7/
 var m=els('#id_ef option');
 var o=[0];
 m.forEach(b=>hide(b));
 if(['3','4','5','6','7'].includes(u))o=[0,8];
 if(['8','9'].includes(u)) o=[0,1,2,3,4,5,6,7];
 o.forEach(i=>show(m[i]));
}
//==зеркала-кнопки=овалы
function del_ov(v){
 if(v===1) css_var('--bgo','none');
 if(v===2) zerk_img_url('');
 if(v===0) zerk_del_class('oo');
}
function set_ov_css(x,y,t,url){
  var n=x*y,g='g'+n;
  gen_css_grid(x,y,g); css_var('--time',t+'s');
  zerk_add_class(g); zerk_img_url(url);
}
async function set_ov_mp49(){ //вместо видео
   del_ov(0);
   if(!g_url){//остановить всю анимацию для лучшего извлечения кадров
    start_loading();
    stop_bg(); set_snow(0); hide(el('id_btnBeauty'));
    g_url= await run_mp49('mirror',7,7);
    if(!g_url){alert('ошибка run_mp49'); return;}
    console.log('g_mp4_status='+g_mp4_status+'/время='+get_timer());
    show(el('id_btnBeauty')); set_snow(999);//вкл погоду
    end_loading();
   }
   set_ov_css(7,7,'4.9',g_url);
   o_resizer(); set_bg(rnd(3)+4);
}

function set_ov(u){ //картинки и готовые спрайты
  u=''+u;
  els('select')[2].value=u;
  g_zerk.forEach(b=>{b.classList.remove('bg633','g49','g25','g16'); b.classList.toggle('oo');});
  del_ov(1); del_ov(2);//пусто пока загружается.
  if(u==='mp49'){setTimeout(set_ov_mp49,10);return;}
  if(u==='0'){zerk_add_class('bg633'); o_resizer(); return;}
  if(u==='png'){css_var('--bgo','url("mirror.png")'); o_resizer();; return;}

  start_loading(); // эти большие. долго
  var e = new Image();
  if(u==='gif')u='mirror.gif';
  if(u==='g16')u='g16.jpg';
  if(u==='g25')u='g25.jpg';
  e.onerror = (er)=> {alert('ошибка загрузки2='+u);}
  e.onload = ()=>{
   if(u==='mirror.gif')css_var('--bgo',`url("${u}")`); //png+gif
   if(u==='g16.jpg') set_ov_css(4,4,'1.6',u);
   if(u==='g25.jpg') set_ov_css(5,5,'2.5',u);
   e.remove();
   o_resizer();//?? без него размеры неправильно. надо разбираться
   end_loading();
  }
  e.src = u;
}

var g_fokus_timer=null;
var g_fokus_num=0;
var g_loading_box=els('.loadingBox')[0];
var g_loading_text=el('id_loadingText');
function start_loading(){
 if(g_fokus_timer)clearTimeout(g_fokus_timer);
 g_fokus_num = 0; show(g_loading_box); show_fokus();
}
function show_fokus(){
 if(g_fokus_num>20){end_loading();return;}
 var texts=['✨ Загружаем сказку..','✨ Колдуем..','✨ Красим фон..','✨ Ставим зеркала..'];
 g_loading_text.textContent = texts[g_fokus_num % texts.length]; g_fokus_num++;
 g_fokus_timer=setTimeout(show_fokus,500);
}
function end_loading(){
 if(g_fokus_timer)clearTimeout(g_fokus_timer);
 g_fokus_num=99; hide(g_loading_box);
}
var g_snow=1;
function set_w(){if(g_snow){set_snow(rnd(10));setTimeout(set_w,11111);}}
function set_snow(v){// Смена погоды
 v=v*1;
 var m=['','snow','rain','fog'];
 if(v<4){el('id_weather').className = m[v];els('select')[3].value=v;}
 if(v==0){g_snow=0; console.log('погода выкл OFF');}
 if(v==999){g_snow=1; console.log('погода вкл ON'); set_w();}
}
function load_css_htm(){
 var st=document.createElement('style');
 st.textContent=`
:root {
  --bg2: none;
  --bgo: none;
}
img[src=''] {display:none;}
/* СТИЛЬ ЗЕРКАЛА (Кнопки) */
.zerk img {border-radius: 50%;object-fit: cover; position: absolute; top:0; left:0; width:100%; height:100%;}
.zerk b {z-index:1; font-size: x-large; color: gold;}

/* РЕЖИМ ОВАЛОВ (Волшебные зеркала) */
.oval .zerk {
 position: absolute;
 width: 184px; height: 240px;
 width: var(--wz,184px); height: var(--hz,240px);
 background-repeat: no-repeat; background-position: center; background-size: contain;
 background-image: var(--bgo,none);
}
.oo {
 border: 2px solid cyan; border-radius: 50%;
 box-shadow: 0 0 15px aqua,0 0 15px aqua, inset 0 0 15px #000;
}
.bg633 {background: #000633;}
.oo.zerk::before{
  content:""; position:absolute; z-index:1; inset:10%; border-radius:50%;
  border:5px solid aqua; filter:blur(5px); animation:colors 3s linear infinite;
}
@keyframes colors {
 0% { border-color: aqua;}
 50% { border-color: magenta;}
 100% { transform:rotate(360deg); }
}

/* ПОЗИЦИИ НА ПК (Треугольники вдоль дороги) */
/* Левая сторона (зеркала 1, 2, 3) */
.oval .sektorL .zerk:nth-child(1) { top: 5%;  left: 1%; }
.oval .sektorL .zerk:nth-child(2) { top: 35%; left: 45%; }
.oval .sektorL .zerk:nth-child(3) { top: 65%; left: 1%; }

/* Правая сторона (зеркала 4, 5, 6) */
.oval .sektorR .zerk:nth-child(1) { top: 5%;  right: 1%; }
.oval .sektorR .zerk:nth-child(2) { top: 35%; right: 45%; }
.oval .sektorR .zerk:nth-child(3) { top: 65%; right: 1%; }
.hint.open {font-size:1.5em;}

/* ПОЗИЦИИ НА ТЕЛЕФОНЕ (Зигзаг по бокам) */
@media (orientation:portrait) {
  .oval .sektorL { min-height: 100vh; }
  .oval .sektorR { min-height: 100vh; }

  /* Левая сторона (зеркала 1, 2, 3) */
  .oval .sektorL .zerk:nth-child(1) { top: 0%;  left: 5%; }
  .oval .sektorL .zerk:nth-child(2) { top: 30%; right: 5%; }
  .oval .sektorL .zerk:nth-child(3) { top: 60%; left: 5%; }

  /* Правая сторона (зеркала 4, 5, 6) */
  .oval .sektorR .zerk:nth-child(1) { top: 0%;  right: 5%; }
  .oval .sektorR .zerk:nth-child(2) { top: 30%; left: 5%; }
  .oval .sektorR .zerk:nth-child(3) { top: 60%; right: 5%; }
  .hint.open {font-size:1.2em;}
}
.loadingBox {
  position: fixed;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: red;
  padding: 12px 18px;
  border-radius: 14px;
  z-index: 90;
  font-size: 28px;
}
.zerk b{
  font-weight:bold; color:gold;
  text-shadow: 0 0 4px black, 0 0 4px black, 0 0 4px black, 0 0 4px black, 0 0 4px black,
   0 0 4px black,  0 0 4px black,  0 0 4px black,  0 0 4px black, 0 0 4px black,
   0 0 10px cyan;
}
.title {
  display: inline-block; padding: 0.6em 1em; background: rgba(54, 97, 51, 0.5);;
  font-size: 1.5rem; border: 1px solid aqua; border-radius: 30px; margin: 5vh auto 5vh 0;
  font-weight:bold; color: aliceblue;
  text-shadow: 0 0 4px black, 0 0 4px black, 0 0 4px black, 0 0 4px black, 0 0 4px black,
   0 0 4px black,  0 0 4px black,  0 0 4px black,  0 0 4px black, 0 0 4px black,
   0 0 10px coral;
 }
#id_weather {
 position: fixed; z-index: 1; top: 0; left: 0; width: 100%; height: 100%;
 background-repeat: repeat; pointer-events: none;
}
/* эффекты фона2 */
.fon2 {
  display: flex; position: fixed; width: 100vw; height: 100vh;
  z-index:1;pointer-events: none;
  background: fixed center; background-size: var(--bg2s,auto); background-color: black;
  background-image: var(--bg2,none);
}
.fon2 video {width:100%;height:100%;object-fit:cover;}
.section {
  height:100%; overflow:hidden; display:flex; justify-content:center; perspective:1000px;
}
/* ПК: 50/50 */
.left, .right { flex: 0 0 50%; }
/* ТЕЛЕФОН: левая на весь экран */
@media (orientation:portrait) {
  .left { flex: 0 0 100%; }
  .right { display: none; }
}
.section img {height: 100%; width: auto; position: absolute;left: 0;}

.v0 .section img {width: 100%;  height: 100%; object-fit: contain;}
.v1 .section img {transform: translateX(var(--shift2,0)) translateZ(1px);}
.v2 .section.left  img {transform: translateX(0) translateZ(1px);}
.v2 .section.right img {transform: translateX(var(--shift1,0)) translateZ(1px);}
.v3 .section.left  img {transform: translateX(var(--shift1,0)) translateZ(1px);}
.v3 .section.right img {transform: translateX(0) translateZ(1px);}

/*анимация фона */
.v4 .section.left  img {will-change: transform; animation: l4 8s linear infinite;}
.v4 .section.right img {will-change: transform; animation: r4 8s linear infinite;}
@keyframes l4 {
  0%, 100% { transform: translateX(0) translateZ(1px); }
  50% { transform: translateX(var(--shift1,0)) translateZ(1px); }
}
@keyframes r4 {
  0%, 100% { transform: translateX(var(--shift1,0)) translateZ(1px); }
  50% { transform: translateX(0) translateZ(1px); }
}
.v5 .section img {will-change: transform; animation: l4 8s linear infinite;}
.v6 .section.left  img {will-change: transform; left: auto; transform-origin: center center;  animation: l6 8s linear infinite;}
.v6 .section.right img {will-change: transform; left: auto; transform-origin: center center;  animation: r6 8s linear infinite;}
@keyframes l6 {
  0%, 100% { transform: rotateY(var(--angle2, -1deg)); }
  50%      { transform: rotateY(var(--angle1, 1deg)); }
}
@keyframes r6 {
  0%, 100% { transform: rotateY(var(--angle1, 1deg)); }
  50%      { transform: rotateY(var(--angle2, -1deg)); }
}
.v7 .section img {will-change: transform; left: auto; transform-origin: center center;  animation: l6 8s linear infinite;}
.v8 .fon2{
  background-repeat:repeat-x; background-size: auto 100%;
  animation: moveBg 30s linear infinite;
}
@keyframes moveBg{
  from{background-position:0 0;}
  to{background-position:calc(100vh*var(--wh,1)) 0;}
}
.snow { opacity: 0.4; background-image:url("snow.gif");}
.rain { opacity: 0.5 ;background-image:url("rain.gif"); animation:rain 10s linear infinite;}
.fog { opacity: 0.3 ;background-image:url("fog.gif"); animation:fog 20s linear infinite;}
@keyframes fog{ from{background-position:0 0} to{background-position:100vw 0}}
@keyframes rain{ from{background-position:0 0} to{background-position:0 100vh}}

#toggle-panel {display: none;}
.control-panel {
  position: fixed; bottom: 0; left: 0; right: 0;
  max-width: 600px; margin: 0 auto;
  background: rgba(20, 20, 40, 0.85);
  border-top: 2px solid rgba(0, 240, 255, 0.4);
  border-radius: 24px 24px 0 0; padding: 40px 30px 30px;
  color: #e0e0ff; opacity: 0; pointer-events: none; z-index: 5;
  transform: translateY(100%); /* спрятано снизу */
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.6);
}
/* Когда открыто */
#toggle-panel:checked ~ .control-panel {
  transform: translateY(0);
  opacity: 1; pointer-events: auto;
}
/* Анимация выезда (только где поддерживается) */
@supports (transform: translateY(0)) and (transition-timing-function: cubic-bezier(0,0,0,0)) {
  #toggle-panel:checked ~ .control-panel {
  animation: panel-emerge 0.7s ease-out forwards;
  }
}
@keyframes panel-emerge {
  0%   { transform: translateY(100%) scale(0.92); opacity:0;}
  60%  { transform: translateY(0) scale(1.04); opacity:1;}
  100% { transform: translateY(0) scale(1.00); opacity:1;}
}
/* Контент панели */
.panel-content {display: grid;  gap: 24px;}
select, .action-btn {
  padding: 12px 16px;  font-size: 1.1rem;  background: black;  color: white;
  border: 1px solid rgba(0, 240, 255, 0.3);  border-radius: 12px;  outline: none;
}
.actions { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;}
.action-btn {
  padding: 14px 32px; font-weight: bold; cursor: pointer;
  background: linear-gradient(135deg, #00f0ff, #7c3aed);color: #000;
  border: none; border-radius: 50px;
}
/* Мобильная адаптация */
@media (orientation:portrait) { .control-panel { padding: 30px 20px 20px; }}
#kn99 {position:fixed; top:0; left:0; z-index:999;}
`;
document.head.appendChild(st);

var htm=`
<input type="checkbox" id="toggle-panel">
<div class="control-panel">
 <div class="panel-content">

   <select onchange="set_bg(this.value)">
    <option value="0">Фон (нет)<\/option>
    <option value="1">Простой1+<\/option>
    <option value="2">Простой2-<\/option>
    <option value="3">Поляна 280кб<\/option>
    <option value="4">Сказка 150кб<\/option>
    <option value="5">Тропинка 150кб<\/option>
    <option value="6">Дорога 150кб<\/option>
    <option value="7">Лес чудес 110кб<\/option>
    <option value="8">Сказка 2х<\/option>
    <option value="9">Дорога 2х<\/option>
    <option value="bg.mp4">Фон1 видео 1,5мб<\/option>
    <option value="bg7.mp4">Фон2 видео 7мб<\/option>
   <\/select>

   <select id="id_ef" onchange="set_ef(this.value)">
    <option value="0">Эффект фона (нет)<\/option>
    <option value="1">Центр<\/option>
    <option value="2">Слева<\/option>
    <option value="3">Справа<\/option>
    <option value="4">➡️ Сдвиг-1<\/option>
    <option value="5">⬅️ Сдвиг-2<\/option>
    <option value="6">🔄 Поворот-1<\/option>
    <option value="7">🔄 Поворот-2<\/option>
    <option value="8">Панорама для 1x<\/option>
   <\/select>

   <select onchange="set_ov(this.value)">
    <option value="0">Вид зеркала (нет)<\/option>
    <option value="png">PNG rbga 20кб<\/option>
    <option value="g16">JPG-16? 390кб<\/option>
    <option value="g25">JPG-25? 600кб<\/option>
    <option value="gif">GIF-A? 1.5мб<\/option>
    <option value="mp49">MP49! 32кб<\/option>
   <\/select>

   <select onchange="set_snow(this.value)">
    <option value="0">Погода (нет)<\/option>
    <option value="1">❄️ Снег ☃️<\/option>
    <option value="2">⛈️ Дождь ☔ <\/option>
    <option value="3">🌫 Туман ☁️<\/option>
   <\/select>

   <div class="actions">
    <button class="action-btn" onclick="location.reload();" style="background:linear-gradient(135deg, #00ff9d, #00bfff);">Выход<\/button>
    <button class="action-btn" onclick="el('toggle-panel').checked = false;" style="background:linear-gradient(135deg, #ff4d4d, #ff8c00);">Закрыть<\/button>
   <\/div>

 <\/div>
<\/div>
<div style="position:relative;z-index:999;margin-top: -20px;">
 <img style="height:1px;" id="id_i0" src='' alt=''>
 <textarea spellcheck="false" id="id_t0" style="width:100vw;min-height:20vh"></textarea>
</div>
<button id="kn99" class="hidden" onclick="alert_info()">info</button>
`;
 document.body.insertAdjacentHTML('beforeend',htm);
}
// flying-fairy.js
function fly(){
 let fairy = null;
 let animationFrameId = null;
 let state = { x: 0, y: 0, targetX: 0, targetY: 0, isActive: false };

 function createFairy() {
  if (fairy) return; // уже создана
  fairy = document.createElement('div');
  fairy.id = 'flyingFairy';
  Object.assign(fairy.style, {
    position: 'fixed', top: '0', left: '0', width: '120px', height: '160px', zIndex: '9999',
    pointerEvents: 'none', backgroundSize: 'contain', backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center', backgroundImage: "url('fairy.gif')",
    transform: 'translate(0px, 0px)', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.8))',
    userSelect: 'none'
  });
  document.body.appendChild(fairy);
}
 function onMouseMove(e) {
  if(!state.isActive) return;
  state.targetX = e.clientX - 50;
  state.targetY = e.clientY - 50;
 }
 function onTouchMove(e) {
  if (!state.isActive || e.touches.length === 0) return;
  state.targetX = e.touches[0].clientX - 50;
  state.targetY = e.touches[0].clientY - 50;
 }
 function animate() {
  if(!state.isActive || !fairy){ animationFrameId = null; return; }
  // Плавное движение
  state.x += (state.targetX - state.x) * 0.01;
  state.y += (state.targetY - state.y) * 0.01;
  // Ограничение по краям экрана
  const margin = 50;
  state.x = min_max(state.x, margin, window.innerWidth - 100 - margin);
  state.y = min_max(state.y, margin, window.innerHeight - 100 - margin);
  fairy.style.transform = `translate(${state.x}px, ${state.y}px)`;
  animationFrameId = requestAnimationFrame(animate);
 }
 function startFairy() {
  if(state.isActive) return;
  createFairy();
  // начальная позиция — центр экрана
  state.targetX = state.x = window.innerWidth / 2 - 50;
  state.targetY = state.y = window.innerHeight / 2 - 50;
  fairy.style.transform = `translate(${state.x}px, ${state.y}px)`;
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('touchmove', onTouchMove, { passive: false });
  state.isActive = true;
  if(!animationFrameId){ animate(); }
 }
 function stopFairy() {
  if(!state.isActive) return;
  state.isActive = false;
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('touchmove', onTouchMove);
  if(animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if(fairy){ fairy.remove(); fairy = null; }
 }
 // Экспортируем в глобальную область
 window.startFairy = startFairy;
 window.stopFairy  = stopFairy;
 console.log('Фея-помощница готова. Вызови startFairy() / stopFairy()');
};
function set_a(h){
 var t = h.trim().split(' ');
 t = (t.length==1)? t[0] : t[0]+'<br>'+t[1];
 return g_img+`<b title="${h}">${t}<\/b>`;
}
function start_fancy(){
 els('.container')[0].remove(); window.scrollTo(0,0);
 load_css_htm();g_h2=999;//выкл анимацию заголовка
 set_o(0);fly();// вкл oval ef0
 els('.hint').forEach(b => b.classList.remove('open'));
 el('id_btnBeauty').innerText = "Панель управления сказкой";
 g_zerk=els('.zerk');
 g_zerk.forEach(b =>{b.className='zerk oo bg633'; b.innerHTML=set_a(''+b.textContent);});
 g_zerk_img=els('.zerk img');
 el('toggle-panel').checked = false;
 els('select').forEach(b => b.selectedIndex=0);
 o_run();//крутой обсервер для кнопок зеркал
//случайный фон и зеркало
 var v=rnd(10);set_bg(''+v);if(v==8)set_ef('5');if(v==9)set_ef('7');if(v==4)set_ef('8');
 if(rnd(3))set_ov('png'); startFairy(); set_w();
 debounceResize();
 console.log('красота загружена');
}
function want_fs(){
 var e=document.documentElement;
 if(e.requestFullscreen)e.requestFullscreen().catch(()=>{});
}
function rnd(k) {
 var n = Date.now();n=Math.floor(Math.random()*n); n=n%5;
 if(n==0)n=10;
 if(n==1)n=100;
 if(n==2)n=1000;
 if(n==3)n=10000;
 if(n==4)n=100000;
 n = Math.floor(Math.random() * n);
 return n % k;
}
function run_panel(){
  el('toggle-panel').checked = true;
  stopFairy();
}

//===main===
want_fs();
if(navigator.hardwareConcurrency<4) alert('слабый девайс, будет тормозить');
start_fancy();

//===mp49 вместо гифок===
async function run_mp49(name,x,y){
 var url=await preload(name+'.mp4',x,y,1);
 if(url===0)return 0;//error
 set_img(url);
 if(window.g_log)set_log();
 return url;
}
function set_css_grid(w,h,t){
 css_var('--wz',w+'px');
 css_var('--hz',h+'px');
 css_var('--time',t+'s');
}
var g_css_grid=[];
function gen_css_grid(nx,ny,classCSS){
 if(g_css_grid[classCSS]){console.log('css grid уже есть='+classCSS);return;}
 g_css_grid[classCSS]=1;//чтобы один раз делать
 var i;
 var css=`
:root {
  --time:3s;
`;
 for(i=1;i<nx;i++){ css+=`--w${i}: calc(var(--wz) * -${i});\n`;}
 for(i=1;i<ny;i++){ css+=`--h${i}: calc(var(--hz) * -${i});\n`;}
 css+=`
}
.${classCSS} {overflow:hidden; border:none;}
.${classCSS} img {
  object-fit:unset; width:${nx*100}%; height:${ny*100}%; border:0; border-radius:0;
  will-change: transform; animation: tr${nx*ny} var(--time) steps(1) infinite alternate;
}
.${classCSS} img[src='']{animation:none;}
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
 var st=document.createElement('style');
 st.textContent=css;
 document.head.appendChild(st);
}
//========sprite_preloader версия 2=============
let g_mp4_status='idle'; // busy/ok/error
let g_spriteBlob=null;    // готовый blob спрайта (глобальный)
let g_webpSupport=null;   // кэш поддержки webp-encode
let g_preloadCallback=null;

function log(t,o){ if(!o) o='';
 if(window['g_log']) g_log+= t+'/'+o+'\n';
 //if(o)console.log(''+t,o);else console.log(''+t); //тормозит
}
function getMaxTextureSize(){// макс размер текстуры WebGL (или 4096)
  let c=document.createElement('canvas');
  let gl=c.getContext('webgl')||c.getContext('experimental-webgl');
  return gl?gl.getParameter(gl.MAX_TEXTURE_SIZE)||4096:4096;
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
function get_url(){
 if(!g_url)g_url=URL.createObjectURL(g_spriteBlob);
 return g_url;
}
function fastHash(data){
 let h = 0;
 const len = data.length;
 const step = 13;//(len / 64) | 0;
 for(let i = 0; i < len; i += step) {  h = ((h << 5) - h + data[i]) | 0; }
 return h;
}
function isEmptyFrame(data){
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
    el_video.currentTime = targetTime;//запускаем seek
    g_seek_timer=setTimeout(()=>{log('seek_timeout='+targetTime);finish();}, 500);
  });
}
async function preload(name,cols,rows,scale=1,bg=''){ // ОСНОВНАЯ ФУНКЦИЯ
  if(g_url) return g_url;
  set_timer();
  g_mp4_status='busy';
  log('preload-start='+name);
  getUserDeviceParams();
  let video=null;

try{
    video=document.createElement('video');
    video.muted=true; video.playsInline=true;
     //document.body.appendChild(video);???
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

    await video.play().catch(()=>{}); ///???
    await new Promise(res=>{ if(video.readyState>=2) res(); else video.onloadeddata=res;});
    video.pause();
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
  let ctx = canvas.getContext('2d', { willReadFrequently: true });//??? alpha=false
  if(!ctx){alert('no 2d context'); g_mp4_status = 'error'; return 0;}
  canvas.width=sW; canvas.height=sH;
  let frames=cols*rows;
  let step=video.duration/(frames - 0) ; //-1?
log('step='+step);
  let rawFrames = [], prevHash = [], dynamicDelay = 5;
  await pause(100);
  log('первый кадр ключевой');
  var f=1,a=3; //три попытки
  while(a){
   a--;
   await waitSeekSafe(0,video);
   ctx.drawImage(video, 0, 0, fW, fH);
   const d = ctx.getImageData(0, 0, fW, fH).data;
   if(!isEmptyFrame(d)){f=0;break;}
  }
  if(f){alert('браузер не поддерживает копирование кадров из видео');return 0;}

  for(let t = 0; t < frames; t++){
   const targetTime = step*t + 0.01; //поправка
   await waitSeekSafe(targetTime,video);
   let attempts = 0, success = false;
   while(attempts < 5 && !success){
    attempts++;
    await new Promise(r => setTimeout(r, dynamicDelay));//=sleep=pause
    ctx.drawImage(video, 0, 0, fW, fH);
    const data = ctx.getImageData(0, 0, fW, fH).data;
    if(isEmptyFrame(data)){log('pusto='+t); dynamicDelay += 5; continue;}
    const hash = fastHash(data);
    if(prevHash.includes(hash)){log('dubl='+t); dynamicDelay += 5; continue;}
    success = true; //ура нашли
    prevHash.push(hash); rawFrames.push(data); dynamicDelay = Math.max(5, dynamicDelay - 1);
   } //end while
  }//end for
  let q=rawFrames.length;
log(`кадры нашла: ${get_timer()}ms/${q}`); if(q<49) log('мало кадров='+q);
  // --- очистка
  del_video(video); del_canvas(canvas); ctx=null;
  const spriteCanvas = document.createElement('canvas');
  ctx = spriteCanvas.getContext('2d');
  spriteCanvas.width = fW * cols;
  spriteCanvas.height = fH * rows;
  let x=0,y=0,z=0;
  for(let i=0; i < frames; i++){
    z=(i<q)? i:q-1; //последний кадр дублируем, но можно новую сетку
    const imgData = new ImageData(rawFrames[z], fW, fH);
    ctx.putImageData(imgData, fW*x, fH*y);
    x++; if(x==cols){y++;x=0;}
  }
  rawFrames=null;
log('спрайт готов='+q+'/t='+get_timer());
  let mime='image/jpeg',qual=0.92;
  g_spriteBlob=await new Promise(res=>spriteCanvas.toBlob(res,mime,qual));
  del_canvas(spriteCanvas);
  log('sprite blob '+g_spriteBlob.type+' '+Math.round(g_spriteBlob.size/1024)+'кб');
  g_mp4_status='ok';
  log('Общее Время: '+get_timer());
  return get_url();//ok
} catch(e){alert('PRELOAD ERROR:'+e); g_mp4_status='error';}

} //end preload

function del_video(e){ // Уничтожаем видеоэлемент
 try{e.pause();e.removeAttribute('src'); e.load(); e.remove(); e = null;} // Принудительная выгрузка
 catch(e){}
}
function del_canvas(e){ // Очищаем холст
 try{e.width = 0; e.height = 0; e.remove();}
 catch(e){}
}
//Освобождаем Blob URL
function del_blob(url){URL.revokeObjectURL(url);}
async function pause(t){await new Promise(r => setTimeout(r, t));}

function alert_info(){
  var w=window.innerWidth;
  var h=window.innerHeight;
  var wz=document.documentElement.style.getPropertyValue('--wz');
  var hz=document.documentElement.style.getPropertyValue('--hz');
  var s=`w=${w}/h=${h}/wz=${wz}/hz=${hz}\n`+window.scrollY+'\n';;
  var n=1;
  for (let o of o_items){s+=n+'/'+int(o.t)+'/'+int(o.b)+'/'+o.e.children[1].title+'\n';n++;}
  el('id_t0').textContent=(s);
}
