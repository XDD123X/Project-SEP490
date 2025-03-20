import React from "react";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import RichTextEditor from "@/components/notification/rich-text-editor";

export default function AddNotificationPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("<p>Write your notification content here...</p>");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a title for your notification");
      return;
    }

    if (content === "<p>Write your notification content here...</p>" || content === "<p></p>") {
      toast.error("Please enter content for your notification");
      return;
    }

    setIsSubmitting(true);

    // Add the new notification
    // addNotification({
    //   title,
    //   content,
    // });

    // Show success toast
    toast.success("Notification created successfully");

    // Reset form and redirect
    setTitle("");
    setContent("<p>Write your notification content here...</p>");
    setIsSubmitting(false);

    //navigate
    // navigate("/notifications");
  };

  return (
    <div className="container py-6">
      <Card className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Create Notification</CardTitle>
            <CardDescription>Create a new notification with rich text formatting.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Notification title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <div className="min-h-[200px] border rounded-md">
                <RichTextEditor content={content} onChange={setContent} />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate("/notifications")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Notification"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
