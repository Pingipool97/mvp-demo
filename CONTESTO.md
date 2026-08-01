# MVP PROGETTI — contesto per proseguire in una nuova sessione

Copia questo file all'inizio di una nuova chat di Claude Code, oppure di' semplicemente
"leggi `C:\Users\miche\Desktop\MVP PROGETTI\CONTESTO.md` e proseguiamo da lì".

---

## 1. Che lavoro è

Michele (utente GitHub **Pingipool97**) fa demo commerciali per attività locali.
Il giro è sempre lo stesso:

1. Si analizza il sito attuale del cliente (font, colori, logo, testi, bug reali).
2. Si costruisce una **demo completa e funzionante** con quella identità visiva.
3. Si pubblica su un link unico e si mostra al cliente.

Le demo sono **file HTML singoli e autonomi**: immagini e font incorporati in base64,
nessuna dipendenza esterna, si aprono anche senza rete.

---

## 2. Dove sta tutto

```
C:\Users\miche\Desktop\MVP PROGETTI\
├── CONTESTO.md              questo file
├── pubblica.ps1             INTERRUTTORE: decide cosa va online
├── soglie-desktop.ps1       utilità già applicata (soglie responsive a 940px)
├── menu-mobile.ps1          utilità già applicata (menu laterale con "left")
├── mvp-demo\                repo git collegato a GitHub e a Vercel
│   ├── index.html           portale generato da pubblica.ps1
│   ├── tortuga\ lido53\ ghepost\
│   └── vercel.json  _headers  robots.txt  .nojekyll
├── Tortuga Beach\
├── Lido 53\
└── Ghe Post\
```

Ogni cartella progetto ha la stessa forma:

```
<Progetto>\
├── src\          sorgenti del sito     (part1-head, part2-body, part3-script)
├── src-dash\     sorgenti gestionale   (d1/g1-head, d2/g2-body, d3/g3-script)
├── src-app\      solo Ghe Post: app dipendenti (a1, a2, a3)
├── assets-src\   immagini e loghi originali del cliente
├── fonts-src\    woff2 scaricati da Google Fonts
├── build*.ps1    uniscono le parti e incorporano gli asset in base64
└── <Nome>-*.html file finale costruito
```

I sorgenti sono spezzati in tre file solo per comodità di scrittura: lo script di build
li concatena e sostituisce i segnaposto `{{ASSET:nomefile}}` con data URI base64.

---

## 3. Come si costruisce e si pubblica

**Costruire** (dentro la cartella del progetto):

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\miche\Desktop\MVP PROGETTI\Ghe Post\build-sito.ps1"
```
Ogni progetto ha `build.ps1` / `build-dash.ps1` / `build-sito.ps1` / `build-app.ps1`.

**Pubblicare** (dalla cartella radice). È un interruttore: online va **solo** ciò che elenchi.

```powershell
cd "C:\Users\miche\Desktop\MVP PROGETTI"
.\pubblica.ps1 -Elenco                    # progetti disponibili
.\pubblica.ps1 tortuga,lido53,ghepost     # manda online questi
.\pubblica.ps1 ghepost                    # solo Ghe Post, gli altri spariscono
.\pubblica.ps1 ghepost -Pin 4821          # online ma chiede un codice
.\pubblica.ps1 -Chiudi                    # tutto offline, resta una pagina nera
```

Lo script svuota `mvp-demo`, copia solo i progetti scelti, genera il portale,
fa commit e push. Vercel si aggiorna da solo in circa 40 secondi.

**Aggiungere un progetto nuovo**: creare la cartella con la stessa struttura, poi
aggiungere una voce nel registro `$REG` dentro `pubblica.ps1`.

---

## 4. Pubblicazione online

- **Repo**: `git@github.com:Pingipool97/mvp-demo.git`, push via **SSH** (chiave già registrata, nessuna password).
- **Hosting**: **Vercel**, collegato al repo, deploy automatico a ogni push.
- **Link pubblico**: `https://mvp-demo-dun.vercel.app/`
- I file hanno `noindex` e `robots.txt` blocca tutto: non finiscono su Google.
- `gh` (GitHub CLI) **non è installato**. Git sì, versione 2.53.

