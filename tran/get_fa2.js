/*! Xing Soft 2026 v2*/
//get_fa+all.js / 600+1600+3200+3700+old(sek,tem,bukv)
var g_dict='';
var g_new_fa='';
var g_mfa='';
var g_fa='';
var g_old_fa='';

function el(id){return document.getElementById('' + id);}
function replace_all(s,a,b){var s0=s+'',a0=a+'', b0=b+'', ms;
 if(s0.indexOf(a0)>=0){ms=s0.split(a0);s0=ms.join(b0);}
 return s0;
}
function one_sp(s){return s.replace(/[ ]+/g,' ');}
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

function end_dict(){
 msg('/dict6k загружен='+g_dict.length);
 end_load_fa();
}
function end_new(){
 msg('/fa new загружены='+g_new_fa.length);
 end_load_fa();
}
function end_old(){
 msg('/fa old загружены='+g_old_fa.length);
 end_load_fa();
}

function start_load_fa(){
 set_timer();
 var p=getLibPath('get_fa2');
 msg('/Загружается словарь 6k <b>Ждите..</b>');
 g_dict='';load_js(p+'dict_6k.txt',end_dict);
 msg('/Загружаются fa new <b>Ждите..</b>');
 g_new_fa='';load_js(p+'new_fa.txt',end_new);
 msg('/Загружаются fa old <b>Ждите..</b>');
 g_old_fa='';load_js(p+'old_fa.txt',end_old);
}
function end_load_fa(){
 if(g_new_fa && g_old_fa && g_dict){
  var t='всё загружено успешно='+get_timer()+'ms';
  msg('<hr>'+t);
  document.getElementById('id_input').focus();
  if(window['suggest_entry'])suggest_entry();
  setTimeout(hide_msg,5000);
  if(window['show_fa'])show_fa();
 }
}

function get_dict(w){var n,k,t='';
 if(!window['g_dict'])return alert('err: dict_6k.txt не загружен!') || '?';
 n=g_dict.indexOf('\n'+w+'[');
 if(n<0)return '';
 k=g_dict.indexOf('\n',n+1);
 if(k<0)alert('get_dict err1='+w);
 t=g_dict.substring(n+w.length+1,k);
 return t;
}
function get_str(t,n){var k;
 for(k=n;k<t.length;k++)if(t.charAt(k)=='\n')break;//есть 100%
 for(n=n;n>=0;n--)if(t.charAt(n)=='\n')break; //если не нашёл то n=-1;
 return t.substring(n+1,k);
}
function get_f(t,w){var n,k=0,out='';
 t='\n'+t+'\n';	
 if(w.trim()=='')alert('пустое слово для get_f');
 while(1){
  n=t.indexOf('\n'+w+'/',k); if(n<0)return out;
  k=t.indexOf('\n',n+2); if(k<0){console.log('нет конца строки для='+n);return 'err';}
  s=t.substring(n+w.length+1,k);
  out+=s.trim()+'\n';
 }
}
function get_fff(t,w,n,k){var out,n1,n2;
 n2=0;out='';
 while(1){
  n1=t.indexOf(n+w+k,n2);
  if(n1<1){return out;}
  out+='/'+get_str(t,n1)+'\n';
  n2=n1+1;
 } 
}
//имена\n<-(w~ (w[ /w~ /w[ |w[ |w~ ->\n
function get_ff(t,w){var n,k=0,out='';
 t='\n'+t+'\n';	
 if(w=='')alert('пустое слово для get_f');
 out+=get_fff(t,w,'(','~'); out+=get_fff(t,w,'(','[');
 out+=get_fff(t,w,'/','~'); out+=get_fff(t,w,'/','[');
 out+=get_fff(t,w,'|','~'); out+=get_fff(t,w,'|','[');
 return replace_all(out,w,'<a>'+w+'</a>');
}
//  \nw~    
// g_new_fa='';\nw/ 3секции
// g_mfa='';//имена\n<-(w~ (w[ /w~ /w[ ->\n
// g_fa='';\nw/
// g_old_fa='';\nw/
function get_fa2(w){var out,n,k,s,t;
 w=''+w;w=w.trim();out='';
 s=get_f(g_new_fa,w); s=s.replace('/','<a>').replace('|','</a>/');
 if(!s)s=get_ff(g_new_fa,w);//ищем в 3й секции
 if(s)out+=s+'<hr>';
 s=get_ff(g_mfa,w); if(s)out+=s+'<hr>';//mfa
 s=get_f(g_fa,w); if(s)out+=s+'<hr>';
 s=get_f(g_old_fa,w); if(s)out+='==<a>старые ФА хуже и дубли</a>==<hr>'+s+'<hr>';
 return out;
}

function del_zn(s){
  s=replace_all(s,' ','');
  s=replace_all(s,'.','');
  s=replace_all(s,',','');
  s=replace_all(s,';','');
  s=replace_all(s,'-','');
  s=replace_all(s,'*','');
  s=replace_all(s,'|','');
  s=replace_all(s,'!','');
  s=replace_all(s,'~','');
  s=replace_all(s,'/','');
  return s;
}
function cmp_fa(s1,s2){
  s1=s1.trim().toLowerCase();
  s2=s2.trim().toLowerCase();
  if(s1==s2)return 1;
  if(del_zn(s1)==del_zn(s2))return 2;
  return 0;
}
function zv(s){ var v,f,i,out;
  var rus='йцукенгшщзхъфывапролджэячсмитьбюё-ЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮЁ';
  f=0;s=s+' ';out='';
  for(i=0;i<s.length;i++){
    v=s.charAt(i);
    if(f==0)if(v=='*'){out+='<i>*'; f=1; continue;}
    if(f==1)if(rus.indexOf(v)<0){out+='</i>';f=0;}
    out+=v;
  }
  return out;
}
function zagl(s){var n,k,ww,i,w,ss,f//заглавные рус.буквы окружаем тегом b
 var rus2='ЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮЁ';
 s=s+' ';n=s.length;k=0;ww='';f=0;
 for(i=0;i<n;i++){
  w=s.charAt(i);
  if(f==0)if(w=='~')f=1;
  if(k==1)if(rus2.indexOf(w)<0){k=0;if(f==0)w='</b>'+w;}//ниже не найдет такое
  if(k==0)if(rus2.indexOf(w)>=0){if(f==0)w='<b>'+w;k=1;}
  if(f==1){if(w==')')f=0;if(w==' ')f=0;}
  ww+=w;
 }
 return ww.trim();
}

function getLibPath(name){var ss,i,s;
 ss=document.getElementsByTagName('script');
 for(i=0;i<ss.length;i++){
  s=''+ss[i].src;
  if(s.indexOf('/'+name+'.js')>0) return s.substring(0,s.lastIndexOf('/')+1);
 }
 return '';
}

start_load_fa();
