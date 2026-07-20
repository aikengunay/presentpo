/**
 * Production-like HTTPS listen using mkcert files from npm run certs:setup.
 * Projector QR URLs inherit https:// from the request origin.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const { createServer } = require("node:https");
const { parse } = require("node:url");
const { join } = require("node:path");
const fs = require("node:fs");
const next = require("next");
const { getPrimaryLocalIP, getWiFiName } = require("./lib-lan");

const ROOT = join(__dirname, "..");
const CERT = join(ROOT, "certs", "dev.pem");
const KEY = join(ROOT, "certs", "dev-key.pem");
const PORT = Number(process.env.PORT || 3000);
const HOSTNAME = process.env.HOSTNAME || "0.0.0.0";

if (!fs.existsSync(CERT) || !fs.existsSync(KEY)) {
  console.error(
    "Missing certs/dev.pem or certs/dev-key.pem.\nRun: npm run certs:setup",
  );
  process.exit(1);
}

const app = next({ dev: false, hostname: HOSTNAME, port: PORT, dir: ROOT });
const handle = app.getRequestHandler();

const ip = getPrimaryLocalIP();
const wifi = getWiFiName();
const url = `https://${ip}:${PORT}`;

console.log("\nHTTPS classroom server (mkcert):\n");
console.log(`   URL:   ${url}`);
console.log(`   WiFi:  ${wifi}`);
console.log(
  "   Phones must trust certs/rootCA.pem once (see classroom runbook).\n",
);

app.prepare().then(() => {
  createServer(
    {
      key: fs.readFileSync(KEY),
      cert: fs.readFileSync(CERT),
    },
    (req, res) => {
      const parsedUrl = parse(req.url || "/", true);
      handle(req, res, parsedUrl);
    },
  ).listen(PORT, HOSTNAME, () => {
    console.log(`Ready on https://0.0.0.0:${PORT} (LAN: ${url})\n`);
  });
});
