const fs=require('fs'), path=require('path');
const RAD=__dirname;
const MIME={'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp',
  '.svg':'image/svg+xml','.woff2':'font/woff2'};
function trova(nome){
  for(const d of ['img','fonts','assets']){
    const p=path.join(RAD,d,nome);
    if(fs.existsSync(p)) return p;
  }
  return null;
}
function costruisci(parti, uscita){
  let t=parti.map(f=>fs.readFileSync(path.join(RAD,'src',f),'utf8')).join('\n');
  const mancanti=[];
  t=t.replace(/\{\{ASSET:([^}]+)\}\}/g,(_,nome)=>{
    const p=trova(nome.trim());
    if(!p){ mancanti.push(nome); return ''; }
    const b=fs.readFileSync(p);
    return 'data:'+(MIME[path.extname(p).toLowerCase()]||'application/octet-stream')
      +';base64,'+b.toString('base64');
  });
  if(mancanti.length){ console.error('ASSET MANCANTI:',[...new Set(mancanti)].join(', ')); process.exit(1); }
  fs.writeFileSync(uscita,t);
  console.log(path.basename(uscita), (fs.statSync(uscita).size/1048576).toFixed(2)+' MB');
}
const quale=process.argv[2]||'sito';
if(quale==='sito') costruisci(['s1-head.html','s2-body.html','s3-script.html'], path.join(RAD,'out','sito.html'));
if(quale==='dash') costruisci(['d1-head.html','d2-body.html','d3-script.html'], path.join(RAD,'out','dashboard.html'));

/* controllo: $(...) restituisce un elemento solo, .forEach su quello esplode */
(function controlla(){
  const fs=require('fs'), path=require('path');
  fs.readdirSync(path.join(__dirname,'src')).forEach(f=>{
    fs.readFileSync(path.join(__dirname,'src',f),'utf8').split('\n').forEach((r,i)=>{
      if(/[^$]\$\([^)]*\)\.forEach/.test(r)){
        console.error('ERRORE in '+f+':'+(i+1)+' -> $(...).forEach, serve $$');
        process.exitCode=1;
      }
    });
  });
})();
