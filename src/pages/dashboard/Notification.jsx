"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTheme } from "next-themes";

const notifications = [
  {
    id: 1,
    title: "🚀 New Interface Update",
    content:
      "**We have upgraded the system interface with several improvements:**\n\n- 🔹 **Optimized performance:** Pages load 30% faster\n- 🌙 **Dark Mode Support:** Protect your eyes when working at night\n- 🔄 **Intuitive Navigation:** Easier and smoother user experience\n\n💡 *Try it now and share your feedback with us!*",
    date: "25/02/2025",
    user: "Nguyễn Văn A",
  },
  {
    id: 2,
    title: "⚠️ System Maintenance Notice",
    content:
      "💡 **Our system will undergo maintenance to enhance performance and security.**\n\n📅 **Maintenance Schedule:**\n- ⏳ **Start Time:** 11:00 PM, *February 28, 2025*\n- ⏳ **End Time:** 03:00 AM, *February 29, 2025*\n\n🚧 Some services may be interrupted during this period. We appreciate your patience and understanding!",
    date: "27/02/2025",
    user: "Trần Minh Khoa",
  },
  {
    id: 3,
    title: "📊 Customer Feedback Survey",
    content:
      "**We would love to hear your thoughts to improve our service quality.**\n\n🗓 **Survey Duration:** *March 1 - March 15, 2025*\n\n🎁 **Rewards:** *5 gift packages worth 500,000 VND for participants*\n\n🔗 **Please check your email for the survey link.**\n\nThank you for your support!",
    date: "28/02/2025",
    user: "Lê Thị Hạnh",
  },
  {
    id: 4,
    title: "🎉 Special March Promotion",
    content: "✨ **This March, we are offering a special promotion:**\n\n💰 **Get 20% off** when you subscribe to our services in March.\n📌 *Applicable to both new and renewing customers.*\n\n🔥 **Don't miss this great opportunity!**",
    date: "01/03/2025",
    user: "Phạm Quốc Bảo",
  },
  {
    id: 5,
    title: "🎓 Launching Online Learning Feature",
    content:
      "👨‍🏫 **You can now join online courses directly on our platform.**\n\n**🎯 Benefits:**\n1️⃣ **Flexible learning schedules**\n2️⃣ **Learn anytime, anywhere**\n3️⃣ **Receive certification upon course completion**\n\n📚 *Don't miss the chance to enhance your knowledge!*",
    date: "05/03/2025",
    user: "Đỗ Thanh Tú",
  },
  {
    id: 6,
    title: "💼 Hiring New Talent",
    content: "🌟 **We are expanding our team and looking for talented candidates.**\n\n💼 **Open Positions:**\n- 🖥 **ReactJS Developer**\n- 📞 **Customer Support Specialist**\n\n📩 *Interested? Submit your CV today!*",
    date: "07/03/2025",
    user: "Ngô Hải Nam",
  },
  {
    id: 7,
    title: "🔒 Important Security Alert",
    content:
      "**We have identified potential security risks.**\n\n🚨 **To protect your account, please take the following actions immediately:**\n\n1️⃣ **Change your password today** 🔑\n2️⃣ **Enable two-factor authentication (2FA)** 🔐\n3️⃣ **Do not share your login credentials** 🚫\n\n⚠️ *Act now to safeguard your data!*",
    date: "10/03/2025",
    user: "Trương Hoàng Duy",
  },
  {
    id: 8,
    title: "🎤 Invitation to Online Seminar",
    content: "📢 **Join our upcoming seminar on AI technology!**\n\n🕒 **Time:** *2:00 PM - 4:00 PM, March 15, 2025*\n🎙 **Speakers:** *Experts from Google and Microsoft*\n\n🔗 *Register now and don't miss this learning opportunity!*",
    date: "21/03/2025",
    user: "Vũ Thị Lan",
  },
];

function NotificationSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-4 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
      <div className="flex justify-end">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      </div>
    </div>
  );
}

function NotificationItem({ notification, onReadMore }) {
  return (
    <div className="bg-white dark:bg-zinc-900 shadow-md rounded-lg p-6 mb-4">
      <h2 className="text-xl font-semibold mb-1 text-gray-900 dark:text-gray-100">{notification.title}</h2>
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        <div>
          Date: <span className="font-bold">{notification.date}</span>
        </div>
        <div>
          Created By: <span className="font-bold">{notification.user}</span>
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        <ReactMarkdown>{notification.content.split("\n")[0].substring(0, 200)}</ReactMarkdown>
        <span>...</span>
      </p>
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => onReadMore(notification)}>
          Read more...
        </Button>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const ITEMS_PER_PAGE = 3;
  const totalPages = Math.ceil(notifications.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentNotifications = notifications.slice(startIndex, endIndex);

  const handleReadMore = (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  const sortedData = notifications.sort((a, b) => b.date.split("/").reverse().join("-").localeCompare(a.date.split("/").reverse().join("-")));

  return (
    <div className={`flex min-h-screen w-full flex-col ${theme === "dark" ? "dark" : ""}`}>
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      <div className="flex justify-between items-center mb-4">
        <Button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </Button>
      </div>
      <div className="space-y-4 mb-6">
        {loading ? Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => <NotificationSkeleton key={index} />) : currentNotifications.map((sortedData) => <NotificationItem key={sortedData.id} notification={sortedData} onReadMore={handleReadMore} />)}
      </div>

      <NotificationModal notification={selectedNotification} isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}

function NotificationModal({ notification, isOpen, onClose }) {
  if (!notification) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className=" rounded-sm max-w-[90vw] sm:max-w-[600px] mx-auto max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{notification.title}</DialogTitle>
          <DialogDescription>
            {notification.date} • {notification.user}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <div className="prose">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <div className="indent-6 text-gray-800 dark:text-gray-200">{children}</div>,
                strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                ol: ({ children }) => <ol className="list-decimal pl-6">{children}</ol>,
                ul: ({ children }) => <ul className="list-disc pl-6">{children}</ul>,
              }}
            >
              {notification.content}
            </ReactMarkdown>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
