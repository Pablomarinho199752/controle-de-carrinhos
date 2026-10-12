const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const web = path.join(__dirname, "web");
const icons = path.join(web, "icons");

fs.rmSync(web, { recursive: true, force: true });
fs.mkdirSync(icons, { recursive: true });

for (const file of ["index.html", "app.js", "firebase-config.js", "manifest.json", "service-worker.js"]) {
  const source = path.join(root, file);
  if (!fs.existsSync(source)) throw new Error("Arquivo obrigatório não encontrado: " + file);
  fs.copyFileSync(source, path.join(web, file));
}

const iconFiles = [
  ["favicon.png", "favicon.png"],
  ["icon-192.png", "icon-192.png"],
  ["icon-512.png", "icon-512.png"],
  ["icon-512-maskable.png", "icon-512-maskable.png"]
];
for (const [sourceName, destName] of iconFiles) {
  const source = path.join(root, sourceName);
  if (fs.existsSync(source)) fs.copyFileSync(source, path.join(icons, destName));
}
const existingIconsDir = path.join(root, "icons");
if (fs.existsSync(existingIconsDir)) {
  fs.cpSync(existingIconsDir, icons, { recursive: true, force: true });
}

const icon = path.join(root, "Carrinho-Azul-Corrigido.ico");
if (!fs.existsSync(icon)) throw new Error("Ícone Carrinho-Azul-Corrigido.ico não encontrado na raiz.");
fs.copyFileSync(icon, path.join(__dirname, "app.ico"));

console.log("Arquivos web preparados para o aplicativo Windows.");
