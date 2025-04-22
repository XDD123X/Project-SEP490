import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Pencil, Trash2, MoreHorizontal, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/services/StoreContext";
import { DeleteNotification, GetNotificationManagement } from "@/services/notificationService";
import { format } from "date-fns";
import { toast } from "sonner";

export default function ManageNotificationPage() {
  const navigate = useNavigate();
  const { state } = useStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const { user, role } = state;

  //only allow lectuer, officer, admin
  useEffect(() => {
    if (role.toLowerCase() === "student") {
      navigate("/notification");
    }
  }, [role, navigate]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await GetNotificationManagement(user.uid);
        if (response.status === 200) {
          setNotifications(response.data);
          console.log(response.data);
          
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  const handleView = (id) => {
    navigate(`/notification/detail/${id}`);
  };

  const handleDelete = async () => {
    if (!selectedNotification) return;

    try {
      // Gọi API để xoá trên backend
      const response = await DeleteNotification(selectedNotification);

      if (response.status === 200) {
        // Xoá thành công, cập nhật danh sách thông báo
        const updatedNotifications = notifications.filter((notification) => notification.notificationId !== selectedNotification);

        setNotifications(updatedNotifications);
        setDeleteDialogOpen(false);
        setSelectedNotification(null);

        toast.success("Notification deleted successfully");
      } else {
        toast.error("Failed to delete notification: Unexpected response", response);
      }
    } catch (error) {
      toast.error("Failed to delete notification:", error);
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notification) => (
                    <TableRow key={notification.notificationId}>
                      <TableCell className="font-medium max-w-[250px] whitespace-nowrap overflow-hidden truncate">{notification.title}</TableCell>
                      <TableCell>{getTypeLabel(notification.type)}</TableCell>
                      <TableCell>{notification.createdByNavigation.fullName}</TableCell>
                      <TableCell>{format(notification.createdAt, "H:mm - dd/MM/yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex space-x-2 justify-end">
                          <Button variant="outline" size="icon" onClick={() => handleView(notification.notificationId)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => confirmDelete(notification.notificationId)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
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
