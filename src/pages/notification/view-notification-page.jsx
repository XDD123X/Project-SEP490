import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { NotificationListItem } from "@/components/notification/notification-list-item";
import { NotificationDetail } from "@/components/notification/notification-detail";
import { NotificationPagination } from "@/components/notification/notification-pagination";
import { useSearchParams } from "react-router-dom";

const initialNotifications = [
  {
    id: "1",
    title: "Welcome to the platform",
    content: "<h1>What’s a Rich Text element H1?</h1><h2>What’s a Rich Text element H2?</h2><h3>What’s a Rich Text element H3?</h3><h4>What’s a Rich Text element H4?</h4><h5>What’s a Rich Text element H5?</h5><h6>What’s a Rich Text element H6?</h6><p>The rich text element allows you to create and format headings, paragraphs, blockquotes, images, and video all in one place instead of having to add and format them individually. Just double-click and easily create content.</p><blockquote>Quote A rich text element can be used with static or dynamic content. For static content, just drop it into any page and begin editing. For dynamic content, add a rich text field to any collection and then connect a rich text element to that field in the settings panel. Voila!</blockquote><h4>How to customize formatting for each rich text</h4><p>Headings, paragraphs, blockquotes, figures,&nbsp;<a href=`procyrion.com` target=`_blank/`>images</a>, and figure captions can all be styled after a class is added to the rich text element using the `When inside of` nested selector system.</p><blockquote>Quote A rich text element can be used with static or dynamic content. For static content, just drop it into any page and begin editing. For dynamic content, add a rich text field to any collection and then connect a rich text element to that field in the settings panel. Voila!</blockquote><p><br></p>",
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
  {
    id: "7",
    title: "IELTS Mock Test Registration Open",
    content: "<p>Our <strong>IELTS mock test</strong> registration is now open! Test your skills under real exam conditions.</p><p>Sign up before <em>Friday</em> to secure your spot.</p>",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    createdBy: "Academic Team",
    read: false,
  },
  {
    id: "8",
    title: "SAT Writing Workshop",
    content: "<p>Join our expert-led <strong>SAT Writing Workshop</strong> this Saturday.</p><p>Learn strategies to improve your essay scores.</p>",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    createdBy: "Training Department",
    read: false,
  },
  {
    id: "9",
    title: "New Speaking Practice Sessions",
    content: "<p>We have added <em>extra speaking practice sessions</em> this week!</p><p>Book your slot now to practice with our tutors.</p>",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    createdBy: "Student Support",
    read: false,
  },
  {
    id: "10",
    title: "IELTS Writing Tips: Task 2",
    content: "<p>Check out our latest guide on <strong>how to write high-scoring IELTS essays</strong> for Task 2.</p><p>Includes sample essays and key strategies.</p>",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    createdBy: "IELTS Instructor",
    read: false,
  },
  {
    id: "11",
    title: "SAT Vocabulary Challenge",
    content: "<p>Want to boost your <strong>SAT Reading score</strong>? Join our weekly SAT vocabulary challenge!</p><p>Test your knowledge and win prizes.</p>",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    createdBy: "SAT Coach",
    read: false,
  },
  {
    id: "12",
    title: "Exclusive IELTS Listening Tips",
    content: "<p>Improve your listening score with our latest <strong>IELTS Listening Guide</strong>.</p><p>Includes top mistakes and how to avoid them.</p>",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(),
    createdBy: "Listening Trainer",
    read: false,
  },
  {
    id: "13",
    title: "New Study Materials Available",
    content: "<p>We've added <strong>new SAT and IELTS study resources</strong> to the learning portal.</p><p>Log in to access exclusive practice tests and lessons.</p>",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 60).toISOString(),
    createdBy: "Academic Support",
    read: false,
  },
  {
    id: "14",
    title: "One-on-One IELTS Speaking Coaching",
    content: "<p>Need personalized coaching? Book a <strong>one-on-one speaking session</strong> with our IELTS experts.</p><p>Limited slots available!</p>",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    createdBy: "Speaking Coach",
    read: false,
  },
  {
    id: "15",
    title: "Free SAT Diagnostic Test",
    content: "<p>Not sure where you stand? Take our <strong>free SAT diagnostic test</strong> to assess your skills.</p><p>Find out your strengths and weaknesses.</p>",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 84).toISOString(),
    createdBy: "SAT Test Prep Team",
    read: false,
  },
  {
    id: "16",
    title: "Upcoming IELTS Bootcamp",
    content: "<p>Our <strong>intensive IELTS Bootcamp</strong> starts next month!</p><p>Register now to get structured training from our top instructors.</p>",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    createdBy: "Bootcamp Coordinator",
    read: false,
  },
  {
    id: "17",
    title: "Scholarship Opportunities",
    content: "<p>We are offering <strong>exclusive scholarships</strong> for top-performing IELTS and SAT students!</p><p>Apply now and reduce your tuition fees.</p>",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 108).toISOString(),
    createdBy: "Admin Team",
    read: false,
  },
  {
    id: "18",
    title: "Practice Test Updates",
    content: "<p>We've updated our <strong>IELTS & SAT practice tests</strong> with new questions.</p><p>Log in now and try them out.</p>",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    createdBy: "Test Prep Center",
    read: false,
  },
  {
    id: "19",
    title: "Exclusive Webinar: Mastering IELTS Writing",
    content: "<p>Join our free <strong>IELTS Writing Webinar</strong> this Sunday.</p><p>Learn key techniques from our expert tutors.</p>",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 132).toISOString(),
    createdBy: "Webinar Team",
    read: false,
  },
  {
    id: "20",
    title: "New Batch Enrollment Open",
    content: "<p>Enrollment is now open for our <strong>new IELTS & SAT training batches</strong>.</p><p>Secure your seat now before spots fill up!</p>",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 144).toISOString(),
    createdBy: "Admissions Office",
    read: false,
  },
  {
    id: "21",
    title: "Daily Practice Questions Available",
    content: "<p>Don't forget to check our <strong>daily SAT & IELTS practice questions</strong> in the learning portal.</p><p>Consistent practice leads to better scores!</p>",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 156).toISOString(),
    createdBy: "Study Coach",
    read: false,
  },
];

export default function ViewNotificationPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
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
