/*! Xing Soft 2026 */
//====get_tran.js====
var g_tran_us='';
var g_tran_uk='';
var g_dict='';

function el(id){return document.getElementById('' + id);}
function replace_all(s,a,b){var s0=s+'',a0=a+'', b0=b+'', ms;
 if(s0.indexOf(a0)>=0){ms=s0.split(a0);s0=ms.join(b0);}
 return s0;
}
var g_timer_start=0;
function set_timer(){g_timer_start = performance.now();}
function get_timer(){return performance.now()-g_timer_start;}
function msg(s){ var e=el('id_info');if(e)e.innerHTML+=''+s+'<br>';console.log(s);}
function hide_msg(){var e=el('id_info');if(e)e.innerHTML='';}

async function load_js(name,fn){
 msg('load_js: началась загрузка ' + name);
 var s = document.createElement('script');
 s.onload = () => {if(fn)fn();};
 s.onerror = () => {alert('load err='+name);}
 s.src = ''+name; s.async=true; document.head.appendChild(s);
}

function end_us(){
 msg('/словарь us загружен='+g_tran_us.length);
 g_tran_us='\n'+g_tran_us+'\n';
 end_load();
}
function end_uk(){
 msg('/словарь uk загружен='+g_tran_uk.length);
 g_tran_uk='\n'+g_tran_uk+'\n';
 end_load();
}
function end_dict(){
 msg('/словарь dict загружен='+g_dict.length);
 g_dict='\n'+g_dict+'\n';
 end_load();
}

function start_load(){
 set_timer();
 var p=getLibPath('get_tran');
 msg('/Загружается словарь us <b>Ждите..</b>');
 g_tran_us='';load_js(p+'tran_us.txt',end_us);
 msg('/Загружается словарь uk <b>Ждите..</b>');
 g_tran_uk='';load_js(p+'tran_uk.txt',end_uk);
 msg('/Загружается словарь dict. <b>Ждите..</b>');
 g_dict='';   load_js(p+'dict_50k.txt',end_dict);
}
function end_load(){
 if(g_tran_us && g_tran_us && g_dict){
  var t='всё загружено успешно='+get_timer()+'ms';
  msg('<hr>'+t);
  document.getElementById('id_input').focus();
  if(window['suggest_entry'])suggest_entry2();
  setTimeout(hide_msg,5000);
 }
}

function get_dict(w,p){var n,k,t='';
 if(!window['g_dict'])return alert('err: dict_50k.txt не загружен!') || '?';
 n=g_dict.indexOf('\n'+w+'|');
 if(n<0)return '-';
 k=g_dict.indexOf('\n',n+1);
 if(k<0)alert('get_dict err1='+w);
 t=g_dict.substring(n+w.length+2,k);
 if(p){
 t+='<hr>\n';
  while(1){
   if(g_dict.charAt(k+1)!='#')break;
   n=k+1;
   k=g_dict.indexOf('\n',n);if(k<0)alert('get_dict err2='+w);
   t+=g_dict.substring(n,k+1);
  }
 }
 return t;
}

function norm_tran(s){
  s=replace_all(s,'dʒ','ʤ');
  s=replace_all(s,'tʃ','ʧ');
  s=replace_all(s,'ɛ','e');
  s=replace_all(s,'ɪ','i');
  s=replace_all(s,'ʊ','u');
  s=replace_all(s,'ɒ','ɔ');
  s=replace_all(s,'ɡ','g');
  s=replace_all(s,'ɜ','ə');
  s=replace_all(s,'ɫ','l');
  s=replace_all(s,'ɹ',"r");
  s=replace_all(s,'ɝ',"ər");
  return s;
}
g_tabl_tr='';
function tran_rus(s){var m,i,w,out,z,n;
 s=s.trim();
 if(!s)return '';
 s=replace_all(s,'əː','@');
 if(!g_tabl_tr){
  g_tabl_tr=new Map();
  m="@/ё|ʤ/дж|ʒ/ж|ɑ/а|ː/:|ˈ/'|ˌ/.|ʧ/ч|ʃ/ш|ə/э|ɔ/о|ŋ/Н|θ/С|ð/З|w/В|æ/Э|ʌ/А|ɐ/э|e/е|r/р|t/т|u/у|i/и|o/о|p/п|a/а|s/с|d/д|f/ф|g/г|h/х|j/й|k/к|l/л|z/з|v/в|b/б|n/н|m/м";
  m=m.split('|');for(i=0;i<m.length;i++){w=m[i].split('/');g_tabl_tr.set(w[0],w[1]);}
  g_tabl_tr.set('/','/');
 }
 out='';
 for(i=0;i<s.length;i++){
	 w=s.charAt(i);
     z=g_tabl_tr.get(w);
	 if(!z)alert('непонятная транскрипция='+s);
	 out+=z;
 }
 out=replace_all(out,'йу','ю');
 out=replace_all(out,'йо','ё');
 out=replace_all(out,'йа','я');
 out=replace_all(out,'йэ','ьэ');
 return out;
}

