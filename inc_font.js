var g_font_busy=0;

function inc_font3(f){
 var b=document.getElementById('id_inc_font'); 
 if(!b) return alert('нет кнопки с id_inc_font');
 b.innerText='+'; b.disabled=false;
 g_font_busy=0; console.log('font-size='+f+'px');
}
function inc_font2(f){
 document.documentElement.style.fontSize=f+'px';
 setTimeout(inc_font3,500,f);
}
function inc_font(){
 if(g_font_busy)return 0; g_font_busy=1;
 var b=document.getElementById('id_inc_font'); 
 if(!b) return alert('нет кнопки с id_inc_font');
 var f=Number.parseInt('0'+document.documentElement.style.fontSize);
 f=f? f+2: 22;
 b.innerText='...'+f; b.disabled=true;
 setTimeout(inc_font2,150,f);
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
 <a href="http://www.24log.de" target="_blank"><img src="http://counter.24log.ru/buttons/cl4/48-0.gif" alt="counter" title=""><\/a>
 <a href="http://www.24log.ru" target="_blank"><img src="http://counter.24log.ru/count4_282346_48_1_6.pcx" alt="счетчик" title=""><\/a>
 <hr>
 <div class="foot">♥ Сайт работает 2023-2026г ♥<\/div>
<\/div>
`;
 document.body.insertAdjacentHTML('beforeend',htm);
}
add_inc_font();
