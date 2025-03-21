import { SideBar } from "@/components/dashboard/SideBar";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { SearchDialog } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Bell, BookOpen, Calendar, ClipboardList, FileText, LayoutDashboard, LifeBuoy, Lock, Settings2, User, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useStore } from "@/services/StoreContext";
import { NotificationDropdown } from "@/components/notification/notification-dropdown";
import { MessageDropdown } from "@/components/notification/message-dropdown";
import { cn } from "@/lib/utils";

const roleBasedData = {
  student: {
    navMain: [
      {
        title: "Class",
        url: "class",
        icon: BookOpen,
        items: [{ title: "My Class", url: "/student/my-class" }],
      },
      {
        title: "Attendance",
        url: "attendance",
        icon: ClipboardList,
        items: [
          { title: "View Attendance", url: "view-attendance" },
          { title: "Attendance Complain", url: "attendance-complain" },
        ],
      },
    ],
    navSecondary: [
      { title: "Support", url: "/support", icon: LifeBuoy },
      { title: "Feedback", url: "/feedback", icon: FileText },
    ],
    general: [
      { title: "Notification", url: "notification", icon: Bell },
      { title: "My Schedule", url: "Student/my-schedule", icon: Calendar },
    ],
  },
  administrator: {
    navMain: [
      {
        title: "Account",
        url: "account",
        icon: User,
        items: [
          { title: "View Accounts", url: "view" },
          { title: "Add New", url: "add" },
          { title: "Other", url: "other" },
        ],
      },
      {
        title: "Settings",
        url: "settings",
        icon: Settings2,
        items: [
          { title: "Website Settings", url: "website" },
          { title: "Class Settings", url: "class" },
        ],
      },
      {
        title: "Notification",
        url: "notifications",
        icon: Bell,
        items: [
          { title: "View Notifications", url: "view" },
          { title: "Add New", url: "add" },
        ],
      },
      {
        title: "Report",
        url: "reports",
        icon: FileText,
        items: [
          { title: "View Reports", url: "view" },
          { title: "Add New", url: "add" },
        ],
      },
    ],
    navSecondary: [
      { title: "Documentation", url: "docs", icon: BookOpen },
      { title: "System Health", url: "health", icon: LifeBuoy },
    ],
    general: [
      { title: "Dashboard", url: "dashboard", icon: LayoutDashboard },
      { title: "Notification", url: "notification", icon: Bell },
    ],
  },
  lecturer: {
    navMain: [
      {
        title: "Class",
        url: "class",
        icon: BookOpen,
        items: [{ title: "View Assigned Classes", url: "/lecturer/my-class" }],
      },
      {
        title: "Attendance",
        url: "attendance",
        icon: ClipboardList,
        items: [
          { title: "View Attendance", url: "/lecturer/attendace" },
          { title: "Take Attendance", url: "/lecturer/attendance/take-attendance" },
        ],
      },
      {
        title: "Session",
        url: "request",
        icon: Calendar,
        items: [
          { title: "Change Session", url: "/lecturer/session/change" },
          { title: "Update Session", url: "/lecturer/session/update" },
        ],
      },
      {
        title: "Report",
        url: "reports",
        icon: FileText,
        items: [
          { title: "View Reports", url: "view" },
          { title: "Other", url: "other" },
        ],
      },
      {
        title: "Record",
        url: "records",
        icon: ClipboardList,
        items: [
          { title: "View Records", url: "view" },
          { title: "Upload Records", url: "upload" },
        ],
      },
    ],
    navSecondary: [
      { title: "Academic Support", url: "/support", icon: LifeBuoy },
      { title: "Collaboration", url: "collab", icon: Users },
    ],
    general: [
      { title: "Notification", url: "notification", icon: Bell },
      { title: "My Schedule", url: "lecturer/my-schedule", icon: Calendar },
    ],
  },
  officer: {
    navMain: [
      {
        title: "Class",
        url: "class",
        icon: BookOpen,
        items: [
          { title: "View Classes", url: "/officer/class/" },
          { title: "Add Class", url: "/officer/class/add-new" },
          { title: "Add Student", url: "/officer/class/add-student" },
        ],
      },
      {
        title: "Session",
        url: "my-schedule",
        icon: Calendar,
        items: [
          { title: "View Sessions", url: "/officer/session" },
          { title: "Generate Session", url: "/officer/session/generate" },
        ],
      },
      {
        title: "Account",
        url: "accounts",
        icon: User,
        items: [
          { title: "View Students", url: "/officer/account/students" },
          { title: "View Lecturers", url: "/officer/account/lecturers" },
          { title: "Add Account", url: "/officer/account/add" },
        ],
      },
      {
        title: "Course",
        url: "courses",
        icon: BookOpen,
        items: [{ title: "View Courses", url: "view" }],
      },
      {
        title: "Record",
        url: "records",
        icon: ClipboardList,
        items: [
          { title: "View Records", url: "/officer/notification" },
          { title: "Upload Records", url: "/officer/notification/upload" },
        ],
      },
      {
        title: "Notification",
        url: "notifications",
        icon: Bell,
        items: [
          { title: "View Notifications", url: "/officer/notification" },
          { title: "Create New", url: "/officer/notification/add" },
        ],
      },
      {
        title: "Request",
        url: "requests",
        icon: FileText,
        items: [
          { title: "Student Requests", url: "/officer/request/student" },
          { title: "Lecturer Requests", url: "/officer/request/lecturer" },
        ],
      },
      {
        title: "Report",
        url: "reports",
        icon: FileText,
        items: [
          { title: "View Reports", url: "view" },
          { title: "Add New", url: "add" },
        ],
      },
    ],
    navSecondary: [
      // { title: "Support", url: "/support", icon: LifeBuoy },
      // { title: "Contact", url: "contact", icon: Users }
    ],
    general: [
      // { title: "Dashboard", url: "dashboard", icon: LayoutDashboard },
      { title: "Notification", url: "notification", icon: Bell },
    ],
  },
};

export default function MainScreen() {
  const { state } = useStore();
  const navigate = useNavigate();
  const { role } = state;
  const data = roleBasedData[role.toLowerCase()];
  const [offset, setOffset] = useState(0);
  const fixed = true;

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
    <SidebarProvider>
      <SideBar data={data} />
      <SidebarInset>
        <header className={cn("flex h-16 items-center gap-2 border-b px-4 bg-background sticky top-0 z-50 w-full", fixed && "header-fixed peer/header rounded-md", offset > 10 && fixed ? "shadow" : "shadow-none")}>
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <SearchDialog/>
          <div className="ml-auto flex items-center space-x-4">
            <NotificationDropdown />
            <MessageDropdown />
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 mt-5">
          <div className="p-2">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
