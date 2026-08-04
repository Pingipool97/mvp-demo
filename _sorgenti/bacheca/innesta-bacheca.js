#!/usr/bin/env node
/* =====================================================================
   Innesta la bacheca del giorno e il menù del pranzo dentro un sito
   e un gestionale già costruiti, senza toccare il resto del file.

   Uso:
     node innesta-bacheca.js <cartella-progetto> <prefisso>

   Esempio:
     node innesta-bacheca.js ../../tortuga  tortugabeach
     node innesta-bacheca.js ../../lido53   lido53

   Il prefisso serve a tenere separate le memorie dei progetti:
   stanno tutti sullo stesso dominio e senza prefisso si sovrascriverebbero.

   È ripetibile: se la bacheca c'è già, la sostituisce invece di duplicarla.
   ===================================================================== */
const fs=require('fs'), path=require('path');

const CART=process.argv[2], PREF=process.argv[3];
if(!CART||!PREF){ console.error('Uso: node innesta-bacheca.js <cartella> <prefisso>'); process.exit(1); }

const APRI='<!-- BACHECA:INIZIO -->', CHIUDI='<!-- BACHECA:FINE -->';

/* toglie un innesto precedente, così lo script si può rilanciare */
function pulisci(t){
  let out=t;
  while(true){
    const a=out.indexOf(APRI); if(a<0) break;
    const b=out.indexOf(CHIUDI,a); if(b<0) break;
    out=out.slice(0,a)+out.slice(b+CHIUDI.length);
  }
  return out;
}

/* ---------------- stile, uguale per sito e gestionale ---------------- */
const STILE=`
<style>
.bch{--bch-acc:var(--oro,#EFB402);--bch-deep:var(--notte,#014364);
  --bch-bord:rgba(128,128,128,.24);--bch-card:rgba(255,255,255,.05)}
.bch-griglia{display:grid;grid-template-columns:1.05fr 1fr;gap:18px;align-items:start}
.bch-box{border:1px solid var(--bch-bord);border-radius:16px;padding:20px;background:var(--bch-card)}
.bch-box h3{margin:0 0 4px;font-size:1.05rem}
.bch-data{font-size:.8rem;opacity:.6}
.bch-piatto{display:flex;gap:14px;padding:10px 0;border-bottom:1px dashed var(--bch-bord)}
.bch-piatto:last-of-type{border-bottom:none}
.bch-piatto b{font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:var(--bch-acc);
  width:76px;flex:none;padding-top:3px}
.bch-piatto span{font-size:.97rem;line-height:1.45}
.bch-prezzo{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-top:12px;
  padding-top:12px;border-top:1.5px solid var(--bch-bord)}
.bch-prezzo b{font-size:1.45rem}
.bch-prezzo small{opacity:.6;display:block;font-size:.78rem}
.bch-band{display:inline-flex;align-items:center;gap:8px;padding:.35em .85em;border-radius:99px;
  font-size:.83rem;font-weight:700}
.bch-band i{width:11px;height:11px;border-radius:3px;display:block}
.bch-avvisi{display:grid;gap:10px;margin-top:16px}
.bch-av{display:flex;gap:13px;border:1px solid var(--bch-bord);border-left:4px solid var(--bch-acc);
  border-radius:12px;padding:13px 15px;background:var(--bch-card)}
.bch-av .q{font-weight:700;font-size:.79rem;color:var(--bch-acc);width:88px;flex:none}
.bch-av h4{margin:0 0 2px;font-size:.94rem}
.bch-av p{margin:0;font-size:.86rem;opacity:.78;line-height:1.45}
.bch-meteo{border:1px solid var(--bch-bord);border-radius:16px;padding:20px;background:var(--bch-deep);
  color:#fff;position:relative}
.bch-meteo .agg{position:absolute;top:16px;right:18px;font-size:.72rem;opacity:.55}
.bch-meteo .big{display:flex;align-items:center;gap:16px;margin-bottom:14px}
.bch-meteo .big b{font-size:3rem;line-height:1}
.bch-meteo .big span{display:block;font-size:.92rem;opacity:.8}
.bch-meteo .tre{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding-top:14px;
  border-top:1px solid rgba(255,255,255,.18)}
.bch-meteo .tre small{display:block;font-size:.71rem;opacity:.6}
.bch-meteo .tre b{font-size:1.1rem}
.bch-campo{margin-bottom:12px}
.bch-campo label{display:block;font-size:.76rem;font-weight:700;opacity:.7;margin-bottom:5px}
.bch-campo input{width:100%;padding:.6em .8em;border-radius:9px;border:1.5px solid var(--bch-bord);
  background:rgba(128,128,128,.08);color:inherit;font:inherit;font-size:.9rem}
.bch-campo input:focus{outline:none;border-color:var(--bch-acc)}
.bch-btn{display:inline-flex;align-items:center;gap:7px;padding:.55em 1.05em;border-radius:10px;
  font-weight:700;font-size:.86rem;cursor:pointer;border:1.5px solid var(--bch-bord);
  background:transparent;color:inherit;font-family:inherit}
.bch-btn:hover{border-color:var(--bch-acc)}
.bch-btn.forte{background:var(--bch-acc);border-color:var(--bch-acc);color:#10222E}
.bch-btn.on{background:var(--bch-deep);color:#fff;border-color:var(--bch-deep)}
.bch-riga{display:flex;justify-content:space-between;gap:12px;padding:9px 0;
  border-bottom:1px dashed var(--bch-bord);font-size:.88rem}
.bch-riga:last-child{border:none}
@media(max-width:900px){.bch-griglia{grid-template-columns:1fr}}
</style>`;

