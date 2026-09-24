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
  if (btnFs) btnFs.addEventListener('click', toggleFullscreen);

  // Inicjalizacja pierwszego slajdu
  updateState(0);

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
      cx.strokeStyle = `rgba(127, 188, 168, ${alpha * 0.4})`;
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

      const p = Math.sin(now + n.pulse);
      const rad = Math.max(1, n.r + p * 0.6);

      cx.beginPath();
      cx.arc(n.x, n.y, rad, 0, 6.28);
      // Kolor węzła zależny od grupy
      if (n.g === 1) {
        cx.fillStyle = '#E2C285'; // Personel (złoty)
      } else if (n.g === 2) {
        cx.fillStyle = '#7FBCA8'; // Rodziny (szałwia)
      } else {
        cx.fillStyle = '#A7E8D4'; // Neutralne
      }
      cx.fill();
    }

    requestAnimationFrame(render);
  }

  // Uruchomienie pierwszej formacji
  window.setCanvasForm('network', 'full');
  render();
})();
