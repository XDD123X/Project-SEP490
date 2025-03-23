import { cn } from "@/lib/utils";
import { SidebarTrigger } from "../ui/sidebar";
import { Separator } from "../ui/separator";
import { SearchDialog } from "../search";
import { NotificationDropdown } from "../notification/notification-dropdown";
import { MessageDropdown } from "../notification/message-dropdown";
import { ThemeSwitch } from "../theme-switch";
import { ProfileDropdown } from "../ProfileDropdown";

export default function SiteHeader({fixed, offset}) {
  return (
    <header className={cn("flex h-16 items-center gap-2 border-b px-4 bg-background sticky top-0 z-50 w-full", fixed && "header-fixed peer/header rounded-md", offset > 10 && fixed ? "shadow" : "shadow-none")}>
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <SearchDialog />
      <div className="ml-auto flex items-center space-x-4">
        <NotificationDropdown />
        <MessageDropdown />
        <ThemeSwitch />
        <ProfileDropdown />
      </div>
    </header>
  );
}
