"use client";

import { BadgeCheck, Bell, ChevronsUpDown, CircleUserRound, CreditCard, Dot, Lock, LogOut, Sparkles, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useStore } from "@/services/StoreContext";
import { Link, useNavigate } from "react-router-dom";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const { user, role } = state;

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground bg-sidebar-accent">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user?.imgUrl ?? "https://ui.shadcn.com/avatars/default.jpg"} alt={user?.name ?? "N/A"} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.name ?? "N/A"}</span>
                <span className="truncate text-xs">{role ?? "Unknown"}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" side={isMobile ? "bottom" : "right"} align="end" sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-10 w-10 rounded-lg">
                  <AvatarImage src={user?.imgUrl ?? "https://ui.shadcn.com/avatars/default.jpg"} alt={user?.name ?? "N/A"} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user?.name ?? "N/A"}</span>
                  <span className="truncate text-xs">
                    Role: <span className="font-medium">{role ?? "Unknown"}</span>{" "}
                  </span>
                  <span className="truncate text-xs">
                    Email: <span className="font-medium">{user?.email ?? "N/A"}</span>
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link to="profile">
                <DropdownMenuItem>
                  <User />
                  Profile
                </DropdownMenuItem>
              </Link>
              <Link to="profile/password">
                <DropdownMenuItem>
                  <Lock />
                  Change Password
                </DropdownMenuItem></Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}