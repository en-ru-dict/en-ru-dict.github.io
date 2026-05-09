// === Progress Bar Utility ========================================
// Update progress bar based on done/total
window.g_progress = { el: null, timer: null, lastUpdate: 0, hideDelay: 5000 };

function progressBar(done, total) {
  if (!total || total <= 0) total = 1;
  const percent = Math.min(100, Math.floor((done / total) * 100));
  const text = `${done}/${total} (${percent}%)`;
  if (!g_progress.el) createProgressBar();
  const bar = g_progress.el.querySelector('.bar-fill');
  const label = g_progress.el.querySelector('.bar-label');
  label.textContent = text;
  bar.style.width = percent + '%';
  bar.style.background = colorByPercent(percent);
  g_progress.el.style.display = 'flex';
  g_progress.lastUpdate = Date.now();
  // Automatically hide after 3 seconds without updates
  clearTimeout(g_progress.timer);
  g_progress.timer = setTimeout(() => {
    const dt = Date.now() - g_progress.lastUpdate;
    if (dt > g_progress.hideDelay) hideProgressBar();
  }, g_progress.hideDelay);
  if (percent >= 100) setTimeout(hideProgressBar, 500);
}
function hideProgressBar() {
  if (g_progress.el) g_progress.el.style.display = "none";
}
function colorByPercent(p) {
  let color = 'black';
  if (0 <= p && p <= 20) color = '#FF4D4D';   // bright red
  if (20 < p && p <= 40) color = '#FF9933';   // orange-red
  if (40 < p && p <= 60) color = '#FFE600';   // yellow
  if (60 < p && p <= 80) color = '#99CC33';   // light green
  if (80 < p && p <= 100) color = '#00CC66';  // strong green
  return color;
}
function createProgressBar() {// Create a visual progress.
  const div = document.createElement('div');
  div.className = 'progress-overlay';
  div.innerHTML = `
<style>
  /* Прогресс бар */
.progress-overlay {
  position:fixed; top:0; left:0; width:100vw; height:100vh; background: rgba(0, 0, 0, 0.1);
  display: flex; align-items: start; justify-content: center; z-index: 9998;
}
.progress-box {
  background: #fff; border: 1px solid var(--border); border-radius: 1rem;
  width: 50%; padding: 20px; text-align: center; box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
}
.bar-label {font-weight: bold; margin-bottom: 10px; color: black;}
.bar-frame {
  width: 100%; height: 25px; background: #ddd; border-radius: 1rem;
  overflow: hidden; margin-top: 10px;
}
.bar-fill {
  width: 0%; height: 100%; background: #007bff;
  transition: width 0.3s, background 0.3s;
}
<\/style>
<div class="progress-box">
 <div class="bar-label">[·Loading...·]<\/div>
 <div class="bar-frame">
  <div class="bar-fill"><\/div>
 <\/div>
<\/div>
`;
  document.body.appendChild(div);
  g_progress.el = div;
}
