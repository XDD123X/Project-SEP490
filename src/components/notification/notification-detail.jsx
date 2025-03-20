import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextViewer } from "./rich-text-viewer";

export function NotificationDetail({ notification }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{notification.title}</CardTitle>
        <CardDescription className="flex flex-col sm:flex-row sm:justify-between">
          <span>By: {notification.createdBy}</span>
          <span>{format(new Date(notification.timestamp), "PPP p")}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RichTextViewer content={notification.content} />
      </CardContent>
    </Card>
  );
}
