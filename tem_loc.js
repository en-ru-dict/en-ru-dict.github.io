//!Xing Soft 2024
var g_fa='';//global
var g_fa_tem='';//global
var g_fa_sek='';//global
var g_dict='';//global

function log(s){console.log(s+'');}
function len(d){ return d.length;}
function run_js(vPathScript,fun1,a1,a2){var sc;
 log('загружаем скрипт='+vPathScript);
 sc=document.createElement('script');sc.async=true;
 sc.src=''+vPathScript; document.head.appendChild(sc);
 sc.onerror=function(){log('no file='+sc.src+': error in run_js');}
 sc.onload=function(){
  if(!this.executed){
   this.executed=true;
   if(fun1)setTimeout(fun1,0,a1,a2);
  }
 }
 sc.onreadystatechange=function(){var self=this;
  if(this.readyState == "complete" || this.readyState == "loaded"){
   setTimeout(function(){self.onload()}, 0);
  }
 }
}
function save_s_to_Loc(name_el,s){
 try {localStorage.setItem(name_el,s);}
 catch(e) { if (e == QUOTA_EXCEEDED_ERR) alert('limit localStorage2');}
}
function load_s_from_Loc(name_el){
    var v=localStorage.getItem(name_el);
    if(v) return v;
    else return '';
}
function del_Loc(){localStorage.clear();alert('localStorage очищено');}
function del_LocElem(e){localStorage.removeItem(e+'');} //если нету то пофиг
function isLocalStorageAvailable() {
   try {return 'localStorage' in window && window['localStorage'] !== null;}
   catch(e) { return false;}
}
function put_v(id,s){var d=document.getElementById(id);if(d)d.value=s+'';}
function put_h(id,s){var d=document.getElementById(id);if(d)d.innerHTML=s+'';}
function put_src(id,u,w){var fl_err=1;
 if(u=='')u='pic/'+w+'.jpg';
    var o=document.getElementById(id);if(!o)return;
 o.onerror=function(){if(fl_err){fl_err=0;o.src='pic/'+g_pic;}}
    o.src=u;
}

