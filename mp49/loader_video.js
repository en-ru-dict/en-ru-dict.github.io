async function loader_video(name,id,flagFile){ // загрузка'id_video'
    g.video=document.createElement('video'); g.video.muted=true; g.video.playsInline=true;
    if(id)elv(id).appendChild(g.video);

    if(flagFile || location.protocol==='file:'){ // file:// режим: грузим .js с base64
      name+='.js';
      log('локальный режим file://, грузим запасной mp4.js');
      let r=await load_js(name);
      if(!r){alert('нет скрипта='+name); g.mp4_status = 'error'; return 0;}
      if(!window['g_mp4']){alert('нет внутри g_mp4=base64');g.mp4_status = 'error'; return 0;}
      g.video.src=g_mp4; g_mp4=null;
    } else g.video.src=name; // обычный http/https

    g.video.onerror=(e)=>log('video error',e);
    g.video.onloadedmetadata=()=>log('video onloadedmetadata');
    g.video.onloadeddata=()=>log('video onloadeddata');
    g.video.onloadend=()=>log('video onloadend');
    g.video.load();
    g.video.play().catch(()=>{});
    await new Promise(res=>{ if(g.video.readyState>=2) res(); else g.video.onloadeddata=res;});
    await g.video.pause();
log('readyState4='+g.video.readyState);
    if(!g.video.videoWidth){alert('error videoWidth=0'); g.mp4_status = 'error'; return 0;}
    log('video loaded '+g.video.videoWidth+'×'+g.video.videoHeight+' time='+g.video.duration);
    return 1;
}
