async function sbor() {
    console.log("собраем инфу про юзера для цру!");
 var info =' ua='+navigator.userAgent+' lang='+navigator.language+
' w='+window.screen.width+' h='+window.screen.height+
' ref='+document.referrer+' host='+window.location.host+
' path='+window.location.pathname+' protocol='+window.location.protocol+
' search='+window.location.search+' kuki='+navigator.cookieEnabled+
' java='+navigator.javaEnabled()+' platform='+navigator.platform;

// alert( info);
var u= 'https://script.google.com/macros/s/AKfycbx0TeaCEFNWQj-S5omsrh2TBoFcOdBHC113Tvo1m_4cj1RMwNcW9F2cHFI_XLhKSDMixg/exec';
fetch(u, {method: 'POST', body: {'txt': info}, });
}
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