/* ---------------- pezzo mostrato sul sito ---------------- */
const SITO=`
<section class="sec bch" id="bacheca-oggi" style="padding:34px 0">
  <div class="container">
    <p class="eyebrow">Oggi in spiaggia</p>
    <h2 style="margin:6px 0 8px">Come sta la spiaggia adesso</h2>
    <p class="lead" style="margin-bottom:22px">Meteo, mare, menù del pranzo e avvisi della giornata.
      Questa parte la aggiorna il personale dal gestionale.</p>

    <div class="bch-griglia">
      <div class="bch-meteo">
        <span class="agg" id="bch-ora">in aggiornamento</span>
        <div class="big"><b id="bch-t">--</b>
          <div><span id="bch-desc">Rilevazione in corso</span></div></div>
        <div class="tre">
          <div><small>MARE</small><b id="bch-mare">--</b></div>
          <div><small>ONDA</small><b id="bch-onda">--</b></div>
          <div><small>VENTO</small><b id="bch-vento">--</b></div>
        </div>
      </div>

      <div class="bch-box">
        <div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px">
          <h3>Il menù del pranzo</h3><span class="bch-data" id="bch-data"></span>
        </div>
        <div id="bch-piatti" style="margin-top:10px"></div>
        <div class="bch-prezzo">
          <span>Menù completo<small>bevande escluse</small></span>
          <b id="bch-prezzo">--</b>
        </div>
      </div>
    </div>

    <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:18px">
      <span class="bch-band" id="bch-band"><i></i><span id="bch-band-t">--</span></span>
    </div>
    <div class="bch-avvisi" id="bch-avvisi"></div>
  </div>
</section>`;

/* ---------------- pagina dell'editor nel gestionale ---------------- */
const GEST=`
<section class="page bch" id="p-bacheca" hidden>
  <div class="bch-griglia">
    <div class="bch-box">
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px">
        <h3>Menù del pranzo di oggi</h3><span class="bch-data" id="bch-g-data"></span>
      </div>
      <div style="margin-top:14px">
        <div class="bch-campo"><label for="bch-primo">Primo</label><input id="bch-primo"></div>
        <div class="bch-campo"><label for="bch-secondo">Secondo</label><input id="bch-secondo"></div>
        <div class="bch-campo"><label for="bch-contorno">Contorno</label><input id="bch-contorno"></div>
        <div class="bch-campo"><label for="bch-dolce">Dolce</label><input id="bch-dolce"></div>
        <div class="bch-campo"><label for="bch-prezzo-in">Prezzo del menù completo, bevande escluse</label>
          <input id="bch-prezzo-in" inputmode="numeric"></div>
      </div>
    </div>

    <div style="display:grid;gap:16px;align-content:start">
      <div class="bch-box">
        <h3>Bandiera in battigia</h3>
        <div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:12px" id="bch-scelta-band">
          <button class="bch-btn" data-b="verde">Verde, mare tranquillo</button>
          <button class="bch-btn" data-b="gialla">Gialla, prudenza</button>
          <button class="bch-btn" data-b="rossa">Rossa, vietato il bagno</button>
        </div>
      </div>
      <div class="bch-box">
        <div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px">
          <h3>Avvisi ed eventi</h3><span class="bch-data" id="bch-conta"></span>
        </div>
        <div id="bch-elenco" style="margin-top:10px"></div>
        <div style="display:grid;grid-template-columns:110px 1fr;gap:10px;margin-top:12px">
          <div class="bch-campo" style="margin:0"><label for="bch-quando">Quando</label>
            <input id="bch-quando" placeholder="11:00"></div>
          <div class="bch-campo" style="margin:0"><label for="bch-titolo">Titolo</label>
            <input id="bch-titolo" placeholder="Acqua gym"></div>
        </div>
        <div class="bch-campo" style="margin-top:10px"><label for="bch-testo">Testo</label>
          <input id="bch-testo" placeholder="Mezz'ora in acqua bassa, compresa nel prezzo"></div>
        <button class="bch-btn" id="bch-aggiungi">Aggiungi alla bacheca</button>
      </div>
    </div>
  </div>
  <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:18px">
    <button class="bch-btn forte" id="bch-salva">Pubblica sul sito</button>
    <button class="bch-btn" id="bch-ripristina">Rimetti i valori di partenza</button>
    <span style="font-size:.83rem;opacity:.6">Compare subito nella sezione
      "Oggi in spiaggia" del sito pubblico.</span>
  </div>
</section>`;

