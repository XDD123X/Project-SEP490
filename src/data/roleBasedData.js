import { Bell, BookOpen, Calendar, Clipboard, ClipboardList, FileStack, FileText, LayoutDashboard, LifeBuoy, Mail, MonitorCog, School, Settings2, User, UserRound, Users, UsersRound, Video } from "lucide-react";

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
      { title: "Contact", url: "contact", icon: Users },
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
          { title: "Officer List", url: "/administrator/accounts" },
          { title: "Add New", url: "/administrator/account/add" },
        ],
      },
      {
        title: "Notification",
        url: "notifications",
        icon: Bell,
        items: [
          { title: "View Notifications", url: "/notification/list" },
          { title: "Add New", url: "/notification/add" },
        ],
      },
    ],
    navSecondary: [
      { title: "Support", url: "/support", icon: LifeBuoy },
      { title: "Contact", url: "contact", icon: Users },
    ],
    general: [
      { title: "Dashboard", url: "/administrator/dashboard", icon: LayoutDashboard },
      { title: "Monitoring", url: "/administrator/monitoring", icon: MonitorCog },
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
      { title: "Support", url: "/support", icon: LifeBuoy },
      { title: "Contact", url: "contact", icon: Users },
    ],
    general: [
      { title: "Notification", url: "notification", icon: Bell },
      { title: "Schedule", url: "lecturer/my-schedule", icon: Calendar },
      { title: "Class", url: "lecturer/my-class", icon: School },
      { title: "Attendance", url: "lecturer/attendance", icon: ClipboardList },
      { title: "Request", url: "lecturer/request", icon: Mail },
      { title: "Record", url: "lecturer/record", icon: Video },
      { title: "Material", url: "lecturer/material", icon: FileStack },
      { title: "Report", url: "/lecturer/reports", icon: FileText },
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
        title: "Attendance",
        url: "attendanc",
        icon: UsersRound,
        items: [{ title: "View Attendance", url: "/officer/attendance" }],
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
        items: [{ title: "View Reports", url: "/officer/reports" }],
      },
    ],
    navSecondary: [
      { title: "Support", url: "/support", icon: LifeBuoy },
      { title: "Contact", url: "contact", icon: Users },
    ],
    general: [{ title: "Notification", url: "notification", icon: Bell }],
  },
};

export default roleBasedData;
