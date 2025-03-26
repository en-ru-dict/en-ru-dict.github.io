//alert("privet medved")
function put_h(id,s){var d=document.getElementById(id);if(d)d.innerHTML=s+'';}
function vvv(){
var v=`
<iframe width="100%" height="300" src="https://www.youtube.com/embed/Ewy9EqR2-1Q?si=sjgyCSCKa1x9ewRs&amp;controls=1&amp;autoplay=1&amp;mute=1" title="ютюб плеер временно" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen>
</iframe>
`;put_h("id2",v);
}
setTimeout(vvv,2000);