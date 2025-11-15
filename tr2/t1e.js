// t1e.js v2 any charset + old browsers! (qwen.ai + XingSoft*2025)
var T1E = (function () {
  var cyrToCode = {
    1072: 'a',   1073: 'b',   1074: 'v',   1075: 'g',   1076: 'd',
    1077: 'e',   1078: 'x',   1079: 'z',   1080: 'i',   1081: 'j',
    1082: 'k',   1083: 'l',   1084: 'm',   1085: 'n',   1086: 'o',
    1087: 'p',   1088: 'r',   1089: 's',   1090: 't',   1091: 'u',
    1092: 'f',   1093: 'h',   1094: 'c',   1095: '4',   1096: 'w',
    1097: '1w',  1098: '5',   1099: 'y',   1100: '6',   1101: '3',
    1102: 'q',   1103: '9',   1105: '1e', 

    1040: 'A',   1041: 'B',   1042: 'V',   1043: 'G',   1044: 'D',
    1045: 'E',   1046: 'X',   1047: 'Z',   1048: 'I',   1049: 'J',
    1050: 'K',   1051: 'L',   1052: 'M',   1053: 'N',   1054: 'O',
    1055: 'P',   1056: 'R',   1057: 'S',   1058: 'T',   1059: 'U',
    1060: 'F',   1061: 'H',   1062: 'C',   1063: '14',  1064: 'W',
    1065: '1W',  1066: '15',  1067: 'Y',   1068: '16',  1069: '13',
    1070: 'Q',   1071: '19',  1025: '1E' 
  };

  var codeToCyr = {};
  for(var u in cyrToCode){
    if (cyrToCode.hasOwnProperty(u)) {
      codeToCyr[cyrToCode[u]] = parseInt(u, 10);
    }
  }

  function charType(ch){
    var c = ch.charCodeAt(0);
    if (c >= 48 && c <= 57) return 1;
    if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122)) return 2;
    if ((c >= 1040 && c <= 1103) || c === 1025 || c === 1105) return 3;
    return 0;
  }

 return {
 encode: function(text){
  var res = '', inMode = false;
  for(var i = 0; i < text.length; i++){
   var ch = text.charAt(i), t = charType(ch);
   if(ch=='~'){res+='~~';continue;}
   if(t === 3){
    if(!inMode){ res += '~'; inMode = true; }
    ch = cyrToCode[ch.charCodeAt(0)] || '?';
   } 
   if(t===1 || t===2)if(inMode){res+='~';inMode = false;}
   res += ch;
  }
  if(inMode) res += '~';//end
  return res;
 },
 decode: function(text,h){
  var res='',i=0,f=false,c1='',c2='';
  var ff=String.fromCharCode;if(h)ff=function(v){return '&#'+v+';'};//u+v
  while(i < text.length){
   c1 = text.charAt(i); c2 = text.substring(i,i+2);  
   if(c2 === '~~'){res += '~';i+=2;continue;}
   if(c1 === '~') {f=!f;i++;continue;}
   if(!f){ res+=c1;i++;continue;}
   //t1e
   if(c1==='1'){
    res+= codeToCyr.hasOwnProperty(c2)? ff(codeToCyr[c2]):'1?';
    i+=2; continue;
   }
   res+= codeToCyr.hasOwnProperty(c1)? ff(codeToCyr[c1]):c1;
   i++; continue;
  }
  return res;
 },

 toUnicode: function(s){ return this.decode(s); },
 toHtml: function(s){return this.decode(s,1); },
 toTranslit: function (s) { return this.encode(s); },
 charType: charType
 };//end return
})();

