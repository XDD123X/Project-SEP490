import { SideBar } from "@/components/dashboard/SideBar";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Bell, BookOpen, Calendar, ClipboardList, FileText, LayoutDashboard, LifeBuoy, Lock, Settings2, User, Users } from "lucide-react";
import React from "react";
import { Outlet } from "react-router-dom";
import { useStore } from "@/services/StoreContext";

const roleBasedData = {
  student: {
    navMain: [
      {
        title: "Class",
        url: "class",
        icon: BookOpen,
        items: [
          { title: "My Class", url: "demo" },
          { title: "Other Classes", url: "other-classes" }
        ]
      },
      {
        title: "Attendance",
        url: "attendance",
        icon: ClipboardList,
        items: [
          { title: "View Attendance", url: "view-attendance" },
          { title: "Attendance Complain", url: "attendance-complain" }
        ]
      }
    ],
    navSecondary: [
      { title: "Support", url: "/support", icon: LifeBuoy },
      { title: "Feedback", url: "/feedback", icon: FileText }
    ],
    general: [
      { title: "Notification", url: "notification", icon: Bell },
      { title: "My Schedule", url: "my-schedule", icon: Calendar }
    ]
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
          { title: "Other", url: "other" }
        ]
      },
      {
        title: "Settings",
        url: "settings",
        icon: Settings2,
        items: [
          { title: "Website Settings", url: "website" },
          { title: "Class Settings", url: "class" }
        ]
      },
      {
        title: "Notification",
        url: "notifications",
        icon: Bell,
        items: [
          { title: "View Notifications", url: "view" },
          { title: "Add New", url: "add" }
        ]
      },
      {
        title: "Report",
        url: "reports",
        icon: FileText,
        items: [
          { title: "View Reports", url: "view" },
          { title: "Add New", url: "add" }
        ]
      }
    ],
    navSecondary: [
      { title: "Documentation", url: "docs", icon: BookOpen },
      { title: "System Health", url: "health", icon: LifeBuoy }
    ],
    general: [
      { title: "Dashboard", url: "dashboard", icon: LayoutDashboard },
      { title: "Notification", url: "notification", icon: Bell }
    ]
  },
  lecturer: {
    navMain: [
      {
        title: "Class",
        url: "class",
        icon: BookOpen,
        items: [
          { title: "My Class", url: "my-class" },
          { title: "Other Classes", url: "other-classes" }
        ]
      },
      {
        title: "Attendance",
        url: "attendance",
        icon: ClipboardList,
        items: [
          { title: "View Attendance", url: "view" },
          { title: "Take Attendance", url: "take" },
          { title: "Other", url: "other" }
        ]
      },
      {
        title: "Schedule",
        url: "my-schedule",
        icon: Calendar,
        items: [
          { title: "My Schedule", url: "my-schedule" },
          { title: "Change Request", url: "change-request" },
          { title: "Other", url: "other" }
        ]
      },
      {
        title: "Report",
        url: "reports",
        icon: FileText,
        items: [
          { title: "View Reports", url: "view" },
          { title: "Other", url: "other" }
        ]
      },
      {
        title: "Record",
        url: "records",
        icon: ClipboardList,
        items: [
          { title: "View Records", url: "view" },
          { title: "Upload Records", url: "upload" }
        ]
      }
    ],
    navSecondary: [
      { title: "Academic Support", url: "/support", icon: LifeBuoy },
      { title: "Collaboration", url: "collab", icon: Users }
    ],
    general: [
      { title: "Notification", url: "notification", icon: Bell },
      { title: "My Schedule", url: "my-schedule", icon: Calendar }
    ]
  },
  officer: {
    navMain: [
      {
        title: "Class",
        url: "class",
        icon: BookOpen,
        items: [
          { title: "View Class", url: "/officer/class/" },
          { title: "Add Student", url: "/officer/class/add-student" }
        ]
      },
      {
        title: "Schedule",
        url: "my-schedule",
        icon: Calendar,
        items: [
          { title: "View Session", url: "/officer/session" },
          { title: "Generate Session", url: "/officer/session/generate" }
        ]
      },
      {
        title: "Account",
        url: "accounts",
        icon: User,
        items: [
          { title: "List", url: "/officer/account" },
        ]
      },
      {
        title: "Course",
        url: "courses",
        icon: BookOpen,
        items: [
          { title: "View Courses", url: "view" }
        ]
      },
      {
        title: "Record",
        url: "records",
        icon: ClipboardList,
        items: [
          { title: "View Records", url: "view" },
          { title: "Upload Records", url: "upload" }
        ]
      },
      {
        title: "Notification",
        url: "notifications",
        icon: Bell,
        items: [
          { title: "My Notifications", url: "my" },
          { title: "Create New", url: "create" }
        ]
      },
      {
        title: "Report",
        url: "reports",
        icon: FileText,
        items: [
          { title: "View Reports", url: "view" },
          { title: "Add New", url: "add" }
        ]
      },
      {
        title: "Request",
        url: "requests",
        icon: FileText,
        items: [
          { title: "Student Requests", url: "student" },
          { title: "Lecturer Requests", url: "lecturer" }
        ]
      }
    ],
    navSecondary: [
      { title: "Support", url: "/support", icon: LifeBuoy },
      { title: "Contact", url: "contact", icon: Users }
    ],
    general: [
      { title: "Dashboard", url: "dashboard", icon: LayoutDashboard },
      { title: "Notification", url: "notification", icon: Bell }
    ]
  }
};

export default function MainScreen() {
  const { state } = useStore();
  const { role } = state;
  const data = roleBasedData[role.toLowerCase()] || roleBasedData.student;
  return (
    <SidebarProvider>
      <SideBar data={data} />
      <SidebarInset>
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

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 mt-5">
          <div className="p-5">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