function but_enable(id_but,n){var d,v;//1-0
    d=document.getElementById(id_but);
    if(d){
     if(n)d.disabled=false;
     else d.disabled=true;
    }
}
function replace_all(s,a,b){var s0=s+'',a0=a+'', b0=b+'', ms;
 if(s0.indexOf(a0)>=0){ms=s0.split(a0);s0=ms.join(b0);}
 return s0;
}
function zvez_v_kurs(s,p){var z,i=0,ms=[],v='',f=0; // *слово -> <i>слово</i>
 var sps=' ,.!?()[]{}"+%/~';//до них выделить
 if(!s)return '';
 s=s.trim()+' ';
 s=replace_all(s,',',', ');
 s=replace_all(s,'/',' <hr> ');
 s=replace_all(s,'@',' <hr class="mag"> ');
 p=p.trim();
 if(p){// (+) на перевод
  p=replace_all(p,' ','-');
  s=replace_all(s,'+ ',' + ');
  s=replace_all(s,' +',' + ');
  s=replace_all(s,' + ',' <i>'+p+'</i> ');
 }
 s=replace_all(s,'   ',' ');s=replace_all(s,'  ',' ');s=replace_all(s,'  ',' ');
 v='';f=0;
 for(i=0;i<len(s);i++){
  z=s.charAt(i);
  if(f==0)if(z=='*'){v+='<i>'; f=1;continue;}
  if(f==1)if(sps.indexOf(z)>=0){v+='</i>';f=0;}
  v+=z;
 }
 return v;
}
function get_tr2(w){ var m,tr,tr1,s=w+'';
 tr2 = {'ja':'я','ya':'я','ch':'ч','sh':'ш',
 'q':'к', 'w': 'в', 'e': 'е', 'r': 'р', 't':'т', 'y': 'и', 'u': 'у', 'i': 'и', 'o': 'о', 'p': 'п',
 'a': 'а', 's': 'с', 'd': 'д', 'f': 'ф', 'g': 'г', 'h': 'х', 'j': 'дж', 'k': 'к', 'l': 'л',
 'z': 'з', 'x': 'кс', 'c': 'ц', 'v': 'в', 'b': 'б', 'n': 'н', 'm': 'м' };
 for(tr in tr2){m=s.split(tr);s=m.join(tr2[tr]);}//=replace_all
 return s;
}
function get_tr3(tr){var i,tr2,b,out,dd=[],w=tr+'';
 tr3="ʤдж/ʧч/əэ/bб/æэ/kк/nн/dд/eе/tт/ʌа/aа/lл/iи/ɔо/rр/mм‌/ɑа/ʃш/uу/vв/pп/sс/jй/ŋн/zз/ʒж/wв/hх/oо/fф/θс/ðз/gг/";
 w=replace_all(w,'[','');w=replace_all(w,']','');
 dd=w.split('/');w=dd[0];//only amer tran
 out='';
 for(i=0;i<w.length;i++){
  b=w.charAt(i);
  if(b=='ʤ'){out+='дж'; continue;}
  if(b=='/'){out+='/'; continue;}
  n=tr3.indexOf(b);
  if(n<0){out+=b;continue;}
  out+=tr3.charAt(n+1);
 }
 out=replace_all(out,',','');
 out=replace_all(out,"'",'');
 out=replace_all(out,':','');
 out=replace_all(out,'йу', 'ью');
 return out;
}
function is_digit(s){s=s+'';if(s=='')return 0;return '1234567890'.indexOf(s)+1;}
function cut1(s){return s.substring(1);}
function cut2(s){return s.substring(2);}
function cut3(s){return s.substring(3);}
function simv1(s){return s.substring(0,1);}
function simv2(s){return s.substring(0,2);}
function simv3(s){return s.substring(0,3);}
function cut_tem(s){s=s+'';
    if(is_digit(simv1(s)))s=cut1(s);
    if(is_digit(simv1(s)))s=cut1(s);
    if(is_digit(simv1(s)))s=cut1(s);
    if(simv1(s)=='.')s=cut1(s);
    if(simv1(s)==' ')s=cut1(s);
    if(simv2(s)=='a ')s=cut2(s);
    if(simv3(s)=='an ')s=cut3(s);
    if(simv3(s)=='to ')s=cut3(s);
    return s;
}
function get_tr123(w,t){var tr1,tr2,tr3,out,i,dd=[];
  tr2=get_tr2(w); tr3=get_tr3(t);
  return t+' ('+tr3+')';
}
function next_word(n){var le=len(vu.$data.todos);
  if(!n)n=1;
  g_word+=n; if(g_word>=le){g_word=le-1;alert("конец списка");}
  show_card();
}
function prev_word(){var le=0,s='',d,n=0;
  g_word--;if(g_word<0){g_word=0;alert("начало списка");}
  show_card();
}
function load_card(){ g_word=0;show_card();}
function show_card(){var s,v='',n1,n2,w,t,p,fa,dp,da,pic;
  put_h('id_list',g_page);put_h('id_word',g_word);
 s=vu.$data.todos[g_word].text;
 v=''+g_api[s]+'||||||||';
  put_h("id_tek_word",s+'');
 ms=v.split('|');
 n1=s.indexOf('[');n2=s.indexOf(']');
 w=s.substring(0,n1);    w=w.trim();
 
 t=s.substring(n1,n2+1); t=t.trim();
 p=s.substring(n2+1);    p=p.trim();
 fa=zvez_v_kurs(ms[2],p)
 p=replace_all(p,',',', ');
 p=replace_all(p,'%%','(примерно похоже)')
 p=replace_all(p,'%','(очень похоже)');
 s=w+' - <i>'+p+'</i>'; w=cut_tem(w);
 t=get_tr123(w,t); t=t.replace('/',' / ');
  put_h('id_p0',s); //word+perevod
 if(len(s)>70)t='<br>'+t;
  put_h('id_p1',t); //tr123
  put_h('id_p2',fa);//best fa
  put_src('id_p3',ms[1],w);//pic
 dp=ms[3];if(dp=='')dp=get_dp(w);//доп.перевод
  put_h('id_p4',dp);
 da=ms[4]; if(da=='')da=get_da(w);//доп.асоц
 da=zvez_v_kurs(da,'');put_h('id_p5',da);
 put_h('id_p6','(разное) '+ms[5]);
 if(ms[5]=='')get_fa1(w);
}
function delit_s(s,d){ //делит строку по d
    var n=s.indexOf(d);if(n>=0)return[s.substring(0,n),s.substring(n)];
    return [s,'.'];
}
function ok_load_All(){var i,ms,n=0,s;
    save_s_to_Loc(g_page,g_api);g_api='';
    load_g_api_from_Loc();//g_api to a-mas
    log('ok_load_All '+g_page);
}
function load_All(n){
 if(n){g_page=get_page()+n;}
 run_js(get_page()+'/'+g_page+'.txt',ok_load_All);
}

function load_g_api_from_Loc(n){var i=0,ms=[],s='',dd=[];
 if(n)g_page=get_page()+n;//smena tek stranicy
 put_h('id_list0',g_page);
 if(!isLocalStorageAvailable())return;
 vu.$data.todos.length=0;g_api=[];
 s=localStorage.getItem(g_page);
 if(s){
  ms=s.split('\n');
  for(i=0;i<len(ms);i++)if(ms[i]){
    dd=delit_s(ms[i],'|');
    s=dd[0].trim();
    s=s.replace('[',' [');s=s.replace(']','] ');
    g_api[s]=dd[1];
    vu.$data.todos.push({text:s});
  }
 }
 else vu.$data.todos.push({text:'пустой список'})
}
function save_g_api_to_Loc(){ var i=0,s='',ss='';
 if(!isLocalStorageAvailable()){alert('нету localStorage?');return;}
 for(s in g_api)if(s.indexOf('[')>0){ss+=s+g_api[s]+'\n';}
 try {localStorage.setItem(g_page,ss);}
 catch(e) { if (e == QUOTA_EXCEEDED_ERR) alert('limit localStorage1');}
}

