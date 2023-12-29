var g_page='';//global
var g_word=0;//global
if(window['g_api']!=undefined)alert('g_api in use!');g_api='error';//global

function log(s){console.log(s+'');}
function len(d){ return d.length;}
function run_js(vPathScript,fun1){var sc;
  sc=document.createElement('script');sc.async=true;
 sc.src=''+vPathScript; document.head.appendChild(sc);
 sc.onerror=function(){console.log('no file='+vPathScript+': error in run_js');}
 sc.onload=function(){
  if(!this.executed){
   this.executed=true;
   if(fun1)setTimeout(fun1,0);
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
function put_src(id,s){var d=document.getElementById(id);if(s==undefined)s='';if(d)d.src=s+'';}

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
function zvez_v_kurs(s,w){var dd=[],i=0,ms=[],v=''; // *слово  <i>слово</i>
	//меняем + на слово перевод
	s=s+' ';w=w+'';w='*'+w.trim();
	s=replace_all(s,'+ ',w+' ');
	
	s=replace_all(s,'/',' <hr> ');
    ms=s.split(' ');
    for(i=0;i<len(ms);i++)if(ms[i].substring(0,1)=='*')ms[i]='<i>'+ms[i].substring(1)+'</i>';
    return ms.join(' ');
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
 return out;
}
function is_digit(s){s=s+'';if(s=='')return 0;return '1234567890'.indexOf(s)+1;}
function cut1(s){return s.substring(1);}
function simv1(s){return s.substring(0,1);}
function simv2(s){return s.substring(0,2);}
function simv3(s){return s.substring(0,3);}
function cut_tem(s){
    if(is_digit(simv1(s)))s=cut1(s);
    if(is_digit(simv1(s)))s=cut1(s);
    if(is_digit(simv1(s)))s=cut1(s);
    if(simv1(s)=='.')s=cut1(s);
    if(simv1(s)==' ')s=cut1(s);
    if(simv2(s)=='a '){s=cut1(s);s=cut1(s);}
    if(simv3(s)=='an '){s=cut1(s);s=cut1(s);s=cut1(s);}
    if(simv3(s)=='to '){s=cut1(s);s=cut1(s);s=cut1(s);}
 return s;
}
function get_tr123(w,t){var tr1,tr2,tr3,out,i,dd=[];
  tr2=get_tr2(w); tr3=get_tr3(t);
  return t+'('+tr2+'; '+tr3+')';
}
function next_word(n){var le=len(vu.$data.todos);
  g_word+=n; if(g_word>=le){g_word=le-1;alert("конец списка");}
  show_card();
  return;
}
function prev_word(){var le=0,s='',d,n=0;
  g_word--;if(g_word<0){g_word=0;alert("начало списка");}
  show_card();
  return ;
}

function load_card(){
 g_word=0;show_card();
}
function show_card(){var s,v='',n1,n2,w,t,p,a;
 put_h('id_list',g_page);put_h('id_word',g_word);
 s=vu.$data.todos[g_word].text;
 v=g_api[s];if(!v)v='w?[t?]p?|i?|a?|dp?|da?|';
 put_h("id_tek_word",s+'');
 v+='||||||||';
 ms=v.split('|');
 n1=s.indexOf('[');n2=s.indexOf(']');
 w=s.substring(0,n1);t=s.substring(n1,n2+1);p=s.substring(n2+1);
 s=w+' - '+p; w=cut_tem(w);
 t=get_tr123(w,t); t=t.replace('/',' / '); t=t.replace(']','] ');
 a=zvez_v_kurs(ms[2],p);
 put_h('id_p0',s); //word+perevod
 put_h('id_p1',t); //tr123
 put_h('id_p2',a);//fa
 put_src('id_p3',ms[1]);//pic
 put_h('id_p4','(доп.перевод) '+ms[3]);
 put_h('id_p5','(доп.ассоц) '+ms[4]);
 put_h('id_p6','(разное) '+ms[5]);
 
}
//=============локально из скриптов=============
function delit_s(s,d){ //делит строку по d
    var n=s.indexOf(d);if(n>=0)return[s.substring(0,n),s.substring(n)];
    return [s,'?'];
}
function ok_load_All(){var i,ms,n=0,s;
    save_s_to_Loc(g_page,g_api);g_api='';
    load_g_api_from_Loc();//g_api to a-mas
    log('ok_load_All '+g_page+' len='+len(g_api));
}
function load_All(n){
 if(n){g_page='tem'+n;}
 run_js(g_page+'.txt',ok_load_All);
}

function load_g_api_from_Loc(n){var i=0,ms=[],s='',dd=[];
 if(n)g_page='tem'+n;//smena tek stranicy
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
