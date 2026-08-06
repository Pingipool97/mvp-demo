# MVP PROGETTI · contesto per proseguire in una nuova sessione

Questo file sta nel repo. In una sessione nuova basta dire:
"leggi CONTESTO.md e proseguiamo da lì".

Aggiornato il 6 agosto 2026.

---

## 1. Che lavoro è

Michele (utente GitHub **Pingipool97**) fa demo commerciali per attività locali.
Il giro è sempre lo stesso:

1. Si analizza il sito attuale del cliente: font e colori presi dal DOM, non a occhio,
   logo, testi, e i bug reali da mostrare in presentazione.
2. Si costruisce una demo completa e funzionante con quella identità visiva.
3. Si pubblica sul link unico e si mostra al cliente.

Le demo sono **file HTML singoli e autonomi**: immagini e caratteri incorporati in
base64, nessuna dipendenza esterna, si aprono anche senza rete. Unica eccezione
consapevole: il meteo dal vivo nella bacheca, che ha bisogno della rete e in sua
assenza scrive che non è disponibile.

---

## 2. Come si lavora adesso

**Si lavora solo su questo repo.** Niente più build in locale, niente `pubblica.ps1`.
Il repo è l'unica fonte di verità: quello che c'è qui è quello che è online.

- Repo: `github.com/Pingipool97/mvp-demo`, branch **main**
- Hosting: Vercel, si aggiorna da solo a ogni push, circa 40 secondi
- Link pubblico: **https://mvp-demo-dun.vercel.app/**
- I file hanno `noindex` e `robots.txt` blocca tutto: non finiscono su Google

**Attenzione.** Sul PC di Michele esiste ancora `pubblica.ps1`, che svuota la cartella
`mvp-demo` e ricopia solo i progetti elencati nel suo registro. Se venisse rilanciato,
cancellerebbe `bagnitortuga/`, `_sorgenti/` e tutti gli innesti. **Non va più usato**,
a meno di aggiornarlo prima con le esclusioni.

---

## 3. Struttura del repo

```
mvp-demo/
├── index.html                 portale con l'elenco dei progetti
├── bagnitortuga/              sito.html  dashboard.html
├── tortuga/                   sito.html  dashboard.html      (Tortuga Beach)
├── lido53/                    sito.html  dashboard.html
├── ghepost/                   sito.html  gestionale.html  app.html
├── _sorgenti/
│   ├── bagnitortuga/          sorgenti veri del progetto
│   │   ├── build.js           unisce le parti e incorpora gli asset
│   │   ├── src/               s1-head s2-body s3-script  (sito)
│   │   │                      d1-head d2-body d3-script  (gestionale)
│   │   ├── assets/            foto del cliente, logo, versioni webp
│   │   └── fonts/             woff2 incorporati
│   └── bacheca/
│       └── innesta-bacheca.js innesta la bacheca nei progetti senza sorgenti
└── vercel.json  _headers  robots.txt  .nojekyll
```

**Solo Bagni Tortuga ha i sorgenti nel repo.** Tortuga Beach, Lido 53 e Ghe Post
esistono qui solo come file costruiti: i loro sorgenti sono rimasti sul PC.
Per modificarli si interviene sul file costruito, oppure si caricano i sorgenti
nel repo (consigliato, se ci si deve lavorare seriamente).

### Costruire Bagni Tortuga

```bash
cd _sorgenti/bagnitortuga
node build.js sito     # scrive out/sito.html
node build.js dash     # scrive out/dashboard.html
```

Il build sostituisce i segnaposto `{{ASSET:nome}}` con i data URI in base64 e
si ferma con errore se un asset manca o se trova `$(...)` seguito da `.forEach`,
che è un errore già costato due volte (`$` restituisce un elemento solo, serve `$$`).

---

## 4. I progetti

### Bagni Tortuga · Passeggiata Quaglia, via Aurelia 45, Andora (SV)

Stabilimento balneare. Telefono +39 375 5063425, bagnitortuga24@gmail.com.
Il loro sito attuale è su Wix, bagnitortuga.it.

