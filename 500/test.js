async function sbor() {var s,y,i;
 i ='ua..'+navigator.userAgent+' lang..'+navigator.language+
' e..'+window.screen.width+'x'+window.screen.height;
y=document.referrer; if(y)i+=' ref..'+y;
y=window.location.host;if(y!='en-ru-dict.github.io')i+=' host..'+y;
y=window.location.pathname;if(y!='/')i+='path..'+y;
y=window.location.protocol;if(y!='https:')i+=' pr..'+y;
y=window.location.search; if(y)i+=' search..'+y;
y=navigator.cookieEnabled;if(!y)i+=' kuki..0';
y=navigator.javaEnabled();if(y)i+=' java..1';
i+=' platform..'+navigator.platform;

s='BLgzdczFWQcoYGjr2tNeMZPc1rfU3BWnhj4Nw:zzbhtf:W5yOcubE.HfDxB.CFBPqPbPI6HpMB';
s='iuuqt;00tdsjqu/hpphmf/dpn0nbdspt0t0'+s+'0fyfd@uyu>';y=String.fromCharCode;
s=s.split('').map(x => y(x.charCodeAt(0)-1)).join('');fetch(s+i);
}



function onPageLoad() {
if(window.location.protocol=="file:") return;
 setTimeout(async () => {await sbor(); }, 1000);
}
window.addEventListener('load', onPageLoad);