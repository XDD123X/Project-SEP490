import { useEffect, useState } from "react";
import { useMessages } from "@/hooks/use-messages";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { MessageListItem } from "@/components/message-list-item";
import { MessageDetail } from "@/components/message-detail";
import { Pagination } from "@/components/pagination";
import { useSearchParams } from "react-router-dom";

const initialMessages = [
  {
    id: "1",
    sender: "System Admin",
    subject: "Welcome Message",
    content: "<p>Hello and welcome to our <strong>messaging system</strong>! Feel free to explore all the features.</p>",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    createdBy: "System",
    read: false,
  },
  {
    id: "2",
    sender: "Support Team",
    subject: "Your Recent Inquiry",
    content:
      "<p>Thank you for contacting us. We've received your inquiry and will get back to you shortly.</p><p>In the meantime, you might find these <em>resources</em> helpful:</p><ul><li>FAQ section</li><li>User guides</li><li>Video tutorials</li></ul>",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    createdBy: "Support",
    read: false,
  },
  {
    id: "3",
    sender: "Marketing",
    subject: "Special Offer Inside",
    content: "<p>We're excited to share our latest promotion with you!</p><p>Use code <strong>SPECIAL10</strong> for 10% off your next purchase.</p>",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    createdBy: "Marketing Team",
    read: false,
  },
  {
    id: "4",
    sender: "HR Department",
    subject: "Company Policy Updates",
    content: "<p>Please review the updated company policies that will take effect next month.</p><p>The main changes include:</p><ul><li>Remote work guidelines</li><li>Expense reimbursement process</li><li>Annual leave requests</li></ul>",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    createdBy: "HR",
    read: false,
  },
  {
    id: "5",
    sender: "IT Department",
    subject: "Password Expiration Notice",
    content: "<p>Your current password will expire in 7 days.</p><p>Please update your password to maintain access to your account.</p>",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    createdBy: "IT Security",
    read: false,
  },
  {
    id: "6",
    sender: "Events Team",
    subject: "Upcoming Webinar Invitation",
    content: "<p>You're invited to our upcoming webinar on 'Digital Transformation Strategies'.</p><p>Date: Next Thursday at 2 PM</p><p>Click here to register and save your spot!</p>",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    createdBy: "Events",
    read: false,
  },
];

export default function ViewMessagePage() {
  const [messages, setMessages] = useState(initialMessages);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { searchParams } = useSearchParams();

  //unread
  const unreadMessagesCount = messages.filter((m) => !m.read).length;

  //handle markAsRead
  const markAsRead = (id) => {};
  //handle markAllAsRead
  const markAllAsRead = () => {};

  // Get the message ID from the URL if present
  useEffect(() => {
    const idFromUrl = searchParams.get("id");
    if (idFromUrl && messages.some((m) => m.id === idFromUrl)) {
      setSelectedMessageId(idFromUrl);
      markAsRead(idFromUrl);
    } else if (messages.length > 0 && !selectedMessageId) {
      setSelectedMessageId(messages[0].id);
    }
  }, [searchParams, messages, selectedMessageId, markAsRead]);

  const handleMessageClick = (id) => {
    markAsRead(id);
    setSelectedMessageId(id);

    // Update URL without full page reload
    const url = new URL(window.location.href);
    url.searchParams.set("id", id);
    window.history.pushState({}, "", url);
  };

  const selectedMessage = messages.find((m) => m.id === selectedMessageId);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = messages.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(messages.length / itemsPerPage);

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
        <h1 className="text-2xl font-bold">Messages</h1>
        {unreadMessagesCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            Mark all as read
          </Button>
        )}
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Mail className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">No messages</h2>
          <p className="text-muted-foreground">Your inbox is empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column - Message list */}
          <div className="border rounded-lg overflow-hidden">
            <div className="h-[calc(100vh-220px)] overflow-y-auto">
              {currentItems.map((message) => (
                <MessageListItem key={message.id} message={message} isSelected={message.id === selectedMessageId} onClick={() => handleMessageClick(message.id)} />
              ))}
            </div>
            {messages.length > itemsPerPage && (
              <div className="border-t p-2">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} itemsPerPage={itemsPerPage} onItemsPerPageChange={handleItemsPerPageChange} />
              </div>
            )}
          </div>

          {/* Right column - Message detail */}
          <div className="h-[calc(100vh-220px)] overflow-y-auto">
            {selectedMessage ? (
              <MessageDetail message={selectedMessage} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-muted-foreground">Select a message to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
