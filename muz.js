a=new Audio('margins_of_the_real.mp3');
//a.loop=true;
a.volume=0.5;
a.play().catch(e=>alert(e));
window.addEventListener('keydown',e=>{
 if(!a)return;
 var v1=a.volume+0.1;if(v1>1)v1=1;
 var v2=a.volume-0.1;if(v2<0)v2=0;

 if(e.key==='+')a.volume=v1;
 if(e.key==='-')a.volume=v2;
});