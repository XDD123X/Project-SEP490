import { Bell, BookOpen, Calendar, Clipboard, ClipboardList, FileText, LayoutDashboard, LifeBuoy, Mail, School, Settings2, User, Users, Video } from "lucide-react";

const roleBasedData = {
  student: {
    // navMain: [
    //   {
    //     title: "Class",
    //     url: "class",
    //     icon: BookOpen,
    //     items: [{ title: "My Class", url: "/student/my-class" }],
    //   },
    //   {
    //     title: "Attendance",
    //     url: "attendance",
    //     icon: ClipboardList,
    //     items: [
    //       { title: "View Attendance", url: "view-attendance" },
    //       { title: "Attendance Complain", url: "attendance-complain" },
    //     ],
    //   },
    // ],
    navSecondary: [
      { title: "Support", url: "/support", icon: LifeBuoy },
      { title: "Feedback", url: "/feedback", icon: FileText },
    ],
    general: [
      { title: "Notification", url: "notification", icon: Bell },
      { title: "Schedule", url: "Student/my-schedule", icon: Calendar },
      { title: "Class", url: "Student/my-class", icon: School },
      { title: "Attendance", url: "Student/attendance", icon: Calendar },
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
    // navMain: [
    //   {
    //     title: "Class",
    //     url: "class",
    //     icon: BookOpen,
    //     items: [{ title: "My Class", url: "/lecturer/my-class" }],
    //   },
    //   {
    //     title: "Attendance",
    //     url: "attendance",
    //     icon: ClipboardList,
    //     items: [
    //       { title: "View Attendance", url: "/lecturer/attendace" },
    //       { title: "Take Attendance", url: "/lecturer/attendance/take-attendance" },
    //     ],
    //   },
    //   {
    //     title: "Session",
    //     url: "request",
    //     icon: Calendar,
    //     items: [
    //       { title: "Change Session", url: "/lecturer/session/change" },
    //       { title: "Update Session", url: "/lecturer/session/update" },
    //     ],
    //   },
    //   {
    //     title: "Report",
    //     url: "reports",
    //     icon: FileText,
    //     items: [
    //       { title: "View Reports", url: "view" },
    //       { title: "Other", url: "other" },
    //     ],
    //   },
    //   {
    //     title: "Record",
    //     url: "records",
    //     icon: ClipboardList,
    //     items: [
    //       { title: "View Records", url: "view" },
    //       { title: "Upload Records", url: "upload" },
    //     ],
    //   },
    // ],
    navSecondary: [
      { title: "Academic Support", url: "/support", icon: LifeBuoy },
      { title: "Collaboration", url: "collab", icon: Users },
    ],
    general: [
      { title: "Notification", url: "notification", icon: Bell },
      { title: "Schedule", url: "lecturer/my-schedule", icon: Calendar },
      { title: "Class", url: "lecturer/my-class", icon: School },
      { title: "Attendace", url: "lecturer/attendance", icon: ClipboardList },
      { title: "Request", url: "lecturer/request", icon: Mail },
      { title: "Material", url: "lecturer/material", icon: Video },
      { title: "Report", url: "lecturer/report", icon: FileText },
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
        title: "Request",
        url: "requests",
        icon: FileText,
        items: [
          { title: "Student Requests", url: "/officer/request/student" },
          { title: "Lecturer Requests", url: "/officer/request/lecturer" },
        ],
      },
      {
        title: "Course",
        url: "courses",
        icon: BookOpen,
        items: [
          { title: "View Courses", url: "/officer/course" },
          { title: "Add Course", url: "/officer/course/add" },
        ],
      },
      // {
      //   title: "Record",
      //   url: "records",
      //   icon: ClipboardList,
      //   items: [
      //     { title: "View Records", url: "/officer/notification" },
      //     { title: "Upload Records", url: "/officer/notification/upload" },
      //   ],
      // },
      {
        title: "Notification",
        url: "notifications",
        icon: Bell,
        items: [
          { title: "View Notifications", url: "/notification/list" },
          { title: "Create New", url: "/notification/add" },
        ],
      },
      {
        title: "Report",
        url: "reports",
        icon: FileText,
        items: [
          { title: "View Reports", url: "/officer/report" }
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

export default roleBasedData;
