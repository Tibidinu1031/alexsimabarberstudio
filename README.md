# Alex Sima Barber Studio

Site static pentru Alex Sima Barber Studio, Strada Neptun 30, Brașov. HTML, CSS și JavaScript, fără framework, pachete sau instalare. `index.html` se află în rădăcină.

Repository: [Tibidinu1031/alexsimabarberstudio](https://github.com/Tibidinu1031/alexsimabarberstudio).

Adresa GitHub Pages: [tibidinu1031.github.io/alexsimabarberstudio](https://tibidinu1031.github.io/alexsimabarberstudio/).

## Publicare pe GitHub Pages

1. Încarcă fișierele din acest folder în repository. Păstrează `index.html`, fișierele `.css` și `.js`, `.nojekyll` și folderul `assets` direct în rădăcina repository-ului.
2. În repository, deschide **Settings → Pages**.
3. La **Build and deployment**, selectează **Deploy from a branch**.
4. Selectează branch-ul **main**, folderul **/(root)** și apasă **Save**.
5. Deschide adresa afișată de GitHub după publicare.

Toate căile către resurse sunt relative. Metadatele `og:url`, `og:image`, adresa canonică și URL-urile JSON-LD sunt configurate pentru adresa GitHub Pages de mai sus. Dacă folosești un domeniu propriu, actualizează aceste adrese în `index.html`.

Folderele locale ale asistenților AI (`.claude`, `.codex`, `.chatgpt`, `.openai` și altele) sunt în `.gitignore` și nu ajung în repository.

## Previzualizare locală

Poți deschide `index.html` direct în browser. Pentru o previzualizare HTTP, rulează din acest folder:

```sh
python -m http.server 4173
```

Deschide `http://localhost:4173`.

## Stil

Barbershop clasic, negru cu auriu, în spiritul logo-ului. Tot stilul paginii e în `site.css`:

- Header cu emblema în centru și meniul împărțit stânga-dreapta. Pe telefon, emblema cu numele și un meniu.
- Hero pe toată lățimea, cu fotografia din studio, ramă aurie dublă și o bară cu evaluarea, adresa și statusul „Deschis acum”.
- Fundal: fotografia de frizerie old-school din `assets/barbershop-background.webp`, fixată pe fereastră și întunecată ca să se citească textul. Pe ecranele în portret se vede jumătatea stângă a pozei, cu tot scaunul din stânga.
- Conținutul se întinde pe toată lățimea paginii, cu o margine mică. Pe ecrane late, lista de prețuri și galeria primesc mai multe coloane.
- Servicii afișate ca o listă de prețuri de frizerie, cu linie punctată între serviciu și preț.
- Galerie mozaic cu filtre. Fotografia apăsată se deschide mare, cu miniaturi pentru răsfoit, săgeți, tastatură și glisare pe telefon.
- `assets/fonts.css`: Cinzel pentru titluri, Playfair Display Italic pentru accente și DM Sans pentru text.

## Ecranul de deschidere

La încărcare, pe un fundal complet negru, logo-ul apare în centru, iar sub el o bară de încărcare cu dungi albe, roșii și albastre. Dungile curg continuu, iar bara se umple de la stânga la dreapta cât timp se încarcă pagina și ajunge la capăt abia după ce s-a încărcat. Logo-ul se înclină după cursor. Click sau atingere pe logo îl face să pulseze.

Ecranul dispare după cel puțin 3,8 secunde, odată ce bara e plină, sau imediat la click în afara logo-ului, tastă, scroll sau glisare. Nu rămâne mai mult de 8,5 secunde. O animație CSS îl ascunde după 9 secunde dacă JavaScript nu rulează. Cu mișcare redusă, logo-ul și bara apar pline, fără animații.

`assets/alexsima-logo.webp` este logo-ul clientului cu fundalul negru făcut transparent, ca să stea direct pe fundalul paginii. `assets/alexsima-logo.jpg` rămâne pentru imaginea de share.

## Programări prin MERO

Calendarul MERO al studioului e inclus direct în pagină, în secțiunea **Programare**, într-un iframe cu profilul [mero.ro/p/alex-sima](https://mero.ro/p/alex-sima). Vizitatorul alege serviciul, ziua și ora fără să părăsească site-ul. Butoanele **Programează** din lista de prețuri și meniul **Serviciu** de lângă calendar încarcă direct pasul 2 din 3, cu Alexandru Sima și serviciul respectiv deja selectate.

Deasupra calendarului, **Deschide în MERO** deschide același pas într-o filă nouă. E util în browserele care blochează cookie-urile din iframe, de exemplu Safari pe iPhone, unde autentificarea MERO poate să nu se finalizeze în pagină.

ID-urile serviciilor sunt în atributele `data-mero` și în opțiunile meniului **Serviciu** din `index.html`, iar ID-ul specialistului în `booking-core.js`. Dacă un serviciu se schimbă pe MERO, actualizează ID-ul, durata și prețul în `index.html`.

Statusul „Deschis acum” din hero și din programări se calculează după ora României și după programul de pe MERO: luni - vineri 10:00 - 19:00, sâmbătă 10:30 - 17:30, duminică închis.

## Fotografii și informații

Fotografiile sunt lucrările clientului din galeria publică de pe MERO, aceleași ca pe Instagram, dar la rezoluție completă. Pe Instagram, cadrele din reel-uri au doar 361 × 640 pixeli. Fotografiile au fost decupate cu subiectul în centru și salvate fără datele EXIF și GPS din originale. Vezi `ASSETS.md`.

Adresa și telefonul provin din profilul Google Business și din pagina de Facebook. Serviciile, prețurile și programul provin de pe MERO. Programul de pe Google diferă: luni - vineri 10:00 - 18:00, sâmbătă 10:00 - 16:00. Site-ul folosește programul de pe MERO, unde se fac programările.

## Verificări

```sh
node scripts/verify.mjs
node --test scripts/booking.test.cjs
```

`scripts/prepare-site.mjs` pregătește opțional un pachet în `dist`. GitHub Pages servește direct fișierele din rădăcină și nu are nevoie de el.
