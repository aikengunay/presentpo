import { LogoutButton } from "@/components/LogoutButton";
import Link from "next/link";

export default function TeacherAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/teacher" className="text-sm font-semibold tracking-tight">
            Attendance Tracker
          </Link>
          <nav className="flex items-center gap-3 text-sm text-zinc-600">
            <Link href="/teacher" className="hover:text-zinc-900">
              Sections
            </Link>
            <Link href="/teacher/import" className="hover:text-zinc-900">
              Import
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 py-8">{children}</div>
    </div>
  );
}
