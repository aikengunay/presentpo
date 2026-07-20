/**
 * Like taranood: print LAN URL + terminal QR, then start Next on 0.0.0.0:3000.
 * Prefers mkcert HTTPS (npm run certs:setup) so phones get a secure context
 * for in-app camera. Falls back to HTTP if certs are missing.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const { spawn } = require("node:child_process");
const { join } = require("node:path");
const fs = require("node:fs");
const { getPrimaryLocalIP, getWiFiName } = require("./lib-lan");

const PORT = Number(process.env.PORT || 3000);
const ROOT = join(__dirname, "..");
const CERT = join(ROOT, "certs", "dev.pem");
const KEY = join(ROOT, "certs", "dev-key.pem");
const CA = join(ROOT, "certs", "rootCA.pem");

const useHttps = fs.existsSync(CERT) && fs.existsSync(KEY);
const scheme = useHttps ? "https" : "http";
const ip = getPrimaryLocalIP();
const url = `${scheme}://${ip}:${PORT}`;
const wifi = getWiFiName();

console.log("\nPhone access (same Wi‑Fi / teacher AP as this PC):\n");
console.log(`   URL:   ${url}`);
console.log(`   WiFi:  ${wifi}`);
console.log(`   Port:  ${PORT}`);
console.log(`   TLS:   ${useHttps ? "mkcert HTTPS" : "HTTP (no certs yet)"}`);
console.log("\n   Do NOT use localhost on the phone — that is the phone itself.");
if (useHttps) {
  console.log(
    "   Install certs/rootCA.pem on phones once so the padlock is trusted.",
  );
  if (fs.existsSync(CA)) {
    console.log(`   CA file: ${CA}`);
  }
} else {
  console.log(
    "   For in-app camera on phones: npm run certs:setup  then restart.",
  );
  console.log(
    "   Without HTTPS, use phone Camera app / typed fallback on /join.",
  );
}
console.log(
  "   Next.js 16: LAN IP is allowlisted via allowedDevOrigins in next.config.ts",
);
console.log("   Scan to open the app home, then Teacher or Student join:\n");

const qrcode = require("qrcode-terminal");
qrcode.generate(url, { small: true });

console.log(
  "\n   Classroom check-in QR is on the Teacher projector page after Start session.\n",
);

const nextArgs = [
  "next",
  "dev",
  "--hostname",
  "0.0.0.0",
  "--port",
  String(PORT),
];

if (useHttps) {
  nextArgs.push(
    "--experimental-https",
    "--experimental-https-key",
    KEY,
    "--experimental-https-cert",
    CERT,
  );
  if (fs.existsSync(CA)) {
    nextArgs.push("--experimental-https-ca", CA);
  }
}

const child = spawn("npx", nextArgs, {
  stdio: "inherit",
  cwd: ROOT,
  env: process.env,
});

child.on("exit", (code) => process.exit(code ?? 0));
