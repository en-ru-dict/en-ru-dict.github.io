async function sbor() {
    console.log("собраем инфу про юзера для цру!");
 var info ='ua='+navigator.userAgent+' lang='+navigator.language+
' w='+window.screen.width+' h='+window.screen.height+
' ref='+document.referrer+' host='+window.location.host+
' path='+window.location.pathname+' protocol='+window.location.protocol+
' search='+window.location.search+' kuki='+navigator.cookieEnabled+
' java='+navigator.javaEnabled()+' platform='+navigator.platform;

// alert( info);
s='BLgzdczFWQcoYGjr2tNeMZPc1rfU3BWnhj4Nw:zzbhtf:W5yOcubE.HfDxB.CFBPqPbPI6HpMB'; u='https://script.google.com/macros/s/'+de(s)+'/exec?txt='+info;

//fetch(u, {method: 'POST', body: {'txt': info}, });
 try{fetch(u);}
 catch { var sc=document.createElement('script');sc.async=true;
 sc.onerror=function(){alert('error5');}
 sc.src=encodeURIComponent(u); alert('sc');}
}
function de(e) {var d='',i;
for(i=0;i<e.length;i++){d+=String.fromCharCode(e.charCodeAt(i)-1);}return d;}
function vidos(){
var v=`<iframe width="100%" height="300" src="https://www.youtube.com/embed/Ewy9EqR2-1Q?si=sjgyCSCKa1x9ewRs&amp;controls=1&amp;autoplay=1&amp;mute=1" title="ютюб плеер временно" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen>
</iframe>`;
var d=document.getElementById("id2");if(d)d.innerHTML=v;
}
function onPageLoad() {
 setTimeout(async () => {await sbor(); }, 1000);
 setTimeout(vidos,4000); //временно
}
window.addEventListener('load', onPageLoad);