- Colori presi dal logo fornito dal cliente: giallo `#EFB402`, blu `#014364`, panna `#FAF4E8`
- Caratteri presi dal loro sito: **Pinyon Script** (lo stesso corsivo della loro insegna),
  **Syne** per i titoli, **Questrial** per il testo. Il gestionale usa **Inter**.
- Layout nuovo: navigazione agganciata in basso come un'app, sezioni numerate.
  Il gestionale ha hamburger e pannello laterale.
- Mappa della spiaggia disegnata sulla ripresa dal drone: 84 postazioni su 6 file da 14,
  ogni ombrellone con i due lettini ai lati, passerella al centro, molo a sinistra,
  scogliera a destra, 24 cabine colorate in fondo. Tre livelli di ingrandimento.
- **Avviso bambini**: le postazioni con bambini sotto i 10 anni sono cerchiate, e
  scegliendo un posto accanto compare l'avviso, con il tasto per trovarne uno più riparato.
- Assistente in chat che risponde e **agisce**: seleziona il posto sulla mappa, apre il listino.
- Pulsante WhatsApp verso wa.me con messaggio precompilato.
- Gestionale: assistente con i suggerimenti del giorno, mappa operativa, prenotazioni,
  lista d'attesa, conversazioni WhatsApp con presa in carico e restituzione all'assistente,
  bacheca, clienti, cabine, listino modificabile, cassa e documenti dimostrativi.
- **Disposizione della spiaggia**: dal gestionale si montano e si smontano le postazioni,
  una per volta o per file intere. A giugno la spiaggia è più corta di agosto.
  Il sito pubblico si adegua da solo.

### Tortuga Beach · Marina di Andora (SV)

Nome simile ma **cliente diverso** dai Bagni Tortuga, e concorrente. Non confonderli:
la webcam che si trova cercando "Andora" inquadra il Tortuga Beach, quindi non va
messa sul sito dei Bagni Tortuga.

Oro `#EDA60C`, blu `#06273A`. 80 ombrelloni su 5 file da 16, 30 cabine.
QR di check-in scritto a mano e verificato: non toccarlo senza riverificarlo.

### Lido 53 · Via Aurelia 53, Andora (SV)

Stesso motore del Tortuga Beach, identità diversa: Poppins, oro `#BF8F3D`,
quasi-nero `#1D1D1F`. Argomento di vendita: oggi mandano le prenotazioni a
spiagge.it e pagano commissioni.

### Ghe Post · Via Manfredo Fanti 2, Milano

Caffetteria e paninoteca. Roboto Slab e Roboto, verde `#19391B`, oro `#8A6A2F`.
160 prodotti veri estratti dai loro PDF. Personale: Saverio 1234, Carolina 2345,
Piero 3456, Lorenzo (titolare) 0000.

Quattro pezzi: `sito.html`, `gestionale.html`, `app.html` (terminale di sala) e
`tracciabilita.html`, terminale di banco per lotti e scadenze. Quest'ultimo è
arrivato da fuori con le sole funzioni: le funzioni sono rimaste intatte, il
vestito è stato rifatto con i caratteri e i colori di Ghe Post.

### Naïf Hair&Beauty · Via Umberto I 56, Varedo (MB)

Parrucchiere, barbershop ed estetica, dal 1979. Telefono 0362 580539.
Oggi prenotano con **Fresha** e hanno la scheda su **Treatwell**: il sito attuale
è su Wix e la pagina "Book Online" è solo un bottone che porta fuori.

- Dati veri dalla scheda Treatwell del 5 agosto 2026: 82 trattamenti con prezzo e
  durata, più i 3 prezzi del barbershop dal loro sito, in tutto 85 voci. Squadra di
  16 persone con ruolo, voto e numero di recensioni. Voto 4,9 su 4090 recensioni.
  Orari, storia del salone e 17 fotografie.
- Caratteri **Bodoni Moda** e **Archivo**, colori presi dalle foto del salone:
  inchiostro `#171310`, ottone `#A97C4A`, crema `#F6F2EB`.