Struttura online:
```
/                              portale con l'elenco dei progetti
/tortuga/sito.html   /tortuga/dashboard.html
/lido53/sito.html    /lido53/dashboard.html
/ghepost/sito.html   /ghepost/gestionale.html   /ghepost/app.html
```

**Nota**: quando si dice "chiudi", i file spariscono davvero dal server. Non è un
filtro cosmetico, è la protezione vera di queste demo.

---

## 5. Regole di stile che Michele ha imposto

Sono richieste esplicite, non preferenze mie:

- **Niente emoji.** Mai, in nessun file. Usare icone SVG o niente.
- **Niente trattini lunghi** (— e –). Usare virgole, due punti, oppure il punto medio ·.
- **Non riusare lo stesso layout** fra progetti diversi. I lidi hanno la barra laterale,
  Ghe Post ha la navigazione orizzontale in alto. Il prossimo dovrà essere ancora diverso.
- **Font e colori si prendono dal sito del cliente**, ispezionando il DOM, non a occhio.
- **Il logo lo fornisce lui** o si scarica dal loro sito.
- Testi in italiano, tono professionale, niente marketing gonfiato.
- Vuole **velocità**. Non fare venti giri: se una strada non funziona, cambiarla subito
  e dirlo, invece di insistere.

---

## 6. Trappole tecniche già scoperte (leggere prima di lavorare)

Queste sono costate ore. Non ripeterle.

**PowerShell srotola l'ultimo elemento di un array.**
Un array di coppie `$R = @( @('a','b'), @('c','d') )` viene srotolato sull'ultimo
elemento, che diventa due stringhe separate. Poi `$r[0]` e `$r[1]` sono **caratteri**,
e `.Replace()` sostituisce carattere per carattere distruggendo il file
(`ASSET` diventava `tppET`). Soluzione: mettere sempre una sentinella innocua in fondo,
tipo `@('~~','~~')`, e validare che ogni elemento sia una coppia.

**PowerShell 5.1 legge i .ps1 come ANSI, non UTF-8.**
Il simbolo € e le lettere accentate nelle stringhe di ricerca non corrispondono e le
sostituzioni falliscono in silenzio. Soluzione: salvare gli script **con BOM**
(`New-Object System.Text.UTF8Encoding($true)`), oppure costruire i caratteri con
`[char]0x20AC`. I file HTML invece si scrivono **senza BOM**.

**Preferire sostituzioni sequenziali agli array.**
`$t = $t.Replace('a','b')` ripetuto è noioso ma non si rompe mai.

**git scrive gli avvisi su stderr** e con `$ErrorActionPreference='Stop'` PowerShell li
tratta come errori bloccanti. In `pubblica.ps1` è già gestito, ma attenzione se si
scrivono nuovi script con git dentro.

**File di sola lettura in mvp-demo.** Ogni tanto compaiono e bloccano la pubblicazione.
`pubblica.ps1` non li pulisce da solo: se dà "accesso negato", lanciare prima
`Get-ChildItem .\mvp-demo -Recurse | Where-Object {$_.IsReadOnly} | ForEach-Object {$_.IsReadOnly=$false}`.

**System.Drawing non legge i .webp.** Per ridimensionare immagini usare i jpg/png;
i webp si incorporano così come sono, i browser li leggono.

**Il pannello di anteprima del browser è inaffidabile.** In questa sessione ha:
servito versioni vecchie in cache, smesso di ricalcolare gli stili (nemmeno un
`!important` inline spostava un elemento), troncato script inline, e non eseguito
JavaScript su pagine appena caricate. **Verificare sempre sul file costruito o sull'URL
Vercel**, mai fidarsi solo dell'anteprima. Se un test dà risultati assurdi, ricaricare
la pagina o riaprire una scheda nuova prima di dare la colpa al codice.

