const { app, BrowserWindow, shell } = require("electron");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

let server;
let mainWindow;
const webRoot = path.join(__dirname, "web");
const mimeTypes = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".css":"text/css; charset=utf-8", ".json":"application/json; charset=utf-8", ".png":"image/png", ".ico":"image/x-icon", ".svg":"image/svg+xml" };

function startLocalServer() {
  return new Promise((resolve, reject) => {
    server = http.createServer((req, res) => {
      if (!["GET", "HEAD"].includes(req.method)) { res.writeHead(405); return res.end("Method Not Allowed"); }
      let pathname;
      try { pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname); }
      catch { res.writeHead(400); return res.end("Bad Request"); }
      if (pathname === "/") pathname = "/index.html";
      const filePath = path.resolve(webRoot, "." + pathname);
      if (!filePath.startsWith(webRoot + path.sep)) { res.writeHead(403); return res.end("Forbidden"); }
      fs.readFile(filePath, (error, data) => {
        if (error) { res.writeHead(error.code === "ENOENT" ? 404 : 500); return res.end(error.code === "ENOENT" ? "Not Found" : "Internal Server Error"); }
        res.writeHead(200, { "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream", "X-Content-Type-Options": "nosniff" });
        if (req.method === "HEAD") return res.end();
        res.end(data);
      });
    });
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve("http://localhost:" + server.address().port + "/index.html"));
  });
}

async function createWindow() {
  const url = await startLocalServer();
  mainWindow = new BrowserWindow({
    width: 1200, height: 850, minWidth: 900, minHeight: 650,
    title: "Controle de Carrinhos", icon: path.join(__dirname, "app.ico"),
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://")) shell.openExternal(url);
    return { action: "deny" };
  });
  await mainWindow.loadURL(url);
}
app.whenReady().then(createWindow).catch(error => { console.error(error); app.quit(); });
app.on("window-all-closed", () => { if (server) server.close(); if (process.platform !== "darwin") app.quit(); });
app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
