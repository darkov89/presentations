/* ==========================================================================
   Silver Care · Prezentacja Komercyjna B2B dla Placówek Opiekuńczych
   Silnik Prezentacji Multimedialnej
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

  // 1. Generowanie nawigacji kropkowej
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

  // 2. Nawigacja
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

    const activeCard = cards[idx];
    if (activeCard && notesContent) {
      const notesElem = activeCard.querySelector('.notes');
      if (notesElem) {
        notesContent.innerHTML = notesElem.innerHTML;
      } else {
        notesContent.innerHTML = '<p style="color:var(--s-ter);">Brak notatek dla tego slajdu.</p>';
      }
    }

    if (activeCard && window.setCanvasForm) {
      const form = activeCard.getAttribute('data-form') || 'network';
      const side = activeCard.getAttribute('data-side') || 'full';
      window.setCanvasForm(form, side);
    }
  }

  // 4. Detekcja IntersectionObserver
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

  // 6. Stoper
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
      clock.style.opacity = '0.7';
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
    clock.style.opacity = '0.7';
  }

  if (clock) clock.addEventListener('click', toggleTimer);

  // 7. Notatki
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

  // 9. Motyw
  let colorNode1 = '#235F50';
  let colorNode2 = '#3E7F6D';
  let colorNodeDefault = '#756E66';

  function updateThemeColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      colorNode1 = '#7FBCA8';
      colorNode2 = '#5FA08C';
      colorNodeDefault = '#A8A196';
    } else {
      colorNode1 = '#235F50';
      colorNode2 = '#3E7F6D';
      colorNodeDefault = '#756E66';
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

  updateState(0);
  initB2BWidgets();

  // 10. Canvas sieci połączeń
  const cv = document.getElementById('org');
  if (cv) {
    const cx = cv.getContext('2d');
    let W = 0, H = 0;
    const narrow = window.matchMedia('(max-width: 900px)').matches;
    const N = narrow ? 35 : 70;
    const nodes = [];
    const rnd = (a, b) => a + Math.random() * (b - a);

    function resize() {
      W = cv.width = window.innerWidth;
      H = cv.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < N; i++) {
      nodes.push({
        x: rnd(0, W || 1400),
        y: rnd(0, H || 900),
        tx: 0,
        ty: 0,
        r: rnd(1.6, 2.6),
        g: 0,
        pulse: Math.random() * 6.28
      });
    }

    let sideConstraint = 'full';

    window.setCanvasForm = function (form, side) {
      sideConstraint = side || 'full';
      const nowW = W || window.innerWidth;
      const nowH = H || window.innerHeight;
      let minX = 0, maxX = nowW;
      if (sideConstraint === 'right') minX = nowW * 0.48;
      if (sideConstraint === 'left') maxX = nowW * 0.52;

      nodes.forEach((n, i) => {
        n.g = i % 3;
        n.tx = rnd(minX, maxX);
        n.ty = rnd(60, nowH - 40);
      });
    };

    let lastT = performance.now();
    function render(t) {
      const dt = Math.min((t - lastT) / 1000, 0.1);
      lastT = t;
      cx.clearRect(0, 0, W, H);

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const lineStroke = isDark ? 'rgba(127, 188, 168, 0.14)' : 'rgba(35, 95, 80, 0.12)';

      for (let i = 0; i < N; i++) {
        const n = nodes[i];
        n.x += (n.tx - n.x) * (2.0 * dt);
        n.y += (n.ty - n.y) * (2.0 * dt);
      }

      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 140 * 140) {
            cx.beginPath();
            cx.moveTo(nodes[i].x, nodes[i].y);
            cx.lineTo(nodes[j].x, nodes[j].y);
            cx.strokeStyle = lineStroke;
            cx.lineWidth = 1;
            cx.stroke();
          }
        }
      }

      const now = t * 0.0018;
      for (let i = 0; i < N; i++) {
        const n = nodes[i];
        const p = Math.sin(now + n.pulse);
        const rad = Math.max(1, n.r + p * 0.4);

        cx.beginPath();
        cx.arc(n.x, n.y, rad, 0, 6.28);
        cx.fillStyle = n.g === 1 ? colorNode1 : (n.g === 2 ? colorNode2 : colorNodeDefault);
        cx.fill();
      }

      requestAnimationFrame(render);
    }

    window.setCanvasForm('network', 'full');
    render(performance.now());
  }

  // 11. Widżety komercyjne B2B
  function initB2BWidgets() {
    // A. Narzędzia operacyjne (Slajd 05)
    const modItems = document.querySelectorAll('.module-nav-item');
    const modTitle = document.getElementById('mod-preview-title');
    const modDesc = document.getElementById('mod-preview-desc');
    const modUi = document.getElementById('mod-preview-ui');

    const modulesData = {
      'bed-mapper': {
        title: '01 · Smart Bed Mapper (Import w 60 sekund)',
        desc: 'Błyskawiczny import struktury pokoi z pliku Excel/CSV oraz wizualne przypisywanie podopiecznych metodą drag-and-drop.',
        ui: `<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; margin-top:0.8rem;">
              <div style="background:var(--s-soft); border:2px solid var(--s-accent); padding:1rem; border-radius:12px; text-align:center;">
                <b style="color:var(--s-accent); font-size:17px;">Sektor A · Pokój 101</b><div style="font-size:15px; color:var(--s-sec); margin-top:4px;">2/2 zajęte (Jan K., Anna W.)</div>
              </div>
              <div style="background:var(--s-soft); border:2px solid var(--s-accent); padding:1rem; border-radius:12px; text-align:center;">
                <b style="color:var(--s-accent); font-size:17px;">Sektor A · Pokój 102</b><div style="font-size:15px; color:var(--s-sec); margin-top:4px;">2/2 zajęte (Stanisław M., Piotr B.)</div>
              </div>
              <div style="background:var(--s-surface); border:2px dashed var(--s-border); padding:1rem; border-radius:12px; text-align:center;">
                <b style="color:var(--s-text); font-size:17px;">Sektor B · Pokój 103</b><div style="font-size:15px; color:var(--s-accent); margin-top:4px;">● 1 wolne łóżko (przeciągnij tutaj)</div>
              </div>
            </div>
            <div style="margin-top:1rem; font-size:15px; color:var(--s-sec);">
              Status: <strong style="color:var(--s-accent);">Import z Excela zakończony sukcesem (48 łóżek zaindeksowanych)</strong>
            </div>`
      },
      'admission': {
        title: '02 · Admission Wizard (Przyjęcie w 3 minuty)',
        desc: '3-krokowy kreator: profil nawyków seniora, zaproszenia SMS dla rodziny oraz cyfrowe oświadczenia RODO art. 9.',
        ui: `<div style="display:flex; gap:8px; margin-top:0.8rem;">
              <div style="flex:1; background:var(--s-soft); border:2px solid var(--s-accent); padding:0.8rem; border-radius:8px; text-align:center; font-weight:600; color:var(--s-accent); font-size:15px;">1. Dane & Rytuały dnia</div>
              <div style="flex:1; background:var(--s-soft); border:2px solid var(--s-accent); padding:0.8rem; border-radius:8px; text-align:center; font-weight:600; color:var(--s-accent); font-size:15px;">2. Kontakty rodziny (SMS)</div>
              <div style="flex:1; background:var(--s-soft); border:2px solid var(--s-accent); padding:0.8rem; border-radius:8px; text-align:center; font-weight:600; color:var(--s-accent); font-size:15px;">3. E-zgoda RODO art. 9</div>
            </div>
            <div style="margin-top:1rem; font-size:15px; color:var(--s-sec);">
              System automatycznie generuje i wysyła zaproszenie do aplikacji dla córki i syna w 3 sekundy po zatwierdzeniu.
            </div>`
      },
      'handover': {
        title: '03 · Shift Handover Digest (Przekazanie dyżuru)',
        desc: 'Pigułka najważniejszych zdarzeń generowana przez AI na zmianę nocną i dzienną w 30 sekund.',
        ui: `<div style="background:var(--s-surface); border:2px solid var(--s-border); padding:1rem; border-radius:8px; margin-top:0.8rem; font-size:15px; line-height:1.5;">
              <b style="color:var(--s-accent);">Raport zmiany dziennej dla dyżuru nocnego (Sektor A):</b><br>
              • Pan Stanisław: bardzo dobry nastrój, pełna aktywność w ogrodzie.<br>
              • Pani Helena: zgłaszała potrzebę cieplejszego koca na noc.<br>
              • Pan Jan: wypił 1,8 l płynów, spokojny wieczór.
            </div>`
      },
      'export': {
        title: '04 · 1-klikowy Eksport Kontrolny (Sanepid / UW / NFZ)',
        desc: 'Natychmiastowe generowanie audytowalnych raportów PDF/Excel z rejestru obecności i czynności opiekuńczych.',
        ui: `<div style="display:flex; justify-content:space-between; align-items:center; background:var(--s-soft); border:2px solid var(--s-accent); padding:1rem; border-radius:8px; margin-top:0.8rem;">
              <span style="font-weight:600; color:var(--s-text); font-size:16px;">📄 Raport czynności opiekuńczych (Miesiąc bieżący)</span>
              <button type="button" style="background:var(--s-accent); color:var(--s-onacc); border:none; padding:8px 16px; border-radius:20px; font-weight:600; font-size:14px;">Pobierz PDF dla Kontroli</button>
            </div>`
      }
    };

    if (modItems.length > 0 && modTitle && modDesc && modUi) {
      modItems.forEach((item) => {
        item.addEventListener('click', () => {
          modItems.forEach((m) => m.classList.remove('active'));
          item.classList.add('active');
          const key = item.getAttribute('data-mod');
          const d = modulesData[key];
          if (d) {
            modTitle.textContent = d.title;
            modDesc.textContent = d.desc;
            modUi.innerHTML = d.ui;
          }
        });
      });
    }

    // B. Kalkulator ROI (Slajd 08)
    const sliderRoi = document.getElementById('slider-roi-beds');
    const displayRoiBeds = document.getElementById('roi-beds-display');
    const outRoiHours = document.getElementById('roi-hours-saved');
    const outRoiCalls = document.getElementById('roi-calls-saved');
    const outRoiFte = document.getElementById('roi-fte-saved');
    const outRoiPrice = document.getElementById('roi-price-est');

    if (sliderRoi && displayRoiBeds && outRoiHours && outRoiCalls && outRoiFte && outRoiPrice) {
      function updateRoi() {
        const beds = parseInt(sliderRoi.value, 10);
        displayRoiBeds.textContent = `${beds} łóżek`;
        const hours = Math.round(beds * 1.6);
        const calls = Math.round(beds * 12);
        const fte = (hours / 160).toFixed(1);
        let price = 2500;
        if (beds > 30 && beds <= 60) price = 3500;
        if (beds > 60) price = 4500;

        outRoiHours.textContent = `~${hours} godz.`;
        outRoiCalls.textContent = `~${calls}`;
        outRoiFte.textContent = `~${fte} etatu`;
        outRoiPrice.textContent = `${price} zł`;
      }
      sliderRoi.addEventListener('input', updateRoi);
      updateRoi();
    }

    // C. Symulator Samofinansowania B2B2C (Slajd 07)
    const sliderB2b2c = document.getElementById('slider-b2b2c');
    const displayB2b2c = document.getElementById('b2b2c-count-display');
    const outB2b2cRevenue = document.getElementById('b2b2c-revenue');
    const outB2b2cCoverage = document.getElementById('b2b2c-coverage');

    if (sliderB2b2c && displayB2b2c && outB2b2cRevenue && outB2b2cCoverage) {
      function updateB2b2c() {
        const count = parseInt(sliderB2b2c.value, 10);
        displayB2b2c.textContent = `${count} rodzin`;
        const revenue = count * 75;
        const baseFee = 3500;
        const coverage = Math.min(100, Math.round((revenue / baseFee) * 100));

        outB2b2cRevenue.textContent = `+${revenue} zł / mies.`;
        outB2b2cCoverage.textContent = `${coverage}% abonamentu`;
      }
      sliderB2b2c.addEventListener('input', updateB2b2c);
      updateB2b2c();
    }

    // D. Formularz kontaktowy B2B (Slajd 12)
    const btnOrder = document.getElementById('btn-b2b-submit');
    const inFac = document.getElementById('b2b-fac-name');
    const inBeds = document.getElementById('b2b-fac-beds');
    const inCity = document.getElementById('b2b-fac-city');

    if (btnOrder && inFac) {
      btnOrder.addEventListener('click', (e) => {
        e.preventDefault();
        const fac = inFac.value.trim() || 'Dom Opieki';
        const beds = inBeds ? inBeds.value.trim() || '50 łóżek' : '50 łóżek';
        const city = inCity ? inCity.value.trim() || 'Polska' : 'Polska';

        const subject = encodeURIComponent(`Zapytanie o wdrożenie Silver Care: ${fac}`);
        const body = encodeURIComponent(
          `Dzień dobry,\n\nChcielibyśmy umówić bezpłatną prezentację i skalkulować wdrożenie Silver Care dla naszej placówki:\n\n` +
          `• Nazwa placówki: ${fac}\n` +
          `• Liczba łóżek: ${beds}\n` +
          `• Miejscowość: ${city}\n\n` +
          `Prosimy o kontakt w celu przedstawienia szczegółów wdrożenia concierge.\n\n` +
          `Pozdrawiamy`
        );
        window.location.href = `mailto:kontakt@silvercare.pl?subject=${subject}&body=${body}`;
      });
    }
  }
})();
