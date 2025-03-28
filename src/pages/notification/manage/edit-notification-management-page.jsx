import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { GetNotificationById, UpdateNotification } from "@/services/notificationService";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { RichTextEditor } from "../rich-text-editor";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import NewRichTextEditor from "../enhanced-rich-text-editor";

export default function EditNotificationManagementPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  //fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await GetNotificationById(id);

        if (response.status === 200) {
          setNotification(response.data);
          setTitle(response.data.title);
          setContent(response.data.content);
          setIsLoading(false);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [id]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!content.trim()) {
      newErrors.content = "Content is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length !== 0) {
      toast.warning("Please Fill All Required Field");
    }

    let notificationData = {
      notificationId: notification.notificationId,
      title,
      content,
    };

    console.log("Notification data:", notificationData);
    try {
      const response = await UpdateNotification(notificationData);
      console.log(response);

      if (response.status === 200) {
        toast.success("Notification Created Successfully!");
        navigate("/notification/list");
      }
    } catch (error) {
      toast.error(error);
    }
  };

  const getNotificationType = (type) => {
    if (type === null || type === undefined) return "Unknown";
    switch (type) {
      case 0:
        return "All";
      case 1:
        return "Specific Role";
      default:
        return "Messages";
    }
  };

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Notification</h1>
        <Button variant="outline" asChild>
          <Link to="/notification/list">Back to Notifications</Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Create New Notification</CardTitle>
            <CardDescription>Fill in the details below to create a new notification.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Notification Type */}
            <div className="space-y-2">
              <Label htmlFor="notification-type">Notification Type</Label>
              <Input id="title" value={getNotificationType(notification?.type)} disabled />
            </div>

            {/* Notification Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter notification title" required />
            </div>

            {/* Notification Content */}
            <div className="space-y-2">
              <Label htmlFor="content" className="flex items-center justify-between w-full">
                <span className={errors.content && "text-red-500"}>Content</span>
                {errors.content && <p className="text-red-500 text-xs">( {errors.content} )</p>}
              </Label>
              <NewRichTextEditor value={content} onChange={setContent} placeholder="Enter notification content (supports rich text formatting)" minHeight="250" />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit">Update Notification</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
