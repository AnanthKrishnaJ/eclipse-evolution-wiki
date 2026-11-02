// Builds index.html from the game's source file.
// Usage: node scripts/build.mjs path/to/eclipse.html [commit]
// Reads the divine powers (the D(...) definitions) and the hidden skills (the hs(...) block)
// straight out of eclipse.html, so the wiki always matches the game.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [src, commit = ''] = process.argv.slice(2);
if (!src) { console.error('Usage: node scripts/build.mjs path/to/eclipse.html [commit]'); process.exit(1); }
const game = readFileSync(src, 'utf8');
const lines = game.split('\n');

// Divine powers: every line that starts with D('
const powerSrc = lines.filter(l => l.startsWith("D('")).join('\n');
const PW = new Function(`const PW=[];function D(id,name,cat,rar,type,arch,p,mp,cd,desc,limit,evo,hidden){PW.push({id,name,cat,rar,type,arch,p,mp,cd,desc,limit,evo,hidden})}\n${powerSrc}\nreturn PW;`)();

// Display names used by the hidden-skill effect text
const nameOf = key => { const m = game.match(new RegExp(`\\b${key}:\\{[^}]{0,80}?name:'((?:[^'\\\\]|\\\\.)*)'`)); return m ? m[1].replace(/\\'/g, "'") : null; };
const mapName = id => { const m = game.match(new RegExp(`id:'${id}',name:'([^']*)'`)) || game.match(new RegExp(`name:'([^']*)',id:'${id}'`)); return m ? m[1] : null; };
const lookup = fn => new Proxy({}, { get: (_, k) => (typeof k === 'string' && fn(k)) ? { name: fn(k) } : undefined });
const MAPS = new Proxy({}, { get: (_, k) => typeof k === 'string' ? { name: mapName(k) || ({ woods: 'the Whispering Woods', caverns: 'the Crystal Caverns' })[k] || k } : undefined });

// Hidden skills: the block from the HIDDEN SKILLS header to "values and effects", plus the effect-text helpers
const between = (a, b) => { const i = game.indexOf(a), j = game.indexOf(b, i); if (i < 0 || j < 0) throw new Error(`Could not find "${a}" in ${src}`); return game.slice(i, j); };
const defs = between('/* ================= HIDDEN SKILLS: learned by doing', '/* values and effects */');
const helpers = between('const pctS=', 'const HSCATS=');
const HS = new Function('ITEMS', 'ENEMY', 'G', `${defs}\n${helpers}\nreturn HS.map(s=>({id:s.id,name:s.name,cat:s.cat,cond:s.cond,ctr:s.counter,th:s.th,secret:!!s.secret,keys:Object.keys(s.eff),lv:s.th.map((_,i)=>effTxt(s.eff,i+1))}));`)(lookup(nameOf), lookup(nameOf), { maps: MAPS });

const json = v => JSON.stringify(v).replace(/</g, '\\u003c');
let html = readFileSync(join(root, 'src/template.html'), 'utf8')
  .replace('/*PW*/[]', () => json(PW))
  .replace('/*HS*/[]', () => json(HS));
html = commit ? html.replace('{{COMMIT}}', commit.slice(0, 7)) : html.replace(/<span>commit <code>\{\{COMMIT\}\}<\/code><\/span>/, '');
writeFileSync(join(root, 'index.html'), html);
console.log(`Built index.html: ${PW.length} powers, ${HS.length} hidden skills${commit ? ` from ${commit.slice(0, 7)}` : ''}`);