function get_dp(w){var t,o,d,n1,n2;//ищем слово в словаре
if(!w)return '_';
    n1=g_dict.indexOf('\n'+w.trim()+'|');
    if(n1<0){return '-';}
    n2=n1+1;
    while(1){ // добавляем примеры к слову
     n2=g_dict.indexOf('\n',n2+1);
     if(g_dict.charAt(n2+1)!='#')break;
    }
  o=g_dict.substring(n1+1,n2);
  o=replace_all(o,';','; ');o=replace_all(o,',',', ');
  o=replace_all(o,'|',' - ');
  o=replace_all(o,'\n','<br>');
  o=replace_all(o,'#','<hr>');
  return o;
}

function one_space(s){var i,out='',f=0,ss;
 for(i=0;i<len(s);i++){
   ss=s.charAt(i);
   if(ss==' '){
     if(f==1)continue;
     f=1;
   }
   else f=0;
   out+=ss;
 }
 return out;
}

function get_da(w){var out='',n1=0,n2=0,n=0,s='';//ищем fa по новому
 if(g_fa=='')return '-';//off
 w=w.trim(); if(!w)return;
  log('da w='+w);
 var out='';
 if(g_fa_tem){//ищем в fa_tem
  n=0; while(1){
   n1=g_fa_tem.indexOf('\n'+w+'/',n);if(n1<0)break;n2=n1+1;
   while(1){n2=g_fa_tem.indexOf('\n',n2+1);if(g_fa_tem.charAt(n2+1)!='/')break;}
   s=' *'+g_fa_tem.substring(n1+1,n2);
   out+=s+'@';n=n2+1;
  }
 }
 if(g_fa_sek){//ищем в fa_sek
  n=0; while(1){
   n1=g_fa_sek.indexOf('\n'+w+'~',n);if(n1<0)break;n2=n1+1;
   while(1){n2=g_fa_sek.indexOf('\n',n2+1);if(g_fa_sek.charAt(n2+1)!='/')break;}
   s=' *'+g_fa_sek.substring(n1+1,n2);
   out+=s+'@';n=n2+1;
  }
 }

 if(out=='')out='-@';
 out=out.substring(0,out.length-1);//del @

  out=replace_all(out,';','; ');
  out=replace_all(out,'\n',' <br> ');
  out=replace_all(out,'/',' <hr> ');
  out=one_space(out);
  return out;
}

function get_fa1(w){var out='',n1=0,n2=0,n=0,s='';//ищем fa по новому
 if(g_fa=='')return '-';//off
 w=w.trim(); if(!w)return;
  log('fa w='+w);
  //ищем в 16к по буквам
 s=w.charAt(0);
 if(s!=g_fa.charAt(1))run_js('fa/'+s+'-fa.txt',get_fa2,w);
 else get_fa2(w);
}
function get_fa2(w){var out='',n1=0,n2=0,n=0,s='';//словарь загружен
 var out='';
 if(g_fa){//ищем в fa_sek
  n=0; while(1){
   n1=g_fa.indexOf('\n'+w+'~',n);if(n1<0)break;n2=n1+1;
   while(1){n2=g_fa.indexOf('\n',n2+1);if(g_fa.charAt(n2+1)!='/')break;}
   s=' *'+g_fa.substring(n1+1,n2);
   out+=s+'@';n=n2+1;
  }
 }
 if(out=='')out='-@';
 out=out.substring(0,out.length-1);//del @
 out=replace_all(out,';','; ');
 out=replace_all(out,'\n',' <br> ');
 out=replace_all(out,'/',' <hr> ');
 out=one_space(out);
 out=zvez_v_kurs(out,'');put_h('id_p6',out);//в разное
}
function get_page(){
 if(len(g_page)<3)alert('g_page='+g_page);
 return g_page.substring(0,3);
}
 
function loader_fa(){
 if(g_fa_tem==''){g_fa_tem='1';run_js('fa-tem.txt',loader_fa);return;}
 if(g_fa_sek==''){g_fa_sek='1';run_js('fa-sek.txt',loader_fa);return;}
}
function load_dp(){run_js('dp6k.txt');document.getElementById("id_dp").style.backgroundColor='coral';}
function load_da(){g_fa='1';loader_fa();document.getElementById("id_da").style.backgroundColor='coral';}
//news
var g_news='';
//run_js('news.txt',function(){alert(g_news);}); мешает 
