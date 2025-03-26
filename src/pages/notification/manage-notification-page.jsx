import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Pencil, Trash2, MoreHorizontal, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock state for demonstration
const state = {
  userEmail: "user@example.com",
  role: "admin", // Change to "officer" or "lecturer" to test different roles
};

const mockData = [
  {
    notificationId: "691f7599-2410-4047-8ce2-2911c9ffd47d",
    title: "This is an announcement about changing the website address of the center's online learning system from futureme-phonglinh.com to phonglinhclass.com",
    content:
      'This is an<strong> Announcement</strong> about changing the website address of the center\'s online learning system from <span style="color: #0000ff"><a href="futureme-phonglinh.com" target="_blank">futureme-phonglinh.com</a></span> to <span style="color: #0000ff"><a href="phonglinhclass.com" target="_blank">phonglinhclass.com</a></span>',
    type: 0,
    createdBy: "04b4a4a9-8475-470c-8bca-eb5393728cda",
    createdAt: "2025-03-26T21:00:00",
    createdByNavigation: {
      email: "admin@gmail.com",
      fullName: "Nguyễn Văn Quân",
      phoneNumber: "0123456789",
      gender: true,
      role: {
        name: "Administrator",
        description: "Quản lý hệ thống",
      },
    },
  },
  {
    notificationId: "b71ddd73-0572-4997-bab7-6c7de6562c43",
    title: "New SAT Preparation Class",
    content: "<b>New class alert:</b> Our SAT preparation course starts next Monday!",
    type: 0,
    createdBy: "04b4a4a9-8475-470c-8bca-eb5393728cda",
    createdAt: "2025-03-26T20:30:00",
    createdByNavigation: {
      email: "admin@gmail.com",
      fullName: "Nguyễn Văn Quân",
      phoneNumber: "0123456789",
      gender: true,
      role: {
        name: "Administrator",
        description: "Quản lý hệ thống",
      },
    },
  },
  {
    notificationId: "32b5f9ad-689a-441f-882a-70e453da47e9",
    title: "IELTS Speaking Workshop",
    content: "<i>Improve your speaking skills!</i> Join our free IELTS Speaking Workshop this weekend.",
    type: 0,
    createdBy: "04b4a4a9-8475-470c-8bca-eb5393728cda",
    createdAt: "2025-03-26T20:00:00",
    createdByNavigation: {
      email: "admin@gmail.com",
      fullName: "Nguyễn Văn Quân",
      phoneNumber: "0123456789",
      gender: true,
      role: {
        name: "Administrator",
        description: "Quản lý hệ thống",
      },
    },
  },
  {
    notificationId: "8a5bef46-29ec-44f7-a320-4230bb37e405",
    title: "Holiday Announcement",
    content: "<b>Notice:</b> The center will be closed during the national holiday from April 30 to May 1.",
    type: 0,
    createdBy: "04b4a4a9-8475-470c-8bca-eb5393728cda",
    createdAt: "2025-03-26T17:00:00",
    createdByNavigation: {
      email: "admin@gmail.com",
      fullName: "Nguyễn Văn Quân",
      phoneNumber: "0123456789",
      gender: true,
      role: {
        name: "Administrator",
        description: "Quản lý hệ thống",
      },
    },
  },
  {
    notificationId: "6fe05293-9962-4754-a06b-a551bf931304",
    title: "Discount on Course Fees",
    content: "<b>Special Offer:</b> Get a 10% discount if you register before the end of this month.",
    type: 0,
    createdBy: "04b4a4a9-8475-470c-8bca-eb5393728cda",
    createdAt: "2025-03-18T00:00:00",
    createdByNavigation: {
      email: "admin@gmail.com",
      fullName: "Nguyễn Văn Quân",
      phoneNumber: "0123456789",
      gender: true,
      role: {
        name: "Administrator",
        description: "Quản lý hệ thống",
      },
    },
  },
  {
    notificationId: "aeb3701c-c3c9-4b75-90a5-cbe9c4b87bd8",
    title: "Student Orientation",
    content: "<b>Dear students,</b> Don’t forget to attend the orientation session this Friday!",
    type: 1,
    createdBy: "04b4a4a9-8475-470c-8bca-eb5393728cda",
    createdAt: "2025-03-17T00:00:00",
    createdByNavigation: {
      email: "admin@gmail.com",
      fullName: "Nguyễn Văn Quân",
      phoneNumber: "0123456789",
      gender: true,
      role: {
        name: "Administrator",
        description: "Quản lý hệ thống",
      },
    },
  },
  {
    notificationId: "015b4f90-77a8-47fe-b758-905e1d8a2e46",
    title: "Exam Schedule Update",
    content: "<b>Important:</b> The final exam schedule has been updated. Check the portal.",
    type: 1,
    createdBy: "04b4a4a9-8475-470c-8bca-eb5393728cda",
    createdAt: "2025-03-16T00:00:00",
    createdByNavigation: {
      email: "admin@gmail.com",
      fullName: "Nguyễn Văn Quân",
      phoneNumber: "0123456789",
      gender: true,
      role: {
        name: "Administrator",
        description: "Quản lý hệ thống",
      },
    },
  },
  {
    notificationId: "54b709a0-3178-4fc9-92ec-bcdd525da566",
    title: "Mock Test Registration",
    content: "<b>Practice makes perfect!</b> Register now for our free mock test.",
    type: 1,
    createdBy: "04b4a4a9-8475-470c-8bca-eb5393728cda",
    createdAt: "2025-03-15T00:00:00",
    createdByNavigation: {
      email: "admin@gmail.com",
      fullName: "Nguyễn Văn Quân",
      phoneNumber: "0123456789",
      gender: true,
      role: {
        name: "Administrator",
        description: "Quản lý hệ thống",
      },
    },
  },
];

