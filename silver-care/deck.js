/* ==========================================================================
   Silver Care · Silnik Prezentacji Multimedialnej
   Zgodny z Kontraktem Wizualnym i Systemem Projektowania Silver Care
   - Nawigacja klawiaturą, kółkiem, kliknięciem, kroki i pasek postępu
   - Stoper [T], Notatki prelegenta [N], Pełny ekran [F], Motyw Jasny/Ciemny [M]
   - Subtelny, organiczny canvas połączeń w palecie marki
   - Interaktywne widżety: Porównanie Dziś vs Z Silver Care, Filtr Non-MDR,
     Ramka aplikacji, Symulator dyktowania, Kalkulator korzyści, Oś czasu, Formularz KIDO
   ========================================================================== */

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
  const btnTheme = document.getElementById('btn-theme');

  const total = cards.length;
  let currentIndex = 0;

  // 1. Generowanie kropek nawigacyjnych
  if (dotsNav) {
    dotsNav.innerHTML = '';
    cards.forEach((card, idx) => {
      const a = document.createElement('a');
      a.title = card.getAttribute('data-t') || `Slajd ${idx + 1}`;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        goToSlide(idx);
      });
      dotsNav.appendChild(a);
    });
  }
  const dots = dotsNav ? Array.from(dotsNav.querySelectorAll('a')) : [];

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
    if (activeCard && notesContent) {
      const notesElem = activeCard.querySelector('.notes');
      if (notesElem) {
        notesContent.innerHTML = notesElem.innerHTML;
      } else {
        notesContent.innerHTML = '<p style="color:var(--s-ter);">Brak notatek dla tego slajdu.</p>';
      }
    }

    // Zmiana formacji na canvasie
    if (activeCard) {
      const form = activeCard.getAttribute('data-form') || 'network';
      const side = activeCard.getAttribute('data-side') || 'full';
      if (window.setCanvasForm) {
        window.setCanvasForm(form, side);
      }
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
    if (!clock) return;
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
    if (!clock) return;
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
  if (btnFs) btnFs.addEventListener('click', toggleFullscreen);

  // 9. Przełącznik Motywu (Jasny / Ciemny wg Brand Kontraktu)
  let colorNode1 = '#2F6F5E';
  let colorNode2 = '#4F8F7C';
  let colorNodeDefault = '#8C8680';
  let lineRgb = '47, 111, 94';

  function updateThemeColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      colorNode1 = '#7FBCA8';
      colorNode2 = '#5FA08C';
      colorNodeDefault = '#918B83';
      lineRgb = '127, 188, 168';
    } else {
      colorNode1 = '#2F6F5E';
      colorNode2 = '#4F8F7C';
      colorNodeDefault = '#8C8680';
      lineRgb = '47, 111, 94';
    }
  }

  function applyTheme(mode) {
    const isDark = mode === 'dark';
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    if (btnTheme) {
      btnTheme.textContent = isDark ? 'Motyw: Ciemny [M]' : 'Motyw: Jasny [M]';
    }
    updateThemeColors();
  }

  function cycleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    applyTheme(isDark ? 'light' : 'dark');
  }

  if (btnTheme) btnTheme.addEventListener('click', cycleTheme);
  updateThemeColors();

  // Inicjalizacja pierwszego slajdu
  updateState(0);
  initInteractiveWidgets();

  // ==========================================
  // 10. SUBTELNY CANVAS (Organiczna Sieć Węzłów)
  // ==========================================
  const cv = document.getElementById('org');
  if (cv) {
    const cx = cv.getContext('2d');
    let W = 0, H = 0;
    const narrow = window.matchMedia('(max-width: 900px)').matches;
    const N = narrow ? 35 : 75;
    const nodes = [];
    const rnd = (a, b) => a + Math.random() * (b - a);

    function resize() {
      W = cv.width = window.innerWidth;
      H = cv.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

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
        r: rnd(1.6, 2.8),
        g: 0,
        pulse: Math.random() * 6.28
      });
    }

    let sideConstraint = 'full';
    const X0 = () => (sideConstraint === 'right' && !narrow ? W * 0.52 : W * 0.05);
    const X1 = () => W * 0.95;
    const xr = (u) => X0() + u * (X1() - X0());

    let activeLinks = [];

    const forms = {
      network() {
        const links = [];
        nodes.forEach((n) => {
          n.tx = xr(Math.random());
          n.ty = rnd(H * 0.12, H * 0.88);
          n.g = 0;
        });
        const lim = Math.min(W, H) * 0.13;
        for (let i = 0; i < N; i++) {
          for (let j = i + 1; j < N; j++) {
            if (Math.hypot(nodes[i].tx - nodes[j].tx, nodes[i].ty - nodes[j].ty) < lim) {
              links.push([i, j, 0.35]);
            }
          }
        }
        return links;
      },

      split() {
        const links = [];
        const mid = Math.floor(N / 2);
        nodes.forEach((n, i) => {
          if (i < mid) {
            n.tx = X0() + (X1() - X0()) * rnd(0.05, 0.38);
            n.ty = H * rnd(0.2, 0.8);
            n.g = 1;
          } else {
            n.tx = X0() + (X1() - X0()) * rnd(0.62, 0.95);
            n.ty = H * rnd(0.2, 0.8);
            n.g = 2;
          }
        });
        for (let i = 0; i < N; i++) {
          for (let j = i + 1; j < N; j++) {
            if (nodes[i].g === nodes[j].g) {
              if (Math.hypot(nodes[i].tx - nodes[j].tx, nodes[i].ty - nodes[j].ty) < 95) {
                links.push([i, j, 0.4]);
              }
            }
          }
        }
        return links;
      },

      streams() {
        const links = [];
        const rows = 3;
        nodes.forEach((n, i) => {
          const row = i % rows;
          n.tx = xr((Math.floor(i / rows) / (N / rows)) * 0.9 + 0.05);
          n.ty = H * (0.3 + row * 0.22) + rnd(-16, 16);
          n.g = row;
        });
        for (let i = 0; i < N; i++) {
          for (let j = i + 1; j < N; j++) {
            if (nodes[i].g === nodes[j].g && Math.abs(nodes[i].tx - nodes[j].tx) < W * 0.12) {
              links.push([i, j, 0.45]);
            }
          }
        }
        return links;
      },

      shield() {
        const links = [];
        const cxm = xr(0.5);
        const cym = H * 0.5;
        const R = Math.min(X1() - X0(), H) * 0.28;
        nodes.forEach((n, i) => {
          const a = (i / N) * 6.28;
          n.tx = cxm + Math.cos(a) * R * rnd(0.85, 1.15);
          n.ty = cym + Math.sin(a) * R * rnd(0.85, 1.15);
          n.g = 0;
        });
        for (let i = 0; i < N; i++) {
          const next = (i + 1) % N;
          links.push([i, next, 0.5]);
        }
        return links;
      },

      hub() {
        const links = [];
        const cxm = xr(0.5);
        const cym = H * 0.5;
        const R = Math.min(X1() - X0(), H) * 0.3;
        nodes[0].tx = cxm;
        nodes[0].ty = cym;
        nodes[0].r = 4.5;
        for (let i = 1; i < N; i++) {
          const a = rnd(0, 6.28);
          const r = rnd(R * 0.35, R);
          nodes[i].tx = cxm + Math.cos(a) * r;
          nodes[i].ty = cym + Math.sin(a) * r;
          if (i < 14) {
            links.push([0, i, 0.55]);
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

    function render() {
      cx.clearRect(0, 0, W, H);

      for (let k = 0; k < activeLinks.length; k++) {
        const [i, j, alpha] = activeLinks[k];
        const n1 = nodes[i];
        const n2 = nodes[j];
        if (!n1 || !n2) continue;

        cx.beginPath();
        cx.moveTo(n1.x, n1.y);
        cx.lineTo(n2.x, n2.y);
        cx.strokeStyle = `rgba(${lineRgb}, ${alpha * 0.28})`;
        cx.lineWidth = 1;
        cx.stroke();
      }

      const now = Date.now() * 0.002;
      for (let i = 0; i < N; i++) {
        const n = nodes[i];
        n.x += (n.tx - n.x) * 0.05;
        n.y += (n.ty - n.y) * 0.05;

        if (mouse.active) {
          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120 && dist > 1) {
            const force = (120 - dist) / 120;
            n.x += (dx / dist) * force * 2.5;
            n.y += (dy / dist) * force * 2.5;
          }
        }

        const p = Math.sin(now + n.pulse);
        const rad = Math.max(1, n.r + p * 0.4);

        cx.beginPath();
        cx.arc(n.x, n.y, rad, 0, 6.28);
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

    window.setCanvasForm('network', 'full');
    render();
  }

  // ==========================================
  // 11. INTERAKTYWNE WIDŻETY PREZENTACJI
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
      });

      btnSc.addEventListener('click', () => {
        btnSc.classList.add('active');
        btnStd.classList.remove('active');
        viewStd.style.display = 'none';
        viewSc.style.display = 'grid';
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
        cut: '<strong>Odcięto informacje medyczne przed AI:</strong><br>„Podałam tabletkę na nadciśnienie 5mg, ciśnienie 130 na 85” → Zapisano wyłącznie do wewnętrznego brudnopisu placówki.',
        letter: '„Dzień dobry! Pan Stanisław miał dziś spokojny poranek. Z dużym apetytem zjadł całe śniadanie i z uśmiechem spacerował po oddziale, rozmawiając z personelem. Przesyłamy serdeczne pozdrowienia z placówki!”',
        metrics: 'Kroki: 1 240 · Aktywność: 1,5 godz. · Posiłek: 100% · Nastrój: Pogodny'
      },
      'sample-2': {
        audio: '„Pani Helena uczestniczyła w zajęciach plastycznych, zrobiła piękny bukiet z papieru. Skarżyła się na ból kolana przy zmianie pogody, posmarowałam maścią.”',
        cut: '<strong>Odcięto informacje medyczne przed AI:</strong><br>„Skarżyła się na ból kolana (...), posmarowałam maścią” → Zapisano do wewnętrznego zeszytu dyżuru.',
        letter: '„Dzień dobry! Pani Helena spędziła dziś twórcze popołudnie na warsztatach plastycznych – stworzyła piękny papierowy bukiet, który ozdobił jej stolik. Cieszyła się ze wspólnej herbaty z sąsiadkami.”',
        metrics: 'Kroki: 980 · Warsztaty: 45 min · Sen: 8 godz. · Nastrój: Radosny'
      },
      'sample-3': {
        audio: '„Pan Jan wypił 1.5 litra wody, po obiedzie uciął sobie regenerującą drzemkę. Zmiana opatrunku na przedramieniu wykonana czysto.”',
        cut: '<strong>Odcięto informacje medyczne przed AI:</strong><br>„Zmiana opatrunku na przedramieniu” → Zapisano wyłącznie do karty czynności placówki.',
        letter: '„Dzień dobry! Pan Jan miał dziś bardzo spokojny dzień. Z apetytem zjadł obiad, dbał o regularne picie wody i wypoczął podczas popołudniowej drzemki. Przesyłamy pozdrowienia!”',
        metrics: 'Płyny: 1,5 L · Drzemka: 45 min · Posiłek: 100% · Nastrój: Spokojny'
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

    // 3. Eksplorator Modułów (Slide 05 / Layout S06)
    const moduleItems = document.querySelectorAll('.module-nav-item');
    const modTitle = document.getElementById('mod-preview-title');
    const modDesc = document.getElementById('mod-preview-desc');
    const modUi = document.getElementById('mod-preview-ui');

    const modulesData = {
      'bed': {
        title: '01 · Obłożenie i pokoje (Facility & Bed)',
        desc: 'Interaktywny rejestr sektorów, pokoi i łóżek. Dyrekcja w 3 sekundy widzi stan obłożenia placówki.',
        ui: `<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; margin-top:1rem;">
              <div style="background:var(--s-soft); border:2px solid var(--s-accent); padding:1rem; border-radius:12px; text-align:center;">
                <b style="color:var(--s-accent); font-size:17px;">Pokój 101</b><div style="font-size:15px; color:var(--s-sec); margin-top:4px;">2/2 zajęte</div>
              </div>
              <div style="background:var(--s-soft); border:2px solid var(--s-accent); padding:1rem; border-radius:12px; text-align:center;">
                <b style="color:var(--s-accent); font-size:17px;">Pokój 102</b><div style="font-size:15px; color:var(--s-sec); margin-top:4px;">2/2 zajęte</div>
              </div>
              <div style="background:var(--s-surface); border:2px dashed var(--s-border); padding:1rem; border-radius:12px; text-align:center;">
                <b style="color:var(--s-text); font-size:17px;">Pokój 103</b><div style="font-size:15px; color:var(--s-accent); margin-top:4px;">● 1 wolne miejsce</div>
              </div>
            </div>
            <div style="margin-top:1.2rem; font-size:16px; color:var(--s-sec);">
              Łączne obłożenie placówki: <strong style="color:var(--s-accent);">95,6%</strong> (43 / 45 miejsc aktywnych)
            </div>`
      },
      'agenda': {
        title: '02 · Agenda i rytm dnia',
        desc: 'Harmonogram posiłków, aktywności i wizyt. Opiekun wie co robić, a rodzina zna plan dnia.',
        ui: `<div style="display:flex; flex-direction:column; gap:8px; margin-top:1rem;">
              <div style="display:flex; justify-content:space-between; font-size:16px; border-bottom:1px solid var(--s-border); padding-bottom:6px;">
                <span style="font-weight:600; color:var(--s-text);">08:30 · Śniadanie w jadalni</span><span style="color:var(--s-accent);">Zakończone</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:16px; border-bottom:1px solid var(--s-border); padding-bottom:6px;">
                <span style="font-weight:600; color:var(--s-text);">10:30 · Warsztaty plastyczne / Ogród</span><span style="color:var(--s-accent);">Zakończone</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:16px; border-bottom:1px solid var(--s-border); padding-bottom:6px;">
                <span style="font-weight:600; color:var(--s-accent);">13:30 · Obiad & Czas na odpoczynek</span><span style="color:var(--s-accent);">W trakcie</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:16px; padding-bottom:6px;">
                <span style="color:var(--s-sec);">15:00 · Wysyłka raportu Peace Letter do bliskich</span><span style="color:var(--s-ter);">Zaplanowane</span>
              </div>
            </div>`
      },
      'chat': {
        title: '03 · Bezpieczny kontakt z rodziną',
        desc: 'Wygodna skrzynka zapytań od bliskich. Koniec z gubiącymi się karteczkami i telefonami w trakcie opieki.',
        ui: `<div style="display:flex; flex-direction:column; gap:10px; margin-top:1rem;">
              <div style="background:var(--s-sunken); padding:0.8rem 1.2rem; border-radius:12px; font-size:16px; max-width:85%; border:1px solid var(--s-border);">
                <b style="color:var(--s-text);">Córka (Pani Anna):</b><br>Dzień dobry, czy tata potrzebuje cieplejszych ubrań na spacer?
              </div>
              <div style="background:var(--s-soft); border:2px solid var(--s-accent); padding:0.8rem 1.2rem; border-radius:12px; font-size:16px; align-self:flex-end; max-width:85%;">
                <b style="color:var(--s-accent);">Opiekunka dyżurna:</b><br>Dzień dobry! Cieplejsza bluza będzie w sam raz na popołudnie. Dziękujemy!
              </div>
            </div>`
      },
      'wizard': {
        title: '04 · Kreator przyjęć podopiecznego',
        desc: 'Sprawne wprowadzenie seniora do systemu w 3 minuty. Baza kontaktów do bliskich, preferencje i zgody RODO.',
        ui: `<div style="display:flex; gap:8px; margin-top:1rem; font-size:15px;">
              <div style="flex:1; background:var(--s-soft); border:2px solid var(--s-accent); padding:0.7rem; border-radius:8px; text-align:center; font-weight:600; color:var(--s-accent);">1. Dane i profil</div>
              <div style="flex:1; background:var(--s-soft); border:2px solid var(--s-accent); padding:0.7rem; border-radius:8px; text-align:center; font-weight:600; color:var(--s-accent);">2. Preferencje dnia</div>
              <div style="flex:1; background:var(--s-soft); border:2px solid var(--s-accent); padding:0.7rem; border-radius:8px; text-align:center; font-weight:600; color:var(--s-accent);">3. Kontakt do bliskich</div>
            </div>
            <div style="margin-top:1.2rem; font-size:16px; color:var(--s-sec);">
              System generuje kod dostępu dla bliskich i uruchamia codzienny obieg informacji bez drukowania formularzy.
            </div>`
      },
      'multi': {
        title: '05 · Multi-Resident (Wielu podopiecznych)',
        desc: 'Rodziny posiadające oboje rodziców w placówce przełączają profil jednym tapnięciem bez przelogowywania.',
        ui: `<div style="display:flex; gap:12px; margin-top:1rem;">
              <div style="flex:1; border:2px solid var(--s-accent); background:var(--s-soft); padding:1rem; border-radius:12px;">
                <b style="color:var(--s-text); font-size:17px;">Mama (Pani Krystyna)</b>
                <div style="font-size:15px; color:var(--s-accent); margin-top:4px;">Pokój 104 · Aktywny widok</div>
              </div>
              <div style="flex:1; border:2px solid var(--s-border); background:var(--s-surface); padding:1rem; border-radius:12px; cursor:pointer;">
                <b style="color:var(--s-sec); font-size:17px;">Tata (Pan Henryk)</b>
                <div style="font-size:15px; color:var(--s-ter); margin-top:4px;">Pokój 108 · Kliknij, aby przełączyć</div>
              </div>
            </div>`
      },
      'gallery': {
        title: '06 · Bezpieczna galeria z życia placówki',
        desc: 'Zdjęcia z warsztatów i spacerów z automatyczną weryfikacją zgody wizerunkowej RODO.',
        ui: `<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; margin-top:1rem;">
              <div style="background:var(--s-sunken); border:1px solid var(--s-border); aspect-ratio:4/3; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:15px; color:var(--s-sec);">📷 Wypiek chleba</div>
              <div style="background:var(--s-sunken); border:1px solid var(--s-border); aspect-ratio:4/3; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:15px; color:var(--s-sec);">📷 Spacer w ogrodzie</div>
              <div style="background:var(--s-sunken); border:1px solid var(--s-border); aspect-ratio:4/3; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:15px; color:var(--s-sec);">📷 Muzyka i śpiew</div>
            </div>
            <div style="margin-top:1rem; font-size:15px; color:var(--s-accent); font-weight:500;">
              Zgoda wizerunkowa zweryfikowana dla wszystkich widocznych seniorów.
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
        btnRecord.innerHTML = '<span>●</span> Nagrywanie notatki (3s)...';
        waveform.classList.add('active');
        recStatus.textContent = 'Trwa nagrywanie notatki głosowej przez mikrofon PWA...';

        setTimeout(() => {
          btnRecord.innerHTML = '<span>⚡</span> Transkrypcja Groq Whisper EU...';
          recStatus.textContent = 'Transkrypcja AI + filtr Guardrails Non-MDR...';
        }, 2000);

        setTimeout(() => {
          btnRecord.classList.remove('recording');
          btnRecord.innerHTML = '<span>✔</span> Wysłano pomyślnie w 3.8s';
          waveform.classList.remove('active');
          recStatus.textContent = 'Notatka przetworzona · Dane medyczne odcięte · Raport doręczony do bliskich!';
          if (toastFamily) {
            toastFamily.style.display = 'block';
          }
          setTimeout(() => {
            btnRecord.innerHTML = '<span>🎙️</span> Przetestuj dyktowanie (Symulacja 3s)';
            isRecording = false;
          }, 4500);
        }, 3800);
      });
    }

    // 5. Interaktywny Kalkulator Korzyści (Slide 09 / Layout S07)
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

    // 6. Interaktywna Oś Czasu (Slide 13 / Layout S08 Proces)
    const timelineTabs = document.querySelectorAll('.timeline-step-btn');
    const timelineDetails = document.getElementById('timeline-step-details');
    const timelineData = {
      '1': {
        title: 'Krok 1 · Dziś: Porozumienie partnerskie z KIDO',
        desc: 'Podpisanie listu intencyjnego i wskazanie placówek członkowskich do bezpłatnego programu pilotażowego pod patronatem Izby.',
        checklist: [
          'Podpisanie listu intencyjnego między Zarządem KIDO a Silver Care',
          'Wskazanie 10-15 placówek zrzeszonych w Izbie do udziału w pilotażu',
          'Ustalenie zakresu metryk do wspólnego Ogólnopolskiego Raportu Branżowego'
        ]
      },
      '2': {
        title: 'Krok 2 · Za 30 dni: Uruchomienie & Szkolenia personelu',
        desc: 'Lekkie, bezkosztowe wdrożenie w domach członkowskich bez obciążania kadr ani działów informatycznych.',
        checklist: [
          'Zdalna konfiguracja pokoi i instalacja PWA na telefonach personelu (1 tapnięcie)',
          '30-minutowe instruktaże dyktowania głosem dla opiekunów i pielęgniarek',
          'Start codziennej wysyłki Peace Letter do bliskich pensjonariuszy o 15:00'
        ]
      },
      '3': {
        title: 'Krok 3 · Za 60 dni: Pilotaż w toku & Bieżące wsparcie',
        desc: 'Codzienna praca personelu z aplikacją głosową i bezpośrednia opieka nad podopiecznymi bez telefonów na dyżurce.',
        checklist: [
          'Codzienne raporty Peace Letter docierające do córek i synów o 15:00',
          'Spadek powtarzalnych telefonów na recepcji o 60%',
          'Bieżące zbieranie anonimowych metryk oszczędności czasu personelu'
        ]
      },
      '4': {
        title: 'Krok 4 · Za 90 dni: Ogólnopolski Raport KIDO & Konferencja',
        desc: 'Podsumowanie wyników, publikacja wspólnego raportu i uroczyste wręczenie certyfikatów placówkom Izby.',
        checklist: [
          'Opracowanie Raportu KIDO × Silver Care: „Cyfryzacja a retencja kadr w domach opieki”',
          'Uroczyste wręczenie certyfikatów „Lider Nowego Standardu KIDO” placówkom pilotażowym',
          'Wystąpienie Prezesa KIDO z twardymi danymi na ogólnopolskiej konferencji branżowej'
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
          let listHtml = d.checklist.map(item => `<li style="display:flex; align-items:flex-start; gap:8px;"><span style="color:var(--s-accent); font-weight:600;">✔</span> <span>${item}</span></li>`).join('');
          timelineDetails.innerHTML = `
            <div style="background:var(--s-surface); border:2px solid var(--s-accent); border-radius:var(--radius-sm); padding:1.5rem; margin-top:1rem;">
              <h4 style="font-size:20px; font-weight:600; color:var(--s-accent); margin:0 0 0.5rem;">${d.title}</h4>
              <p style="color:var(--s-sec); font-size:17px; margin-bottom:1rem; line-height:1.5;">${d.desc}</p>
              <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:0.6rem; font-size:16px; color:var(--s-text);">
                ${listHtml}
              </ul>
            </div>
          `;
        }
      });
    });

    // 7. Inicjatywa Partnerska KIDO (Slide 14)
    const pilotBtn = document.getElementById('btn-pilot-submit');
    const inputFacility = document.getElementById('pilot-facility');
    const inputCity = document.getElementById('pilot-city');
    const inputBeds = document.getElementById('pilot-beds');

    if (pilotBtn && inputFacility) {
      pilotBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const facility = inputFacility.value.trim() || 'Krajowa Izba Domów Opieki';
        const city = inputCity ? inputCity.value.trim() || 'Warszawa / Cała Polska' : 'Warszawa';
        const beds = inputBeds ? inputBeds.value.trim() || '10-15 placówek pilotażowych' : '10-15 placówek';

        const subject = encodeURIComponent(`Inicjatywa Partnerska: Krajowa Izba Domów Opieki x Silver Care`);
        const body = encodeURIComponent(
          `Szanowny Panie Prezesie,\n\nNawiązując do prezentacji dla Krajowej Izby Domów Opieki, potwierdzamy gotowość do sformalizowania partnerstwa strategicznego oraz uruchomienia bezpłatnego Programu Pilotażowego dla placówek zrzeszonych w KIDO:\n\n` +
          `• Podmiot: ${facility}\n` +
          `• Zasięg: ${city}\n` +
          `• Skala pilotażu: ${beds}\n\n` +
          `Cel: Ochrona kadr opiekuńczych, wdrożenie standardu komunikacji Non-MDR oraz przygotowanie wspólnego Ogólnopolskiego Raportu Branżowego KIDO.\n\n` +
          `Z poważaniem,\nDariusz Olszewski-Rink\nMichał Sznurowski\nŁukasz Romanowicz\nSilver Care`
        );
        window.location.href = `mailto:kontakt@silvercare.pl?subject=${subject}&body=${body}`;
      });
    }
  }
})();
