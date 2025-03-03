import { Folder, Forward, MoreHorizontal, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";

export function SidebarGeneral({ items }) {
  const location = useLocation();
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>General</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={checkIsActive(location.pathname, item)}>
              <Link to={item.url}>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function checkIsActive(href, item, mainNav = false) {
  const hrefParts = href.split("/").filter(Boolean); // Loại bỏ dấu `/` thừa
  const itemParts = item.url.split("/").filter(Boolean);

  return (
    href.endsWith(`/${item.url}`) || // Trường hợp đường dẫn kết thúc bằng item.url
    hrefParts.includes(item.url) || // Kiểm tra nếu item.url nằm trong href
    (item?.items?.some((i) => href.endsWith(`/${i.url}`))) || // Kiểm tra menu con
    (mainNav &&
      hrefParts.length > 1 &&
      hrefParts[1] === itemParts[0])
  );
}


