function inc_font(){
  var n=document.documentElement.style.fontSize;
  if(!n)n=22; else n=Number.parseInt(n)+2;
  document.documentElement.style.fontSize=n+'px';
}
function add_inc_font(){
var htm=`
<style>
.title {
  font-weight:bold; color: aliceblue;
  text-shadow: 0 0 4px black, 0 0 4px black, 0 0 4px black, 0 0 4px black, 0 0 4px black,
   0 0 4px black,  0 0 4px black,  0 0 4px black,  0 0 4px black, 0 0 4px black,
   0 0 10px lime;
 }
.aquamarine {color:aquamarine;}
.gold {color:gold;}

.center {text-align:center;}
#id_inc_font {
 position:absolute;right:0;top:0;z-index:999;
 color: #fff; background: red;
 font-weight: 600; font-size: 2em; line-height: 1;
 border: 1px dotted #000; border-radius: 10px;
 display: inline-block; padding: 3px 7px;  margin: 0; box-sizing: border-box;
 text-shadow: 1px -1px 1px #000,1px 1px 0px rgba(0, 0, 0, 0.5);
 box-shadow: inset 2px 2px 8px 3px darkorange; cursor:pointer;
}
<\/style>
<div id="id_inc_font" onclick="inc_font();">+<\/div>
<div class="center">
 <a href="http://www.24log.de" target="_blank"><img src="https://counter.24log.ru/buttons/cl4/48-0.gif" alt="counter" title=""><\/a>
 <a href="http://www.24log.ru" target="_blank"><img src="https://counter.24log.ru/count4_282346_48_1_6.pcx" alt="счетчик" title=""><\/a>
 <hr>
 <div class="foot">♥ Сайт работает 2023-2026г ♥<\/div>
<\/div>
`;
 document.body.insertAdjacentHTML('beforeend',htm);
}
add_inc_font();
