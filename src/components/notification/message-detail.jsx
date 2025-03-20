import { format } from "date-fns"
import { RichTextViewer } from "@/components/rich-text-viewer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"


export function MessageDetail({ message }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{message.subject}</CardTitle>
        <CardDescription className="flex flex-col sm:flex-row sm:justify-between gap-1">
          <div>
            <span>From: {message.sender}</span>
            <span className="mx-2">•</span>
            <span>By: {message.createdBy}</span>
          </div>
          <span>{format(new Date(message.timestamp), "PPP p")}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RichTextViewer content={message.content} />
      </CardContent>
    </Card>
  )
}

