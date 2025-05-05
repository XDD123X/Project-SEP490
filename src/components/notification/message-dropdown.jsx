import { format, formatDistanceToNow, isBefore, subWeeks } from "date-fns";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { GetMyNotification } from "@/services/notificationService";
import { NotificationContext } from "@/services/NotificationContext";

export function MessageDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const location = useLocation();
  const pathname = location.pathname;
  const { readStatus } = useContext(NotificationContext);

  //fetch Notification
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await GetMyNotification();

        if (response.status === 200) {
          const sortedData = {
            private: response.data.private.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
          };
          setMessages(sortedData.private);
          setNotifications(response.data);
          console.log(response.data);
          
        }
      } catch (error) {
        console.log("failed to fetch notification: ", error);
      }
    };
    fetchData();
  }, []);

  //format date
  const formatNotificationDate = (isoDate) => {
    const date = new Date(isoDate);
    if (isBefore(date, subWeeks(new Date(), 1))) {
      return format(date, "dd/MM/yyyy");
    }
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Check if a notification is read
  const isRead = (notificationId) => {
    return readStatus[notificationId] === true;
  };
  // Get unread count for a category
  const getUnreadCount = () => {
    if (!notifications["private"] || !readStatus) return 0;
    return notifications["private"].filter((n) => !isRead(n.notificationId)).length;
  };

  // Get the 5 most recent messages
  const recentMessages = messages.slice(0, 5);

  return (
    <HoverCard openDelay={100} closeDelay={200}>
      <HoverCardTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("relative", pathname === "/messages" && "bg-accent")} >
          <Mail className="h-5 w-5" />
          {getUnreadCount() > 0 && <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-green-500">{getUnreadCount()}</Badge>}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-0" align="end">
        <div className="p-2 border-b">
          <h4 className="font-medium">Recent Messages</h4>
          <p className="text-xs text-muted-foreground">{getUnreadCount()} unread messages</p>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {recentMessages.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No messages</div>
          ) : (
            <div className="divide-y">
              {recentMessages.map((message) => (
                <Link key={message.notificationId} to={`/notification/private/${message.notificationId}`} className={cn("block p-3 hover:bg-accent/50 transition-colors", isRead(message.notificationId) && "bg-accent/20")}>
                  <div className="flex justify-between items-start">
                    <h5 className="font-medium text-sm truncate">{message.title}</h5>
                  </div>
                  <div className="text-xs mt-1 text-muted-foreground capitalize">{formatNotificationDate(message.createdAt)}</div>
                  <div className="text-xs mt-1 text-muted-foreground mb-3">From: {message.createdByNavigation?.fullName || "N/A"}</div>

                  <div
                    className="text-xs line-clamp-2 mt-1"
                    dangerouslySetInnerHTML={{
                      __html: message.content.replace(/<\/?[^>]+(>|$)/g, " "),
                    }}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="p-2 border-t">
          <Link to="/notification/private" className="block text-center text-sm text-primary hover:underline">
            View all messages
          </Link>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
