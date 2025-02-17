import { SideBar } from "@/components/dashboard/SideBar";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AudioWaveform, BookOpen, Bot, Command, Frame, GalleryVerticalEnd, LifeBuoy, Map, PieChart, Send, Settings2, SquareTerminal } from "lucide-react";
import { useState } from "react";
import { Breadcrumb, BreadcrumbItem } from "react-bootstrap";
import { Outlet } from "react-router-dom";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Playground",
      url: "demo",
      icon: SquareTerminal,
      isActive: true,
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
  projects: [
    {
      name: "Design Engineering",
      url: "demo",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "demo",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "demo",
      icon: Map,
    },
  ],
};

export default function AdminDashboard() {
  return (
    <SidebarProvider>
      <SideBar data={data} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Search />
          <div className="ml-auto flex items-center space-x-4">
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 mt-5">
          {/* <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" /> */}
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
