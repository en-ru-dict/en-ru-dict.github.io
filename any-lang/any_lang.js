// AnyLang.js: A robust, mini i18n library for static sites.
// XingSoft*2025

// Marker string that prevents an inline <script> from being re-executed.
window.STOP_RESTART_MARKER = "ANYlang_sToP_ReStArT";

// --- GLOBAL HELPER FUNCTIONS (Kept global for user convenience) ---
if (!window.log) { // Simple console logging helper
  window.log = (s, o) => { console.log('' + s); if (o) console.log(o); }
}
if (!window.el) { // Simple document.getElementById helper
  window.el =(id) => {
    const e = document.getElementById('' + id);
    if (!e) log(`el: element not found id=${id}`);
    return e;
  }
}

if (!window.g_AnyLang) {
  window.g_AnyLang = (() => {

    // --- PRIVATE CONFIGURATION AND STATE ---
    let config = {
      mode: 'dev',               // 'prod' or 'dev' (slow accurate)
      selectId: 'id_lang',        // ID of the <select> element
      baseLang: 'EN',             // The language of the HTML markers (e.g., [·Hello·])
      leftMarker: '['+'·',        // Visible marker
      rightMarker: '·'+']',
      leftMarkerN: '\u200B'+'\u200C',        // INvisible marker
      rightMarkerN: '\u200C'+'\u200B',

      init: 'init',               // User's function (e.g., window.init) to run after restart
      replace: 0,
      restart: 0,
      onReplaceDone: null         // Callback(count) after translation is complete

    };
    // --- PRIVATE UTILITY FUNCTIONS ---
    const getLangFromLS = () => localStorage.getItem('current_any_lang') || '';
    const saveLangToLS = (lang) => localStorage.setItem('current_any_lang', lang.toUpperCase());
    const getFinalLang = () => {
      let lang = window.location.search.slice(1, 3).toUpperCase(); if (lang) return lang;
      lang = getLangFromLS(); if (lang) return lang;
      lang = window.navigator.language.slice(0, 2).toUpperCase(); if (lang) return lang;
      return config.baseLang;
    };
    const isLangAvailable = (langCode) => window.g_all_lang && window.g_all_lang.indexOf('\n### ' + langCode) > -1;

    // Function to extract dictionary lines
    function getTranslationDict(baseLang, targetLang) {
      const dict = new Map();
      if (typeof window.g_all_lang !== 'string') return dict;

      const extract = (langCode) => {
        const lines = {};
        const section = window.g_all_lang.split('### ' + langCode)[1].split('### ')[0];
        for (const s of section.split('\n')) {
          const separatorPos = s.indexOf('. ');
          if (separatorPos > 0) {
            const number = s.slice(0, separatorPos);
            if (1*number > 0) lines[1*number] = s.slice(separatorPos + 2);
          }
        }
        return lines;
      };

      if (!isLangAvailable(baseLang) || !isLangAvailable(targetLang)) return dict;

      const baseLines = extract(baseLang);
      const targetLines = extract(targetLang);

      for (const number in baseLines) {
        const key = baseLines[number];
        const val = targetLines[number] || `NO TR? [${baseLines[number]}]`;
        dict.set(key, val);
      }
      return dict;
    }

    function replace_slow_accurate(html, dict) {
      config.replace = 0;
      for (const [key, val] of dict) {
        const parts = html.split(config.leftMarker+key+config.rightMarker);
        if (parts.length > 1) {
          config.replace += parts.length - 1;
          html = parts.join(val);
        }
      }
      log(`Replaced ${config.replace} strings.`);
      return html;
    }

    // --- CORE LOGIC ---

    function replace_html(targetLang) {
      let html = document.documentElement.innerHTML;
      if (html.indexOf(config.leftMarker) < 0) if (html.indexOf(config.rightMarker) < 0){
        log('No markers found in HTML, skipping replacement.'); return 0;
      }

      if (!isLangAvailable(targetLang)) {log(`Target language '${targetLang}' not available. HTML replacement skipped.`);return 0;}
      const dict = getTranslationDict(config.baseLang, targetLang);
      if (!dict.size) {log('Translation dictionary is empty. HTML replacement cancelled.');return 0;}

      // Select replacement mode
      html =  replace_slow_accurate(html, dict);
      document.documentElement.innerHTML = html;

      // Execute user callback if defined
      if (config.onReplaceDone && typeof config.onReplaceDone === 'function') {
        try { config.onReplaceDone(); }
        catch(e) { log("Error executing onReplaceDone callback:", e); }
      }
    }
    // Re-executes all *inline* <script> blocks.
    function restart_js() {
      const scripts = document.querySelectorAll('script:not([src])');
      config.restart = 0;
      for (let i = 0; i < scripts.length; i++) {
        const oldScript = scripts[i];
        if (oldScript.textContent.includes(window.STOP_RESTART_MARKER)) {
          continue;
        }
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(a => { newScript.setAttribute(a.name, a.value); });
        newScript.textContent = oldScript.textContent;
        try {
          oldScript.parentNode.replaceChild(newScript, oldScript);
          config.restart++;
        } catch (e) {
          log(`Error restarting script [${i}]:`, e);
        }
      }
      log(`Restarted scripts: ${config.restart}`);
    }
    function allLangs() {
        const m = new Map();
        if (typeof window.g_all_lang !== 'string') return m;
        const lines = window.g_all_lang.split('\n');
        for (const line of lines) {
          if (line.slice(0, 4) === '### ') {
            m.set(line.slice(4, 6).toUpperCase(), line.slice(7).trim());
          }
        }
        return m;
    }
    // Initializes the <select> dropdown
    function initSelect() {
      const selectElement = el(config.selectId);
      if (!selectElement) {
        log(`Language selector element with ID #${config.selectId} not found.`);
        return 0;
      }
      let all_langs=allLangs();
      if (!all_langs.size) return;
      const currentLang = getLangFromLS() || config.baseLang;

      selectElement.innerHTML = '';
      selectElement.disabled = false;
      let selectedIndex = 0, counter = 0;
      for (const [code, name] of all_langs) {
        const option = document.createElement('option');
        option.value = code; option.title = name; option.textContent = code;
        selectElement.appendChild(option);
        if (code === currentLang) selectedIndex = counter;
        counter++;
      }
      selectElement.options.selectedIndex = selectedIndex;
      selectElement.onchange = (e) => {
        const selectedCode = e.target.value;
        saveLangToLS(selectedCode);
        window.location.search = '?' + selectedCode.toLowerCase();
      };
    }
    // --- MAIN INIT (called on window.onload) ---
    function initAnyLang() {
      if (config.mode != 'dev'){
        config.leftMarker = config.leftMarkerN;
        config.rightMarker = config.rightMarkerN;
      }
      log('1. Determining target language...');
      const targetLang = getFinalLang();
      replace_html(targetLang); if (config.replace > 0) restart_js();
      log('2. Initializing language selector.'); initSelect();
      if (config.init && typeof window[config.init] === 'function') {
         log('3. Running user-defined init() callback.');
         window[config.init]();
      }
    }
    // --- PUBLIC INTERFACE ---
    return {
      initAnyLang: initAnyLang,
      config: config
    };

  })(); // IIFE ends here
} //end if

window.onload = g_AnyLang.initAnyLang;