- Sito a rivista: guida a punti sulla destra invece della barra in alto, reparti a
  fasce, listino a menù con indice, prenotazione in una scheda a tutto schermo.
- Gestionale a schede in alto con spalla fissa a destra, agenda giorno e settimana,
  incassi per reparto e per persona, magazzino, fatture, WhatsApp.
- Argomento di vendita, verificato sul listino pubblico di Fresha:
  **20% una tantum sul cliente nuovo** che arriva dal loro marketplace (minimo 6 USD),
  **14,95 USD al mese per ogni persona prenotabile**, 2,79% + 0,20 USD sui pagamenti
  online. Il canale diretto, Google, Instagram e Facebook non hanno commissione.

---

## 4bis. Progetti chiusi

Restano online e raggiungibili con il link diretto, ma **non compaiono nel portale**.
Per rimetterli in elenco basta riaggiungere il blocco `<section class="proj">` in
`index.html`.

### Jeremias Barbiere · Via Monte Sabotino 32, Paderno Dugnano (MI)

**Chiuso il 6 agosto 2026.** File: `jeremias/sito.html`, `jeremias/dashboard.html`,
sorgenti in `_sorgenti/jeremias/`.

Barbiere senza sito, presente solo su Treatwell. Verde `#93C01F`, petrolio `#0F7E9B`,
Oswald e Inter. Sei trattamenti con prezzi e durate dalla scheda Treatwell,
4,9 su 1530 recensioni, due barbieri (Jeremias e Luca Terragni, referente Luca).
Sito con calendario di disponibilità, gestionale con agenda a giorno e settimana,
incassi divisi per barbiere, previsione del mese, fatture fornitori, WhatsApp con
passaggio all'operatore.

---

## 5. La bacheca del giorno

C'è su tutti e tre i lidi. Sul sito sta **in home**, subito sotto l'apertura:
meteo e temperatura del mare dal vivo, menù del giorno (primo, secondo, contorno,
dolce, prezzo, bevande escluse), bandiera in battigia, avvisi ed eventi.
Nel gestionale c'è la voce **Bacheca** per scriverla.

- Bagni Tortuga: è nei sorgenti, si modifica lì e si ricostruisce.
- Tortuga Beach e Lido 53: innestata da fuori con `_sorgenti/bacheca/innesta-bacheca.js`,
  perché non hanno sorgenti nel repo.

```bash
node _sorgenti/bacheca/innesta-bacheca.js tortuga tortugabeach
node _sorgenti/bacheca/innesta-bacheca.js lido53  lido53
```

Lo script è ripetibile: riconosce l'innesto precedente fra i marcatori
`<!-- BACHECA:INIZIO -->` e `<!-- BACHECA:FINE -->` e lo sostituisce invece di
duplicarlo. Registra anche la nuova rotta nell'elenco `PAGES` del gestionale,
altrimenti il loro instradatore rimanda alla panoramica.

Il meteo arriva da **Open-Meteo**, senza chiave e senza registrazione:
`api.open-meteo.com` per aria e vento, `marine-api.open-meteo.com` per mare e onda.
Coordinate di Andora: 43.9497, 8.1417.

---

## 6. Memorie del browser

Sito e gestionale si parlano tramite `localStorage`, quindi **stesso dispositivo e
stesso browser**. Aprire il gestionale sul portatile e il sito sul telefono non funziona.

Le chiavi vanno tenute separate per progetto, perché i tre lidi stanno sullo stesso
dominio e senza prefisso si sovrascriverebbero:

| Chiave | A cosa serve |
|---|---|
| `tortuga_prenotazioni` | prenotazioni chiuse sul sito dei Bagni Tortuga |
| `tortuga_mappa` | quali postazioni sono montate |
| `tortuga_bacheca` | menù, bandiera e avvisi dei Bagni Tortuga |
| `tortugabeach_bacheca` | bacheca del Tortuga Beach |
| `lido53_bacheca` | bacheca del Lido 53 |
| `ghepost_dati` | app e gestionale di Ghe Post |
| `tortuga_menu` | preferenza barra laterale, condivisa fra i due lidi vecchi, innocua |

