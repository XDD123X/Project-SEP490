import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, CheckCheck, ChevronLeft, ChevronRight, User, Users } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Link } from "react-router-dom";

// Mock data for notifications
const mockNotifications = {
  common: [
    {
      id: 1,
      title: "System Maintenance",
      content: "<p>The system will be down for maintenance on <strong>Saturday, March 27th</strong> from 2:00 AM to 4:00 AM EST.</p>",
      date: "2 days ago",
      read: false,
      type: "common",
    },
    {
      id: 2,
      title: "New Feature Released",
      content: "<p>We've released a new <em>dashboard feature</em> that helps you track your progress better.</p>",
      date: "1 week ago",
      read: false,
      type: "common",
    },
    {
      id: 3,
      title: "Holiday Schedule",
      content: "<p>Please note that our offices will be closed during the upcoming holidays.</p>",
      date: "2 weeks ago",
      read: true,
      type: "common",
    },
    {
      id: 4,
      title: "Admin Training",
      content: "<p>New admin training sessions are available. Please register by <strong>Friday</strong>.</p>",
      date: "3 days ago",
      read: false,
      type: "role",
    },
    {
      id: 5,
      title: "Manager Report Due",
      content: "<p>Monthly manager reports are due by the end of this week.</p>",
      date: "5 days ago",
      read: false,
      type: "role",
    },
    {
      id: 8,
      title: "System Update",
      content: "<p>A new system update is available. Please update your application.</p>",
      date: "1 week ago",
      read: false,
      type: "common",
    },
    {
      id: 9,
      title: "Security Alert",
      content: "<p>We've detected unusual activity on your account. Please verify your recent logins.</p>",
      date: "3 days ago",
      read: false,
      type: "common",
    },
    {
      id: 10,
      title: "Team Meeting",
      content: "<p>Reminder: Team meeting scheduled for tomorrow at 10:00 AM.</p>",
      date: "1 day ago",
      read: true,
      type: "role",
    },
    {
      id: 11,
      title: "Project Deadline",
      content: "<p>The project deadline has been extended to next Friday.</p>",
      date: "4 days ago",
      read: false,
      type: "role",
    },
    {
      id: 12,
      title: "New Policy",
      content: "<p>Please review the updated company policy on remote work.</p>",
      date: "1 week ago",
      read: true,
      type: "common",
    },
  ],
  private: [
    {
      id: 6,
      title: "Your Account Status",
      content: "<p>Your account has been <strong>verified</strong>. You now have access to all features.</p>",
      date: "1 day ago",
      read: false,
    },
    {
      id: 7,
      title: "Password Reset",
      content: "<p>Your password was reset successfully.</p>",
      date: "4 days ago",
      read: true,
    },
    {
      id: 13,
      title: "Personal Message",
      content: "<p>You have a new personal message from the administrator.</p>",
      date: "2 days ago",
      read: false,
    },
    {
      id: 14,
      title: "Subscription Renewal",
      content: "<p>Your subscription will renew automatically in 7 days.</p>",
      date: "1 week ago",
      read: false,
    },
    {
      id: 15,
      title: "Document Approval",
      content: "<p>Your submitted document has been approved.</p>",
      date: "3 days ago",
      read: true,
    },
    {
      id: 16,
      title: "Profile Update",
      content: "<p>Please update your profile information.</p>",
      date: "5 days ago",
      read: false,
    },
  ],
};

