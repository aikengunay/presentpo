import { LogoutButton } from "@/components/LogoutButton";
import Link from "next/link";

export default function TeacherAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/teacher"
            className="text-sm font-semibold tracking-tight text-zinc-900"
          >
            presentpo
          </Link>
          <nav className="flex items-center gap-1 text-sm text-zinc-600 sm:gap-2">
            <Link
              href="/teacher"
              className="rounded-md px-2.5 py-1.5 hover:bg-zinc-100 hover:text-zinc-900"
            >
              Sections
            </Link>
            <Link
              href="/teacher/import"
              className="rounded-md px-2.5 py-1.5 hover:bg-zinc-100 hover:text-zinc-900"
            >
              Import
            </Link>
            <span className="mx-1 hidden h-4 w-px bg-zinc-200 sm:block" aria-hidden />
            <LogoutButton />
          </nav>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