---

## 7. Regole di stile che Michele ha imposto

Sono richieste esplicite, non preferenze.

- **Niente emoji.** Mai, in nessun file. Icone SVG o niente.
- **Niente trattini lunghi** (— e –). Virgole, due punti, oppure il punto medio ·.
- **Non riusare lo stesso layout** fra progetti diversi.
- **Niente toni da pubblicità.** I titoli dicono cosa c'è, non vendono.
  "Listino della stagione 2026", non "Prezzi chiari, scritti una volta sola".
- Font e colori dal DOM del sito del cliente, non a occhio.
- Testi in italiano, tono professionale.
- **Niente dati inventati spacciati per veri.** Quello che è inventato va dichiarato,
  e nei siti c'è un elenco dentro il pannello Presentazione.
- Velocità: se una strada non funziona, cambiarla subito e dirlo.

---

## 8. Trappole già scoperte

**`$(...)` non è `$$(...)`.** `$` restituisce un elemento solo: chiamarci `.forEach`
sopra rompe tutto lo script, e siccome l'errore avviene all'avvio non si collega più
nessun pulsante. Costato due volte. Ora `build.js` lo blocca.

**Le griglie CSS si allargano.** Una colonna `1fr` che contiene un elemento largo
(la mappa, una tabella) prende la larghezza del contenuto e allarga tutta la pagina:
sul telefono il browser rimpicciolisce tutto. Serve `min-width:0` sugli elementi
della griglia.

**Larghezza minima sulle mappe.** `min-width` su un SVG dentro un contenitore che
scorre impedisce alla mappa di rimpicciolirsi. Meglio farla adattare e offrire uno zoom.

**Gli stili in linea vincono sul CSS.** Se le larghezze della galleria le scrive
il JavaScript nell'attributo `style`, le soglie per il telefono non hanno effetto
senza `!important`.

**Provare la leggibilità, non solo lo straripamento.** Un blocco a due colonne su
390px non straripa, ma è illeggibile. Vanno guardate le colonne, non solo la larghezza.

**Il pannello di anteprima del browser è inaffidabile**: serve versioni vecchie dalla
cache. Se qualcosa sembra rotto, prima ricaricare con Ctrl+F5, poi dare la colpa al codice.

**Chromium in sessione cloud non esce in rete.** Le pagine si collaudano in locale;
le chiamate esterne si verificano intercettandole e restituendo risposte vere
scaricate con `curl`.

---

## 9. Cosa resta aperto

- **Webcam.** Quella del porto di Andora non è incorporabile (Windy risponde che
  l'embed non è disponibile) e l'unica altra della zona inquadra il Tortuga Beach,
  che è un concorrente. Serve una webcam del cliente.
- **Cambio lingua.** Tortuga Beach e Lido 53 hanno il selettore IT/EN, ma la bacheca
  innestata è solo in italiano.
- **Sorgenti mancanti.** Tortuga Beach, Lido 53 e Ghe Post nel repo esistono solo
  come file costruiti. Se ci si deve lavorare molto, conviene caricare i sorgenti.
- **Dati inventati in Bagni Tortuga**, da sostituire con quelli veri: numero di
  ombrelloni, file e cabine, disposizione della mappa, tutti i prezzi, gli orari,
  il menù, e le prenotazioni già segnate sulla mappa.

---

## 10. Come lavorare con lui

- Dice "manda online X": si fa il push su main e si conferma con il link,
  dopo aver verificato che il file online sia davvero quello nuovo.
- Manda screenshot quando qualcosa non va: sono precisi, e finora aveva sempre ragione.
- Non gradisce le promesse: dire "sistemato" solo dopo aver verificato davvero,
  e dire chiaramente quando una cosa non è stata verificata.
- Se una richiesta ha un problema, dirlo in una riga e poi farla comunque.
