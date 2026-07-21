"use client";

import { markSkipAutoPasskeyOnNextLogin } from "@/lib/passkey-client";

export function LogoutButton() {
  return (
    <button
      type="button"
      className="rounded-md px-2.5 py-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
      onClick={async () => {
        markSkipAutoPasskeyOnNextLogin();
        await fetch("/api/teacher/logout", { method: "POST" });
        window.location.href = "/teacher/login";
      }}
    >
      Log out
    </button>
  );
}
