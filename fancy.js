//==========fancy.js====Xing*2026=======
function els(s){return document.querySelectorAll(''+s);}
function css_var(v,d){document.documentElement.style.setProperty(''+v,''+d);}
function min_max(v,vmin,vmax){if(v<vmin)v=vmin;if(v>vmax)v=vmax;return v;}
function get_wh(){//служебная
  var w = window.innerWidth, h = window.innerHeight;
  const orient = w > h ? 'landscape' : 'portrait';
  return ('w='+w+' h='+h+' :'+orient);
}
function hide(e){e.classList.add('hidden');}
function show(e){e.classList.remove('hidden');}
function is_vert(){return (window.innerHeight>window.innerWidth);}
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
  console.log(`Ширина сдвига: ${r}px`);
  //зеркало 184*240 33%
  w=min_max(Math.floor(w/3),92,368);
  h=min_max(Math.floor(h/3),120,480);
  css_var('--wz',w+'px'); css_var('--hz',h+'px');
  var v=is_vert();
  console.log(`Вертикальный: ${v} овал w=${w} h=${h}`);
  o_resizer();
}
// Слушаем изменение размера и ориентации
var g_resizeTimer=null;
function debounceResize(){
 clearTimeout(g_resizeTimer); g_resizeTimer=setTimeout(resizer,500);
}
window.addEventListener('resize',debounceResize)

function set_o(s){document.body.className='oval v'+s;}
function set_ef(n){
  if(n>4)set_o(1);//синхронизация половинок для анимации
  setTimeout(set_o,100,n);
}
function del_v(e){try{e.pause();e.src=null;e.removeAttribute('src');e.load();} catch(e){}}
function del_all_video(){ els('video').forEach(v=>{v.pause(); v.remove();});}
function del_bg(v){
 if(v==1) css_var('--bg2','none');
 if(v==2) els('.fon2 img').forEach(b => b.remove());
 if(v==3) els('.fon2 video').forEach(b => {b.pause();b.remove();});
}
var el_sr=el('id_sr');
var el_sl=el('id_sl');
var g_video='<video muted playsinline loop></video>';
var g_img='<img src="" alt="" >';
function set_bg(u){ var e; //фон2 бэкграунд, img video
  if(u=='0'){del_bg(1);del_bg(2);del_bg(3);return;}
  if(u=='1'){u='bg.png';css_var('--bg2s','auto');startFairy('');}
  if(u=='2'){u='bg.jpg';css_var('--bg2s','auto');}
  if(u=='3'){u='mir1.jpg';css_var('--bg2s','cover');}
  if(u=='4'){u='mir2.jpg';css_var('--bg2s','cover');}
  if(u=='5'){u='mir3.jpg';css_var('--bg2s','cover');}
  if(u=='6'){u='mir4.jpg';css_var('--bg2s','cover');}
  if(u=='7'){u='mir5.jpg';css_var('--bg2s','cover');}

  start_loading();
  if(u.endsWith('.mp4')){
   el_sl.innerHTML=g_video; if(!is_vert()) el_sr.innerHTML=g_video;
   e = document.createElement('video');
   e.muted = true;e.loop = true;e.playsInline = true;e.preload = 'auto';
   e.onerror = (er)=> {alert('ошибка загрузки='+u); end_loading();}
   e.oncanplaythrough = ()=>{
     del_bg(1);del_bg(2);
     els('.fon2 video').forEach(b=>{b.src=u; b.play();});
     e.remove(); end_loading();
   }
   e.src = u; e.load();
   return;
  }
  var n=1;
  if((u=='8') || (u=='9')) {
    n=2; //2img
    if(u=='8')u='mir2.jpg';
    if(u=='9')u='mir4.jpg';
    el_sl.innerHTML=g_img; if(!is_vert()) el_sr.innerHTML=g_img;
  }
  e = new Image();
  e.onload = ()=>{
    css_var('--wh',e.naturalWidth/e.naturalHeight);
    if(n==1){del_bg(2);del_bg(3); css_var('--bg2',`url("${u}")`);}
    if(n==2){del_bg(1);del_bg(3); els('.fon2 img').forEach(b=>b.src=u);}
    e.remove(); end_loading();
  }
  e.src = u;
}

//new observer
var o_busy=0;
var o_items = [];
function o_update(){var i,m,top,bottom;
 if(o_busy)return; o_busy=1;
 m=Math.ceil(window.innerHeight * 0.1);
 top = window.scrollY + m; bottom = window.scrollY + window.innerHeight - m;
 for(i of o_items) i.e.style.display = (i.bottom > top && i.top < bottom)? '' : 'none';
}
function o_resizer(){
 o_busy=1;
 o_items=[];console.log('o_resizer');
 els(".zerk").forEach(e => {
  e.style.display='';
  const r = e.getBoundingClientRect();
  const top = r.top + window.scrollY;
  o_items.push({ e:e, top:top, bottom: top + r.height });
 });
 o_busy=0;
 o_update();
}

