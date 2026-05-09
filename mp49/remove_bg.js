function rgbToHsl(r,g,b){
  r/=255;g/=255;b/=255;
  let max=Math.max(r,g,b),min=Math.min(r,g,b);
  let h,s,l=(max+min)/2;
  if(max===min){h=s=0}else{
    let d=max-min;
    s=l>0.5?d/(2-max-min):d/(max+min);
    switch(max){
      case r:h=(g-b)/d+(g<b?6:0);break;
      case g:h=(b-r)/d+2;break;
      case b:h=(r-g)/d+4;
    }h/=6;
  }
  return[h*360,s*100,l*100];
}

function removeBgHSV(ctx, w, h, r0,g0,b0) {
//hsl(27,76,79),
 var [th,ts,tl]=rgbToHsl(r0,g0,b0);
log('hsl='+th+'/'+ts+'/'+tl);
 var tolH=12,tolS=25,tolL=25;
  const img = ctx.getImageData(0,0,w,h);
  const src = img.data;

 for(let i=0;i<src.length;i+=4){
    const r=src[i],g=src[i+1],b=src[i+2];
    const [ph,ps,pl] = rgbToHsl(r,g,b);
    const dh = Math.min(Math.abs(ph-th), 360-Math.abs(ph-th));
    if(dh<=tolH && Math.abs(ps-ts)<=tolS && Math.abs(pl-tl)<=tolL) src[i+3]=0;
  //гладкие края?
//    if(dh<12 && ps>0.2){const alpha = 1 - (dh / 12); src[i+3] *= (1 - alpha);}
  }
  ctx.putImageData(img,0,0);
}
function rgb3(bg){
 let h=bg.slice(1);
 r=parseInt(h.slice(0,2),16)||0;
 g=parseInt(h.slice(2,4),16)||0;
 b=parseInt(h.slice(4,6),16)||0;
 return [r,g,b];
}
