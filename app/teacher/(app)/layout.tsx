import { TeacherAppSidebar } from "@/components/teacher/app-sidebar";
import { TeacherSiteHeader } from "@/components/teacher/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function TeacherAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <TeacherAppSidebar variant="inset" />
      <SidebarInset>
        <TeacherSiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
