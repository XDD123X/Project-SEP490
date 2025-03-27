import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pencil } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "@/services/StoreContext";
import { GetNotificationById } from "@/services/notificationService";
import { format } from "date-fns";
import { getAccountById } from "@/services/accountService";
import { toast } from "sonner";

export default function DetailNotificationManagementPage() {
  const { id } = useParams();
  const { state } = useStore();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, role } = state;

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        setLoading(true);
        const response = await GetNotificationById(id);
        if (response.status === 200) {
          const notificationData = response.data;
          const accountResponse = await getAccountById(notificationData.createdBy);
          if (accountResponse.status === 200) {
            const account = accountResponse.data;
            setNotification({
              ...notificationData,
              createdByNavigation: account,
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch notification:", error);
        navigate("/notification/list");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchNotification();
    }
  }, [id, role, navigate]);

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

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center h-40">
        <p>Loading notification...</p>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center h-40">
        <p>Notification not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-5">
            <Button onClick={() => navigate("/notification/list")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Notifications
            </Button>
            <Button onClick={() => navigate(`/notification/edit/${notification.notificationId}`)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
          </div>
          <CardTitle className="text-xl">{notification.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="">
            <div className="flex flex-wrap gap-2 items-center">
              <span>Type:</span> {getTypeLabel(notification.type)}
            </div>
            <div>
              <span>Created By:</span>  {notification.createdByNavigation ? (notification.createdByNavigation.role.name + " " + notification.createdByNavigation.fullName  ) : "N/A"}
            </div>
            <div>
              <span>Created At:</span> {format(notification.createdAt, "hh:mm a dd/MM/yyyy")}
            </div>
            {notification.updatedAt && (
              <div>
                <span>Updated At:</span> {notification.updatedAt ? format(notification.updatedAt, "hh:mm a dd/MM/yyyy") : "-"}
              </div>
            )}
            <div className="mt-5">
              <span className="font-medium">Content:</span>
              <div className="p-5 border rounded-md prose max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: notification.content }} />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => navigate("/notification")}>
            Back to List
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
