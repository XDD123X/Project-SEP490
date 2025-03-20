import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export function MessageListItem({ message, isSelected, onClick }) {
  return (
    <div className={cn("p-3 border-b cursor-pointer transition-colors", isSelected ? "bg-accent" : "hover:bg-accent/50", !message.read && "bg-accent/20 hover:bg-accent/30")} onClick={onClick}>
      <div className="flex justify-between items-start">
        <h3 className="font-medium truncate">{message.subject}</h3>
        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}</span>
      </div>
      <div className="text-xs mt-1">From: {message.sender}</div>
      <div className="text-xs mt-1">By: {message.createdBy}</div>
      <div
        className="text-sm text-muted-foreground line-clamp-2 mt-1"
        dangerouslySetInnerHTML={{
          __html: message.content.replace(/<\/?[^>]+(>|$)/g, " "),
        }}
      />
    </div>
  );
}
