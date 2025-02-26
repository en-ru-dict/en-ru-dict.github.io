/*! Xing Soft 2025 */
function log(s){console.log(s+'');}
function len(d){ return d.length;}
function replace_all(s,a,b){var s0=s+'',a0=a+'', b0=b+'', ms;
 if(s0.indexOf(a0)>=0){ms=s0.split(a0);s0=ms.join(b0);}
 return s0;
}
function run_js(vPathScript,fun1,a1,a2){
 log('00загружаем скрипт='+vPathScript);
 let promise = new Promise(function(resolve, reject) {
    let script = document.createElement('script');
    script.src = vPathScript;
    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`Ошибка загрузки скрипта ${src}`));
    document.head.append(script);
  });
 promise.then(
  script => {log(`${script.src} загружен!`);if(fun1)fun1(a1,a2);},
  error => log(`Ошибка: ${error.message}`)
);
}
function get_keys2(){var dd=[],ms=[],i=0,keys=[]; //делаем ключи для автозавершения
  ms=g_dict.split('\n');
  keys=[];for(i=0;i<ms.length;i++){dd=ms[i].split('[');if(dd.length>1)keys.push(dd[0]);}
  return keys;
}
function show_perevod() {var w,t,o,d,n1,n2,da;//ищем слово в словаре
  w=document.getElementById("id_input").value;
  w=w.toLowerCase();w=w.trim();
  w=replace_all(w,' ','-');
   d=document.getElementById("id_output");
    n1=g_dict.indexOf('\n'+w+'[');
    if(n1<0){d.innerHTML='нет такого слова (если глючит - перезагрузите стр)';put_h('id_p5','*');put_h('id_p6','*');return;}
    n2=n1+1;
    while(1){ // добавляем примеры к слову
     n2=g_dict.indexOf('\n',n2+1);
     if(g_dict.charAt(n2+1)!='#')break;
    }
  o=g_dict.substring(n1+1,n2);
  o=replace_all(o,';','; ');
  o=replace_all(o,'[','</b> <a>[');
  o=replace_all(o,']',']</a> ');
  o=replace_all(o,'\n','<br>');
  o=replace_all(o,'#','<hr>');
  d.innerHTML='<b>'+o;
  if(window['g_fa_tem']==undefined)return;
  da=get_da(w);da=zvez_v_kurs(da,'');
  put_h('id_p5',da);
  get_fa1(w);
}
function loader(){setTimeout(loader2,0);}

function loader2(){var w,lat='qwertyuiopasdfghjklzxcvbnm';
  w=document.getElementById("id_input").value;
  log(w); w=w.charAt(0).toLowerCase();
  if(g_dict.charAt(1)!=w)if(lat.indexOf(w)>=0){//грузим нужный словарь и делаем keys
	  document.getElementById("id_input").style.backgroundColor='coral';
	log('загрузка словаря на ('+w+')'); 
	run_js(w+'_big.txt',loader3);
  }
}  
function loader3(){
	document.getElementById("id_input").style.backgroundColor='honeydew';//aquamarine';
   log('словарь загружен, делаем keys'); 	
   lang = "en";
   keys = get_keys2();
   log('keys сделаны'); 
   suggest_entry();
}
function font_small(){
	var d=document.getElementById("id_output");
	if(d.style.fontSize=='medium')d.style.fontSize='small';
	if(d.style.fontSize=='x-large')d.style.fontSize='medium';
	if(d.style.fontSize=='')d.style.fontSize='x-large';
}
function get_fa0(w){var n1,n2,o;//old
	if(window['g_fa']==undefined)return '';
    n1=g_fa.indexOf('\n'+w+'/');
    if(n1<0){return 'нет ФА для этого слова';}
    n2=n1+1;
    while(1){ 
     n2=g_fa.indexOf('\n',n2+1);
     if(g_fa.charAt(n2+1)!='/')break;
    }
  o=g_fa.substring(n1+1,n2);
  o=replace_all(o,'/','<hr>');
  return o;
}

function suggest_entry() {
  var demo1 = new autoComplete({
    selector: '#id_input',
    minChars: 3,
    source: function(term, suggest){
      term = term.toLowerCase();
      var choices=keys;
      var suggestions=[];
      for(var i=0;i<choices.length;i++)if(~choices[i].toLowerCase().indexOf(term)) suggestions.push(choices[i]);
      suggest(suggestions);
    }
  });
}


