# MVP Demo

Un solo link, tante anteprime. Il portale chiede l'email, controlla se è abilitata
e apre solo i progetti associati a quell'indirizzo.

## Struttura

```
mvp-demo/
├── index.html        portale con accesso via email
├── accessi.json      chi può entrare, fino a quando, su quali progetti
├── progetti.json     elenco dei progetti mostrati nel portale
└── tortuga/
    ├── sito.html
    └── dashboard.html
```

## Dare accesso a un cliente

Aggiungi una voce in `accessi.json`:

```json
{ "email": "cliente@azienda.it", "nome": "Nome Cliente", "attivo": true,
  "scadenza": "2026-08-05", "progetti": ["tortuga"] }
```

`scadenza` è il giorno oltre il quale l'accesso smette di funzionare da solo.
`progetti` accetta `["*"]` per dare accesso a tutto.

## Togliere l'accesso

Metti `"attivo": false` oppure cancella la riga, poi:

```bash
git add accessi.json && git commit -m "revoca accesso" && git push
```

GitHub Pages si aggiorna in circa un minuto. Alla successiva apertura il cliente
viene rimandato al portale.

## Aggiungere un nuovo progetto

1. Crea la cartella `nomeprogetto/` con dentro `sito.html` e `dashboard.html`
2. Aggiungi la voce corrispondente in `progetti.json`
3. Abilita le email che devono vederlo in `accessi.json`

## Cosa protegge davvero questo accesso

Serve a decidere chi vede cosa e per quanto tempo, e a chiudere il rubinetto
quando la presentazione è finita. Non è una protezione crittografica: i file sono
pubblicati su un hosting statico, quindi chi conosce l'indirizzo diretto di un file
può aprirlo senza passare dal portale. Va benissimo per anteprime commerciali,
non va usato per dati reali di clienti.

Se in futuro serve un accesso vero, la strada è Cloudflare Pages con Cloudflare
Access: il cliente riceve un codice via email, tu approvi gli indirizzi da
pannello e la revoca è immediata, senza toccare il codice.
