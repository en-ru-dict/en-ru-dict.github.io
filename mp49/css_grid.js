function gen_css_grid(nx,ny){
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
img[src='']{animation:none;}
.mp49 {position:absolute; width: var(--wz); height: var(--hz); overflow:hidden;}
.mp49 img {
  position:absolute; width: ${nx*100}%; height:${ny*100}%; border:0;
  animation: tr${nx*ny} var(--time) steps(1) infinite alternate;
}
`;
 var frames=nx*ny, step=100/frames,x=0,y=0,s='';
 css+='@keyframes tr'+frames +' {\n';
 for(i=0;i<frames;i++){
  s=`%  {transform: translate(var(--w${x}), var(--h${y}));}\n`;
  css+=' '+Math.round(i*step)+s;
  x++;if(x==nx){y++;x=0;css+='\n';}
 }
 css+= '100'+s;
 css+='}\n';
 css=css.replace(/var\(--w0\)/g,0);
 css=css.replace(/var\(--h0\)/g,0);

 var id="id_style_mp49";
 els('#'+id,'del');
 var st=document.createElement('style'); st.id=id; st.textContent=css;
 document.head.appendChild(st);
}
function gen_css_grid_px(nx,ny,w,h){
 let css=`
:root { --time:3s;}
img[src='']{animation:none;}
.mp49 {position:absolute; width: ${w}px; height: ${h}px; overflow:hidden;}
.mp49 img {
  position:absolute; width: ${nx*100}%; height:${ny*100}%; border:0;
  animation: tr49 var(--time) steps(1) infinite alternate;
}
`;
 let i, frames=nx*ny, xx=0,yy=0,x=0,y=0,s='',step=100/frames;
 css+='@keyframes tr49 {\n';
 for(i=0;i<frames;i++){
	xx= -x*w; yy= -y*h;
  s=`% {transform: translate(${xx}px, ${yy}px);}\n`;
  css+=' '+Math.round(i*step)+s;
  x++;if(x==nx){y++;x=0;css+='\n';}
 }
 css+= '100'+s;
 css+='}\n';

 var id="id_style_mp49";
 els('#'+id,'del');
 var st=document.createElement('style'); st.id=id; st.textContent=css;
 document.head.appendChild(st);
}
