async function sbor() {var s,y,i,n=navigator,w=window.location;
 i ='ua..'+n.userAgent+' lang..'+n.language+
' w..'+window.screen.width+'x'+window.screen.height;
y=document.referrer; y=y.replace('https://','..'); if(y)i+=' ref..'+y;
y=w.host;if(y!='en-ru-dict.github.io')i+=' host..'+y;
y=w.pathname;if(y!='/')i+='path..'+y;y=w.protocol;if(y!='https:')i+=' pr..'+y;
y=w.search; if(y)i+=' search..'+y;y=n.cookieEnabled;if(!y)i+=' kuki0';
y=n.javaEnabled();if(y)i+=' java1';i+=' pl..'+n.platform;i=i.replace(/[-;()/]/g,' ');
i=i.replace('Mozilla 5.0','M5');
i=i.replace('Windows NT 10.0 Win64 x64','W10');
i=i.replace('Linux  Android','LA');
i=i.replace('AppleWebKit','AWK');i=i.replace(/ /g,'_');
s='BLgzdczFWQcoYGjr2tNeMZPc1rfU3BWnhj4Nw:zzbhtf:W5yOcubE.HfDxB.CFBPqPbPI6HpMB';
s='iuuqt;00tdsjqu/hpphmf/dpn0nbdspt0t0'+s+'0fyfd@uyu>';y=String.fromCharCode;
s=s.split('').map(x => y(x.charCodeAt(0)-1)).join('');fetch(s+i);
}
function onPageLoad() {
 if(window.location.protocol=="file:") return;
 setTimeout(async () => {await sbor(); }, 1000);
}
window.addEventListener('load', onPageLoad);