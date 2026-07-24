"use client";

import { TeacherNavMain } from "@/components/teacher/nav-main";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { skipAutoPasskeyOnce } from "@/lib/passkey-client";
import { BookOpenIcon, LogOutIcon, UploadIcon } from "lucide-react";
import Link from "next/link";

const navItems = [
  {
    title: "Sections",
    url: "/teacher",
    icon: <BookOpenIcon />,
  },
  {
    title: "Import",
    url: "/teacher/import",
    icon: <UploadIcon />,
  },
];

async function logout() {
  skipAutoPasskeyOnce();
  await fetch("/api/teacher/logout", { method: "POST" });
  window.location.href = "/teacher/login";
}

export function TeacherAppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/teacher" />}
            >
              <span className="text-base font-semibold tracking-tight">
                presentpo
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <TeacherNavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => void logout()}
            >
              <LogOutIcon />
              Log out
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