let g_updateInterval = null;
function o_run(){
  o_resizer();
  if (g_updateInterval) clearInterval(g_updateInterval);
  g_updateInterval = setInterval(o_update, 500);
  //window.addEventListener("scroll", ()=>o_busy=0);
  window.onscroll=function(){o_busy=0;}
}
function del_ov(v){
 if(v==1) css_var('--bgo','none');
 if(v==2) els('.zerk img').forEach(b => b.src='');
}
function set_ov(u){ var e,n;
  els('.zerk').forEach(b => {b.classList.remove('ooo','g49','g25'); b.classList.toggle('oo');});
  if(u==''){del_ov(1);del_ov(2);els('.zerk').forEach(b => b.classList.add('ooo'));return;}

  start_loading();
  if(u=='mirror.mp4'){
	run_mp49('mirror',7,7).then(url=>{
     console.log('g_mp4_status='+g_mp4_status);
     del_ov(1); els('.zerk img').forEach(b=>b.src=url);
     els('.zerk').forEach(b=>b.classList.add('g49'));
     end_loading();
    }).catch(err=>{
     alert('ошибка run_mp49');
     end_loading();
    });
    return;
  }
  //картинки шмартинки
  e = new Image();
  e.onload = ()=>{
    if(u=='mirror.png'){del_ov(2);css_var('--bgo',`url("${u}")`);}
    if(u=='mirror.gif'){del_ov(1);els('.zerk img').forEach(b=>b.src=u);}
    if(u=='g25.jpg'){
	  del_ov(1); els('.zerk img').forEach(b=>b.src=u);
	  gen_css_grid(5,5,'g25');
	  els('.zerk').forEach(b=>b.classList.add('g25'));
	}
    e.remove(); end_loading();
  }
  e.onerror = (er)=> {alert('ошибка загрузки2='+u); end_loading();}
  e.src = u;
}

