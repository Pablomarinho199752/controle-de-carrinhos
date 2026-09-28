import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'www');
const required = ['index.html', 'app.js', 'firebase-config.js'];
const optional = ['manifest.json', 'service-worker.js', '.nojekyll'];

for (const file of required) {
  const src = path.join(root, file);
  if (!fs.existsSync(src)) {
    console.error(`ERRO: arquivo obrigatório ausente: ${file}`);
    process.exit(1);
  }
}

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

for (const file of [...required, ...optional]) {
  const src = path.join(root, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(out, file));
  }
}

const iconsDir = path.join(root, 'icons');
if (fs.existsSync(iconsDir)) {
  fs.cpSync(iconsDir, path.join(out, 'icons'), { recursive: true });
}

console.log('Arquivos web preparados em www/.');