**Lezione sul debug**: il menu della dashboard "non funzionava su telefono" per tre
tentativi. La causa vera era banale: `.side` aveva `z-index:60` e il velo `.scrim`
`z-index:70`, quindi il velo copriva il menu e intercettava i tocchi. Prima di riscrivere
CSS a tentoni, controllare l'ordine di impilamento e leggere il codice.

**Estrarre testo dai PDF senza librerie**: c'è uno script Node funzionante che decomprime
gli stream FlateDecode e legge gli operatori di testo. È servito per ricavare i menu di
Ghe Post. Vedere la cartella scratchpad della sessione, oppure riscriverlo: sono 30 righe.

---

## 7. Stato dei tre progetti

### Tortuga Beach — stabilimento balneare, Marina di Andora (SV)
- Sito 6 MB (nove foto vere incorporate) e gestionale.
- Font Original Surfer, Pacifico, Open Sans. Oro `#EDA60C`, blu `#06273A`.
- 80 ombrelloni su 5 file da 16, 30 cabine, prezzi per fila e periodo.
- QR di check-in: encoder scritto a mano e **verificato leggibile** con un decodificatore
  indipendente. Non toccarlo senza riverificare.
- Ha un pannello "Modalità presentazione" con l'audit dei bug reali del loro sito.

### Lido 53 — stabilimento balneare, Andora (SV)
- Stesso motore del Tortuga, identità diversa: font Poppins, oro `#BF8F3D`, quasi-nero `#1D1D1F`.
- Quattro foto reali del cliente, incorporate una volta sola tramite classi CSS.
- Argomento di vendita forte: **oggi mandano le prenotazioni a spiagge.it e pagano commissioni**.

### Ghe Post — caffetteria e paninoteca, Via Manfredo Fanti 2, Milano
Tre file: **sito**, **gestionale**, **app dipendenti**.
- Font Roboto Slab e Roboto. Verde `#19391B`, bruno `#262018`, oro `#8A6A2F`, panna `#FAF8F4`.
- **160 prodotti reali** estratti dai loro PDF, in `Ghe Post\catalogo.html`, condiviso dai tre file.
- 12 tavoli misti (tondi da 4, rettangolari da 6) su tre zone.
- Regola loro rispettata: nei panini si toglie o si aggiunge **un solo** ingrediente;
  il panino su misura ha massimo 3 ingredienti da 7,50 €.
- Comande divise per reparto: cucina, bar, caffetteria.
- Personale: **Saverio** 1234, **Carolina** 2345, **Piero** 3456, **Lorenzo** (titolare) 0000.
- Sezione fiscale **dimostrativa**: nessuna integrazione, e lo dice a schermo.
- App e gestionale si parlano tramite `localStorage` (chiave `ghepost_dati`): funziona solo
  sullo **stesso dispositivo**. Michele lo sa e gli va bene.
- Il gestionale semina da solo un servizio in corso: 7 tavoli occupati e comande nei monitor,
  lasciando liberi **T3, T6, T9, T11, T12** per la dimostrazione dal vivo con l'app.

---

## 8. Cosa resta da fare

- Nessun lavoro aperto sui tre progetti.
- Il sito di Ghe Post è stato verificato sul file pubblicato, ma **il menu sfogliabile non
  è mai stato provato cliccandolo** a causa del pannello di anteprima rotto. Prima cosa da
  fare: aprirlo e provarlo davvero.
- Idee già proposte e non realizzate: accesso vero con Cloudflare Access (gratis fino a
  50 utenti) al posto del filtro a email, se un giorno servisse protezione seria.

---

## 9. Come lavorare con lui

- Dice "manda online X" o "chiudi": si esegue `pubblica.ps1` e si conferma con il link.
- Manda screenshot quando qualcosa non va: guardarli, sono precisi.
- Non gradisce le promesse: dire "sistemato" solo dopo aver verificato davvero, e dire
  chiaramente quando una cosa **non** è stata verificata.
- Se una richiesta ha un problema, dirlo in una riga e poi farla comunque.
