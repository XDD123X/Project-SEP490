import { Main } from "@/components/layouts/MainLayout";
import SidebarNav from "@/components/profile/SidebarNav";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/services/StoreContext";
import { Bell, Calendar, Check, Image, Lock, Palette, PenTool, User } from "lucide-react";
import React from "react";
import { Outlet } from "react-router-dom";

export default function ProfilePage() {
  const { state } = useStore();
  const { role, user } = state;

  const sidebarNavItems = [
    {
      title: "Profile",
      icon: <User size={18} />,
      href: "/profile",
    },
    role === "Lecturer" && {
      title: "Personal Schedule",
      icon: <Calendar size={18} />,
      href: "/profile/personal-schedule",
    },
    {
      title: "Avatar",
      icon: <Image size={18} />,
      href: "/profile/avatar",
    },
    {
      title: "Password",
      icon: <Lock size={18} />,
      href: "/profile/password",
    },
  ].filter(Boolean);

  return (
    <>
      <Main fixed>
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Profile</h1>
          <p className="text-muted-foreground">Manage your account profile.</p>
        </div>
        <Separator className="my-4 lg:my-6" />
        <div className="flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="top-0 lg:sticky lg:w-1/5">
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className="flex w-full overflow-y-hidden p-1 pr-4">
            <Outlet />
          </div>
        </div>
      </Main>
    </>
  );
}
