import { SideBar } from "@/components/dashboard/SideBar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useStore } from "@/services/StoreContext";
import SiteHeader from "@/components/dashboard/site-header";
import Cookies from "js-cookie";
import roleBasedData from "@/data/roleBasedData";



export default function MainScreen() {
  const { state } = useStore();
  const navigate = useNavigate();
  const { role } = state;
  const data = roleBasedData[role.toLowerCase()];
  const [offset, setOffset] = useState(0);
  const fixed = true;
  // const defaultOpen = localStorage.getItem("sidebar_state") ?? (localStorage.setItem("sidebar_state", "true"), "true") === "true";
  const defaultOpen = Cookies.get("sidebar_state") !== "false";

  //check current role
  useEffect(() => {
    if (!data) {
      navigate("/503");
    }
  }, [data, navigate]);

  useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop);
    };

    // Add scroll listener to the body
    document.addEventListener("scroll", onScroll, { passive: true });

    // Clean up the event listener on unmount
    return () => document.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <SideBar data={data} />
      <SidebarInset>
        <SiteHeader fixed={fixed} offset={offset} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <Outlet />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