function del_tran_simv(ss){
	var s=ss.trim();
	s=replace_all(s,':','');s=replace_all(s,'ː','');
	s=replace_all(s,'.','');s=replace_all(s,'ˌ','');
	s=replace_all(s,"'",'');s=replace_all(s,"ˈ",'');
	return s;
}
function del_tran_dub(us,uk){var s,m,mm,i;
 s='/'+del_tran_simv(us)+'/';
 m=uk.split('/');
 mm=[];
 for(i=0;i<m.length;i++)if(s.indexOf('/'+del_tran_simv(m[i])+'/')<0)mm.push(m[i]);
 return mm.join('/');
}

function get_tran(w){var n,k,us,uk,ru;
 if(!window['g_tran_us'])return alert('err: tran_us.txt не загружен!') || '?';
 if(!window['g_tran_uk'])return alert('err: tran_uk.txt не загружен!') || '?';
 us=''; n=g_tran_us.indexOf('\n'+w+'|');
 if(n>=0){
  k=g_tran_us.indexOf('\n',n+1);
  if(k>=0)us=g_tran_us.substring(n+w.length+2,k);
 }
 uk=''; n=g_tran_uk.indexOf('\n'+w+'|');
 if(n>=0){
  k=g_tran_uk.indexOf('\n',n+1);
  if(k>=0)uk=g_tran_uk.substring(n+w.length+2,k);
 }
 uk=del_tran_dub(us,uk);
 ru=tran_rus(us);
 return '['+us+']['+uk+']['+ru+']';
}


// Компактная база замен: звук|замена
const rawMap ="əː|ё|ʤ|дж|ʧ|ч|ʒ|ж|ɑ|а|ː|:|ˈ|'|ˌ|.|ʃ|ш|ə|э|ɔ|о|ŋ|н|θ|с|ð|з|w|в|æ|э|ʌ|а|ɐ|э|e|е|r|р|t|т|u|у|i|и|o|о|p|п|a|а|s|с|d|д|f|ф|g|г|h|х|j|й|k|к|l|л|z|з|v|в|b|б|n|н|m|м";
 // Один раз при загрузке создаем массив пар, отсортированный по длине (важно!)
 const tranPairs = rawMap.split('|').reduce((acc, val, i, arr) => {
    if(i % 2 === 0) acc.push([val, arr[i+1]]);
     return acc;
 }, []).sort((a, b) => b[0].length - a[0].length); // Сначала длинные (əː), потом короткие (ə)

function tran_rus_v3(s){
  if(!s) return '';
  let out = s.toLowerCase();
  // 1. Массовая замена по словарю
  tranPairs.forEach(([sound, ru]) => {
   if(out.indexOf(sound) >= 0)out = out.split(sound).join(ru);
  });

  // 2. Финальная «шлифовка» гласных
  const fixes = "йу|ю|йо|ё|йа|я|йэ|ьэ".split('|');
  for(let i=0;i<fixes.length;i+=2) out = out.split(fixes[i]).join(fixes[i+1]);
  return out;
}

 function suggest_entry2() {
   new autoComplete({
     selector: '#id_input',
     minChars: 3,
     source: function(term, suggest) {
       // Так как в файле всё в нижнем регистре, term.toLowerCase() делаем один раз
       var query = '\n' + term.toLowerCase();
       var suggestions = [];
       var n = -1;

       // Ищем первые 15 совпадений прямо в гигантской строке
       while (suggestions.length < 15) {
         n = g_tran_us.indexOf(query, n + 1);
         if (n < 0) break;

         // Нашли начало строки, теперь берем слово до разделителя '[' или '|'
         var start = n + 1;
         var end = g_tran_us.indexOf('|', start);
         if (end > start) {
           suggestions.push(g_tran_us.substring(start, end));
         }
       }
       suggest(suggestions);
     }
   });
 }
function getLibPath(name){var ss,i,s;
 ss=document.getElementsByTagName('script');
 for(i=0;i<ss.length;i++){
  s=''+ss[i].src;
  if(s.indexOf('/'+name+'.js')>0) return s.substring(0,s.lastIndexOf('/')+1);
 }
 return '';
}

start_load();
