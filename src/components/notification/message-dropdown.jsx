import { formatDistanceToNow } from "date-fns";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

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

export function MessageDropdown() {
  const [messages, setMessages] = useState(initialMessages);
  const location = useLocation();
  const pathname = location.pathname;

  // Get the 5 most recent messages
  const recentMessages = messages.slice(0, 5);

  // Unread
  const unreadMessagesCount = messages.filter((m) => !m.read).length;

  return (
    <HoverCard openDelay={100} closeDelay={200}>
      <HoverCardTrigger asChild>
        <Button variant="ghost" size="icon" className={cn( 'relative',pathname === "/messages" && "bg-accent")}>
          <Mail className="h-5 w-5" />
          {unreadMessagesCount > 0 && <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-green-500">{unreadMessagesCount}</Badge>}
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-0" align="end">
        <div className="p-2 border-b">
          <h4 className="font-medium">Recent Messages</h4>
          <p className="text-xs text-muted-foreground">{unreadMessagesCount} unread messages</p>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {recentMessages.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No messages</div>
          ) : (
            <div className="divide-y">
              {recentMessages.map((message) => (
                <Link key={message.id} href={`/messages?id=${message.id}`} className={cn("block p-3 hover:bg-accent/50 transition-colors", !message.read && "bg-accent/20")}>
                  <div className="flex justify-between items-start">
                    <h5 className="font-medium text-sm truncate">{message.subject}</h5>
                    <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}</span>
                  </div>
                  <div className="text-xs mt-1">From: {message.sender}</div>
                  <div
                    className="text-xs text-muted-foreground line-clamp-2 mt-1"
                    dangerouslySetInnerHTML={{
                      __html: message.content.replace(/<\/?[^>]+(>|$)/g, " "),
                    }}
                  />
                  <div className="text-xs mt-1">By: {message.createdBy}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="p-2 border-t">
          <Link to="/messages" className="block text-center text-sm text-primary hover:underline">
            View all messages
          </Link>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
