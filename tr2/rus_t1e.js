// (Xingsoft*2025) ==новый кодер/декодер для старых сисстем без юникода 
//если убрать все коменты на рус, то работает в любой кодировке
//дополнительно 48 популярных символов юникода и 1uFFFF любой код сквозь анси 32-127
var gT1E = (function(){

// Таблицы
var en1 ='A B V G D E ZH Z I J K L M N O P R S T U F H TS CH SH SHCH ` Y ` E YU YA';
var en2 ='A B V G D E X Z I J K L M N O P R S T U F H C 14 W 1W 15 Y 16 13 Q 19';
var en3={};
var zn=String.fromCharCode(126); //тильда
var zn2=zn+zn;
var os=String.fromCharCode(92); //обр слэш
var s1,s2,m,i,n1,n2;

m=en1.split(' ');
en1={};for(i=0;i<32;i++){s=m[i];en1[0x0410+i]=s;en1[0x0430+i]=s.toLowerCase();}
en1[0x0401]='YO';en1[0x0451]='yo';//Ёё
// декодера нет shod это сход или шод? Только туда и для тех кто привык к старому

m=en2.split(' ');en2={};
for(i=0;i<32;i++){
 s1=m[i]; s2=s1.toLowerCase();
 if(s1=='13')s2='3';
 if(s1=='14')s2='4';
 if(s1=='15')s2='5';
 if(s1=='16')s2='6';
 if(s1=='19')s2='9';
 if(s1=='1W')s2='1w';
 n1=0x0410+i; //большие
 n2=0x0430+i; //маленькие
 en2[n1]=s1; en2[n2]=s2;
 en3[n1]=s1; en3[n2]=s2;
}
en2[0x0401]='1E'; en2[0x0451]='1e';//Ёё

//дополнительные 48 кодов/ 11-нельзя EW заняты на ЁЩ
en2[0x000A]='10'; // новая строка /n код 10
en2[0x005C]='12'; // обратный слэш (опасный символ)

en2[0x20AC]='1O'; // Знак Евро 
en2[0x00B0]='1o'; // Знак градуса
en2[0x00A3]='1F'; // Знак Фунта *
en2[0x00A5]='1Y'; // Знак Йены *
en2[0x20BD]='1P'; // Знак Рубля
en2[0x00A7]='1p'; // Знак параграфа
en2[0x00A9]='1C'; // Знак Копирайта
en2[0x00AE]='1c'; // Знак Зарегистрированной торг.марки
en2[0x260E]='1T'; // Телефон
en2[0x2014]='1t'; // Длинное тире
en2[0x2709]='1M'; // E-Mail
en2[0x2026]='1m'; // Многоточие multi
en2[0x2022]='1s'; // Маркер списка
en2[0x2606]='1S'; // Пустая звезда Star
en2[0x2190]='1L'; // Стрелка влево
en2[0x00AB]='1l'; // левая кавычка
en2[0x2191]='1U'; // Стрелка вверх
en2[0x2194]='1u'; // Стрелка влево-вправо
en2[0x2192]='1R'; // Стрелка вправо
en2[0x00BB]='1r'; // правая кавычка
en2[0x2193]='1D'; // Стрелка вниз
en2[0x2195]='1d'; // Стрелка вверх-вниз
en2[0x2714]='1V'; // Жирная галочка
en2[0x2665]='1v'; // сердце черное или красное
en2[0x2718]='1X'; // Жирный крестик
en2[0x00D7]='1x'; // Знак умножения
en2[0x2661]='1H'; // Пустое сердце Heart
en2[0x00BD]='1h'; // Дробь: Одна вторая / half
en2[0x2116]='1N'; // Номер N
en2[0x2260]='1n'; // Не равно
en2[0x2248]='1A'; // Приблизительно равно /approximate
en2[0x00B1]='1a'; // Плюс-минус = примерно
en2[0x2265]='1G'; // Больше или равно /great >=
en2[0x2264]='1g'; // Меньше или равно <=
en2[0x00B2]='1K'; // Верхний индекс 2 (квадрат)
en2[0x221A]='1k'; // Квадратный корень
en2[0x221E]='18'; // Бесконечность
en2[0x00BC]='1Q'; // Дробь: Одна четвертая / quarter
en2[0x201E]='1q'; // Нижняя лапка " (откр.кавычка) / quote
en2[0x00B3]='1B'; // Верхний индекс 3 (куб) kuB=3
en2[0x00BE]='1b'; // Дробь: Три четверти
en2[0x00F7]='1Z'; // Знак деления тире с точками /
//IiJjfyz резерв 5-значные юникоды не поддерживаются эмодзи

var de2=kv(en2);

// переназначаем для краткой таблицы режим тр3
// алиасы синонимы, пишите как удобней, заглавные писать не обязательно
i=de2['13'];de2['0']=i;en3[i]='0'; //Э было 13, после точка+пробел заглавная автоматически
i=de2['14'];de2['8']=i;en3[i]='8'; //Ч было 14, после точка+пробел заглавная автоматически
i=de2['19'];de2['2']=i;en3[i]='2'; //Я было 19, после точка+пробел заглавная автоматически

i=de2['15'];en3[i]='5'; //Ъ=ъ заглавных не бывает
i=de2['16'];en3[i]='6'; //Ь=ь заглавных не бывает

i=de2['1W'];de2['17']=i;en3[i]='7'; //Щ было 1W=17 Щ=щ, после точка+пробел заглавная автоматически
i=de2['1w'];de2['7']=i; en3[i]='7'; //щ было 1w или щ=ш=w Щтирлиц агент 007 из 17 мгн весны

i=de2['1E'];en3[i]='E'; //Ё=Е было 1E читаемо, редкая
i=de2['1e'];en3[i]='e'; //ё=е было 1e читаемо, редкая

// Кодирование
function charType(ch){
 var c = ch.charCodeAt(0);
 if(c>127)return 3;
 if(c >= 48 && c <= 57) return 1; //0-9
 if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122)) return 2; //лат
 if ((c >= 0x0410 && c <= 0x044F) || c == 0x0401 || c == 0x0451) return 3; //рус
 return 0; //знаки
}
function kv(m){ //key-val меняет местами
 var out={};
 for(var k in m)if(m.hasOwnProperty(k))if(m[k])out[m[k]]=k;
 return out;
}
function hex4(d){return Number(d).toString(16).padStart(4,0);}
function d1(n){return String.fromCharCode(n);} //юникод16
function d2(n){return '&#'+n+';';} //html
function d3(n){return os+'u'+hex4(n);} //json

