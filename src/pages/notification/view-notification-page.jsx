import { useContext, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, CheckCheck, User, Users } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { GetMyNotification } from "@/services/notificationService";
import { format, formatDistanceToNow, isBefore, subWeeks } from "date-fns";
import { NotificationContext } from "@/services/NotificationContext";
import { useStore } from "@/services/StoreContext";
import { Helmet } from "react-helmet-async";

const GLOBAL_NAME = import.meta.env.VITE_GLOBAL_NAME;

export default function NotificationPage() {
  const { tab = "common", notificationId } = useParams();
  const navigate = useNavigate();
  const { state } = useStore();

  const [activeTab, setActiveTab] = useState(tab);
  const [notifications, setNotifications] = useState({ common: [], private: [] });
  const [selectedNotification, setSelectedNotification] = useState(null);
  const { readStatus, markAsRead, markAllAsRead } = useContext(NotificationContext);
  const { role } = state;

  //check tab
  useEffect(() => {
    if (!["common", "private"].includes(tab)) {
      navigate("/notification/common", { replace: true });
    }
    setActiveTab(tab);
  }, [tab, navigate]);

  //fetch Notification
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await GetMyNotification();
        if (response.status === 200) {
          const sortedData = {
            common: response.data.common.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
            private: response.data.private.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
          };
          setNotifications(sortedData);

          // Chọn thông báo theo notificationId trên URL
          const allNotifications = [...sortedData.common, ...sortedData.private];
          const foundNotification = allNotifications.find((n) => n.notificationId === notificationId);
          setSelectedNotification(foundNotification || sortedData[tab][0]);
        }
      } catch (error) {
        console.error("failed to fetch notification: ", error);
      }
    };
    fetchData();
  }, [notificationId, tab]);

  //format date
  const formatNotificationDate = (isoDate) => {
    const date = new Date(isoDate);
    if (isBefore(date, subWeeks(new Date(), 1))) {
      return format(date, "dd/MM/yyyy");
    }
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Change active tab and update URL
  const changeTab = (newTab) => {
    setActiveTab(newTab);
  };

  // Handle selecting a notification and update URL
  const handleSelectNotification = (notification) => {
    setSelectedNotification(notification);
    navigate(`/notification/${activeTab}/${notification.notificationId}`);
  };

  // Check if a notification is read
  const isRead = (notificationId) => {
    return readStatus[notificationId] === true;
  };

  // Get unread count for a category
  const getUnreadCount = (category) => {
    if (!notifications[category] || !readStatus) return 0;
    return notifications[category].filter((n) => !isRead(n.notificationId)).length;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        {role.toLowerCase() !== "student" && (
          <Button asChild>
            <Link to="/notification/add">Add Notification</Link>
          </Button>
        )}
      </div>

      <Helmet>
        <title>{GLOBAL_NAME} - Notification</title>
        <meta name="description" content={`${GLOBAL_NAME} - Online Teaching Center.`} />
      </Helmet>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Notification List Column */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-end mb-2 space-x-2">
                <Button variant="outline" size="sm" onClick={() => markAllAsRead(activeTab, notifications)} disabled={getUnreadCount(activeTab) === 0}>
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Mark all as read
                </Button>
              </div>

              <Tabs value={activeTab} onValueChange={changeTab}>
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
                    {notifications != null &&
                      notifications[activeTab].map((notification) => (
                        <div
                          key={notification.notificationId}
                          className={`p-3 mb-2 rounded-md cursor-pointer flex items-start ${selectedNotification?.notificationId === notification.notificationId ? "bg-muted" : "hover:bg-muted/50"} ${
                            !isRead(notification.notificationId) ? "border-l-4 border-primary" : ""
                          }`}
                          onClick={() => handleSelectNotification(notification)}
                        >
                          {notification.type === 1 ? (
                            <Users className={`h-5 w-5 mr-2 mt-1 ${!isRead(notification.notificationId) ? "text-primary" : "text-muted-foreground"}`} />
                          ) : (
                            <Bell className={`h-5 w-5 mr-2 mt-1 ${!isRead(notification.notificationId) ? "text-primary" : "text-muted-foreground"}`} />
                          )}
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h3 className={`font-medium ${!notification.read ? "font-semibold" : ""} line-clamp-2 mb-4`}>{notification.title}</h3>
                              {!isRead(notification.notificationId) && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.notificationId);
                                  }}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-xs text-muted-foreground capitalize">{formatNotificationDate(notification.createdAt)}</p>
                              <p className="text-xs text-muted-foreground">By: {notification.createdByNavigation?.fullName || "N/A"}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="private" className="m-0">
                  <ScrollArea className="h-[350px]">
                    {notifications != null &&
                      notifications[activeTab].map((notification) => (
                        <div
                          key={notification.notificationId}
                          className={`p-3 mb-2 rounded-md cursor-pointer flex items-start ${selectedNotification?.notificationId === notification.notificationId ? "bg-muted" : "hover:bg-muted/50"} ${
                            !isRead(notification.notificationId) ? "border-l-4 border-primary" : ""
                          }`}
                          onClick={() => handleSelectNotification(notification)}
                        >
                          <User className={`h-5 w-5 mr-2 mt-1 ${!isRead(notification.notificationId) ? "text-primary" : "text-muted-foreground"}`} />
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h3 className={`font-medium ${!notification.read ? "font-semibold" : ""} line-clamp-2`}>{notification.title}</h3>
                              {!isRead(notification.notificationId) && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.notificationId);
                                  }}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-xs text-muted-foreground capitalize">{formatNotificationDate(notification.createdAt)}</p>
                              <p className="text-xs text-muted-foreground">By: {notification.createdByNavigation?.fullName || "N/A"}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </ScrollArea>
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
                  <div className="flex justify-between items-start mb-1">
                    <h2 className="text-2xl font-bold">{selectedNotification.title}</h2>
                    <Badge variant={isRead(selectedNotification.notificationId) ? "outline" : "default"}>{isRead(selectedNotification.notificationId) ? "Read" : "Unread"}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground capitalize mb-10">{formatNotificationDate(selectedNotification.createdAt)}</p>
                  {/* <p className="text-sm text-muted-foreground mb-4">Created by: {selectedNotification.createdByNavigation?.fullName || "N/A"}</p> */}
                  <div className="prose max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: selectedNotification.content }} />
                  {!isRead(selectedNotification.notificationId) && (
                    <div className="mt-6 flex justify-end">
                      <Button onClick={() => markAsRead(selectedNotification.notificationId)}>
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