// JavaScript autoComplete v1.0.4
var autoComplete=function(){function e(e){function t(e,t){return e.classList?e.classList.contains(t):new RegExp("\\b"+t+"\\b").test(e.className)}function o(e,t,o){e.attachEvent?e.attachEvent("on"+t,o):e.addEventListener(t,o)}function s(e,t,o){e.detachEvent?e.detachEvent("on"+t,o):e.removeEventListener(t,o)}function n(e,s,n,l){o(l||document,s,function(o){for(var s,l=o.target||o.srcElement;l&&!(s=t(l,e));)l=l.parentElement;s&&n.call(l,o)})}if(document.querySelector){var l={selector:0,source:0,minChars:3,delay:150,offsetLeft:0,offsetTop:1,cache:1,menuClass:"",renderItem:function(e,t){t=t.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&");var o=new RegExp("("+t.split(" ").join("|")+")","gi");return'<div class="autocomplete-suggestion" data-val="'+e+'">'+e.replace(o,"<b>$1</b>")+"</div>"},onSelect:function(){}};for(var c in e)e.hasOwnProperty(c)&&(l[c]=e[c]);for(var a="object"==typeof l.selector?[l.selector]:document.querySelectorAll(l.selector),u=0;u<a.length;u++){var i=a[u];i.sc=document.createElement("div"),i.sc.className="autocomplete-suggestions "+l.menuClass,i.autocompleteAttr=i.getAttribute("autocomplete"),i.setAttribute("autocomplete","off"),i.cache={},i.last_val="",i.updateSC=function(e,t){var o=i.getBoundingClientRect();if(i.sc.style.left=Math.round(o.left+(window.pageXOffset||document.documentElement.scrollLeft)+l.offsetLeft)+"px",i.sc.style.top=Math.round(o.bottom+(window.pageYOffset||document.documentElement.scrollTop)+l.offsetTop)+"px",i.sc.style.width=Math.round(o.right-o.left)+"px",!e&&(i.sc.style.display="block",i.sc.maxHeight||(i.sc.maxHeight=parseInt((window.getComputedStyle?getComputedStyle(i.sc,null):i.sc.currentStyle).maxHeight)),i.sc.suggestionHeight||(i.sc.suggestionHeight=i.sc.querySelector(".autocomplete-suggestion").offsetHeight),i.sc.suggestionHeight))if(t){var s=i.sc.scrollTop,n=t.getBoundingClientRect().top-i.sc.getBoundingClientRect().top;n+i.sc.suggestionHeight-i.sc.maxHeight>0?i.sc.scrollTop=n+i.sc.suggestionHeight+s-i.sc.maxHeight:0>n&&(i.sc.scrollTop=n+s)}else i.sc.scrollTop=0},o(window,"resize",i.updateSC),document.body.appendChild(i.sc),n("autocomplete-suggestion","mouseleave",function(){var e=i.sc.querySelector(".autocomplete-suggestion.selected");e&&setTimeout(function(){e.className=e.className.replace("selected","")},20)},i.sc),n("autocomplete-suggestion","mouseover",function(){var e=i.sc.querySelector(".autocomplete-suggestion.selected");e&&(e.className=e.className.replace("selected","")),this.className+=" selected"},i.sc),n("autocomplete-suggestion","mousedown",function(e){if(t(this,"autocomplete-suggestion")){var o=this.getAttribute("data-val");i.value=o,l.onSelect(e,o,this),i.sc.style.display="none"}},i.sc),i.blurHandler=function(){try{var e=document.querySelector(".autocomplete-suggestions:hover")}catch(t){var e=0}e?i!==document.activeElement&&setTimeout(function(){i.focus()},20):(i.last_val=i.value,i.sc.style.display="none",setTimeout(function(){i.sc.style.display="none"},350))},o(i,"blur",i.blurHandler);var r=function(e){var t=i.value;if(i.cache[t]=e,e.length&&t.length>=l.minChars){for(var o="",s=0;s<e.length;s++)o+=l.renderItem(e[s],t);i.sc.innerHTML=o,i.updateSC(0)}else i.sc.style.display="none"};i.keydownHandler=function(e){var t=window.event?e.keyCode:e.which;if((40==t||38==t)&&i.sc.innerHTML){var o,s=i.sc.querySelector(".autocomplete-suggestion.selected");return s?(o=40==t?s.nextSibling:s.previousSibling,o?(s.className=s.className.replace("selected",""),o.className+=" selected",i.value=o.getAttribute("data-val")):(s.className=s.className.replace("selected",""),i.value=i.last_val,o=0)):(o=40==t?i.sc.querySelector(".autocomplete-suggestion"):i.sc.childNodes[i.sc.childNodes.length-1],o.className+=" selected",i.value=o.getAttribute("data-val")),i.updateSC(0,o),!1}if(27==t)i.value=i.last_val,i.sc.style.display="none";else if(13==t||9==t){var s=i.sc.querySelector(".autocomplete-suggestion.selected");s&&"none"!=i.sc.style.display&&(l.onSelect(e,s.getAttribute("data-val"),s),setTimeout(function(){i.sc.style.display="none"},20))}},o(i,"keydown",i.keydownHandler),i.keyupHandler=function(e){var t=window.event?e.keyCode:e.which;if(!t||(35>t||t>40)&&13!=t&&27!=t){var o=i.value;if(o.length>=l.minChars){if(o!=i.last_val){if(i.last_val=o,clearTimeout(i.timer),l.cache){if(o in i.cache)return void r(i.cache[o]);for(var s=1;s<o.length-l.minChars;s++){var n=o.slice(0,o.length-s);if(n in i.cache&&!i.cache[n].length)return void r([])}}i.timer=setTimeout(function(){l.source(o,r)},l.delay)}}else i.last_val=o,i.sc.style.display="none"}},o(i,"keyup",i.keyupHandler),i.focusHandler=function(e){i.last_val="\n",i.keyupHandler(e)},l.minChars||o(i,"focus",i.focusHandler)}this.destroy=function(){for(var e=0;e<a.length;e++){var t=a[e];s(window,"resize",t.updateSC),s(t,"blur",t.blurHandler),s(t,"focus",t.focusHandler),s(t,"keydown",t.keydownHandler),s(t,"keyup",t.keyupHandler),t.autocompleteAttr?t.setAttribute("autocomplete",t.autocompleteAttr):t.removeAttribute("autocomplete"),document.body.removeChild(t.sc),t=null}}}}return e}();!function(){"function"==typeof define&&define.amd?define("autoComplete",function(){return autoComplete}):"undefined"!=typeof module&&module.exports?module.exports=autoComplete:window.autoComplete=autoComplete}();

