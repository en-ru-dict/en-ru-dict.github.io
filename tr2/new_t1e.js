// (Xingsoft*2025) ==~novyj koder/dekoder dl9 staryh sisstem bez qnikoda ~
//~esli ubrat6 vse komenty na rus, to rabotaet v lqboj kodirovke~
//~dopolnitel6no ~48 ~popul9rnyh simvolov qnikoda i ~1uFFFF ~lqboj kod skvoz6 ansi ~32-127
var gT1E = (function(){

// ~Tablicy~
var en1 ='A B V G D E ZH Z I J K L M N O P R S T U F H TS CH SH SHCH ` Y ` E YU YA';
var en2 ='A B V G D E X Z I J K L M N O P R S T U F H C 14 W 1W 15 Y 16 13 Q 19';
var en3={};
var zn=String.fromCharCode(126); //~til6da~
var zn2=zn+zn;
var os=String.fromCharCode(92); //~obr sl3w~
var s1,s2,m,i,n1,n2;

m=en1.split(' ');
en1={};for(i=0;i<32;i++){s=m[i];en1[0x0410+i]=s;en1[0x0430+i]=s.toLowerCase();}
en1[0x0401]='YO';en1[0x0451]='yo';//~1E1e~
// ~dekodera net ~shod ~3to shod ili wod? Tol6ko tuda i dl9 teh kto privyk k staromu~

m=en2.split(' ');en2={};
for(i=0;i<32;i++){
 s1=m[i]; s2=s1.toLowerCase();
 if(s1=='13')s2='3';
 if(s1=='14')s2='4';
 if(s1=='15')s2='5';
 if(s1=='16')s2='6';
 if(s1=='19')s2='9';
 if(s1=='1W')s2='1w';
 n1=0x0410+i; //~bol6wie~
 n2=0x0430+i; //~malen6kie~
 en2[n1]=s1; en2[n2]=s2;
// en3[n1]=s1; en3[n2]=s2;
}
en2[0x0401]='1E'; en2[0x0451]='1e';//~1E1e~

//~dopolnitel6nye ~48 ~kodov/ ~11-~nel6z9 ~EW ~zan9ty na 1E1W~
en2[0x000A]='10'; // ~nova9 stroka /~n ~kod ~10
en2[0x005C]='12'; // ~obratnyj sl3w (opasnyj simvol)~

en2[0x20AC]='1O'; // ~Znak Evro ~
en2[0x00B0]='1o'; // ~Znak gradusa~
en2[0x00A3]='1F'; // ~Znak Funta *~
en2[0x00A5]='1Y'; // ~Znak Jeny *~
en2[0x20BD]='1P'; // ~Znak Rubl9~
en2[0x00A7]='1p'; // ~Znak paragrafa~
en2[0x00A9]='1C'; // ~Znak Kopirajta~
en2[0x00AE]='1c'; // ~Znak Zaregistrirovannoj torg.marki~
en2[0x260E]='1T'; // ~Telefon~
en2[0x2014]='1t'; // ~Dlinnoe tire~
en2[0x2709]='1M'; // E-Mail
en2[0x2026]='1m'; // ~Mnogoto4ie ~multi
en2[0x2022]='1s'; // ~Marker spiska~
en2[0x2606]='1S'; // ~Pusta9 zvezda ~Star
en2[0x2190]='1L'; // ~Strelka vlevo~
en2[0x00AB]='1l'; // ~leva9 kavy4ka~
en2[0x2191]='1U'; // ~Strelka vverh~
en2[0x2194]='1u'; // ~Strelka vlevo-vpravo~
en2[0x2192]='1R'; // ~Strelka vpravo~
en2[0x00BB]='1r'; // ~prava9 kavy4ka~
en2[0x2193]='1D'; // ~Strelka vniz~
en2[0x2195]='1d'; // ~Strelka vverh-vniz~
en2[0x2714]='1V'; // ~Xirna9 galo4ka~
en2[0x2665]='1v'; // ~serdce 4ernoe ili krasnoe~
en2[0x2718]='1X'; // ~Xirnyj krestik~
en2[0x00D7]='1x'; // ~Znak umnoxeni9~
en2[0x2661]='1H'; // ~Pustoe serdce ~Heart
en2[0x00BD]='1h'; // ~Drob6: Odna vtora9 / ~half
en2[0x2116]='1N'; // ~Nomer ~N
en2[0x2260]='1n'; // ~Ne ravno~
en2[0x2248]='1A'; // ~Priblizitel6no ravno /~approximate
en2[0x00B1]='1a'; // ~Plqs-minus = primerno~
en2[0x2265]='1G'; // ~Bol6we ili ravno /~great >=
en2[0x2264]='1g'; // ~Men6we ili ravno <=~
en2[0x00B2]='1K'; // ~Verhnij indeks ~2 (~kvadrat)~
en2[0x221A]='1k'; // ~Kvadratnyj koren6~
en2[0x221E]='18'; // ~Beskone4nost6~
en2[0x00BC]='1Q'; // ~Drob6: Odna 4etverta9 / ~quarter
en2[0x201E]='1q'; // ~Nixn99 lapka " (otkr.kavy4ka) / ~quote
en2[0x00B3]='1B'; // ~Verhnij indeks ~3 (~kub) ~kuB=3
en2[0x00BE]='1b'; // ~Drob6: Tri 4etverti~
en2[0x00F7]='1Z'; // ~Znak deleni9 tire s to4kami /~
//IiJjfyz ~rezerv ~5-~zna4nye qnikody ne podderxivaqts9 3modzi~

var de2=kv(en2);
for(var k in en2)en3[k]=en2[k]; //???
// ~perenazna4aem dl9 kratkoj tablicy rexim tr~3
// ~aliasy sinonimy, piwite kak udobnej, zaglavnye pisat6 ne ob9zatel6no~
i=de2['13'];de2['0']=i;en3[i]='0'; //~13 bylo ~13, ~posle to4ka+probel zaglavna9 avtomati4eski~
i=de2['14'];de2['8']=i;en3[i]='8'; //~14 bylo ~14, ~posle to4ka+probel zaglavna9 avtomati4eski~
i=de2['19'];de2['2']=i;en3[i]='2'; //~19 bylo ~19, ~posle to4ka+probel zaglavna9 avtomati4eski~

i=de2['15'];en3[i]='5'; //~15=5 zaglavnyh ne byvaet~
i=de2['16'];en3[i]='6'; //~16=6 zaglavnyh ne byvaet~

i=de2['1W'];de2['17']=i;en3[i]='7'; //~1W bylo ~1W=17 ~1W=1w, posle to4ka+probel zaglavna9 avtomati4eski~
i=de2['1w'];de2['7']=i; en3[i]='7'; //~1w bylo ~1w ~ili 1w=w=~w ~1Wtirlic agent ~007 ~iz ~17 ~mgn vesny~

i=de2['1E'];en3[i]='E'; //~1E=E bylo ~1E ~4itaemo, redka9~
i=de2['1e'];en3[i]='e'; //~1e=e bylo ~1e ~4itaemo, redka9~

// ~Kodirovanie~
function charType(ch){
 var c = ch.charCodeAt(0);
 if(c>127)return 3;
 if(c >= 48 && c <= 57) return 1; //0-9
 if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122)) return 2; //~lat~
 if ((c >= 0x0410 && c <= 0x044F) || c == 0x0401 || c == 0x0451) return 3; //~rus~
 return 0; //~znaki~
}
function kv(m){ //key-val ~men9et mestami~
 var out={};
 for(var k in m)if(m.hasOwnProperty(k))if(m[k])out[m[k]]=k;
 return out;
}
function hex4(d){return Number(d).toString(16).padStart(4,0);}
function d1(n){return String.fromCharCode(n);} //~qnikod~16
function d2(n){return '&#'+n+';';} //html
function d3(n){return os+'u'+hex4(n);} //json

