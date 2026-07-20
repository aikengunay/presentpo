/**
 * Like taranood: print LAN URL + terminal QR, then start Next on 0.0.0.0:3000
 * so phones on the same Wi‑Fi / AP can open the app.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync, spawn } = require("node:child_process");
const { join } = require("node:path");
const os = require("node:os");

const PORT = Number(process.env.PORT || 3000);

function getLocalIP() {
  try {
    const ip =
      execSync("ipconfig getifaddr en0", { encoding: "utf8" }).trim() ||
      execSync("ipconfig getifaddr en1", { encoding: "utf8" }).trim();
    if (ip) return ip;
  } catch {
    /* fall through */
  }
  try {
    const nets = os.networkInterfaces();
    for (const name of ["en0", "en1", "eth0", "wlan0"]) {
      const addrs = nets[name];
      if (!addrs) continue;
      const v4 = addrs.find((a) => !a.internal && a.family === "IPv4");
      if (v4) return v4.address;
    }
    for (const addrs of Object.values(nets)) {
      if (!addrs) continue;
      const v4 = addrs.find((a) => !a.internal && a.family === "IPv4");
      if (v4) return v4.address;
    }
  } catch {
    /* fall through */
  }
  return "localhost";
}

function getWiFiName() {
  try {
    const out = execSync(
      '/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I 2>/dev/null | awk -F\': \' \'/ SSID/{print $2}\'',
      { encoding: "utf8" },
    );
    return out.trim() || "Unknown";
  } catch {
    return "Unknown";
  }
}

const ip = getLocalIP();
const url = `http://${ip}:${PORT}`;
const wifi = getWiFiName();

console.log("\nPhone access (same Wi‑Fi / teacher AP as this PC):\n");
console.log(`   URL:   ${url}`);
console.log(`   WiFi:  ${wifi}`);
console.log(`   Port:  ${PORT}`);
console.log("\n   Do NOT use localhost on the phone — that is the phone itself.");
console.log(
  "   Next.js 16: LAN IP is allowlisted via allowedDevOrigins in next.config.ts",
);
console.log("   Scan to open the app home, then Teacher or Student join:\n");

const qrcode = require("qrcode-terminal");
qrcode.generate(url, { small: true });

console.log(
  "\n   Classroom check-in QR is on the Teacher projector page after Start session.\n",
);

const child = spawn(
  "npx",
  ["next", "dev", "--hostname", "0.0.0.0", "--port", String(PORT)],
  {
    stdio: "inherit",
    cwd: join(__dirname, ".."),
    env: process.env,
  },
);

child.on("exit", (code) => process.exit(code ?? 0));
