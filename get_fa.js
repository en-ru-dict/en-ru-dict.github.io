//get FA from 3700 600 1500 1600 3200 old
var g_txt='';
var g_old='';

function elv(id,v,d){
  var e=document.getElementById(''+id);
  if(!e){
    if(v===0)return null;//mute tiho
    alert('нет элемента='+id);return null;
  }
  if(v==='v' || v==='val'){if(!e.value)return 0;       if(d===undefined)return e.value;      e.value=''+d;      return 1;}
  if(v==='h' || v==='htm'){if(!e.innerHTML)return 0;   if(d===undefined)return e.innerHTML;  e.innerHTML=''+d;  return 1;}
  if(v==='t' || v==='txt'){if(!e.textContent)return 0; if(d===undefined)return e.textContent;e.textContent=''+d;return 1;}
  return e;
}
function els(s,del){var e=document.querySelectorAll(''+s);if(del)e.forEach(b=>b.remove());return e;}
window.g_log='>';
function log(t,o){ if(!o) o='';
  if(window['g_log']) g_log+= t+'/'+o+'\n';
  if(o)console.log(''+t,o);else console.log(''+t);
}
function replace_all(s,a,b){var s0=s+'',a0=a+'', b0=b+'', ms;
  if(s0.indexOf(a0)>=0){ms=s0.split(a0);s0=ms.join(b0);}
  return s0;
}
function one_sp(s){return s.replace(/[ ]+/g,' ');}

async function load_js(name){
  msg('load_js: началась загрузка ' + name);
  var id='id_js_fa';
  els('#'+id,'del');
  const scriptLoaded = await new Promise(r => {
    const s = document.createElement('script');
    s.onload = () => r(1);//ok
    s.onerror = () => r(0);//err
    s.id=id;
    s.src = name;
    document.head.appendChild(s);
  });
  msg('load_js: конец загрузки ' + (scriptLoaded?'ok':'err'));
  return scriptLoaded;
}
function msg(s){ var e=elv('id_info');if(e)e.innerHTML+=''+s+'<br>';console.log(s);}
function hide_msg(){elv('id_info','htm','');}
var g_timer_start=0;
function set_timer(){g_timer_start = performance.now();}
function get_timer(){return performance.now()-g_timer_start;}

//===========
function fa0(t,w,r){var out,n,k,s,t;
  out='';n=0;k=0;t=t+'\n';
  while(1){
    n=t.indexOf('\n'+w+r,k); if(n<0)return out;
    k=t.indexOf('\n',n+2); if(k<0){console.log('нет конца строки для='+n);return 'err';}
    s=t.substring(n+1,k);
    s=s.trim();
    m=s.split('/');m[0]='';s=m.join('/');
    out+=s+'\n';
  }
}
function get_fa0(w){var out,n,k,s,t;
  w=w.trim(); w=w.toLowerCase();
  //500
  out=fa0(g_fa,w,' ');
  //по буквам
  out+=fa0(g_old,w,'~');
  //g_fa_sek из книги Секреты..
  out+=fa0(g_fa_sek,w,'~');
  //g_fa_tem из старых карточек
  out+=fa0(g_fa_tem,w,'/');
  return out;
}
//--new 600/1500/1600/3200
function get_fa1(w){var n,k,s,out,m,t;
  out='';n=0;k=0;t=g_txt+'\n';
  while(1){
    n=t.indexOf('\n'+w+' ',k); if(n<0)return out;
    k=t.indexOf('\n',n+2); if(k<0)return 'err: нет конца строки';
    s=t.substring(n+1,k); s=s.trim(); m=s.split('|'); if(m.length<4)return 'err: нет 4 секции';
    s='<a>'+m[0].trim()+'<@a>'+' <i>'+m[1].trim()+'<@i>/'+m[2].trim();
    if(m[3])s+='\n|'+replace_all(m[3],'//','\n|');
    out+=s+'\n';
  }
}
//2000=3700
function get_fa2(w){var n,k,s,out,m,t;
  out=fa0(g_mfa,w,'~');
  n=0;k=0;t=g_mfa+'\n';
  while(1){
    n=t.indexOf('('+w+'~',k); if(n<0)return out;
    for(i=n;i<t.length;i++)if(t.charAt(i)=='\n'){k=i;break;}
    for(i=n;i>1;i--)if(t.charAt(i)=='\n'){n=i;break;}
    out+='/'+t.substring(n+1,k)+'\n';
  }
}
function get_fa(w){var s,out;
  if(g_txt==''){alert('ФА не загружены');return w;}
  out='';
  //new
  s=get_fa1(w); if(s)out+=s+'<hr>';
  s=get_fa2(w); if(s)out+=s+'<hr>';
  //old
  s=get_fa0(w); if(s)out+='==Старинные ФА (хуже и дубли)==\n'+s;
  s=out.trim();
  s=replace_all(s,';','; ');
  s=replace_all(s,',',', ');
  s=replace_all(s,'//','\n<hr>');
  s=replace_all(s,'/','\n/ ');
  s=replace_all(s,'\n\n','\n');
  s=replace_all(s,'\n \n','\n');
  s=del_dubli(s);
  s=replace_all(s,'\n',' <br>\n');
  s=replace_all(s,'|','\n<hr>\n');
  s=replace_all(s,'<@','</');
  s=replace_all(s,'<hr> <br>','<hr>');
  s=replace_all(s,'[',' [');
  s=replace_all(s,']','] ');
  s=one_sp(s);
  s=zv(s);
  return s;
}

async function load_fa(){var f,m;
  set_timer();
  g_txt='';window['g_fa']='';window['g_mfa']='';
  f='500/600b.txt';  n=await load_js(f); if(!n)alert('нет файла:'+f);else g_txt+=g_fa+'\n';
  f='500/1500i.txt'; n=await load_js(f); if(!n)alert('нет файла:'+f);else g_txt+=g_fa+'\n';
  f='500/1600p.txt'; n=await load_js(f); if(!n)alert('нет файла:'+f);else g_txt+=g_fa+'\n';
  f='500/3200r.txt'; n=await load_js(f); if(!n)alert('нет файла:'+f);else g_txt+=g_fa+'\n';
  f='500/2000.txt';  n=await load_js(f); if(!n)alert('нет файла:'+f);//g_mfa
  f='fa-tem.txt'; n=await load_js(f); if(!n)alert('нет файла:'+f);//g_fa_tem
  f='fa-sek.txt'; n=await load_js(f); if(!n)alert('нет файла:'+f);//g_fa_sek
  g_old='';m='abcdefghijklmnopqrstuvwyz'.split('');
  for(let b of m){n=await load_js('fa/'+b+'-fa.txt');if(n)g_old+=g_fa+'\n';};
  f='500/500.txt';   n=await load_js(f); if(!n)alert('нет файла:'+f);//g_fa
  msg('все загружены='+get_timer()+'ms');
  setTimeout(hide_msg,5000);
}
function del_dubli(s){var m,i,j,x,y,out;
  m=s.split('\n');
  for(i=0;i<m.length;i++)m[i]=m[i].trim();
  for(i=0;i<m.length;i++){
    x=m[i];if(!x)continue;
    for(j=i+1;j<m.length;j++){
      y=m[j];if(!y)continue;
      if(cmp_fa(x,y)>0)m[j]='';
    }
  }
  out='';
  for(i=0;i<m.length;i++)if(m[i])out+=m[i]+'\n';
  return out.trim();
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
