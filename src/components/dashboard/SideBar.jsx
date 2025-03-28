import { Command} from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar";
import { NavUser } from "./SideBarUser";
import { SideBarMain } from "./SideBarMain";
import { NavSecondary } from "./SideBarSecondary";
import { Link } from "react-router-dom";
import { SidebarGeneral } from "@/components/dashboard/SidebarGeneral";

const firstName = import.meta.env.VITE_GLOBAL_NAME;
const secondName = import.meta.env.VITE_GLOBAL_NAME_SECOND;

export function SideBar(props) {
  const { data } = props;
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold"> {firstName} </span>
                  <span className="truncate text-xs"> {secondName}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data?.general?.length > 0 && <SidebarGeneral items={data.general} />}
        {data?.navMain?.length > 0 && <SideBarMain items={data.navMain} />}
        {data?.navSecondary?.length > 0 && <NavSecondary items={data.navSecondary} className="mt-auto" />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
