/**
 * Shared LAN helpers for classroom HTTPS / terminal QR.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require("node:child_process");
const os = require("node:os");

function getLocalIPv4s() {
  const ips = new Set();
  try {
    for (const iface of ["en0", "en1"]) {
      try {
        const ip = execSync(`ipconfig getifaddr ${iface}`, {
          encoding: "utf8",
        }).trim();
        if (ip) ips.add(ip);
      } catch {
        /* try next */
      }
    }
  } catch {
    /* fall through */
  }
  try {
    for (const addrs of Object.values(os.networkInterfaces())) {
      if (!addrs) continue;
      for (const a of addrs) {
        if (!a.internal && a.family === "IPv4") ips.add(a.address);
      }
    }
  } catch {
    /* ignore */
  }
  return [...ips];
}

function getPrimaryLocalIP() {
  return getLocalIPv4s()[0] || "localhost";
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

module.exports = { getLocalIPv4s, getPrimaryLocalIP, getWiFiName };
