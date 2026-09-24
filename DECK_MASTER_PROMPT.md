# 🪄 The Deck & Theme Architect · Master Prompt System

Ten dokument zawiera gotowy, generyczny prompt do generowania kompletnych prezentacji internetowych (oraz ich proceduralnego tła, kolorystyki i animacji canvas) w zależności od kontekstu projektu.

Możesz użyć tego promptu bezpośrednio w rozmowie ze mną, wklejając go i uzupełniając zmienne `[KONTEKST]`, `[ODBIORCY]`, `[CEL]`, `[BRANŻA]`.

---

## 📋 Generyczny Master Prompt do skopiowania

```markdown
Jesteś elitarnym Architektem Prezentacji (Deck Architect) i Senior Frontend Creative Developerem.
Twoim zadaniem jest stworzyć kompletną, interaktywną prezentację internetową w stylu Blueprint Deck (opartą na HTML5, CSS3 i Canvas 2D) dopasowaną ściśle do poniższego kontekstu:

### DANE WEJŚCIOWE PROJEKTU:
- **Temat / Produkt**: [WPISZ TUTAJ, np. Silver Care / AI FinTech / Cybersecurity SaaS / Aplikacja Dietetyczna]
- **Branża**: [np. Opieka Senioralna & MedTech / Bankowość / B2B Developer Tools / E-commerce]
- **Grupa Docelowa**: [np. Dyrektorzy domów opieki / Inwestorzy VC / Klienci Enterprise / Użytkownicy B2C]
- **Główny Cel Prezentacji**: [np. Pozyskanie 10 placówek do programu pilotażowego / Zamknięcie rundy Seed / Prezentacja nowej architektury]
- **Pożądany Vibe / Ton**: [np. Techniczny spokój i bezpieczeństwo / Agresywny startup technologiczny / Elegancki minimalizm / Cyberpunkowa precyzja]

---

### WYMAGANIA ARCHITEKTURY DECKU:

1. **WARSTWA TŁA PROCEDURALNEGO I DESIGN TOKENS (CSS + Canvas)**:
   - **Paleta barw**: Dobierz 5-6 semantycznych kolorów pasujących do branży (np. MedTech: szałwia/mięta/antracyt; Cyber: czerń/neon zielony/grafit; FinTech: głęboki granat/złoto/szmaragd; AI: indygo/fiolet/cyjan).
   - **CSS Variables**: Zdefiniuj tokeny: `--bg`, `--surface`, `--primary`, `--accent`, `--accent-gold`, `--line-rgb`, `--bg-glow`.
   - **Tło CSS (.bgfx)**: Wygeneruj proceduralną siatkę w CSS (blueprint grid, isometric mesh, radar crosshairs lub ambient gradient glow) dopasowaną do klimatu.
   - **Canvas Topology (deck.js)**: Skonfiguruj węzły, łączące linie i formacje cząsteczkowe na canvasie (`data-form`), które symbolizują istotę problemu w tej branży (np. rozproszone węzły, scalająca się sieć, mosty danych, orbity wokół rdzenia, koncentryczne radary).

2. **SILNIK NAWIGACJI I INTERAKCJI**:
   - Płynny scroll-snap horyzontalny/wertykalny per slajd.
   - Pasek HUD z logo projektu, licznikiem slajdów (`01 / 14`), interaktywnym stoperem prelegenta (`T`), przyciskiem pełnego ekranu (`F`) i przełącznikiem motywów (`M`).
   - Wbudowane **Notatki Prelegenta (Speaker Notes)** pod klawiszem `N` (wysuwana szuflada z dokładną transkrypcją i wskazówkami na każdy slajd).
   - Pasek postępu na samej górze strony.
   - Kropki nawigacyjne po prawej stronie.

3. **STRUKTURA TREŚCI SLAJDÓW (10-14 slajdów)**:
   - **01. Okładka**: Mocny headline, sygnet marki, eyebrow oferty/prezentacji (`data-form="network"`).
   - **02. Kontekst / Rynek**: Twarde liczby, makrotrendy, presja rynkowa (`data-form="matrix"`).
   - **03. Główny Problem**: Rozłam/napięcie – kontrast między obecnym stanem a oczekiwaniami (`data-form="split"`).
   - **04. Wizja / Teza**: Jedno zdanie definiujące nową kategorię (`data-form="focus"`).
   - **05. Rozwiązanie / Produkt**: Architektura systemu w układzie bento box (`data-form="bridge"`).
   - **06. Kluczowe Filary / Moduły**: 3-4 klocki wartości z ikonografią i metrykami (`data-form="quad"`).
   - **07. Deep Dive / Warstwa Techniczna**: Kod/Terminal z live logami, protokoły bezpieczeństwa, compliance (`data-form="terminal"`).
   - **08. Doświadczenie Użytkownika / Workflow**: Krok po kroku: od startu do efektu (`data-form="flow"`).
   - **09. Trakcja / Dowód / Case Study**: Liczby, cytaty, wyniki z pilotażu (`data-form="metrics"`).
   - **10. Model Biznesowy / Ekonomia**: Unit economics, ROI dla klienta, oszczędność czasu/kosztów (`data-form="bars"`).
   - **11. Przewaga Konkurencyjna**: Tabela porównawcza (My vs Alternatywy/Status Quo) (`data-form="matrix"`).
   - **12. Oferta / Program Pilotażowy**: Konkretne zasady uczestnictwa, gwarancje, brak ryzyka (`data-form="rings"`).
   - **13. Harmonogram Wdrożenia**: Oś czasu: Tydzień 1, Tydzień 2-4, Skalowanie (`data-form="orbit"`).
   - **14. Podsumowanie & CTA**: Dane kontaktowe, przycisk rejestracji/rozmowy, QR kod (`data-form="network"`).

4. **FORMAT WYJŚCIOWY**:
   - Wygeneruj kompletny kod w trzech plikach: `index.html`, `deck.css`, `deck.js` (lub wskaż aktualizacje istniejących szablonów).
```