/* ---------------- logica, condivisa ---------------- */
function script(pref, dove, lat, lon){
return `
<script>
(function(){
  "use strict";
  var CHIAVE='${pref}_bacheca';
  var DEF={menu:{primo:'Trofie al pesto genovese',secondo:'Pesce del giorno alla griglia',
      contorno:'Insalata di pomodori e cipolla di Tropea',dolce:'Panna cotta ai frutti di bosco',prezzo:22},
    bandiera:'verde',
    avvisi:[
      {quando:'11:00',titolo:'Acqua gym',testo:"Mezz'ora in acqua bassa con l'istruttore, compresa nel prezzo del posto."},
      {quando:'16:30',titolo:'Giochi per i bambini',testo:'Ping pong e giochi in spiaggia, all\\'ombra.'},
      {quando:'Venerdì',titolo:'Aperitivo in riva',testo:'Dalle 18:30 musica e aperitivo al banco.'}
    ]};
  var B=JSON.parse(JSON.stringify(DEF));
  try{ var s=JSON.parse(localStorage.getItem(CHIAVE)||'null'); if(s&&s.menu) B=s; }catch(e){}
  function q(x){ return document.querySelector(x); }
  function qq(x){ return [].slice.call(document.querySelectorAll(x)); }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  var TESTI={verde:'Bandiera verde, mare tranquillo',
    gialla:'Bandiera gialla, entrare con prudenza',
    rossa:'Bandiera rossa, balneazione vietata'};
  var COLORI={verde:'#2E8B57',gialla:'#EFB402',rossa:'#C0392B'};

  ${dove==='sito'? `
  /* ---------- lato sito ---------- */
  function piatto(et,t){ return '<div class="bch-piatto"><b>'+et+'</b><span>'
    +esc(t||'da definire')+'</span></div>'; }
  function disegna(){
    if(!q('#bch-piatti')) return;
    q('#bch-data').textContent=new Date().toLocaleDateString('it-IT',
      {weekday:'long',day:'numeric',month:'long'});
    q('#bch-piatti').innerHTML=piatto('Primo',B.menu.primo)+piatto('Secondo',B.menu.secondo)
      +piatto('Contorno',B.menu.contorno)+piatto('Dolce',B.menu.dolce);
    q('#bch-prezzo').textContent=(B.menu.prezzo||0)+' €';
    var b=B.bandiera||'verde';
    q('#bch-band-t').textContent=TESTI[b];
    q('#bch-band').style.background=COLORI[b]+'22';
    q('#bch-band').style.color=COLORI[b];
    q('#bch-band').querySelector('i').style.background=COLORI[b];
    q('#bch-avvisi').innerHTML=(B.avvisi||[]).map(function(a){
      return '<div class="bch-av"><span class="q">'+esc(a.quando)+'</span>'
        +'<div><h4>'+esc(a.titolo)+'</h4><p>'+esc(a.testo)+'</p></div></div>'; }).join('')
      || '<p style="opacity:.6;font-size:.88rem">Nessun avviso per oggi.</p>';
  }
  var CIELO={0:'Sereno',1:'Poco nuvoloso',2:'Parzialmente nuvoloso',3:'Coperto',45:'Nebbia',48:'Nebbia',
    51:'Pioviggine',53:'Pioviggine',55:'Pioviggine',61:'Pioggia debole',63:'Pioggia',65:'Pioggia forte',
    80:'Rovesci',81:'Rovesci',82:'Rovesci forti',95:'Temporale',96:'Temporale',99:'Temporale'};
  function meteo(){
    if(!q('#bch-t')) return;
    var base='https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}'
      +'&current=temperature_2m,weather_code,wind_speed_10m&timezone=Europe%2FRome';
    var mar='https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}'
      +'&current=sea_surface_temperature,wave_height&timezone=Europe%2FRome';
    fetch(base).then(function(r){return r.json();}).then(function(a){
      var c=a.current;
      q('#bch-t').textContent=Math.round(c.temperature_2m)+'°';
      q('#bch-desc').textContent=CIELO[c.weather_code]||'Variabile';
      q('#bch-vento').textContent=Math.round(c.wind_speed_10m)+' km/h';
      q('#bch-ora').textContent='aggiornato alle '+new Date().toLocaleTimeString('it-IT',
        {hour:'2-digit',minute:'2-digit'});
      return fetch(mar).then(function(r){return r.json();}).then(function(m){
        if(m&&m.current){
          q('#bch-mare').textContent=Math.round(m.current.sea_surface_temperature)+'°';
          q('#bch-onda').textContent=String(m.current.wave_height.toFixed(1)).replace('.',',')+' m';
        }
      }).catch(function(){});
    }).catch(function(){
      q('#bch-desc').textContent='Meteo non disponibile senza connessione';
      q('#bch-ora').textContent='non aggiornato';
    });
  }
  function avvia(){ disegna(); meteo(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',avvia);
  else avvia();
  addEventListener('storage',function(e){ if(e.key===CHIAVE){
    try{ var n=JSON.parse(e.newValue||'null'); if(n&&n.menu){ B=n; disegna(); } }catch(x){} }});
  `:`
  /* ---------- lato gestionale ---------- */
  function riempiMenu(){
    q('#bch-primo').value=B.menu.primo||''; q('#bch-secondo').value=B.menu.secondo||'';
    q('#bch-contorno').value=B.menu.contorno||''; q('#bch-dolce').value=B.menu.dolce||'';
    q('#bch-prezzo-in').value=B.menu.prezzo||'';
  }
  function elenco(){
    q('#bch-conta').textContent=(B.avvisi||[]).length+' in bacheca';
    q('#bch-elenco').innerHTML=(B.avvisi||[]).map(function(a,i){
      return '<div class="bch-riga"><span><b>'+esc(a.quando)+' · '+esc(a.titolo)+'</b><br>'
        +'<small style="opacity:.65">'+esc(a.testo)+'</small></span>'
        +'<span><button class="bch-btn" data-el="'+i+'">Elimina</button></span></div>'; }).join('')
      || '<p style="opacity:.6;font-size:.88rem">Nessun avviso in bacheca.</p>';
    qq('#bch-elenco [data-el]').forEach(function(b){ b.onclick=function(){
      B.avvisi.splice(+b.dataset.el,1); elenco(); }; });
  }
  function disegna(){
    if(!q('#bch-primo')) return;
    q('#bch-g-data').textContent=new Date().toLocaleDateString('it-IT',
      {weekday:'long',day:'numeric',month:'long'});
    riempiMenu();
    qq('#bch-scelta-band button').forEach(function(b){
      b.classList.toggle('on',b.dataset.b===B.bandiera); });
    elenco();
  }
  function messaggio(t){
    if(typeof toast==='function'){ try{ toast(t); return; }catch(e){} }
    alert(t);
  }
  function avvia(){
    if(!q('#bch-primo')) return;
    disegna();
    qq('#bch-scelta-band button').forEach(function(b){ b.onclick=function(){
      B.bandiera=b.dataset.b;
      qq('#bch-scelta-band button').forEach(function(x){ x.classList.toggle('on',x===b); }); }; });
    q('#bch-aggiungi').onclick=function(){
      var ti=q('#bch-titolo').value.trim();
      if(ti.length<2){ messaggio("Serve almeno il titolo dell'avviso"); return; }
      B.avvisi=B.avvisi||[];
      B.avvisi.push({quando:q('#bch-quando').value.trim()||'Oggi',titolo:ti,
        testo:q('#bch-testo').value.trim()});
      q('#bch-quando').value=''; q('#bch-titolo').value=''; q('#bch-testo').value='';
      elenco(); messaggio('Avviso aggiunto. Premi Pubblica per mandarlo sul sito.');
    };
    q('#bch-salva').onclick=function(){
      B.menu={primo:q('#bch-primo').value.trim(),secondo:q('#bch-secondo').value.trim(),
        contorno:q('#bch-contorno').value.trim(),dolce:q('#bch-dolce').value.trim(),
        prezzo:parseInt(q('#bch-prezzo-in').value,10)||0};
      try{ localStorage.setItem(CHIAVE,JSON.stringify(B)); }catch(e){}
      elenco(); messaggio('Bacheca pubblicata sul sito');
    };
    q('#bch-ripristina').onclick=function(){
      B=JSON.parse(JSON.stringify(DEF));
      try{ localStorage.removeItem(CHIAVE); }catch(e){}
      disegna(); messaggio('Bacheca riportata ai valori di partenza');
    };
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',avvia);
  else avvia();
  `}
})();
<\/script>`;
}

/* ---------------- innesto ---------------- */
function innestaSito(file,pref,lat,lon){
  let t=pulisci(fs.readFileSync(file,'utf8'));
  /* la bacheca va in fondo alla pagina del bar, dove il menù ha senso */
  const anc=t.indexOf('id="p-ristorante"');
  if(anc<0) throw new Error('non trovo la pagina del ristorante in '+file);
  const fine=t.indexOf('</section>',t.lastIndexOf('<section',t.indexOf('id="p-home"')));
  /* inserisco prima della chiusura della pagina ristorante */
  const chiusura=trovaChiusuraPagina(t,anc);
  t=t.slice(0,chiusura)+APRI+STILE+SITO+script(pref,'sito',lat,lon)+CHIUDI+t.slice(chiusura);
  fs.writeFileSync(file,t);
  return t.length;
}
/* trova la fine della <section class="page"> che contiene la posizione data */
function trovaChiusuraPagina(t,da){
  let i=t.lastIndexOf('<section',da), prof=0, p=i;
  while(p<t.length){
    const apre=t.indexOf('<section',p+1), chiude=t.indexOf('</section>',p+1);
    if(chiude<0) break;
    if(apre>=0 && apre<chiude){ prof++; p=apre; }
    else { if(prof===0) return chiude; prof--; p=chiude; }
  }
  throw new Error('non trovo la chiusura della pagina');
}
function innestaGestionale(file,pref){
  let t=pulisci(fs.readFileSync(file,'utf8'));
  /* voce nel menu laterale, subito dopo WhatsApp */
  const v=t.indexOf('data-p="whatsapp"');
  if(v<0) throw new Error('non trovo la voce WhatsApp in '+file);
  const fineVoce=t.indexOf('</a>',v)+4;
  const voce=APRI+'<a href="#/bacheca" data-p="bacheca" title="Bacheca e menù del giorno">'
    +'<svg><use href="#i-doc"/></svg><span class="lbl">Bacheca</span></a>'+CHIUDI;
  t=t.slice(0,fineVoce)+voce+t.slice(fineVoce);
  /* pagina, prima della chiusura del contenitore delle pagine */
  const ult=t.lastIndexOf('<section class="page"');
  const chiusura=trovaChiusuraPagina(t,ult);
  const fine=chiusura+'</section>'.length;
  t=t.slice(0,fine)+APRI+STILE+GEST+script(pref,'gestionale',0,0)+CHIUDI+t.slice(fine);
  fs.writeFileSync(file,t);
  return t.length;
}

const COORD={tortugabeach:[43.9497,8.1417], lido53:[43.9497,8.1417], bagnitortuga:[43.9497,8.1417]};
const [lat,lon]=COORD[PREF]||[43.9497,8.1417];
const sito=path.join(CART,'sito.html'), gest=path.join(CART,'dashboard.html');
console.log('sito       ', (innestaSito(sito,PREF,lat,lon)/1048576).toFixed(2)+' MB');
console.log('gestionale ', (innestaGestionale(gest,PREF)/1048576).toFixed(2)+' MB');
console.log('fatto, prefisso di memoria: '+PREF+'_bacheca');