function decode(text,mode){ //~universal6nyj: oba varianta~
  var o='',ft=0, f1=0, le=text.length,c1,c2,i,ff;
  ff=d1;
  if(mode==2)ff=d2; //1-unicode16 2-html 3-json
  if(mode==3)ff=d3;
  for(i=0;i<le;i++){
   c1 = text.charAt(i); c2 = text.substring(i,i+2);
   if(c2 == zn2){o+=zn;i++;continue;}
   if(c1 == zn){ft= ft? 0:1;f1=0;continue;}
   if(!ft){o += c1;continue;}
   //~vnutri translita~
   if(c1 == '1'){f1=1; continue;}
   if(f1){
    f1=0;
    if(c1=='u'){
      c2='0x'+text.substring(i+1,i+5);i+=4;
      if(c2*1)o+=String.fromCharCode(c2*1);
      continue;
    }
    c2='1'+c1;
    if(de2.hasOwnProperty(c2))c2=ff(de2[c2]);
    o+=c2;
    continue;
  }
   c2=c1;if(de2.hasOwnProperty(c2))c2=ff(de2[c2]);o+=c2;
  }
 //~posle (.!?)+probel zaglavna9 avtomati4eski~
   o=o.split('. ');for(i=0;i<o.length;i++)o[i]=firstUp(o[i]);o=o.join('. ');
   o=o.split('! ');for(i=0;i<o.length;i++)o[i]=firstUp(o[i]);o=o.join('! ');
   o=o.split('? ');for(i=0;i<o.length;i++)o[i]=firstUp(o[i]);o=o.join('? ');
  return o;
}
function firstUp(s){return s.substring(0,1).toUpperCase()+s.substring(1);}
function encode(text,mode){
  let o='',s,ft=0,i,t,m,c1,le=text.length;
  m=en3; //~kratkij gde ~1 ~simvol 3to ~1 ~bukva (~t1k)
  if(mode==1)m=en1; //~staryj translit~1
  if(mode==2)m=en2; //~odnozna4nyj translit~2 (t1~e) ~extented, 1e ~3to 1e translit~

  for(i=0;i<le;i++){
   s=text.charAt(i);
   if(s==zn){o+=zn2;continue;}
   t=charType(s);
   if(t==3){//rus
    if(!ft){ft=1;o+=zn;}
    c1=s.charCodeAt(0);
    s = m.hasOwnProperty(c1)? m[c1]: '[1u'+hex4(c1)+']';
   }
   if(t==1 || t==2)if(ft){ft=0;o+=zn;} //lat
   o+=s;
  }
  if(ft)o+=zn;//end
  return o;
}
function json16(s){ //~nenad1exna, padaet ot ~0-31
 s=s.split(String.fromCharCode(9)).join(os+os+'t');
 s=s.split(String.fromCharCode(10)).join(os+os+'n');
 return JSON.parse('"'+s+'"');
}
function encode_text(t){
  var i,n=String.fromCharCode(10);
  t=t.split(n);
  for(i=0;i<t.length;i++)t[i]=encode(t[i],2);
  return t.join(n);
}
return {
  encode:encode,
  decode:decode,
  json16:json16,
  encode_text:encode_text
}
})();

