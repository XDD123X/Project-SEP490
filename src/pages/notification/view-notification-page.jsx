import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { NotificationListItem } from "@/components/notification/notification-list-item";
import { NotificationDetail } from "@/components/notification/notification-detail";
import { NotificationPagination } from "@/components/notification/notification-pagination";
import { useSearchParams } from "react-router-dom";

function initNotifications() {
  return [
    {
      id: 1,
      title: "🚀 Introducing Dark Mode!",
      content: `
        <h2>New Feature: Dark Mode</h2><p>Now available in <a href="/settings" style="color:blue;">Settings</a>. Experience a <b>sleek new design</b> that is easy on your eyes.</p><blockquote>“Dark mode reduces eye strain and improves focus.” - UI Experts</blockquote><img src="https://dummyimage.com/600x300" alt="Dark Mode Preview" style="max-width:100%; border-radius:10px;"/>
      `,
      timestamp: new Date(2024, 2, 10, 14, 30).toISOString(),
      createdBy: "System",
      read: false,
    },
    {
      id: 2,
      title: "📹 How to Use Our Platform - Video Guide",
      content: `<h3>Watch our tutorial</h3><p>Learn the basics of our platform in this quick video.</p><iframe width="560" height="315" src="https://www.youtube.com/watch?v=RF7Nc5ZCOoA" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      `,
      timestamp: new Date(2024, 2, 12, 9, 0).toISOString(),
      createdBy: "Support Team",
      read: false,
    },
    {
      id: 3,
      title: "📍 Check Out Our New Location!",
      content: `<h4>We’ve moved to a new office</h4><p>Visit us at our new headquarters.</p><iframe width="600" height="450" style="border:0" loading="lazy" allowfullscreensrc="https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API&q=Googleplex,Mountain+View,CA"></iframe>
      `,
      timestamp: new Date(2024, 2, 8, 16, 45).toISOString(),
      createdBy: "Admin Team",
      read: true,
    },
    {
      id: 4,
      title: "🛠️ New Development Tips",
      content: `<h5>Writing Efficient JavaScript</h5><p>Optimize your code with best practices:</p><ul>  <li>Use <code>const</code> and <code>let</code> instead of <code>var</code>.</li>  <li>Avoid synchronous requests in loops.</li>  <li>Leverage <b>ES6 features</b> for cleaner code.</li></ul><pre><code class="language-js">console.log("Hello, optimized world!");</code></pre>
      `,
      timestamp: new Date(2024, 2, 5, 10, 15).toISOString(),
      createdBy: "Developer Team",
      read: true,
    },
    {
      id: 5,
      title: "🎶 Featured Audio - SoundCloud",
      content: `<h6>Listen to this week’s top track</h6><p>Enjoy our latest music recommendations.</p><iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay"src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/873409793"></iframe>
      `,
      timestamp: new Date(2024, 2, 3, 18, 20).toISOString(),
      createdBy: "Music Team",
      read: false,
    },
  ];
}

export default function ViewNotificationPage() {
  const [notifications, setNotifications] = useState(initNotifications);
  const [selectedNotificationId, setSelectedNotificationId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchParams] = useSearchParams();

  //unread
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  //handle markAsRead
  const markAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };
  //handle markAllAsRead
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Get the notification ID from the URL if present
  useEffect(() => {
    const idFromUrl = searchParams.get("id");
    if (idFromUrl && notifications.some((n) => n.id === idFromUrl)) {
      setSelectedNotificationId(idFromUrl);
      markAsRead(idFromUrl);
    } else if (!selectedNotificationId && notifications.length > 0) {
      setSelectedNotificationId(notifications[0].id);
    }
  }, []);

  const handleNotificationClick = (id) => {
    if (selectedNotificationId !== id) {
      setSelectedNotificationId(id);
    }
    markAsRead(id);

    // Cập nhật URL mà không reload trang
    const url = new URL(window.location.href);
    url.searchParams.set("id", id);
    window.history.pushState({}, "", url);
  };

  const selectedNotification = notifications.find((n) => n.id === selectedNotificationId);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = notifications.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(notifications.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unreadNotificationsCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Bell className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">No notifications</h2>
          <p className="text-muted-foreground">You don't have any notifications yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column - Notification list */}
          <div className="border rounded-lg overflow-hidden">
            <div className="h-[calc(100vh-220px)] overflow-y-auto">
              {currentItems.map((notification) => (
                <NotificationListItem key={notification.id} notification={notification} isSelected={notification.id === selectedNotificationId} onClick={() => handleNotificationClick(notification.id)} />
              ))}
            </div>
            {notifications.length > itemsPerPage && (
              <div className="border-t p-2">
                <NotificationPagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} itemsPerPage={itemsPerPage} onItemsPerPageChange={handleItemsPerPageChange} />
              </div>
            )}
          </div>

          {/* Right column - Notification detail */}
          <div className="h-[calc(100vh-220px)] overflow-y-auto">
            {selectedNotification ? (
              <NotificationDetail notification={selectedNotification} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-muted-foreground">Select a notification to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
