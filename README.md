# Presentations · Hub & Decks

Centralny projekt gromadzący interaktywne prezentacje internetowe, pitch decki i oferty pilotażowe stworzone w technicznym stylu [blueprint](https://blueprint.startcreating.ai/).

Zbudowany w oparciu o czysty HTML, CSS i JS (bez zbędnych zależności node_modules) i wdrożony na platformie **Netlify**.

---

## 📂 Dostępne Prezentacje

1. **[Silver Care · Blueprint Deck](./silver-care/)**
   - **Adresaci**: Dyrektorzy i właściciele prywatnych domów seniora.
   - **Cel**: Pozyskanie placówek do bezpłatnego Programu Pilotażowego.
   - **Objętość**: 14 interaktywnych slajdów, stoper prelegenta, notatki prelegenta (`N`), zgodność MDR/Non-MDR.
   - **Ścieżka**: `/silver-care/`

---

## 🚀 Jak dodać nową prezentację?

1. Utwórz nowy folder w głównym katalogu, np. `smart-senior-pitch/`.
2. Skopiuj do niego pliki szablonu z `silver-care/` (`index.html`, `deck.css`, `deck.js`).
3. Zmodyfikuj treść slajdów.
4. Dodaj kafelek w głównym `index.html` (Hub).
5. Zrób `git commit` i `git push` – Netlify automatycznie zaktualizuje stronę!

---

## ⌨️ Skróty klawiszowe w prezentacjach
- `↓` / `→` / `Spacja` / `PageDown` – Następny slajd
- `↑` / `←` / `PageUp` – Poprzedni slajd
- `Home` / `End` – Pierwszy / Ostatni slajd
- `N` – Notatki prelegenta (Speaker Notes)
- `T` – Start / Pauza stopera
- `R` – Reset stopera do `00:00`
- `F` – Pełny ekran (Fullscreen)
- `Esc` – Zamknięcie notatek

---

## 🌐 Wdrożenie na Netlify

Projekt jest połączony z Netlify:
- **Deploy z terminala**: `npx netlify deploy --prod`
- **Automatyczny deploy**: Po wypchnięciu zmian do gałęzi `main` na GitHub (`darkov89/presentations`).