var g_timer=null;
var g_text=0;
var el_loadBox = els('.loadingBox')[0];
function start_loading(){
 show(el_loadBox);
 g_text = 0; clearInterval(g_timer);
 g_timer = setInterval(show_fokus, 500);
 setTimeout(end_loading,15000);
}
function show_fokus(){
 var steps = ["✨ Колдуем..", "✨ Красим фон..", "✨ Ставим зеркала.."];
 el('id_loadingText').textContent = steps[g_text % steps.length];
 g_text++;
}
function end_loading(){ clearInterval(g_timer); hide(el_loadBox);}
function set_weather(v){// Смена погоды
 var s=''; if(v=='1') s='snow'; if(v=='2') s='rain'; if(v=='3') s='fog';
 el('id_weather').className=s;
 if(v=='0')set_w=()=>{console.log('погода выключена');};
}
function load_css_htm(){
 var st=document.createElement('style');
 st.textContent=`
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
.ooo {background: #000633;}
.oo.zerk::before{
  content:""; position:absolute; z-index:1; inset:10%; border-radius:50%;
  border:5px solid aqua; filter:blur(5px); animation:colors 5s linear infinite;
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

.v1 .section img {width: 100%;  height: 100%; object-fit: contain;}
.v2 .section img {transform: translateX(var(--shift2,0)) translateZ(1px);}
.v3 .section.left  img {transform: translateX(0) translateZ(1px);}
.v3 .section.right img {transform: translateX(var(--shift1,0)) translateZ(1px);}
.v4 .section.left  img {transform: translateX(var(--shift1,0)) translateZ(1px);}
.v4 .section.right img {transform: translateX(0) translateZ(1px);}

/*анимация фона */
.v5 .section.left  img {will-change: transform; animation: l5 8s linear infinite;}
.v5 .section.right img {will-change: transform; animation: r5 8s linear infinite;}
@keyframes l5 {
  0%, 100% { transform: translateX(0) translateZ(1px); }
  50% { transform: translateX(var(--shift1,0)) translateZ(1px); }
}
@keyframes r5 {
  0%, 100% { transform: translateX(var(--shift1,0)) translateZ(1px); }
  50% { transform: translateX(0) translateZ(1px); }
}
.v6 .section img {will-change: transform; animation: l5 8s linear infinite;}
.v7 .fon2{
  background-repeat:repeat-x;
  background-size: auto 100%;
  animation: moveBg 30s linear infinite;
}
@keyframes moveBg{
  from{background-position:0 0;}
  to{background-position:calc(100vh*var(--wh,1)) 0;}
}
.v8 .section.left  img {will-change: transform; left: auto; transform-origin: center center;  animation: l8 8s linear infinite;}
.v8 .section.right img {will-change: transform; left: auto; transform-origin: center center;  animation: r8 8s linear infinite;}
@keyframes l8 {
  0%, 100% { transform: rotateY(var(--angle2, -1deg)); }
  50%      { transform: rotateY(var(--angle1, 1deg)); }
}
@keyframes r8 {
  0%, 100% { transform: rotateY(var(--angle1, 1deg)); }
  50%      { transform: rotateY(var(--angle2, -1deg)); }
}
.v9 .section img {will-change: transform; left: auto; transform-origin: center center;  animation: l8 8s linear infinite;}

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
`;
document.head.appendChild(st);

var htm=`
<input type="checkbox" id="toggle-panel">
<div class="control-panel">
 <div class="panel-content">

   <select onchange="set_bg(this.value)">
    <option value="0">Фон (нет)<\/option>
    <option value="1">Простой1<\/option>
    <option value="2">Простой2<\/option>
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

   <select onchange="set_ef(this.value)">
    <option value="1">Эффект фона 2x<\/option>
    <option value="2">Центр<\/option>
    <option value="3">Слева<\/option>
    <option value="4">Справа<\/option>
    <option value="5">➡️ Сдвиг-1<\/option>
    <option value="6">⬅️ Сдвиг-2<\/option>
    <option value="8">🔄 Поворот-1<\/option>
    <option value="9">🔄 Поворот-2<\/option>
    <option value="7">Панорама 1x<\/option>
   <\/select>

   <select onchange="set_ov(this.value)">
    <option value="">Вид зеркала (нет)<\/option>
    <option value="mirror.png">PNG rbga 20кб<\/option>
    <option value="g25.jpg">JPG-25? 600кб<\/option>
    <option value="mirror.gif">GIF-A? 1.5мб<\/option>
    <option value="mirror.mp4">MP49! 65кб<\/option>
   <\/select>

   <select onchange="set_weather(this.value)">
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
//  state.x = Math.max(margin, Math.min(window.innerWidth - 100 - margin, state.x));
//  state.y = Math.max(margin, Math.min(window.innerHeight - 100 - margin, state.y));
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
 load_css_htm();
 set_o(0);// +oval ef0
 els('.hint').forEach(b => b.classList.remove('open'));
 var bb=el('id_btnBeauty'); bb.innerText = "Панель управления сказкой";
 //bb=bb.getClientRects()[0].top; window.scrollTo(0,bb);
 els('.zerk').forEach(b =>{b.className='zerk oo ooo'; b.innerHTML=set_a(''+b.textContent);});
 //after reload
 el('toggle-panel').checked = false;
 els('select').forEach(b => b.selectedIndex=0);
 o_run();//крутой обсервер для кнопок зеркал
 if(navigator.hardwareConcurrency<4) alert('слабый девайс, будет тормозить');
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
function set_w(){set_weather(rnd(10));setTimeout(set_w,11111);}
function run_panel(){log(window.innerWidth+':'+window.innerHeight);el('toggle-panel').checked = true; stopFairy();}

resizer(); start_fancy(); fly();
want_fs();startFairy();set_w();
var v=rnd(10);set_bg(''+v);if(v==8)set_ef('6');if(v==9)set_ef('8');if(v==4)set_ef('7');
if(rnd(3)){set_ov('');set_ov('mirror.png');}
resizer();
console.log('красота загружена');
//text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 0 10px aqua;

//mp49 вместо гифок

window.g_log='>';//вкл лог
async function run_mp49(name,x,y){
 var url=await sprite_preload(name+'.mp4',x,y,0.7);//зеркало 49 кадров
 if(url===0)return 0;//error
 gen_css_grid(x,y,'g49');
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
  object-fit:unset; width: ${nx*100}%; height:${ny*100}%; border-radius:0;
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

//========sprite_preloader=============
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
function fullCompare(a, b){//для четных длин! у нечетных последний не сравнивается
  if(a.length !== b.length) return false;
  let i,q=a.length >> 1,qq=q+q; //делим на 2
  for(i = q; i < qq ; i++){
    if(a[i] !== b[i]) return false;
    if(a[qq-i] !== b[qq-i]) return false;
  }  
  return true;//одинаковые
}
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
var g_timer_start=0;
async function sprite_preload(name,cols,rows,scale=1,bg=''){ // ОСНОВНАЯ ФУНКЦИЯ
  if(g_url) return g_url;
  g_timer_start = performance.now();
  g_mp4_status='busy';
  log('preload-start='+name);
  getUserDeviceParams();
  let video=null;

  try{
    video=document.createElement('video'); 
    video.muted=true; video.playsInline=true;
     document.body.appendChild(video);
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
 
for(let t = 0; t < frames; t++){
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
  del_video(video); 
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
log('спрайт готов='+frames);

  // выбираем лучший формат
  let mime='image/png',qual=1;
  if(!bg){mime='image/jpeg';qual=0.92;}

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





async function pause(t){await new Promise(r => setTimeout(r, t));}
