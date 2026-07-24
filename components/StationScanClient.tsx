"use client";

import { Html5Qrcode } from "html5-qrcode";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

type FeedLatest = {
  name: string;
  code: number;
  source: string;
} | null;

function speakName(name: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const last = name.split(",")[0]?.trim() || name;
  const utter = new SpeechSynthesisUtterance(`${last}, checked in`);
  utter.rate = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

export function StationScanClient({
  sessionId,
  sectionCode,
}: {
  sessionId: string;
  sectionCode: string;
}) {
  const router = useRouter();
  const regionId = useId().replace(/:/g, "");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanningLock = useRef(false);
  const lastSpoken = useRef<string | null>(null);

  const [counts, setCounts] = useState({ checkedIn: 0, roster: 0 });
  const [latest, setLatest] = useState<FeedLatest>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [announce, setAnnounce] = useState(true);
  const [ending, setEnding] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const pollFeed = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/feed`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.counts) {
        setCounts({
          checkedIn: data.counts.checkedIn,
          roster: data.counts.roster,
        });
      }
      setLatest((data.latest ?? null) as FeedLatest);
    } catch {
      /* ignore poll errors */
    }
  }, [sessionId]);

  useEffect(() => {
    pollFeed();
    const id = setInterval(pollFeed, 2000);
    return () => clearInterval(id);
  }, [pollFeed]);

  useEffect(() => {
    if (!announce || !latest?.name) return;
    const key = `${latest.name}|${latest.code}|${latest.source}`;
    if (lastSpoken.current === key) return;
    lastSpoken.current = key;
    speakName(latest.name);
  }, [announce, latest]);

  const onScan = useCallback(
    async (raw: string) => {
      if (scanningLock.current) return;
      scanningLock.current = true;
      setError(null);
      try {
        const res = await fetch(`/api/sessions/${sessionId}/scan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: raw }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Scan failed");
          setTimeout(() => {
            scanningLock.current = false;
          }, 1500);
          return;
        }
        setFlash(`${data.name} · code ${data.code}`);
        if (announce) speakName(data.name);
        await pollFeed();
        setTimeout(() => {
          setFlash(null);
          scanningLock.current = false;
        }, 2000);
      } catch {
        setError("Network error");
        scanningLock.current = false;
      }
    },
    [sessionId, announce, pollFeed],
  );

  useEffect(() => {
    let cancelled = false;
    const scanner = new Html5Qrcode(regionId);
    scannerRef.current = scanner;

    (async () => {
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 8, qrbox: { width: 260, height: 260 } },
          (decoded) => {
            if (!cancelled) void onScan(decoded);
          },
          () => undefined,
        );
        if (!cancelled) setCameraReady(true);
      } catch {
        if (!cancelled) {
          setError(
            "Could not open the camera. Allow camera access and reload.",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      const s = scannerRef.current;
      scannerRef.current = null;
      if (s?.isScanning) {
        void s.stop().catch(() => undefined);
      }
    };
  }, [regionId, onScan]);

  async function endSession() {
    setEnding(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/end`, {
        method: "POST",
      });
      if (res.ok) {
        router.push(`/teacher/sessions/${sessionId}/roster`);
        router.refresh();
      }
    } finally {
      setEnding(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-lg flex-col gap-4 px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-heading text-xl font-semibold tracking-tight">
            Station Scan
          </p>
          <p className="text-sm text-muted-foreground">
            {sectionCode} · {counts.checkedIn} / {counts.roster} checked in
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={announce}
              onChange={(e) => setAnnounce(e.target.checked)}
            />
            Announce
          </label>
          <Link
            href={`/teacher/sessions/${sessionId}/roster`}
            className="rounded-lg border px-3 py-1.5 text-sm"
          >
            Roster
          </Link>
          <button
            type="button"
            onClick={() => void endSession()}
            disabled={ending}
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {ending ? "Ending…" : "End"}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-black">
        <div id={regionId} className="min-h-[280px] w-full" />
      </div>

      {!cameraReady && !error ? (
        <p className="text-sm text-muted-foreground">Starting camera…</p>
      ) : null}

      {flash ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900">
          {flash}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {latest ? (
        <p className="text-sm text-muted-foreground">
          Latest: <span className="font-medium text-foreground">{latest.name}</span>{" "}
          (code {latest.code})
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Point at a student&apos;s PresentPo QR to check them in.
        </p>
      )}
    </div>
  );
}
