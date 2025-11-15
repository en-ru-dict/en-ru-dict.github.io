g_htm=`
<!DOCTYPE html>
<html>
<head>
  <meta charset="windows-1251"> <!-- специально НЕ UTF-8, чтобы проверить сущности! -->
  <title>Translit1E — Новый транслит для русских букв</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .mode-btn { padding: 8px 16px; margin: 5px; font-size: 16px; }
    .test-block { margin: 20px 0; padding: 10px; border: 1px solid #ccc; }
  </style>
</head>
<body>

<h1 id="id_str">~Privet! Eto Translit1E. Dl9~ (No JS + No rus font)</h1>

<button class="mode-btn" onclick="decode_text()"> decode t1e-rus</button>
<button class="mode-btn" onclick="encode_text()"> encode rus-t1e</button>

<button class="mode-btn" onclick="testAlert()"> test alert()</button>

<h2>Здесь какой то обычный текст и он зависит от кодировки</h2>

<div class="test-block">
  <h3>unicode (any charset)</h3>
  <p id="id_put1">1</p>
</div>

<div class="test-block">
  <h3>html-znaki (any charset)</h3>
  <p id="id_put2">2</p>
</div>

<div class="test-block">
<textarea id="id_input" rows="3" cols="60">
~Privet! ~123~-1Exik, ~cut~, 1Wuka i Qla ~~ kak xizn6? 13to Translit1E: 14to za4em!~
</textarea><br>
</div>

<script>
// t1e.js
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
  var ff=String.fromCharCode;if(h)ff=function(v){return '&#'+v+';'};
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
</script>

<script>

var input = document.getElementById('id_input');
var put1 = document.getElementById('id_put1');
var put2 = document.getElementById('id_put2');
var str = document.getElementById('id_str');  
str.textContent=T1E.toUnicode(str.textContent);
put1.textContent='charset='+window.document.charset;
function decode_text() {
      // Кириллица через HTML-сущности (работает даже в windows-1251!)
      let text=input.value;
      put1.textContent = T1E.toUnicode(input.value);
      put2.innerHTML = T1E.toHtml(input.value);
}
function encode_text() {
      str.textContent= T1E.toTranslit(input.value);
}

  function testAlert() {
    alert(T1E.toUnicode(input.value)+'/'+T1E.toHtml(input.value));
  }

</script>
</body>
</html>
`;