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

Negru cu auriu, în spiritul logo-ului și al frizeriilor old school:

- `style.css`: layout-ul, culorile de bază în `:root` și tipografia comună.
- `theme.css`: stratul negru cu auriu. Butoane și titluri cu auriu metalic, banda aurie care rulează, oglinda arcuită din hero, rame aurii duble, tonul sepia al fotografiilor și granulația fină a paginii.
- `ornaments.css` și `assets/old-school-pattern.svg`: modelul cu romburi și stele aurii din fundal, colțurile și liniile ornamentale.
- `hero.css`: încadrarea primului ecran pe toate dimensiunile.
- `assets/fonts.css`: Cinzel pentru titluri, Playfair Display Italic pentru accente și DM Sans pentru text. Cinzel și Playfair au `size-adjust`, ca să încapă în aceleași cutii ca fonturile condensate pentru care a fost gândit layout-ul.

## Ecranul de deschidere

La încărcare, logo-ul apare în centru, între doi stâlpi de frizerie roșu, alb și albastru. Dungile stâlpilor se umplu de jos în sus cât timp se încarcă pagina și ajung sus abia după ce s-a încărcat. Apoi bilele aurii se aprind. Dungile se rotesc continuu și accelerează când treci cu mouse-ul peste un stâlp. Logo-ul se înclină după cursor și o lumină aurie îl urmărește. Click sau atingere pe logo îl face să pulseze și rotește stâlpii mai repede.

Ecranul dispare după cel puțin 3,8 secunde, odată ce stâlpii sunt plini, sau imediat la click în afara logo-ului, tastă, scroll sau glisare. Nu rămâne mai mult de 8,5 secunde. O animație CSS îl ascunde după 9 secunde dacă JavaScript nu rulează. Cu mișcare redusă, logo-ul și stâlpii apar plini, fără animații.

`assets/alexsima-logo.webp` este logo-ul clientului cu fundalul negru făcut transparent, ca să stea direct pe fundalul paginii. `assets/alexsima-logo.jpg` rămâne pentru imaginea de share.

## Programări prin MERO

MERO nu are API public și nici widget de inclus în alte site-uri, dar are link-uri directe spre pasul de programare. Secțiunea **Programări** afișează cele șase servicii de pe profilul [mero.ro/p/alex-sima](https://mero.ro/p/alex-sima), cu durată și preț. Serviciul ales deschide MERO într-o filă nouă, direct la pasul 2 din 3, cu Alexandru Sima și serviciul deja selectate. Acolo vizitatorul alege ziua și ora din locurile libere reale, iar programarea se confirmă pe telefon.

ID-urile serviciilor sunt în atributele `data-mero` din `index.html`, iar ID-ul specialistului în `booking-core.js`. Dacă un serviciu se schimbă pe MERO, actualizează ID-ul, durata și prețul în `index.html` și în secțiunea Servicii.

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
