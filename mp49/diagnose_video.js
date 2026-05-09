// Запусти это ДО preload() чтобы понять, что происходит
async function diagnose_video_api(videoFile) {
  console.log('=== VIDEO API DIAGNOSIS ===');

  const video = document.createElement('video');
  video.muted = true;
  video.crossOrigin = 'anonymous';
  //document.body.appendChild(video);

  // 1. Проверяем поддержку кодеков
  console.log('📹 Supported Codecs:');
  const codecs = {
    'video/mp4': video.canPlayType('video/mp4; codecs="avc1.42E01E"'),
    'video/mp4 (h265)': video.canPlayType('video/mp4; codecs="hev1.1.6.L93.B0"'),
    'video/webm': video.canPlayType('video/webm; codecs="vp9"'),
    'video/webm (vp8)': video.canPlayType('video/webm; codecs="vp8"'),
    'video/ogg': video.canPlayType('video/ogg; codecs="theora"')
  };
  Object.entries(codecs).forEach(([name, support]) => {
    console.log(`  ${name}: ${support || 'NOT SUPPORTED'}`);
  });

  // 2. Проверяем readyState
  console.log('\n📊 Video ReadyState:');
  console.log('  HAVE_NOTHING:', video.HAVE_NOTHING);
  console.log('  HAVE_METADATA:', video.HAVE_METADATA);
  console.log('  HAVE_CURRENT_DATA:', video.HAVE_CURRENT_DATA);
  console.log('  HAVE_FUTURE_DATA:', video.HAVE_FUTURE_DATA);
  console.log('  HAVE_ENOUGH_DATA:', video.HAVE_ENOUGH_DATA);

  // 3. Загружаем видео и смотрим события
  console.log('\n⏱️ Event Timeline:');
  const eventLog = [];

  const logEvent = (e) => {
    const time = performance.now();
    console.log(`  [${time.toFixed(0)}ms] ${e.type} | readyState=${video.readyState} | currentTime=${video.currentTime.toFixed(3)}`);
    eventLog.push({ type: e.type, time, readyState: video.readyState });
  };

  ['loadstart', 'progress', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough', 'playing', 'pause', 'seeking', 'seeked', 'timeupdate'].forEach(evt => {
    video.addEventListener(evt, logEvent);
  });

  video.src = videoFile;
  video.load();

  // 4. Ждём loadedmetadata и проверяем видео
  await new Promise(r => video.addEventListener('loadedmetadata', r));

  console.log('\n🎬 Video Properties:');
  console.log(`  Duration: ${video.duration.toFixed(2)}s`);
  console.log(`  Width x Height: ${video.videoWidth} x ${video.videoHeight}`);
  console.log(`  ReadyState: ${video.readyState}`);
  console.log(`  NetworkState: ${video.networkState}`);
  console.log(`  Buffered: ${video.buffered.length} ranges`);

  // 5. Тестируем seek на разные позиции
  console.log('\n🎯 Seek Test (50ms intents):');
  for(let t = 0.1; t <= Math.min(1, video.duration - 0.2); t += 0.3) {
    console.log(`\n  → Seeking to ${t.toFixed(2)}s:`);
    video.currentTime = t;

    // Ждём события
    let seeked = false;
    const seekTimeout = new Promise(r => {
      const onSeeked = () => {
        console.log(`    ✅ seeked event at ${video.currentTime.toFixed(3)}s`);
        seeked = true;
        video.removeEventListener('seeked', onSeeked);
        r();
      };
      video.addEventListener('seeked', onSeeked, { once: true });
      setTimeout(() => {
        if(!seeked) {
          console.log(`    ⏱️  timeout, currentTime is ${video.currentTime.toFixed(3)}s`);
          video.removeEventListener('seeked', onSeeked);
          r();
        }
      }, 500);
    });

    await seekTimeout;
  }

  // 6. Тестируем draw в canvas
  console.log('\n🖼️ Canvas Draw Test:');
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');

  video.currentTime = 0.5;
  await new Promise(r => setTimeout(r, 100));

  try {
    ctx.drawImage(video, 0, 0, 100, 100);
    const imageData = ctx.getImageData(0, 0, 10, 10).data;
    const hasPixels = imageData.some(p => p > 0);
    console.log(`  ✅ Draw successful, has pixels: ${hasPixels}`);
    console.log(`  First 4 pixels (RGBA): ${Array.from(imageData.slice(0, 4)).join(',')}`);
  } catch(e) {
    console.log(`  ❌ Draw failed: ${e.message}`);
  }

  // 7. Система
  console.log('\n💻 System Info:');
  console.log(`  UserAgent: ${navigator.userAgent}`);
  console.log(`  Platform: ${navigator.platform}`);
  console.log(`  HW Concurrency: ${navigator.hardwareConcurrency}`);
  console.log(`  Device Memory: ${navigator.deviceMemory}GB`);
  console.log(`  Connection: ${navigator.connection?.effectiveType || 'unknown'}`);
  console.log(`  Screen: ${window.innerWidth}x${window.innerHeight}`);


  document.body.removeChild(canvas);

  return { eventLog, videoProps: { duration: video.duration, width: video.videoWidth, height: video.videoHeight } };
}

// Запускаем диагностику
//diagnose_video_api('mirror.mp4');
