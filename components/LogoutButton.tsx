"use client";

export function LogoutButton() {
  return (
    <button
      type="button"
      className="hover:text-zinc-900"
      onClick={async () => {
        await fetch("/api/teacher/logout", { method: "POST" });
        window.location.href = "/teacher/login";
      }}
    >
      Log out
    </button>
  );
}
