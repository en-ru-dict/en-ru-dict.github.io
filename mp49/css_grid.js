if(!window.int)int=Math.round;
function gen_css_grid(nx,ny,class_name,id){
 var i;
 var css=`
:root {
  --wz: 100px; --hz: 100px;
  --time:3s;
`;
 for(i=1;i<nx;i++){ css+=`--w${i}: calc(var(--wz) * -${i});\n`;}
 for(i=1;i<ny;i++){ css+=`--h${i}: calc(var(--hz) * -${i});\n`;}
 css+=`
}
img[src='']{animation:none !important;}
.mp49 {position:absolute; width: var(--wz); height: var(--hz); overflow:hidden;}
.mp49 img {
  position:absolute; width: ${nx*100}%; height:${ny*100}%; border:0;
  animation: mp49 var(--time) steps(1) infinite alternate;
}
`;
 var frames=nx*ny, step=100/frames,x=0,y=0,s='';
 css+='@keyframes mp49 {\n';
 for(i=0;i<frames;i++){
  s=`%  {transform: translate(var(--w${x}), var(--h${y}));}\n`;
  css+=' '+int(i*step)+s;
  x++;if(x==nx){y++;x=0;css+='\n';}
 }                              
 css+= '100'+s;
 css+='}\n';
 set_css(css,class_name,id);
}
function set_css(css,class_name,id){
 css=css.replace(/var\(--w0\)/g,0);
 css=css.replace(/var\(--h0\)/g,0);
 if(class_name)css=css.replace(/mp49/g,class_name);
 if(!id) id="id_style_mp49"; els('#'+id,'del');//удаляем все старые
 var st=document.createElement('style'); st.id=id; st.textContent=css;
 document.head.appendChild(st);
}
function gen_css_grid_px(nx,ny,w,h){
 let css=`
:root { --time:3s;}
img[src='']{animation:none !important;}
.mp49 {position:absolute; width: ${w}px; height: ${h}px; overflow:hidden;}
.mp49 img {
  position:absolute; width: ${nx*100}%; height:${ny*100}%; border:0;
  animation: mp49 var(--time) steps(1) infinite alternate;
}
`;
 let i, frames=nx*ny, xx=0,yy=0,x=0,y=0,s='',step=100/frames;
 css+='@keyframes mp49 {\n';
 for(i=0;i<frames;i++){
	xx= -x*w; yy= -y*h;
  s=`% {transform: translate(${xx}px, ${yy}px);}\n`;
  css+=' '+int(i*step)+s;
  x++;if(x==nx){y++;x=0;css+='\n';}
 }
 css+= '100'+s;
 css+='}\n';
 set_css(css,'mp49px','id_style_mp49px');
}

function gen_css_grid_bg(nx,ny,w,h){ 
 var i;
 var css=`
:root {
  --wz: ${w}px; --hz: ${h}px;
  --time:3s;
`;
 for(i=1;i<nx;i++){ css+=`--w${i}: calc(var(--wz) * -${i});\n`;}
 for(i=1;i<ny;i++){ css+=`--h${i}: calc(var(--hz) * -${i});\n`;}
 css+=`
}
.mp49 {
  width: var(--wz); height: var(--hz);
  background-size: ${nx*100}% ${ny*100}%;
  border:none; background-position:0 0; border-radius: 50%;
  box-shadow: 0 0 15px deepskyblue,0 0 15px lime, inset 0 0 15px #000;
  will-change:background-position; animation: mp49 var(--time) steps(1) infinite alternate;
}
`;
 var frames=nx*ny;
 var step=100/frames;
 css+='@keyframes mp49 {\n';
 var x=0,y=0,s='';
 for(i=0;i<frames;i++){
  s=`% {background-position: var(--w${x}) var(--h${y});}\n`;
  css+=' '+int(i*step)+s;
  x++;if(x==nx){y++;x=0;css+='\n';}
 }
 css+= '100'+s;
 css+='}\n';
 set_css(css,'mp49bg','id_style_mp49bg');
}