function decode(text,mode){ //универсальный: оба варианта
  var o='',ft=0, f1=0, le=text.length,c1,c2,i,ff;
  ff=d1;
  if(mode==2)ff=d2; //1-unicode16 2-html 3-json
  if(mode==3)ff=d3;
  for(i=0;i<le;i++){
   c1 = text.charAt(i); c2 = text.substring(i,i+2);
   if(c2 == zn2){o+=zn;i++;continue;}
   if(c1 == zn){ft= ft? 0:1;f1=0;continue;}
   if(!ft){o += c1;continue;}
   //внутри транслита
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
 //после (.!?)+пробел заглавная автоматически
   o=o.split('. ');for(i=0;i<o.length;i++)o[i]=firstUp(o[i]);o=o.join('. ');
   o=o.split('! ');for(i=0;i<o.length;i++)o[i]=firstUp(o[i]);o=o.join('! ');
   o=o.split('? ');for(i=0;i<o.length;i++)o[i]=firstUp(o[i]);o=o.join('? ');
  return o;
}
function firstUp(s){return s.substring(0,1).toUpperCase()+s.substring(1);}
function encode(text,mode){
  let o='',s,ft=0,i,t,m,c1,le=text.length;
  m=en3; //краткий где 1 символ это 1 буква (t1k)
  if(mode==1)m=en1; //старый транслит1
  if(mode==2)m=en2; //однозначный транслит2 (t1е) extented, 1e это ё транслит

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
function json16(s){ //ненадёжна, падает от 0-31
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