export default function ManageNotificationPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(mockData);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const { userEmail, role } = state;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        // In a real application, these would be actual API calls
        let data = [];

        if (role === "admin") {
          // Admin can see all notifications
          //data = await getAllNotifications();
        } else if (role === "officer") {
          // Officer can see notifications by officerId and lecturer
          //data = await getNotificationsByOfficer();
        } else if (role === "lecturer") {
          // Lecturer can only see their own notifications
          //data = await getNotificationsByLecturer();
        }

        //setNotifications(data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [role]);

  // Mock API functions
  const getAllNotifications = async () => {
    // This would be an actual API call in a real application
    return JSON.parse(localStorage.getItem("notifications") || "[]");
  };

  const getNotificationsByOfficer = async () => {
    const allNotifications = await getAllNotifications();
    // Filter notifications for officer (type 1 or created by the officer)
    return allNotifications.filter((notification) => notification.type === 1 || notification.createdByNavigation.email === userEmail);
  };

  const getNotificationsByLecturer = async () => {
    const allNotifications = await getAllNotifications();
    // Filter notifications created by the lecturer
    return allNotifications.filter((notification) => notification.createdByNavigation.email === userEmail);
  };

  const handleView = (id) => {
    navigate(`/notification/detail/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/notification/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!selectedNotification) return;

    try {
      // In a real application, this would be an API call
      const updatedNotifications = notifications.filter((notification) => notification.notificationId !== selectedNotification);

      // Update local storage for demo purposes
      localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
      setNotifications(updatedNotifications);

      // Close the dialog
      setDeleteDialogOpen(false);
      setSelectedNotification(null);
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const confirmDelete = (id) => {
    setSelectedNotification(id);
    setDeleteDialogOpen(true);
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 0:
        return <Badge>All</Badge>;
      case 1:
        return <Badge variant="secondary">Role</Badge>;
      case 2:
        return <Badge variant="outline">Message</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const canEdit = (notification) => {
    if (role === "admin") return true;
    if (role === "officer" && (notification.type === 1 || notification.createdByNavigation.email === userEmail)) return true;
    if (role === "lecturer" && notification.createdByNavigation.email === userEmail) return true;
    return false;
  };

  const canDelete = canEdit;

  // Initialize local storage with sample data for demo purposes
  useEffect(() => {
    if (!localStorage.getItem("notifications")) {
      const sampleData = [
        {
          notificationId: "691f7599-2410-4047-8ce2-2911c9ffd47d",
          title: "This is an announcement about changing the website address",
          content:
            'This is an<strong> Announcement</strong> about changing the website address of the center\'s online learning system from <span style="color: #0000ff"><a href="futureme-phonglinh.com" target="_blank">futureme-phonglinh.com</a></span> to <span style="color: #0000ff"><a href="phonglinhclass.com" target="_blank">phonglinhclass.com</a></span>',
          type: 0,
          createdBy: "04b4a4a9-8475-470c-8bca-eb5393728cda",
          createdAt: "2025-03-26T21:00:00",
          createdByNavigation: {
            email: "admin@gmail.com",
            fullName: "Nguyễn Văn Quân",
            phoneNumber: "0123456789",
            gender: true,
            role: null,
          },
        },
        {
          notificationId: "b71ddd73-0572-4997-bab7-6c7de6562c43",
          title: "New SAT Preparation Class",
          content: "<b>New class alert:</b> Our SAT preparation course starts next Monday!",
          type: 0,
          createdBy: "04b4a4a9-8475-470c-8bca-eb5393728cda",
          createdAt: "2025-03-26T20:30:00",
          createdByNavigation: {
            email: "admin@gmail.com",
            fullName: "Nguyễn Văn Quân",
            phoneNumber: "0123456789",
            gender: true,
            role: null,
          },
        },
        {
          notificationId: "5c101d8e-9466-4acd-bf74-f490b02d8bcf",
          title: "Officer Training Session",
          content: "<b>Mandatory training:</b> All officers must attend the system training.",
          type: 1,
          createdBy: "04b4a4a9-8475-470c-8bca-eb5393728cda",
          createdAt: "2025-03-11T00:00:00",
          createdByNavigation: {
            email: "admin@gmail.com",
            fullName: "Nguyễn Văn Quân",
            phoneNumber: "0123456789",
            gender: true,
            role: null,
          },
        },
      ];
      localStorage.setItem("notifications", JSON.stringify(sampleData));
    }
  }, []);

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Notification Management</CardTitle>
          <Button onClick={() => navigate("/notification/add")} className="ml-auto">
            <Plus className="mr-2 h-4 w-4" /> Create New
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <p>No notifications found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Updated At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notification) => (
                    <TableRow key={notification.notificationId}>
                      <TableCell className="font-medium">{notification.title}</TableCell>
                      <TableCell>{getTypeLabel(notification.type)}</TableCell>
                      <TableCell>{notification.createdByNavigation.fullName}</TableCell>
                      <TableCell>{formatDate(notification.createdAt)}</TableCell>
                      <TableCell>{notification.updatedAt ? formatDate(notification.updatedAt) : "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(notification.notificationId)}>
                              <Eye className="mr-2 h-4 w-4" /> View
                            </DropdownMenuItem>
                            {canEdit(notification) && (
                              <DropdownMenuItem onClick={() => handleEdit(notification.notificationId)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                            )}
                            {canDelete(notification) && (
                              <DropdownMenuItem onClick={() => confirmDelete(notification.notificationId)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the notification.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
