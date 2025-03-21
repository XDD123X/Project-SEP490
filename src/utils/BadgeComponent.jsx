import { Badge } from "@/components/ui/badge";
import { Check, Clock, X } from "lucide-react";
import React from "react";

export function AccountBadge({ status }) {
  switch (status) {
    case 0:
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
          <X className="w-3 h-3 mr-1" /> Suspended
        </Badge>
      );
    case 1:
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
          <Check className="w-3 h-3 mr-1" /> Active
        </Badge>
      );
    case 2:
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
          <Check className="w-3 h-3 mr-1" /> Finished
        </Badge>
      );
    case 3:
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" /> Invited
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

export function ClassBadge() {
  return <div>AccountBadge</div>;
}