export default function NotificationPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [activeTab, setActiveTab] = useState("common");
  const [selectedNotification, setSelectedNotification] = useState(mockNotifications.common[0]);
  const [notifications, setNotifications] = useState(mockNotifications);

  // Load read status from localStorage on component mount
  useState(() => {
    const savedReadStatus = localStorage.getItem("notificationReadStatus");
    if (savedReadStatus) {
      const parsedStatus = JSON.parse(savedReadStatus);

      // Update the read status in our notifications
      const updatedNotifications = { ...notifications };
      Object.keys(updatedNotifications).forEach((key) => {
        updatedNotifications[key] = updatedNotifications[key].map((notification) => ({
          ...notification,
          read: parsedStatus[notification.id] || notification.read,
        }));
      });

      setNotifications(updatedNotifications);
    }
  }, []);

  // Mark a notification as read
  const markAsRead = (id) => {
    const updatedNotifications = { ...notifications };

    Object.keys(updatedNotifications).forEach((key) => {
      updatedNotifications[key] = updatedNotifications[key].map((notification) => {
        if (notification.id === id) {
          return { ...notification, read: true };
        }
        return notification;
      });
    });

    setNotifications(updatedNotifications);

    // Save to localStorage
    const savedReadStatus = localStorage.getItem("notificationReadStatus") ? JSON.parse(localStorage.getItem("notificationReadStatus")) : {};

    savedReadStatus[id] = true;
    localStorage.setItem("notificationReadStatus", JSON.stringify(savedReadStatus));

    // Update selected notification if it's the one being marked
    if (selectedNotification && selectedNotification.id === id) {
      setSelectedNotification({ ...selectedNotification, read: true });
    }
  };

  // Mark all notifications in a category as read
  const markAllAsRead = (category) => {
    const updatedNotifications = { ...notifications };

    updatedNotifications[category] = updatedNotifications[category].map((notification) => ({
      ...notification,
      read: true,
    }));

    setNotifications(updatedNotifications);

    // Save to localStorage
    const savedReadStatus = localStorage.getItem("notificationReadStatus") ? JSON.parse(localStorage.getItem("notificationReadStatus")) : {};

    updatedNotifications[category].forEach((notification) => {
      savedReadStatus[notification.id] = true;
    });

    localStorage.setItem("notificationReadStatus", JSON.stringify(savedReadStatus));

    // Update selected notification if it's in the current category
    if (selectedNotification && notifications[category].some((n) => n.id === selectedNotification.id)) {
      setSelectedNotification({ ...selectedNotification, read: true });
    }
  };

  // Get unread count for a category
  const getUnreadCount = (category) => {
    return notifications[category].filter((n) => !n.read).length;
  };

  // Paginate notifications
  const paginateNotifications = (items, page, perPage) => {
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    return items.slice(startIndex, endIndex);
  };

  // Get total pages
  const getTotalPages = (items, perPage) => {
    return Math.ceil(items.length / perPage);
  };

  // Generate pagination items
  const generatePaginationItems = (totalPages, currentPage, category) => {
    const items = [];

    // Always show first page
    items.push(
      <PaginationItem key="page-1">
        <PaginationLink isActive={currentPage === 1} onClick={() => setCurrentPage(1)}>
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Show current page and surrounding pages
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue; // Skip first and last page as they're always shown
      items.push(
        <PaginationItem key={`page-${i}`}>
          <PaginationLink isActive={currentPage === i} onClick={() => setCurrentPage(i)}>
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={`page-${totalPages}`}>
          <PaginationLink isActive={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <Button asChild>
          <Link to="/notification/add">Add Notification</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Notification List Column */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-end mb-2">
                <Button variant="outline" size="sm" onClick={() => markAllAsRead(activeTab)} disabled={getUnreadCount(activeTab) === 0}>
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Mark all as read
                </Button>
              </div>

              <Tabs
                defaultValue="common"
                value={activeTab}
                onValueChange={(value) => {
                  setActiveTab(value);
                  setCurrentPage(1); // Reset to first page when switching tabs
                }}
              >
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="common" className="flex items-center justify-center">
                    Common
                    {getUnreadCount("common") > 0 && <span className="ml-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">{getUnreadCount("common")}</span>}
                  </TabsTrigger>
                  <TabsTrigger value="private" className="flex items-center justify-center">
                    Private
                    {getUnreadCount("private") > 0 && <span className="ml-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">{getUnreadCount("private")}</span>}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="common" className="m-0">
                  <ScrollArea className="h-[350px]">
                    {paginateNotifications(notifications.common, currentPage, itemsPerPage).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 mb-2 rounded-md cursor-pointer flex items-start ${selectedNotification?.id === notification.id ? "bg-muted" : "hover:bg-muted/50"} ${!notification.read ? "border-l-4 border-primary" : ""}`}
                        onClick={() => setSelectedNotification(notification)}
                      >
                        {notification.type === "role" ? (
                          <Users className={`h-5 w-5 mr-2 mt-1 ${!notification.read ? "text-primary" : "text-muted-foreground"}`} />
                        ) : (
                          <Bell className={`h-5 w-5 mr-2 mt-1 ${!notification.read ? "text-primary" : "text-muted-foreground"}`} />
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className={`font-medium ${!notification.read ? "font-semibold" : ""}`}>{notification.title}</h3>
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{notification.date}</p>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>

                  <div className="flex items-center justify-between mt-4 border-t pt-2">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="rows-per-page" className="text-xs whitespace-nowrap">
                        Rows:
                      </Label>
                      <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) => {
                          setItemsPerPage(Number(value));
                          setCurrentPage(1); // Reset to first page when changing items per page
                        }}
                      >
                        <SelectTrigger id="rows-per-page" className="h-8 w-[70px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Pagination className="justify-end">
                      <PaginationContent>
                        <PaginationItem>
                          <Button size="icon" variant="outline" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                        </PaginationItem>

                        {generatePaginationItems(getTotalPages(notifications.common, itemsPerPage), currentPage, "common")}

                        <PaginationItem>
                          <Button size="icon" variant="outline" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, getTotalPages(notifications.common, itemsPerPage)))} disabled={currentPage === getTotalPages(notifications.common, itemsPerPage)}>
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </TabsContent>

                <TabsContent value="private" className="m-0">
                  <ScrollArea className="h-[350px]">
                    {paginateNotifications(notifications.private, currentPage, itemsPerPage).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 mb-2 rounded-md cursor-pointer flex items-start ${selectedNotification?.id === notification.id ? "bg-muted" : "hover:bg-muted/50"} ${!notification.read ? "border-l-4 border-primary" : ""}`}
                        onClick={() => setSelectedNotification(notification)}
                      >
                        <User className={`h-5 w-5 mr-2 mt-1 ${!notification.read ? "text-primary" : "text-muted-foreground"}`} />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className={`font-medium ${!notification.read ? "font-semibold" : ""}`}>{notification.title}</h3>
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{notification.date}</p>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>

                  <div className="flex items-center justify-between mt-4 border-t pt-2">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="private-rows-per-page" className="text-xs whitespace-nowrap">
                        Rows:
                      </Label>
                      <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) => {
                          setItemsPerPage(Number(value));
                          setCurrentPage(1); // Reset to first page when changing items per page
                        }}
                      >
                        <SelectTrigger id="private-rows-per-page" className="h-8 w-[70px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Pagination className="justify-end">
                      <PaginationContent>
                        <PaginationItem>
                          <Button size="icon" variant="outline" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                        </PaginationItem>

                        {generatePaginationItems(getTotalPages(notifications.private, itemsPerPage), currentPage, "common")}

                        <PaginationItem>
                          <Button size="icon" variant="outline" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, getTotalPages(notifications.private, itemsPerPage)))} disabled={currentPage === getTotalPages(notifications.private, itemsPerPage)}>
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Notification Content Column */}
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardContent className="p-6">
              {selectedNotification ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{selectedNotification.title}</h2>
                    <div className="flex items-center gap-2">
                      <Badge variant={selectedNotification.read ? "outline" : "default"}>{selectedNotification.read ? "Read" : "Unread"}</Badge>
                      <p className="text-sm text-muted-foreground">{selectedNotification.date}</p>
                    </div>
                  </div>
                  <div className="prose max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: selectedNotification.content }} />
                  {!selectedNotification.read && (
                    <div className="mt-6 flex justify-end">
                      <Button onClick={() => markAsRead(selectedNotification.id)}>
                        <Check className="h-4 w-4 mr-2" />
                        Mark as read
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium">No notification selected</h3>
                  <p className="text-muted-foreground">Select a notification from the list to view its content</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
