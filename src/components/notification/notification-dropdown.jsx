import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const initialNotifications = [
  {
    id: "1",
    title: "Welcome to the platform",
    content: "<p>Welcome to our <strong>notification system</strong>! We're glad to have you here.</p>",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    createdBy: "System Admin",
    read: false,
  },
  {
    id: "2",
    title: "New feature available",
    content: "<p>We've just released a <em>new feature</em> that allows you to:</p><ul><li>Create rich text notifications</li><li>Track read/unread status</li><li>View on mobile and desktop</li></ul>",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    createdBy: "Product Team",
    read: false,
  },
  {
    id: "3",
    title: "Your account has been updated",
    content: "<p>Your account settings have been updated successfully.</p><p>If you didn't make these changes, please contact support.</p>",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    createdBy: "Account Management",
    read: false,
  },
  {
    id: "4",
    title: "Security alert",
    content: "<p>We noticed a login from a new device. If this was you, you can ignore this message.</p><p>If not, please change your password immediately.</p>",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    createdBy: "Security Team",
    read: false,
  },
  {
    id: "5",
    title: "Weekly summary",
    content: "<p>Here's your weekly activity summary:</p><ul><li>3 new messages received</li><li>2 tasks completed</li><li>1 new connection made</li></ul>",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    createdBy: "Analytics",
    read: false,
  },
  {
    id: "6",
    title: "Upcoming maintenance",
    content: "<p>We'll be performing scheduled maintenance this weekend. The system may be unavailable for a short period.</p><p>We apologize for any inconvenience.</p>",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    createdBy: "Operations Team",
    read: false,
  },
];

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const location = useLocation();
  const pathname = location.pathname;

  // Get the 5 most recent notifications
  const recentNotifications = notifications.slice(0, 5);

  // Unread
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <HoverCard openDelay={100} closeDelay={200}>
      <HoverCardTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("relative", pathname === "/notifications" && "bg-accent")}>
          <Bell className="h-5 w-5" />
          {unreadNotificationsCount > 0 && <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">{unreadNotificationsCount}</Badge>}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-0" align="end">
        <div className="p-2 border-b">
          <h4 className="font-medium">Recent Notifications</h4>
          <p className="text-xs text-muted-foreground">{unreadNotificationsCount} unread notifications</p>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {recentNotifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
          ) : (
            <div className="divide-y">
              {recentNotifications.map((notification) => (
                <Link key={notification.id} href={`/notifications?id=${notification.id}`} className={cn("block p-3 hover:bg-accent/50 transition-colors", !notification.read && "bg-accent/20")}>
                  <div className="flex justify-between items-start">
                    <h5 className="font-medium text-sm truncate">{notification.title}</h5>
                    <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}</span>
                  </div>
                  <div
                    className="text-xs text-muted-foreground line-clamp-2 mt-1"
                    dangerouslySetInnerHTML={{
                      __html: notification.content.replace(/<\/?[^>]+(>|$)/g, " "),
                    }}
                  />
                  <div className="text-xs mt-1">By: {notification.createdBy}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="p-2 border-t">
          <Link to="/notifications" className="block text-center text-sm text-primary hover:underline">
            View all notifications
          </Link>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