---

## 🎨 Matryca Motywów i Topologii (Kontekst $\rightarrow$ Styl)

| Branża / Kontekst | Dominujące kolory | Styl siatki CSS (`.bgfx`) | Formacje Canvasu (`data-form`) | Fonty (Display / Body) |
| :--- | :--- | :--- | :--- | :--- |
| **Healthcare / Senior Care** (np. Silver Care) | Szałwia (`#2F6F5E`), Mięta (`#7FBCA8`), Ciepły Krem (`#FBFAF8`), Antracyt (`#091512`) | Techniczna siatka 48px, miękka poświata szałwiowa | `network`, `split` (rodzina vs personel), `bridge`, `rings` | `Space Grotesk` + `Inter` |
| **Clinical MedTech / Szpitalny** | Sterylny Kobalt (`#1E5086`), Cyjan (`#4EA8DE`), Złoty alert (`#FFB703`), Głęboka czerń (`#071018`) | Cienkie linie laboratoryjne 32px, monitor pulsu | `pulse`, `scan`, `nodes`, `matrix` | `Space Grotesk` + `JetBrains Mono` |
| **CyberSecurity & Cloud Ops** | Terminal Green (`#00FF66`), Ciemny Grafit (`#0A0F0D`), Neon Amber (`#FFB000`) | Skaner radarowy, linie heksagonalne, CRT vignette | `radar`, `shield`, `packets`, `firewall` | `JetBrains Mono` + `Inter` |
| **FinTech & Web3 / Crypto** | Głęboki Granat (`#0A0E1A`), Szmaragd (`#10B981`), Złoto Inwestorskie (`#F59E0B`) | Siatka notowań, wykresy świecowe w tle | `constellation`, `candlestick`, `blocks`, `mesh` | `Plus Jakarta Sans` + `Space Grotesk` |
| **AI / LLM / Deep Tech** | Głęboki Fiolet (`#0B0813`), Elektryczny Cyjan (`#38BDF8`), Magenta Glow (`#C084FC`) | Siatka wektorowa, poświata synaptyczna | `synapse`, `latent-space`, `neural`, `clusters` | `Sora` + `Inter` |
| **B2B SaaS Enterprise** | Dark Slate (`#0F172A`), Indygo (`#6366F1`), Błękit (`#38BDF8`) | Minimalistyczna kropkowana siatka 24px | `flow`, `quad`, `metrics`, `orbit` | `Inter` + `Space Grotesk` |

---

## 🚀 Jak jednym poleceniem stworzyć nową prezentację z innym tłem?

Wystarczy, że napiszesz mi np.:
> *"Stwórz dla mnie nową prezentację w katalogu `/smart-senior/` na temat platformy dla opiekunów seniorów w stylu Deep Tech AI. Chcę fioletowo-cyjanowy motyw i formacje synaptyczne na canvasie."*

Silnik automatycznie dobierze kolory, wygeneruje `index.html`, `deck.css`, `deck.js`, doda kafelek do głównego Hubu i wdroży całość na Twoje Netlify!
