document.addEventListener('DOMContentLoaded',()=>{
  // Splash intro handler (only on pages that include .splash)
  const splash = document.querySelector('.splash');
  const app = document.querySelector('.app');
  if(splash && app){
    // Reset any stale states on refresh
    splash.classList.remove('hide');
    app.classList.remove('show');
    app.classList.remove('blur');
    // While splash is visible, keep app blurred beneath
    app.classList.add('blur');
    // Attach a robust click handler early so the button always works
    const earlyStartBtn = document.getElementById('startBtn');
    if(earlyStartBtn){
      earlyStartBtn.addEventListener('click', ()=>{
        earlyStartBtn.disabled = true;
        earlyStartBtn.style.pointerEvents = 'none';
        // trigger split animation
        splash.classList.remove('split');
        void splash.offsetWidth;
        splash.classList.add('split');
        setTimeout(()=>{
          try{ sessionStorage.setItem('connectiq_splash_shown','1'); }catch(e){}
          splash.classList.add('hide');
          app.classList.add('show');
          app.classList.remove('blur');
        }, 1800);
      }, { once:false });
    }

  // Prompt login when clicking profile details in the left panel
  const detailsList = document.querySelector('.profile-details');
  if(detailsList){
    detailsList.addEventListener('click', (e)=>{
      const li = e.target.closest('li');
      if(!li) return;
      alert('Login to enter and save the details');
    });
  }
    // Always show the splash on load to prevent brief hide/show flicker on refresh
    {
      const minMs = 3000; // run initial animations, then wait for user
      const start = performance.now();
      const done = () => {
        const elapsed = performance.now() - start;
        const wait = Math.max(0, minMs - elapsed);
        setTimeout(()=>{
          // Don't reveal texts yet; wait for split on button click
        }, wait);
      };
      const vid = document.querySelector('#handshakeVideo');
      const svgFallback = document.querySelector('.handshake');
      if(vid){
        // Play video; once ended, respect minimum duration
        const safeDone = () => { vid.removeEventListener('ended', safeDone); done(); };
        vid.addEventListener('ended', safeDone);
        // Autoplay might be blocked; ensure we still finish
        const p = vid.play();
        if(p && typeof p.catch === 'function'){
          p.catch(()=>{ 
            // Autoplay blocked: show SVG fallback and continue timer
            if(svgFallback) svgFallback.classList.remove('hidden');
            setTimeout(done, minMs);
          });
        }
        // If the video file is missing or fails, show SVG fallback
        vid.addEventListener('error', ()=>{
          if(svgFallback) svgFallback.classList.remove('hidden');
          setTimeout(done, minMs);
        });
        // Fallback: force finish in case 'ended' never fires
        setTimeout(done, minMs + 2000);
      } else {
        // No video present; keep previous simple timing
        setTimeout(done, minMs);
      }
      // Hook up Get Started button
      const startBtn = document.getElementById('startBtn');
      if(startBtn){
        startBtn.addEventListener('click', ()=>{
          startBtn.disabled = true;
          startBtn.style.pointerEvents = 'none';
          splash.classList.remove('split');
          void splash.offsetWidth;
          splash.classList.add('split');
          setTimeout(()=>{
            try{ sessionStorage.setItem('connectiq_splash_shown','1'); }catch(e){}
            splash.classList.add('hide');
            app.classList.add('show');
            app.classList.remove('blur');
          }, 1800);
        });
      }
      // Delegated fallback: ensure click works even if early binding failed
      document.addEventListener('click', (e)=>{
        const btn = e.target.closest('#startBtn');
        if(!btn || !splash || !app) return;
        btn.disabled = true;
        btn.style.pointerEvents = 'none';
        splash.classList.remove('split');
        void splash.offsetWidth;
        splash.classList.add('split');
        setTimeout(()=>{
          try{ sessionStorage.setItem('connectiq_splash_shown','1'); }catch(err){}
          splash.classList.add('hide');
          app.classList.add('show');
          app.classList.remove('blur');
        }, 1800);
      });
    }
  } else {
    // No splash on this page; just fade content
    document.body.classList.add('animate-in');
  }

  // Sidebar toggle (hamburger)
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  const hideHamburger = ()=>{ if(menuBtn){ menuBtn.style.opacity = '0'; menuBtn.style.pointerEvents = 'none'; } };
  const showHamburger = ()=>{ if(menuBtn){ menuBtn.style.opacity = '1'; menuBtn.style.pointerEvents = 'auto'; } };
  const setSidebar = (open) => {
    if(!sidebar || !sidebarBackdrop) return;
    sidebar.classList.toggle('open', open);
    sidebarBackdrop.classList.toggle('show', open);
  };
  if(menuBtn){
    menuBtn.addEventListener('click', ()=> setSidebar(!sidebar?.classList.contains('open')));
  }
  if(sidebarBackdrop){
    sidebarBackdrop.addEventListener('click', ()=> setSidebar(false));
    // Ensure backdrop not shown on load
    sidebarBackdrop.classList.remove('show');
  }

  // Left profile panel: Profile button -> prompt login
  const profileBtn = document.getElementById('profileBtn');
  if(profileBtn){
    profileBtn.addEventListener('click', ()=>{
      alert('Login to page to update profile');
    });
  }

  // Sidebar: section toggling + modal search on Browse
  const homeSide = document.querySelector('.sidebar a[data-side="home"]');
  const browseSide = document.querySelector('.sidebar a[data-side="browse"]');
  const dashSide = document.querySelector('.sidebar a[data-side="dashboard"]');
  const settingsSide = document.querySelector('.sidebar a[data-side="settings"]');
  const helpSide = document.querySelector('.sidebar a[data-side="help"]');
  const languageSide = document.querySelector('.sidebar a[data-side="language"]');
  const locationSide = document.querySelector('.sidebar a[data-side="location"]');
  const browseHeader = document.getElementById('browseHeader');
  const browseFilters = document.getElementById('browseFilters');
  const browseGrid = document.getElementById('browseGrid');
  const dashboardSection = document.getElementById('dashboard');
  const settingsPanel = document.getElementById('settingsPanel');
  const searchModal = document.getElementById('searchModal');
  const closeSearchBtn = document.getElementById('closeSearch');
  const suggestionsBox = document.getElementById('searchSuggestions');
  const dashBack = document.getElementById('dashBack');
  const profileIco = document.querySelector('#dashboard .stat-box .profile-ico');
  // Force-close search modal on initial load
  if(searchModal){
    searchModal.classList.remove('show');
    if(app) app.classList.remove('blur');
  }
  // Set sign-in flag when clicking Sign In on login page
  const signInBtn = document.querySelector('.auth a.btn.primary[href="browse.html"], .auth a.btn.primary.block[href="browse.html"]');
  if(signInBtn){
    signInBtn.addEventListener('click', ()=>{
      localStorage.setItem('connectiq_signed_in','1');
    });
  }
  // Normalize dashboard amount to include currency prefix
  const amountValueInit = document.querySelector('#dashboard .stat-box .value');
  if(amountValueInit){
    const initNum = parseInt((amountValueInit.textContent||'').replace(/[^0-9]/g,''), 10) || 0;
    amountValueInit.textContent = `Rs. ${initNum.toLocaleString()}`;
  }

  const showBrowse = () => {
    if(browseHeader) browseHeader.style.display = '';
    if(browseFilters) browseFilters.style.display = '';
    if(browseGrid) browseGrid.style.display = '';
    if(dashboardSection) dashboardSection.style.display = 'none';
    if(settingsPanel) settingsPanel.style.display = 'none';
    // Ensure search is not auto-shown unless explicitly requested
    if(app) app.classList.remove('blur');
    if(searchModal) searchModal.classList.remove('show');
    document.body.classList.remove('dashboard-full');
    showHamburger();
    if(menuBtn) menuBtn.classList.remove('float-on-dashboard');
    if(dashBack) dashBack.style.display = 'none';
    // Hide profile info panel if open
    if(profileIco){ const sb = profileIco.closest('.stat-box'); if(sb) sb.classList.remove('show-info'); }
  };

  // Location overlay helpers
  const ensureLocationOverlay = () => {
    let overlay = document.querySelector('.location-overlay');
    if(overlay) return overlay;
    overlay = document.createElement('div');
    overlay.className = 'location-overlay';
    overlay.innerHTML = `
      <button class="loc-close" aria-label="Close">×</button>
      <div class="map-wrap">
        <iframe title="Map"
          src="https://www.google.com/maps?q=0,0&z=2&output=embed"
          loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>
      <div class="loc-controls">
        <button class="loc-btn use">Use current location</button>
        <button class="loc-btn secondary change">Change location</button>
        <button class="loc-btn back" aria-label="Back">
          <svg viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#0e1b39" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Back
        </button>
      </div>`;
    document.body.appendChild(overlay);
    // Wire close
    const closeBtn = overlay.querySelector('.loc-close');
    const closeLocationOverlay = ()=>{ overlay.classList.remove('show'); if(app) app.classList.remove('blur'); };
    if(closeBtn){ closeBtn.addEventListener('click', closeLocationOverlay); }
    // Close on ESC
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeLocationOverlay(); });
    // Wire buttons
    const iframe = overlay.querySelector('iframe');
    const useBtn = overlay.querySelector('.loc-btn.use');
    const changeBtn = overlay.querySelector('.loc-btn.change');
    const backBtn = overlay.querySelector('.loc-btn.back');
    if(useBtn){
      useBtn.addEventListener('click', ()=>{
        if(!navigator.geolocation){ return; }
        navigator.geolocation.getCurrentPosition((pos)=>{
          const {latitude, longitude} = pos.coords;
          iframe.src = `https://www.google.com/maps?q=${latitude},${longitude}&z=14&output=embed`;
        });
      });
    }
    if(changeBtn){
      changeBtn.addEventListener('click', ()=>{
        const q = prompt('Enter a place, address, or city:');
        if(!q) return;
        const enc = encodeURIComponent(q.trim());
        iframe.src = `https://www.google.com/maps?q=${enc}&z=13&output=embed`;
      });
    }
    if(backBtn){ backBtn.addEventListener('click', closeLocationOverlay); }
    return overlay;
  };
  const openLocation = () => {
    const overlay = ensureLocationOverlay();
    overlay.classList.add('show');
    if(app) app.classList.remove('blur');
    setSidebar(false);
  };

  // Language overlay helpers
  const ensureLanguageOverlay = () => {
    let overlay = document.querySelector('.language-overlay');
    if(overlay) return overlay;
    overlay = document.createElement('div');
    overlay.className = 'language-overlay';
    overlay.innerHTML = `
      <div class="language-panel" role="dialog" aria-modal="true" aria-label="Choose Language">
        <div class="lang-head">
          <span>Choose your language</span>
          <button class="lang-close" aria-label="Close">Close</button>
        </div>
        <div class="lang-body">
          <ul class="lang-list"></ul>
        </div>
        <div class="lang-actions">
          <button class="lang-close">Done</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const ul = overlay.querySelector('.lang-list');
    const langs = [
      'English', 'हिन्दी (Hindi)', 'తెలుగు (Telugu)', 'தமிழ் (Tamil)', 'বাংলা (Bangla)', 'मराठी (Marathi)',
      'Français', 'Español', 'Deutsch', 'Italiano', '中文 (Chinese)', '日本語 (Japanese)', '한국어 (Korean)',
      'Português', 'Русский', 'اردو (Urdu)'
    ];
    if(ul){
      ul.innerHTML = langs.map(l=> `<li><button class="lang-btn" data-lang="${l.replace(/"/g,'&quot;')}">${l}</button></li>`).join('');
      ul.addEventListener('click', (e)=>{
        const btn = e.target.closest('.lang-btn');
        if(!btn) return;
        ul.querySelectorAll('.lang-btn').forEach(b=> b.classList.remove('active'));
        btn.classList.add('active');
        // Persist basic preference
        const chosen = btn.dataset.lang || btn.textContent.trim();
        localStorage.setItem('connectiq_lang', chosen);
        // Apply immediately
        applyLanguage(chosen);
        // Sparkle feedback
        btn.classList.remove('sparkle');
        // Force reflow to restart animation
        void btn.offsetWidth;
        btn.classList.add('sparkle');
        setTimeout(()=> btn.classList.remove('sparkle'), 800);
      });
    }
    // Close handlers
    const closes = overlay.querySelectorAll('.lang-close');
    const closeOverlay = ()=>{ overlay.classList.remove('show'); if(app) app.classList.remove('blur'); };
    closes.forEach(c=> c.addEventListener('click', closeOverlay));
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeOverlay(); });
    return overlay;
  };
  const openLanguage = () => {
    const overlay = ensureLanguageOverlay();
    // Preselect saved language if present
    const saved = localStorage.getItem('connectiq_lang');
    if(saved){
      const ul = overlay.querySelector('.lang-list');
      if(ul){
        ul.querySelectorAll('.lang-btn').forEach(b=>{
          b.classList.toggle('active', (b.dataset.lang||b.textContent.trim())===saved);
        });
      }
    }
    overlay.classList.add('show');
    setSidebar(false);
  };

  // Help overlay helpers
  const ensureHelpOverlay = () => {
    let overlay = document.querySelector('.help-overlay');
    if(overlay) return overlay;
    // Inject minimal styles for help overlay if not present
    if(!document.getElementById('help-overlay-styles')){
      const style = document.createElement('style');
      style.id = 'help-overlay-styles';
      style.textContent = `
        .help-overlay{position:fixed; inset:0; display:none; align-items:center; justify-content:center; background:rgba(0,0,0,.4); z-index:1000}
        .help-overlay.show{display:flex}
        .help-panel{width:min(92vw,740px); max-height:80vh; background:linear-gradient(135deg,#0f1c3a 0%, #1c2d5a 60%, #395fa9 100%); color:#e7edf8; border:1px solid rgba(255,255,255,.2); border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,.25); padding:14px; display:flex; flex-direction:column}
        .help-head{display:flex; align-items:center; justify-content:space-between; gap:10px; border-bottom:1px solid rgba(255,255,255,.25); padding-bottom:8px; margin-bottom:10px; font-weight:800}
        .help-body{display:grid; grid-template-columns:220px 1fr; gap:14px; flex:1; min-height:0}
        .help-list{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px}
        .help-item{width:100%; text-align:left; padding:10px 12px; border:1px solid rgba(255,255,255,.25); border-radius:8px; background:rgba(255,255,255,.06); color:#e7edf8; font-weight:700; cursor:pointer}
        .help-item:hover{background:rgba(255,255,255,.12)}
        .help-right{display:flex; flex-direction:column; gap:10px; min-height:0}
        .help-comments{border:1px solid rgba(255,255,255,.25); border-radius:8px; padding:10px; background:rgba(12,23,47,.35); flex:1; display:flex; flex-direction:column; min-height:0}
        .help-comments label{display:block; font-weight:800; margin:0 0 6px; color:#e7edf8}
        .help-comments textarea{width:100%; flex:1; min-height:120px; border:1px solid rgba(255,255,255,.25); background:rgba(255,255,255,.08); color:#e7edf8; border-radius:6px; padding:8px; resize:vertical}
        .help-content{border:1px solid rgba(255,255,255,.25); border-radius:8px; padding:12px; background:rgba(12,23,47,.35); color:#e7edf8}
        .help-actions{display:flex; justify-content:flex-end; margin-top:10px}
        .help-close{border:1px solid rgba(255,255,255,.25); background:rgba(255,255,255,.08); color:#e7edf8; border-radius:8px; padding:8px 12px; font-weight:700; cursor:pointer}
        @media(max-width: 720px){ .help-body{grid-template-columns:1fr} }
      `;
      document.head.appendChild(style);
    }
    overlay = document.createElement('div');
    overlay.className = 'help-overlay';
    overlay.innerHTML = `
      <div class="help-panel" role="dialog" aria-modal="true" aria-label="Help">
        <div class="help-head">
          <span>Help Center</span>
          <button class="help-close" aria-label="Close">Close</button>
        </div>
        <div class="help-body">
          <ul class="help-list">
            <li><button class="help-item" data-key="getting-started">Getting started guide</button></li>
            <li><button class="help-item" data-key="faq">FAQ</button></li>
            <li><button class="help-item" data-key="troubleshooting">Troubleshooting</button></li>
            <li><button class="help-item" data-key="support">Technical support</button></li>
            <li><button class="help-item" data-key="contact">Contact</button></li>
            <li><button class="help-item" data-key="guidelines">Guidelines</button></li>
          </ul>
          <div class="help-right">
            <div class="help-comments">
              <label>Comments:</label>
              <textarea placeholder="Type your comments..."></textarea>
            </div>
            <div class="help-content" aria-live="polite"></div>
          </div>
        </div>
        <div class="help-actions">
          <button class="help-close">Done</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const closeButtons = overlay.querySelectorAll('.help-close');
    const closeOverlay = ()=>{ overlay.classList.remove('show'); if(app) app.classList.remove('blur'); };
    closeButtons.forEach(b=> b.addEventListener('click', closeOverlay));
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeOverlay(); });
    // Simple content preview behavior
    const content = overlay.querySelector('.help-content');
    const list = overlay.querySelector('.help-list');
    if(list && content){
      list.addEventListener('click', (e)=>{
        const btn = e.target.closest('.help-item');
        if(!btn) return;
        const key = btn.dataset.key;
        let title = btn.textContent.trim();
        content.innerHTML = `<h4 style="margin:0 0 8px">${title}</h4><p>Coming soon. This section will provide ${title.toLowerCase()}.</p>`;
      });
    }
    return overlay;
  };
  const openHelp = () => {
    const overlay = ensureHelpOverlay();
    overlay.classList.add('show');
    if(app) app.classList.add('blur');
    setSidebar(false);
  };

  // Simple i18n system
  const translations = {
    'English': {
      header_available: 'Available Opportunities',
      browse: 'Browse Jobs',
      dashboard: 'Dashboard',
      settings: 'Settings',
      help: 'Help',
      language: 'Language',
      location: 'Location',
      get_started: 'Get Started',
      login: 'Login',
      reg_vol: 'Register as Volunteer',
      reg_org: 'Register as Organizer',
      work_eff: 'Work efficiency',
      amount_earned: 'Amount earned'
    },
    'हिन्दी (Hindi)': {
      header_available: 'उपलब्ध अवसर',
      browse: 'नौकरियाँ ब्राउज़ करें',
      dashboard: 'डैशबोर्ड',
      settings: 'सेटिंग्स',
      help: 'मदद',
      language: 'भाषा',
      location: 'स्थान',
      get_started: 'शुरू करें',
      login: 'लॉगिन',
      reg_vol: 'स्वयंसेवक के रूप में पंजीकरण',
      reg_org: 'आयोजक के रूप में पंजीकरण',
      work_eff: 'कार्य कुशलता',
      amount_earned: 'कमाई गई राशि'
    },
    'తెలుగు (Telugu)': {
      header_available: 'అందుబాటులో ఉన్న అవకాశాలు',
      browse: 'ఉద్యోగాలు బ్రౌజ్ చేయండి',
      dashboard: 'డ్యాష్‌బోర్డ్',
      settings: 'సెట్టింగ్స్',
      help: 'సహాయం',
      language: 'భాష',
      location: 'ప్రాంతం',
      get_started: 'ప్రారంభించండి',
      login: 'లాగిన్',
      reg_vol: 'వాలంటీర్‌గా నమోదు',
      reg_org: 'ఆర్గనైజర్‌గా నమోదు',
      work_eff: 'పని సామర్థ్యం',
      amount_earned: 'ఆర్జించిన మొత్తం'
    },
    'தமிழ் (Tamil)': {
      header_available: 'கிடைக்கும் வாய்ப்புகள்',
      browse: 'வேலைகளை உலாவு',
      dashboard: 'டாஷ்போர்ட்',
      settings: 'அமைப்புகள்',
      help: 'உதவி',
      language: 'மொழி',
      location: 'இடம்',
      get_started: 'தொடங்கு',
      login: 'உள்நுழை',
      reg_vol: 'தன்னார்வலராக பதிவு',
      reg_org: 'ஆயோஜகராக பதிவு',
      work_eff: 'பணி திறன்',
      amount_earned: 'சம்பாதித்த தொகை'
    },
    'Español': {
      header_available: 'Oportunidades disponibles',
      browse: 'Explorar trabajos',
      dashboard: 'Panel',
      settings: 'Ajustes',
      help: 'Ayuda',
      language: 'Idioma',
      location: 'Ubicación',
      get_started: 'Comenzar',
      login: 'Iniciar sesión',
      reg_vol: 'Registrarse como voluntario',
      reg_org: 'Registrarse como organizador',
      work_eff: 'Eficiencia de trabajo',
      amount_earned: 'Cantidad ganada'
    }
  };
  const setAnchorLabel = (a, label) => {
    if(!a) return;
    const svg = a.querySelector('svg');
    if(svg){
      const clone = svg.cloneNode(true);
      a.innerHTML = '';
      a.appendChild(clone);
      a.appendChild(document.createTextNode(label));
    } else {
      a.textContent = label;
    }
  };
  const applyLanguage = (langName) => {
    const dict = translations[langName] || translations['English'];
    // Header title
    const hdr = document.querySelector('#browseHeader h1');
    if(hdr) hdr.textContent = dict.header_available;
    // Sidebar labels
    setAnchorLabel(document.querySelector('.sidebar a[data-side="browse"]'), dict.browse);
    setAnchorLabel(document.querySelector('.sidebar a[data-side="dashboard"]'), dict.dashboard);
    setAnchorLabel(document.querySelector('.sidebar a[data-side="settings"]'), dict.settings);
    setAnchorLabel(document.querySelector('.sidebar a[data-side="help"]'), dict.help);
    setAnchorLabel(document.querySelector('.sidebar a[data-side="language"]'), dict.language);
    setAnchorLabel(document.querySelector('.sidebar a[data-side="location"]'), dict.location);
    // Navbar CTA texts (if present)
    const navLogin = document.querySelector('.navlinks a[href="login.html"]');
    const navVol = document.querySelector('.navlinks a[data-cta="volunteer"]');
    const navOrg = document.querySelector('.navlinks a[data-cta="organizer"]');
    if(navLogin) navLogin.textContent = dict.login;
    if(navVol) navVol.textContent = dict.reg_vol;
    if(navOrg) navOrg.textContent = dict.reg_org;
    // Start button
    const startBtn = document.getElementById('startBtn');
    if(startBtn) startBtn.textContent = dict.get_started;
    // Dashboard donut title
    const donutTitle = document.querySelector('.donut-title');
    if(donutTitle) donutTitle.textContent = dict.work_eff;
    // Stat label
    const statLabel = document.querySelector('.stat-box .label');
    if(statLabel) statLabel.textContent = dict.amount_earned;
  };

  // Apply saved language on load
  const savedLang = localStorage.getItem('connectiq_lang');
  if(savedLang) applyLanguage(savedLang);
  const showDashboard = () => {
    if(browseHeader) browseHeader.style.display = 'none';
    if(browseFilters) browseFilters.style.display = 'none';
    if(browseGrid) browseGrid.style.display = 'none';
    if(dashboardSection) dashboardSection.style.display = 'block';
    if(settingsPanel) settingsPanel.style.display = 'none';
    if(app) app.classList.remove('blur');
    if(searchModal) searchModal.classList.remove('show');
    document.body.classList.add('dashboard-full');
    hideHamburger();
    if(menuBtn) menuBtn.classList.add('float-on-dashboard');
    if(dashBack) dashBack.style.display = 'inline-flex';
    // Ensure profile info starts hidden
    if(profileIco){ const sb = profileIco.closest('.stat-box'); if(sb) sb.classList.remove('show-info'); }
  };
  const showSettings = () => {
    if(browseHeader) browseHeader.style.display = 'none';
    if(browseFilters) browseFilters.style.display = 'none';
    if(browseGrid) browseGrid.style.display = 'none';
    if(dashboardSection) dashboardSection.style.display = 'none';
    if(settingsPanel) settingsPanel.style.display = 'block';
    if(app) app.classList.remove('blur');
    if(searchModal) searchModal.classList.remove('show');
    document.body.classList.remove('dashboard-full');
  };
  const openSearch = () => {
    if(!searchModal || !app) return;
    app.classList.add('blur');
    searchModal.classList.add('show');
    setSidebar(false);
    const input = searchModal.querySelector('input');
    if(input) setTimeout(()=> input.focus(), 50);
  };
  const closeSearch = () => {
    if(!searchModal || !app) return;
    app.classList.remove('blur');
    searchModal.classList.remove('show');
  };
  if(homeSide){
    homeSide.addEventListener('click', (e)=>{
      const inApp = !!(browseHeader || dashboardSection);
      if(inApp){
        e.preventDefault();
        showBrowse();
        setSidebar(false);
      } else {
        e.preventDefault();
        window.location.href = 'worklink.html';
      }
    });
  }
  if(browseSide){
    browseSide.addEventListener('click', (e)=>{ 
      const inApp = !!(browseHeader || dashboardSection);
      if(inApp){
        e.preventDefault();
        showBrowse();
        openSearch();
      } else {
        // Navigate to app page and show Browse
        window.location.href = 'worklink.html#browse';
      }
    });
  }
  if(dashSide){
    dashSide.addEventListener('click', (e)=>{
      const inApp = !!dashboardSection;
      if(inApp){
        e.preventDefault();
        showDashboard();
        setSidebar(false);
      } else {
        // Navigate to app page and show Dashboard
        e.preventDefault();
        window.location.href = 'worklink.html#dashboard';
      }
    });
  }
  if(settingsSide){
    settingsSide.addEventListener('click', (e)=>{
      const inApp = !!settingsPanel || !!dashboardSection || !!browseHeader;
      if(inApp){
        e.preventDefault();
        showSettings();
        setSidebar(false);
      } else {
        // Navigate to app page and show Settings
        e.preventDefault();
        window.location.href = 'worklink.html#settings';
      }
    });
  }
  if(helpSide){
    helpSide.addEventListener('click', (e)=>{
      e.preventDefault();
      openHelp();
    });
  }
  // Fallback: on pages without the app sections, route sidebar clicks to worklink.html
  const sidebarEl = document.querySelector('.sidebar');
  if(sidebarEl){
    sidebarEl.addEventListener('click', (e)=>{
      const a = e.target.closest('a[data-side]');
      if(!a) return;
      const side = a.getAttribute('data-side');
      const inApp = !!(dashboardSection || browseHeader || settingsPanel);
      if(!inApp){
        e.preventDefault();
        if(side === 'home'){
          window.location.href = 'worklink.html';
          return;
        }
        const allowed = ['dashboard','settings','browse','help','language','location','home'];
        const hash = allowed.includes(side) ? side : 'browse';
        window.location.href = `worklink.html#${hash}`;
      }
    });
  }
  // Global fallback for any link to browse.html (e.g., on login/register pages)
  document.addEventListener('click', (e)=>{
    const link = e.target.closest('a[href="browse.html"]');
    if(!link) return;
    const inApp = !!(dashboardSection || browseHeader || settingsPanel);
    if(!inApp){
      e.preventDefault();
      window.location.href = 'worklink.html#browse';
    }
  });
  if(dashBack){
    dashBack.addEventListener('click', ()=>{
      showBrowse();
      setSidebar(false);
      // Ensure we scroll to header
      const hdr = document.getElementById('browseHeader');
      if(hdr) hdr.scrollIntoView({behavior:'smooth', block:'start'});
    });
  }
  // Route by hash once functions are defined
  const routeByHash = ()=>{
    const hash = (location.hash||'').toLowerCase();
    if(hash === '#dashboard'){
      showDashboard();
    } else if(hash === '#settings'){
      showSettings();
    } else if(hash === '#browse' || hash === '#home'){
      showBrowse();
    } else if(hash === '#help'){
      openHelp();
    } else if(hash === '#language'){
      openLanguage();
    } else if(hash === '#location'){
      openLocation();
    }
  };
  routeByHash();
  window.addEventListener('hashchange', routeByHash);
  const orgInner = document.querySelector('#dashboard .org-tile .org-inner');
  if(orgInner){
    orgInner.addEventListener('click', ()=>{
      if(localStorage.getItem('connectiq_signed_in') !== '1') return;
      const nameEl = orgInner.querySelector('.org-name');
      if(nameEl){ nameEl.textContent = 'Clean Up Volunteer'; }
      const valEl = document.querySelector('#dashboard .stat-box .value');
      if(valEl){
        const current = parseInt((valEl.textContent||'').replace(/[^0-9]/g,''), 10) || 0;
        const next = Math.max(0, current - 1000);
        valEl.textContent = `Rs. ${next.toLocaleString()}`;
      }
    });
  }
  // Profile info toggle on dashboard
  if(profileIco){
    const statBox = profileIco.closest('.stat-box');
    profileIco.addEventListener('click', (e)=>{
      e.stopPropagation();
      if(statBox){
        statBox.classList.toggle('show-info');
        statBox.classList.toggle('show-calendar');
      }
    });
    // Close when clicking outside
    document.addEventListener('click', (e)=>{
      if(!statBox) return;
      const panel = statBox.querySelector('.profile-info');
      if(!statBox.contains(e.target)){
        statBox.classList.remove('show-info');
        statBox.classList.remove('show-calendar');
      }
    });
  }
  if(languageSide){
    languageSide.addEventListener('click', (e)=>{
      e.preventDefault();
      openLanguage();
    });
  }
  if(locationSide){
    locationSide.addEventListener('click', (e)=>{
      e.preventDefault();
      openLocation();
    });
  }
  if(closeSearchBtn){
    closeSearchBtn.addEventListener('click', closeSearch);
  }
  if(searchModal){
    const modalBackdrop = searchModal.querySelector('.backdrop');
    if(modalBackdrop){ modalBackdrop.addEventListener('click', closeSearch); }
    document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeSearch(); });

    // Build suggestions list from existing cards
    const titles = Array.from(document.querySelectorAll('#browseGrid .card h3'))
      .map(h=> h.textContent.trim())
      .filter(Boolean);
    const uniqueTitles = Array.from(new Set(titles)).reverse();

    const renderSuggestions = (items=[]) => {
      if(!suggestionsBox) return;
      const ul = suggestionsBox.querySelector('ul');
      if(!ul) return;
      ul.innerHTML = items.slice(0,8).map(t=> `<li data-val="${t.replace(/"/g,'&quot;')}">${t}</li>`).join('');
      suggestionsBox.classList.toggle('show', items.length>0);
    };

    const input = searchModal.querySelector('input');
    if(input){
      input.addEventListener('focus', ()=>{
        // Show top suggestions on focus
        renderSuggestions(uniqueTitles);
      });
      input.addEventListener('input', ()=>{
        const q = input.value.trim().toLowerCase();
        if(!q){ renderSuggestions(uniqueTitles); return; }
        const filtered = uniqueTitles.filter(t=> t.toLowerCase().includes(q));
        renderSuggestions(filtered);
      });
      input.addEventListener('blur', ()=>{
        setTimeout(()=> suggestionsBox && suggestionsBox.classList.remove('show'), 120);
      });
    }
    if(suggestionsBox){
      suggestionsBox.addEventListener('mousedown', (e)=>{
        const li = e.target.closest('li');
        if(!li || !input) return;
        input.value = li.dataset.val || li.textContent.trim();
        suggestionsBox.classList.remove('show');
      });
    }
  }

  // Ensure main app is visible after handshake if Dashboard is selected elsewhere

  // Show hamburger when hovering 'Diagrams' or the hamburger itself; 
  // keep it visible until cursor leaves both (with a short delay)
  const diagramsTab = document.querySelector('.dash-top .tab:first-child');
  let hoverCount = 0;
  let hideTimer;
  const onEnter = ()=>{
    if(!document.body.classList.contains('dashboard-full')) return;
    hoverCount++;
    if(hideTimer){ clearTimeout(hideTimer); hideTimer = null; }
    showHamburger();
  };
  const onLeave = ()=>{
    if(!document.body.classList.contains('dashboard-full')) return;
    hoverCount = Math.max(0, hoverCount - 1);
    if(hoverCount===0){
      hideTimer = setTimeout(()=>{
        // Only hide if still on dashboard and sidebar is closed
        const isSidebarOpen = sidebar && sidebar.classList.contains('open');
        if(document.body.classList.contains('dashboard-full') && !isSidebarOpen){
          hideHamburger();
        }
      }, 2000);
    }
  };
  if(diagramsTab){
    diagramsTab.addEventListener('mouseenter', onEnter);
    diagramsTab.addEventListener('mouseleave', onLeave);
  }
  if(menuBtn){
    menuBtn.addEventListener('mouseenter', onEnter);
    menuBtn.addEventListener('mouseleave', onLeave);
  }

  // Global left-edge reveal: show hamburger when cursor is at far left
  let globalEdgeTimer;
  document.addEventListener('mousemove', (e)=>{
    if(!menuBtn) return;
    if(e.clientX <= 8){
      showHamburger();
    } else {
      const isSidebarOpen = sidebar && sidebar.classList.contains('open');
      if(!isSidebarOpen && document.body.classList.contains('dashboard-full')){
        if(globalEdgeTimer) clearTimeout(globalEdgeTimer);
        globalEdgeTimer = setTimeout(()=>{ hideHamburger(); }, 2000);
      }
    }
  });

  // Filter chips active state
  const chips = Array.from(document.querySelectorAll('.chip'));
  const cards = Array.from(document.querySelectorAll('[data-type]'));
  const applyFilter = (key) => {
    cards.forEach(card => {
      const type = card.getAttribute('data-type');
      const show = (key === 'all') || (type === key);
      card.style.display = show ? '' : 'none';
    });
  };
  chips.forEach(chip=>{
    chip.addEventListener('click',()=>{
      chips.forEach(c=>c.classList.remove('active'));
      chip.classList.add('active');
      const key = chip.dataset.filter || chip.textContent.trim().toLowerCase();
      applyFilter(key);
    });
  });
  // Initialize default filter if an active chip is present
  const active = document.querySelector('.chip.active');
  if(active){
    const key = active.dataset.filter || active.textContent.trim().toLowerCase();
    applyFilter(key);
  }

  // Auto set active navbar link based on pathname
  const navLinks = Array.from(document.querySelectorAll('.navlinks a[href]'));
  if(navLinks.length){
    const file = location.pathname.split('/').pop().toLowerCase();
    navLinks.forEach(a=>a.classList.remove('active'));
    const match = navLinks.find(a=> a.getAttribute('href').toLowerCase() === file);
    if(match) match.classList.add('active');
  }

  // Navbar highlight switching (works for any nav link or button)
  const nav = document.querySelector('.navlinks');
  const clearNavPrimary = () => nav && nav.querySelectorAll('a').forEach(b=> b.classList.remove('primary'));
  const applyBtnPrimaryFromStorage = () => {
    const token = localStorage.getItem('connectiq_btn');
    if(!nav) return;
    if(!token){
      // No default highlight; only set on explicit click
      clearNavPrimary();
      return;
    }
    clearNavPrimary();
    let target;
    if(token.startsWith('cta:')){
      const key = token.slice(4);
      target = nav.querySelector(`[data-cta="${key}"]`);
    } else if(token.startsWith('href:')){
      const href = token.slice(5);
      target = nav.querySelector(`a[href="${href}"]`);
    }
    if(target) target.classList.add('primary');
  };
  applyBtnPrimaryFromStorage();
  // Click handler for any nav button
  if(nav){
    nav.addEventListener('click', (e)=>{
      const a = e.target.closest('a');
      if(!a) return;
      if(a.dataset.cta){
        localStorage.setItem('connectiq_btn', `cta:${a.dataset.cta}`);
      } else if(a.getAttribute('href')){
        localStorage.setItem('connectiq_btn', `href:${a.getAttribute('href')}`);
      }
      clearNavPrimary();
      a.classList.add('primary');
    });
  }

  // Redirect all job card 'Apply Now' clicks to login interface
  document.addEventListener('click', (e)=>{
    const applyLink = e.target.closest('.apply a');
    if(!applyLink) return;
    e.preventDefault();
    window.location.href = 'login.html';
  });

  // Search input simple highlight on focus using parent field
  const input = document.querySelector('.searchbar input');
  if(input){
    const field = input.closest('.field');
    input.addEventListener('focus',()=> field.style.boxShadow = '0 0 0 6px rgba(76,111,255,.12)');
    input.addEventListener('blur',()=> field.style.boxShadow = 'none');
  }
});

// Ensure splash stays skipped on BFCache back/forward restores
window.addEventListener('pageshow', (e)=>{
  if(sessionStorage.getItem('connectiq_splash_shown') === '1'){
    const splash = document.querySelector('.splash');
    const app = document.querySelector('.app');
    if(splash) splash.classList.add('hide');
    if(app) app.classList.add('show');
  }
});
