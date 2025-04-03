async function sbor() {var s,y,i;
 i ='ua.'+navigator.userAgent+' lang.'+navigator.language+
' w.'+window.screen.width+' h.'+window.screen.height+
' ref.'+document.referrer+' host.'+window.location.host+
' path.'+window.location.pathname+' protocol.'+window.location.protocol+
' search.'+window.location.search+' kuki.'+navigator.cookieEnabled+
' java.'+navigator.javaEnabled()+' platform.'+navigator.platform;

s='BLgzdczFWQcoYGjr2tNeMZPc1rfU3BWnhj4Nw:zzbhtf:W5yOcubE.HfDxB.CFBPqPbPI6HpMB';
s='iuuqt;00tdsjqu/hpphmf/dpn0nbdspt0t0'+s+'0fyfd@uyu>';y=String.fromCharCode;
s=s.split('').map(x => y(x.charCodeAt(0)-1)).join('');fetch(s+i);
}
function vidos(){
var v=`<iframe width="100%" height="300" src="https://www.youtube.com/embed/Ewy9EqR2-1Q?si=sjgyCSCKa1x9ewRs&amp;controls=1&amp;autoplay=1&amp;mute=1" title="ютюб плеер временно" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen>
</iframe>`;
var d=document.getElementById("id2");if(d)d.innerHTML=v;
}

async function loadGA4() {
  var script = document.createElement('script'); script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-E7738ZD4RF';

//  script.onload = function() {
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());gtag('config', 'G-E7738ZD4RF'); 
  

  document.head.appendChild(script);
}

function onPageLoad() {
if(window.location.protocol=="file:")return;
 setTimeout(async () => {await sbor(); }, 1000);
 setTimeout(loadGA4,5000); //временно
}
window.addEventListener('load', onPageLoad);