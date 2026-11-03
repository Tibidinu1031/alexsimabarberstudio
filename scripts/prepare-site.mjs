// Optional packaging for Sites. GitHub Pages uses the root files directly.
import {mkdir,copyFile,cp} from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
await mkdir(dist, {recursive:true});
for (const name of ['index.html','style.css','booking.css','ornaments.css','hero.css','theme.css','intro.css','intro.js','app.js','booking-core.js','booking.js','.nojekyll']) await copyFile(path.join(root,name),path.join(dist,name));
await cp(path.join(root,'assets'),path.join(dist,'assets'),{recursive:true});
console.log('Static Site package prepared in dist. GitHub Pages needs no build.');
