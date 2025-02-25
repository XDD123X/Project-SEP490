import { SideBar } from "@/components/dashboard/SideBar";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Bell, BookOpen, Bot, Frame, LayoutDashboard, LifeBuoy, Lock, PieChart, Send, Settings2, SquareTerminal, User } from "lucide-react";
import React from "react";
import { Outlet } from "react-router-dom";


const data = {
  navMain: [
    {
      title: "Playground",
      url: "demo",
      icon: SquareTerminal,
      items: [
        {
          title: "History",
          url: "demo",
        },
        {
          title: "Starred",
          url: "demo",
        },
        {
          title: "Settings",
          url: "demo",
        },
      ],
    },
    {
      title: "Models",
      url: "demo",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "demo",
        },
        {
          title: "Explorer",
          url: "demo",
        },
        {
          title: "Quantum",
          url: "demo",
        },
      ],
    },
    {
      title: "Documentation",
      url: "demo",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "demo",
        },
        {
          title: "Get Started",
          url: "demo",
        },
        {
          title: "Tutorials",
          url: "demo",
        },
        {
          title: "Changelog",
          url: "demo",
        },
      ],
    },
    {
      title: "Settings",
      url: "demo",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "demo",
        },
        {
          title: "Team",
          url: "demo",
        },
        {
          title: "Billing",
          url: "demo",
        },
        {
          title: "Limits",
          url: "demo",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "demo",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "demo",
      icon: Send,
    },
  ],
  general: [
    {
      name: "Dashboard",
      url: "dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Notification",
      url: "notification",
      icon: Bell,
    },
  ],
};

export default function MainScreen() {
  return (
    <SidebarProvider>
      <SideBar data={data} />
      <SidebarInset>
        {/* Header chỉ sticky trên mobile */}
        <header
          className="flex h-16 shrink-0 items-center gap-2 border-b px-4
          light:bg-white dark:bg-black
                      sticky top-0 z-50 md:relative"
        >
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Search />
          <div className="ml-auto flex items-center space-x-4">
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </header>

        {/* Nội dung chính */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 mt-5">
          <div className="p-5">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
