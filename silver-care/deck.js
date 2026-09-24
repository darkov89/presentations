/* Silver Care · Blueprint Deck Engine
   - Silnik prezentacji: scroll-snap, kropki, klawisze, stoper, notatki (N), pełny ekran (F).
   - Animowany canvas: sieć węzłów w barwach Silver Care, reorganizująca się per slajd (data-form).
*/

(function () {
  // Elementy DOM
  const deck = document.getElementById('deck');
  const cards = Array.from(document.querySelectorAll('.card'));
  const bar = document.getElementById('bar');
  const num = document.getElementById('num');
  const dotsNav = document.getElementById('dots');
  const clock = document.getElementById('clock');
  const notesDrawer = document.getElementById('notes-drawer');
  const notesContent = document.getElementById('notes-content');
  const btnNotes = document.getElementById('btn-notes');
  const btnFs = document.getElementById('btn-fs');
  const btnCloseNotes = document.getElementById('btn-close-notes');

  const total = cards.length;
  let currentIndex = 0;

  // 1. Generowanie kropek nawigacyjnych
  cards.forEach((card, idx) => {
    const a = document.createElement('a');
    a.title = card.getAttribute('data-t') || `Slajd ${idx + 1}`;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      goToSlide(idx);
    });
    dotsNav.appendChild(a);
  });
  const dots = Array.from(dotsNav.querySelectorAll('a'));

  // 2. Nawigacja do konkretnego slajdu
  function goToSlide(idx) {
    if (idx < 0) idx = 0;
    if (idx >= total) idx = total - 1;
    cards[idx].scrollIntoView({ behavior: 'smooth' });
  }

  // 3. Aktualizacja stanu aktywnego slajdu
  function updateState(idx) {
    currentIndex = idx;
    const pad = (n) => (n < 10 ? '0' + n : '' + n);
    if (num) num.textContent = `${pad(idx + 1)} / ${pad(total)}`;
    if (bar) bar.style.width = `${((idx + 1) / total) * 100}%`;

    dots.forEach((d, i) => {
      d.classList.toggle('active', i === idx);
    });

    // Aktualizacja notatek prelegenta
    const activeCard = cards[idx];
    const notesElem = activeCard.querySelector('.notes');
    if (notesContent) {
      if (notesElem) {
        notesContent.innerHTML = notesElem.innerHTML;
      } else {
        notesContent.innerHTML = '<p class="dim">Brak notatek dla tego slajdu.</p>';
      }
    }

    // Zmiana formacji na canvasie
    const form = activeCard.getAttribute('data-form') || 'network';
    const side = activeCard.getAttribute('data-side') || 'full';
    if (window.setCanvasForm) {
      window.setCanvasForm(form, side);
    }
  }

  // 4. Detekcja widocznego slajdu (IntersectionObserver)
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          const idx = cards.indexOf(entry.target);
          if (idx !== -1) updateState(idx);
        }
      });
    },
    { root: deck, threshold: 0.5 }
  );

  cards.forEach((card) => observer.observe(card));

  // 5. Obsługa klawiatury
  window.addEventListener('keydown', (e) => {
    // Jeśli użytkownik pisze w inpucie, ignoruj
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
      case ' ':
      case 'PageDown':
        e.preventDefault();
        goToSlide(currentIndex + 1);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault();
        goToSlide(currentIndex - 1);
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        goToSlide(total - 1);
        break;
      case 'n':
      case 'N':
        toggleNotes();
        break;
      case 't':
      case 'T':
        toggleTimer();
        break;
      case 'r':
      case 'R':
        resetTimer();
        break;
      case 'f':
      case 'F':
        toggleFullscreen();
        break;
      case 'm':
      case 'M':
        cycleTheme();
        break;
      case 'Escape':
        if (notesDrawer && notesDrawer.classList.contains('open')) {
          toggleNotes(false);
        }
        break;
    }
  });

  // 6. Stoper (Timer)
  let timerRunning = false;
  let seconds = 0;
  let timerInterval = null;

  function formatTime(s) {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
  }

  function toggleTimer() {
    if (timerRunning) {
      clearInterval(timerInterval);
      timerRunning = false;
      clock.style.opacity = '0.6';
    } else {
      timerRunning = true;
      clock.style.opacity = '1';
      timerInterval = setInterval(() => {
        seconds++;
        clock.textContent = formatTime(seconds);
      }, 1000);
    }
  }

  function resetTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    seconds = 0;
    clock.textContent = '00:00';
    clock.style.opacity = '0.6';
  }

  if (clock) {
    clock.addEventListener('click', toggleTimer);
  }

  // 7. Notatki prelegenta
  function toggleNotes(force) {
    if (!notesDrawer) return;
    const shouldOpen = force !== undefined ? force : !notesDrawer.classList.contains('open');
    notesDrawer.classList.toggle('open', shouldOpen);
    if (btnNotes) btnNotes.classList.toggle('active', shouldOpen);
  }

  if (btnNotes) btnNotes.addEventListener('click', () => toggleNotes());
  if (btnCloseNotes) btnCloseNotes.addEventListener('click', () => toggleNotes(false));

  // 8. Pełny ekran
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  }
  // 8.5. Dynamiczny Silnik Motywów (Theme Engine)
  const themes = ['default', 'clinical', 'warm', 'midnight'];
  const themeNames = {
    'default': 'Szałwia',
    'clinical': 'Clinical Blue',
    'warm': 'Warm Care',
    'midnight': 'Midnight Tech'
  };
  let currentThemeIdx = 0;
  const btnTheme = document.getElementById('btn-theme');

  let colorNode1 = '#E2C285';
  let colorNode2 = '#7FBCA8';
  let colorNodeDefault = '#A7E8D4';
  let lineRgb = '127, 188, 168';

  function updateThemeColors() {
    const cs = getComputedStyle(document.documentElement);
    colorNode1 = cs.getPropertyValue('--node-g1').trim() || '#E2C285';
    colorNode2 = cs.getPropertyValue('--node-g2').trim() || '#7FBCA8';
    colorNodeDefault = cs.getPropertyValue('--node-default').trim() || '#A7E8D4';
    lineRgb = cs.getPropertyValue('--line-rgb').trim() || '127, 188, 168';
  }

  function applyTheme(idx) {
    currentThemeIdx = (idx + themes.length) % themes.length;
    const t = themes[currentThemeIdx];
    if (t === 'default') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', t);
    }
    if (btnTheme) {
      btnTheme.textContent = `Motyw: ${themeNames[t]} [M]`;
    }
    updateThemeColors();
  }

  function cycleTheme() {
    applyTheme(currentThemeIdx + 1);
  }

  if (btnTheme) btnTheme.addEventListener('click', cycleTheme);
  updateThemeColors();

  // Inicjalizacja pierwszego slajdu
  updateState(0);
  initInteractiveWidgets();

  // ==========================================
  // 9. ANIMOWANY CANVAS (Blueprint Topology)
  // ==========================================
  const cv = document.getElementById('org');
  if (!cv) return;
  const cx = cv.getContext('2d');

  let W = 0, H = 0;
  const narrow = window.matchMedia('(max-width: 900px)').matches;
  const N = narrow ? 45 : 110;
  const nodes = [];
  const rnd = (a, b) => a + Math.random() * (b - a);

  function resize() {
    W = cv.width = window.innerWidth;
    H = cv.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Interakcja myszką z canvasem
  let mouse = { x: -1000, y: -1000, active: false };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });
  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  for (let i = 0; i < N; i++) {
    nodes.push({
      x: rnd(0, W || 1400),
      y: rnd(0, H || 900),
      tx: 0,
      ty: 0,
      r: rnd(1.8, 3.2),
      g: 0,
      pulse: Math.random() * 6.28
    });
  }

  let sideConstraint = 'full';
  const X0 = () => (sideConstraint === 'right' && !narrow ? W * 0.54 : W * 0.05);
  const X1 = () => W * 0.95;
  const xr = (u) => X0() + u * (X1() - X0());

  let activeLinks = [];

  const forms = {
    // Siatka relacji (Home, opieka, rodzina)
    network() {
      const links = [];
      nodes.forEach((n) => {
        n.tx = xr(Math.random());
        n.ty = rnd(H * 0.12, H * 0.88);
        n.g = 0;
      });
      const lim = Math.min(W, H) * 0.11;
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          if (Math.hypot(nodes[i].tx - nodes[j].tx, nodes[i].ty - nodes[j].ty) < lim) {
            links.push([i, j, 0.4]);
          }
        }
      }
      return links;
    },

    // Dwa odcięte bieguny (Personel vs Rodzina w problemie)
    split() {
      const links = [];
      const mid = Math.floor(N / 2);
      nodes.forEach((n, i) => {
        if (i < mid) {
          // Lewa grupa (personel)
          n.tx = X0() + (X1() - X0()) * rnd(0.05, 0.35);
          n.ty = H * rnd(0.2, 0.8);
          n.g = 1;
        } else {
          // Prawa grupa (rodziny)
          n.tx = X0() + (X1() - X0()) * rnd(0.65, 0.95);
          n.ty = H * rnd(0.2, 0.8);
          n.g = 2;
        }
      });
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          if (nodes[i].g === nodes[j].g) {
            if (Math.hypot(nodes[i].tx - nodes[j].tx, nodes[i].ty - nodes[j].ty) < 90) {
              links.push([i, j, 0.45]);
            }
          }
        }
      }
      return links;
    },

    // 3 strumienie notatki (Medical odcięty, Behavioral & Discomfort lecące do AI)
    streams() {
      const links = [];
      const rows = 3;
      const stepY = (H * 0.6) / (rows - 1);
      nodes.forEach((n, i) => {
        const row = i % rows;
        n.tx = X0() + (X1() - X0()) * ((i / N) * 0.9 + 0.05);
        n.ty = H * 0.22 + row * stepY + rnd(-15, 15);
        n.g = row;
        if (i > 0 && (i - 1) % rows === row) {
          links.push([i - 1, i, 0.8]);
        }
      });
      return links;
    },

    // Tarcza ochronna (Bezpieczeństwo, RODO Art 9, Non-MDR)
    shield() {
      const links = [];
      const cxm = xr(0.5);
      const cym = H * 0.52;
      const R = Math.min(X1() - X0(), H) * 0.36;
      nodes.forEach((n, i) => {
        const a = (i / N) * 6.283;
        const rad = i % 4 === 0 ? R * 0.55 : R;
        n.tx = cxm + Math.cos(a) * rad;
        n.ty = cym + Math.sin(a) * rad;
        n.g = 3;
        if (i > 0) links.push([i - 1, i, 0.6]);
      });
      links.push([N - 1, 0, 0.6]);
      return links;
    },

    // Centralny węzeł modułowy (Ekosystem platformy)
    hub() {
      const links = [];
      const cxm = xr(0.5);
      const cym = H * 0.5;
      const R = Math.min(X1() - X0(), H) * 0.32;
      // Węzeł centralny
      nodes[0].tx = cxm;
      nodes[0].ty = cym;
      nodes[0].r = 5;

      for (let i = 1; i < N; i++) {
        const a = rnd(0, 6.28);
        const r = rnd(R * 0.3, R);
        nodes[i].tx = cxm + Math.cos(a) * r;
        nodes[i].ty = cym + Math.sin(a) * r;
        if (i < 15) {
          links.push([0, i, 0.7]);
        }
      }
      return links;
    }
  };

  window.setCanvasForm = function (name, side) {
    sideConstraint = side || 'full';
    const fn = forms[name] || forms.network;
    activeLinks = fn();
  };

  // Pętla renderująca canvas
  function render() {
    cx.clearRect(0, 0, W, H);

    // Połączenia (linie)
    for (let k = 0; k < activeLinks.length; k++) {
      const [i, j, alpha] = activeLinks[k];
      const n1 = nodes[i];
      const n2 = nodes[j];
      if (!n1 || !n2) continue;

      cx.beginPath();
      cx.moveTo(n1.x, n1.y);
      cx.lineTo(n2.x, n2.y);
      cx.strokeStyle = `rgba(${lineRgb}, ${alpha * 0.4})`;
      cx.lineWidth = 1;
      cx.stroke();
    }

    // Węzły (kropki)
    const now = Date.now() * 0.003;
    for (let i = 0; i < N; i++) {
      const n = nodes[i];
      // Płynna interpolacja do pozycji docelowej
      n.x += (n.tx - n.x) * 0.06;
      n.y += (n.ty - n.y) * 0.06;

      // Interakcja myszką: delikatne odpychanie cząsteczek wokół kursora
      if (mouse.active) {
        const dx = n.x - mouse.x;
        const dy = n.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 130 && dist > 1) {
          const force = (130 - dist) / 130;
          n.x += (dx / dist) * force * 3.4;
          n.y += (dy / dist) * force * 3.4;
        }
      }

      const p = Math.sin(now + n.pulse);
      const rad = Math.max(1, n.r + p * 0.6);

      cx.beginPath();
      cx.arc(n.x, n.y, rad, 0, 6.28);
      // Kolor węzła zależny od grupy i dynamicznego motywu
      if (n.g === 1) {
        cx.fillStyle = colorNode1;
      } else if (n.g === 2) {
        cx.fillStyle = colorNode2;
      } else {
        cx.fillStyle = colorNodeDefault;
      }
      cx.fill();
    }

    requestAnimationFrame(render);
  }

  // Uruchomienie pierwszej formacji
  window.setCanvasForm('network', 'full');
  render();

  // ==========================================
  // 10. INTERAKTYWNE WIDŻETY PREZENTACJI
  // ==========================================
  function initInteractiveWidgets() {
    // 1. Przełącznik trybu placówki (Slide 02)
    const btnStd = document.getElementById('btn-mode-std');
    const btnSc = document.getElementById('btn-mode-sc');
    const viewStd = document.getElementById('view-mode-std');
    const viewSc = document.getElementById('view-mode-sc');

    if (btnStd && btnSc && viewStd && viewSc) {
      btnStd.addEventListener('click', () => {
        btnStd.classList.add('active');
        btnSc.classList.remove('active');
        viewStd.style.display = 'grid';
        viewSc.style.display = 'none';
        if (window.setCanvasForm) window.setCanvasForm('split', 'right');
      });
      btnSc.addEventListener('click', () => {
        btnSc.classList.add('active');
        btnStd.classList.remove('active');
        viewStd.style.display = 'none';
        viewSc.style.display = 'grid';
        if (window.setCanvasForm) window.setCanvasForm('network', 'right');
      });
    }

    // 2. Próbki dyktowania i filtr Non-MDR (Slide 04)
    const samplePills = document.querySelectorAll('.sample-pill');
    const sampleAudioText = document.getElementById('sample-audio-text');
    const sampleCutText = document.getElementById('sample-cut-text');
    const sampleFamilyLetter = document.getElementById('sample-family-letter');
    const sampleMetrics = document.getElementById('sample-metrics');

    const samplesData = {
      'sample-1': {
        audio: '„Pan Stanisław zjadł całe śniadanie, humor dopisuje, spacerował po korytarzu. Podałam tabletkę na nadciśnienie 5mg, ciśnienie 130 na 85.”',
        cut: '<span class="no">✖ ODCIĘTO MEDYCZNE PRZED AI:</span><br>„Podałam tabletkę na nadciśnienie 5mg, ciśnienie 130 na 85” → Zapisano do wewnętrznego brudnopisu medycznego placówki.',
        letter: '„Dzień dobry! Pan Stanisław miał dziś wspaniały poranek. Z dużym apetytem zjadł całe śniadanie i z uśmiechem spacerował po oddziale, rozmawiając z personelem. Przesyłamy ciepłe pozdrowienia z placówki!”',
        metrics: 'Kroki: 1 240 · Aktywność: 1.5h · Posiłek: 100% · Humor: Pogodny'
      },
      'sample-2': {
        audio: '„Pani Helena uczestniczyła w zajęciach plastycznych, zrobiła piękny bukiet z papieru. Skarżyła się na lekki ból kolana przy zmianie pogody, posmarowałam maścią rozgrzewającą.”',
        cut: '<span class="no">✖ ODCIĘTO MEDYCZNE PRZED AI:</span><br>„Skarżyła się na lekki ból kolana (...), posmarowałam maścią rozgrzewającą” → Przekazano do pielęgniarki dyżurnej.',
        letter: '„Dzień dobry! Pani Helena spędziła dziś twórcze popołudnie na warsztatach plastycznych – stworzyła piękny papierowy bukiet, który ozdobił jej stolik. Cieszyła się ze wspólnej herbaty z sąsiadkami.”',
        metrics: 'Kroki: 980 · Warsztaty: 45 min · Sen nocny: 8h · Humor: Radosna'
      },
      'sample-3': {
        audio: '„Pan Jan wypił 1.5 litra wody, po obiedzie uciął sobie regenerującą drzemkę. Zmiana opatrunku na przedramieniu wykonana czysto bez zaczerwienień.”',
        cut: '<span class="no">✖ ODCIĘTO MEDYCZNE PRZED AI:</span><br>„Zmiana opatrunku na przedramieniu (...) bez zaczerwienień” → Zapisano do karty zabiegowej placówki.',
        letter: '„Dzień dobry! Pan Jan miał dziś bardzo spokojny i zrelaksowany dzień. Z apetytem zjadł obiad, dbał o nawodnienie i wypoczął podczas popołudniowej drzemki. Wszystko w najlepszym porządku!”',
        metrics: 'Nawodnienie: 1.5 L · Drzemka: 45 min · Posiłek: 100% · Spokój: Wysoki'
      }
    };

    samplePills.forEach((pill) => {
      pill.addEventListener('click', () => {
        samplePills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        const key = pill.getAttribute('data-sample');
        const d = samplesData[key];
        if (d && sampleAudioText && sampleCutText && sampleFamilyLetter) {
          sampleAudioText.textContent = d.audio;
          sampleCutText.innerHTML = d.cut;
          sampleFamilyLetter.textContent = d.letter;
          if (sampleMetrics) sampleMetrics.textContent = d.metrics;
        }
      });
    });

    // 3. Eksplorator Modułów (Slide 05)
    const moduleItems = document.querySelectorAll('.module-nav-item');
    const modTitle = document.getElementById('mod-preview-title');
    const modDesc = document.getElementById('mod-preview-desc');
    const modUi = document.getElementById('mod-preview-ui');

    const modulesData = {
      'bed': {
        title: '01 · Obłożenie i Pokoje (Facility & Bed)',
        desc: 'Interaktywny rejestr sektorów, pokoi i łóżek. Dyrekcja w 3 sekundy widzi stan obłożenia placówki.',
        ui: `<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.6rem; margin-top:0.8rem;">
              <div style="background:rgba(47,111,94,0.3); border:1px solid var(--accent); padding:0.6rem; border-radius:4px; text-align:center;">
                <b style="color:var(--accent-soft);">Pokój 101</b><div style="font-size:0.75rem; color:var(--ink2);">2/2 Zajęte</div>
              </div>
              <div style="background:rgba(47,111,94,0.3); border:1px solid var(--accent); padding:0.6rem; border-radius:4px; text-align:center;">
                <b style="color:var(--accent-soft);">Pokój 102</b><div style="font-size:0.75rem; color:var(--ink2);">2/2 Zajęte</div>
              </div>
              <div style="background:rgba(226,194,133,0.15); border:1px dashed var(--accent-gold); padding:0.6rem; border-radius:4px; text-align:center;">
                <b style="color:var(--accent-gold);">Pokój 103</b><div style="font-size:0.75rem; color:var(--ink2);"><span style="color:#6ED6A0;">● 1 wolne łóżko</span></div>
              </div>
            </div>
            <div style="margin-top:1rem; font-family:var(--mono); font-size:0.75rem; color:var(--ink3);">
              Łączne obłożenie: <strong style="color:var(--accent);">95.6%</strong> (43/45 miejsc aktywnych)
            </div>`
      },
      'agenda': {
        title: '02 · Agenda i Rytm Dnia',
        desc: 'Harmonogram posiłków, rehabilitacji i wizyt. Opiekun wie co robić, a rodzina zna plan dnia.',
        ui: `<div style="display:flex; flex-direction:column; gap:0.5rem; margin-top:0.8rem;">
              <div style="display:flex; justify-content:space-between; font-size:0.82rem; border-bottom:1px solid var(--line2); padding-bottom:0.3rem;">
                <span style="color:var(--accent);">08:30 · Śniadanie & Leki</span><span style="color:#6ED6A0;">✔ Zakończone</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:0.82rem; border-bottom:1px solid var(--line2); padding-bottom:0.3rem;">
                <span style="color:var(--accent);">10:30 · Zajęcia plastyczne / Ogród</span><span style="color:#6ED6A0;">✔ Zakończone</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:0.82rem; border-bottom:1px solid var(--line2); padding-bottom:0.3rem;">
                <span style="color:var(--accent-gold);">13:30 · Obiad & Drzemka</span><span style="color:var(--accent-gold);">● W toku</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:0.82rem; padding-bottom:0.3rem;">
                <span style="color:var(--ink2);">15:00 · Wysyłka Peace Letter do rodzin</span><span style="color:var(--ink3);">Zaplanowane</span>
              </div>
            </div>`
      },
      'chat': {
        title: '03 · Bezpieczny Czat z Rodziną',
        desc: 'Wygodna skrzynka zapytań od bliskich. Koniec z gubiącymi się karteczkami i telefonami w trakcie zabiegów.',
        ui: `<div style="display:flex; flex-direction:column; gap:0.6rem; margin-top:0.8rem;">
              <div style="background:rgba(255,255,255,0.06); padding:0.6rem 0.8rem; border-radius:6px; font-size:0.82rem; max-width:85%;">
                <b style="color:var(--accent-gold);">Córka (Pani Anna):</b><br>Dzień dobry, czy tata potrzebuje cieplejszych skarpet na jesień?
              </div>
              <div style="background:rgba(47,111,94,0.35); border:1px solid var(--line); padding:0.6rem 0.8rem; border-radius:6px; font-size:0.82rem; align-self:flex-end; max-width:85%;">
                <b style="color:var(--accent-soft);">Opiekunka dyżurna:</b><br>Dzień dobry! Tak, 2 pary cieplejszych skarpet będą super. Dziękujemy!
              </div>
            </div>`
      },
      'wizard': {
        title: '04 · Kreator Przyjęć Mieszkańca',
        desc: 'Szybkie wprowadzenie podopiecznego do systemu w 3 minuty. Baza kontaktów, dieta i zgody RODO.',
        ui: `<div style="display:flex; gap:0.5rem; margin-top:0.8rem; font-family:var(--mono); font-size:0.72rem;">
              <div style="flex:1; background:rgba(47,111,94,0.4); border:1px solid var(--accent); padding:0.5rem; border-radius:4px; text-align:center;">1. Dane & PESEL (Hash)</div>
              <div style="flex:1; background:rgba(47,111,94,0.4); border:1px solid var(--accent); padding:0.5rem; border-radius:4px; text-align:center;">2. Dieta & Preferencje</div>
              <div style="flex:1; background:rgba(47,111,94,0.4); border:1px solid var(--accent); padding:0.5rem; border-radius:4px; text-align:center;">3. Telefon do córki</div>
            </div>
            <div style="margin-top:1rem; font-size:0.82rem; color:var(--ink2);">
              System natychmiast generuje dedykowany PIN logowania dla rodziny i tworzy bezpieczny profil.
            </div>`
      },
      'multi': {
        title: '05 · Multi-Resident (Wielu podopiecznych)',
        desc: 'Rodziny posiadające oboje rodziców w ośrodku przełączają profil jednym tapnięciem bez przelogowywania.',
        ui: `<div style="display:flex; gap:0.8rem; margin-top:0.8rem;">
              <div style="flex:1; border:1px solid var(--accent); background:rgba(47,111,94,0.3); padding:0.7rem; border-radius:4px;">
                <b style="color:#FFFFFF;">Mama (Pani Krystyna)</b>
                <div style="font-size:0.75rem; color:var(--accent);">Pokój 104 · Aktywny</div>
              </div>
              <div style="flex:1; border:1px solid var(--line2); background:rgba(9,21,18,0.5); padding:0.7rem; border-radius:4px;">
                <b style="color:var(--ink2);">Tata (Pan Henryk)</b>
                <div style="font-size:0.75rem; color:var(--ink3);">Pokój 108 · Kliknij by przełączyć</div>
              </div>
            </div>`
      },
      'gallery': {
        title: '06 · Bezpieczna Galeria Fotografii',
        desc: 'Szyfrowane zdjęcia z życia placówki z automatyczną weryfikacją zgody wizerunkowej RODO.',
        ui: `<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.5rem; margin-top:0.8rem;">
              <div style="background:rgba(255,255,255,0.06); aspect-ratio:4/3; border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:0.7rem; color:var(--accent);">📷 Wypiek chleba</div>
              <div style="background:rgba(255,255,255,0.06); aspect-ratio:4/3; border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:0.7rem; color:var(--accent);">📷 Spacer jesienny</div>
              <div style="background:rgba(255,255,255,0.06); aspect-ratio:4/3; border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:0.7rem; color:var(--accent);">📷 Muzykoterapia</div>
            </div>
            <div style="margin-top:0.8rem; font-family:var(--mono); font-size:0.7rem; color:#6ED6A0;">
              ✔ Zgoda RODO zweryfikowana dla 100% widocznych mieszkańców.
            </div>`
      }
    };

    moduleItems.forEach((item) => {
      item.addEventListener('click', () => {
        moduleItems.forEach((m) => m.classList.remove('active'));
        item.classList.add('active');
        const key = item.getAttribute('data-mod');
        const d = modulesData[key];
        if (d && modTitle && modDesc && modUi) {
          modTitle.textContent = d.title;
          modDesc.textContent = d.desc;
          modUi.innerHTML = d.ui;
        }
      });
    });

    // 4. Live Voice Simulator (Slide 07)
    const btnRecord = document.getElementById('btn-record-sim');
    const waveform = document.getElementById('waveform-sim');
    const recStatus = document.getElementById('rec-sim-status');
    const toastFamily = document.getElementById('toast-family-sim');

    if (btnRecord && waveform && recStatus) {
      let isRecording = false;
      btnRecord.addEventListener('click', () => {
        if (isRecording) return;
        isRecording = true;
        btnRecord.classList.add('recording');
        btnRecord.innerHTML = '<span>🔴</span> Nagrywanie głosu (3s)...';
        waveform.classList.add('active');
        recStatus.textContent = 'Trwa nagrywanie notatki przez mikrofon PWA...';

        setTimeout(() => {
          btnRecord.innerHTML = '<span>⚡</span> Przetwarzanie Groq Whisper EU...';
          recStatus.textContent = 'Transkrypcja AI + filtr Guardrails Non-MDR...';
        }, 2000);

        setTimeout(() => {
          btnRecord.classList.remove('recording');
          btnRecord.innerHTML = '<span>✔</span> Sukces! Wysłano w 3.8s';
          waveform.classList.remove('active');
          recStatus.textContent = 'Notatka przetworzona · Dane medyczne odcięte · Raport w telefonie rodziny!';
          if (toastFamily) {
            toastFamily.style.display = 'block';
            toastFamily.style.animation = 'fadeIn 0.4s ease';
          }
          setTimeout(() => {
            btnRecord.innerHTML = '<span>🎙️</span> Przetestuj dyktowanie (Symulacja 3s)';
            isRecording = false;
          }, 4500);
        }, 3800);
      });
    }

    // 5. Interaktywny Kalkulator Korzyści (Slide 09)
    const slider = document.getElementById('slider-residents');
    const valDisplay = document.getElementById('calc-residents-val');
    const outHours = document.getElementById('calc-hours-saved');
    const outCalls = document.getElementById('calc-calls-saved');
    const outFte = document.getElementById('calc-fte-saved');

    if (slider && valDisplay && outHours && outCalls && outFte) {
      function updateCalculator() {
        const count = parseInt(slider.value, 10);
        valDisplay.textContent = `${count} mieszkańców`;
        const hours = Math.round(count * 1.6);
        const calls = Math.round(count * 12);
        const fte = (hours / 160).toFixed(1);

        outHours.textContent = `~${hours} godz.`;
        outCalls.textContent = `~${calls}`;
        outFte.textContent = `~${fte} etatu`;
      }
      slider.addEventListener('input', updateCalculator);
      updateCalculator();
    }

    // 6. Interaktywna Oś Czasu (Slide 13)
    const timelineTabs = document.querySelectorAll('.timeline-step-btn');
    const timelineDetails = document.getElementById('timeline-step-details');
    const timelineData = {
      '1': {
        title: 'Krok 1 · Dziś: Rozmowa Zerowa (20 minut)',
        desc: 'Krótka, niezobowiązująca rozmowa z dyrekcją lub koordynatorem opieki.',
        checklist: [
          'Określenie liczby mieszkańców i specyfiki oddziałów',
          'Wybór 1-2 opiekunów jako koordynatorów testu',
          'Ustalenie dogodnej godziny wysyłki Peace Letter (np. 15:00)'
        ]
      },
      '2': {
        title: 'Krok 2 · Za 7 dni: Konfiguracja & Lekkie Szkolenie (30 minut)',
        desc: 'Wprowadzamy strukturę placówki bez angażowania działu IT.',
        checklist: [
          'Wprowadzenie listy pokoi i podopiecznych (szybki import)',
          'Zainstalowanie aplikacji PWA na telefonach opiekunów (1 tapnięcie)',
          'Krótki instruktaż dyktowania notatek głosem'
        ]
      },
      '3': {
        title: 'Krok 3 · Za 14 dni: Start Pilotażu & Pierwsze Raporty',
        desc: 'Pierwsze podyktowane notatki i pierwsze wiadomości u rodzin.',
        checklist: [
          'Pierwszy Peace Letter dostarczony do córek i synów o 15:00',
          'Natychmiastowy spadek liczby powtarzalnych telefonów na recepcji',
          'Cotygodniowy raport dla dyrekcji ze statystykami oszczędności czasu'
        ]
      }
    };

    timelineTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        timelineTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const step = tab.getAttribute('data-step');
        const d = timelineData[step];
        if (d && timelineDetails) {
          let listHtml = d.checklist.map(item => `<li><span style="color:#6ED6A0;">✔</span> ${item}</li>`).join('');
          timelineDetails.innerHTML = `
            <div style="background:var(--termbg); border:1px solid var(--accent-gold); border-radius:var(--radius); padding:1.2rem; margin-top:1rem;">
              <h4 style="font-family:var(--display); font-size:1.1rem; color:var(--accent-gold); margin:0 0 0.5rem;">${d.title}</h4>
              <p style="color:var(--ink2); font-size:0.92rem; margin-bottom:0.8rem;">${d.desc}</p>
              <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:0.4rem; font-size:0.85rem; color:var(--ink3);">
                ${listHtml}
              </ul>
            </div>
          `;
        }
      });
    });

    // 7. Szybkie Zgłoszenie Pilotażowe (Slide 14)
    const pilotBtn = document.getElementById('btn-pilot-submit');
    const inputFacility = document.getElementById('pilot-facility');
    const inputCity = document.getElementById('pilot-city');
    const inputBeds = document.getElementById('pilot-beds');

    if (pilotBtn && inputFacility) {
      pilotBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const facility = inputFacility.value.trim() || 'Dom Seniora';
        const city = inputCity ? inputCity.value.trim() || 'Polska' : 'Polska';
        const beds = inputBeds ? inputBeds.value.trim() || '40' : '40';

        const subject = encodeURIComponent(`Zgłoszenie do Programu Pilotażowego Silver Care - ${facility}`);
        const body = encodeURIComponent(
          `Dzień dobry,\n\nZgłaszam naszą placówkę do bezpłatnego Programu Pilotażowego Silver Care:\n\n` +
          `• Nazwa placówki: ${facility}\n` +
          `• Miejscowość: ${city}\n` +
          `• Szacunkowa liczba mieszkańców: ${beds}\n\n` +
          `Prosimy o kontakt w sprawie ustalenia terminu 20-minutowej rozmowy zerowej.\n\n` +
          `Pozdrawiam,\n`
        );
        window.location.href = `mailto:kontakt@silvercare.pl?subject=${subject}&body=${body}`;
      });
    }
  }
})();
