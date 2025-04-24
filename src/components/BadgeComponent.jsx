import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Check, Clock, X } from "lucide-react";
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

export function RequestBadge({ status }) {
  switch (status) {
    case 2:
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
          <X className="w-3 h-3 mr-1" /> Rejected
        </Badge>
      );
    case 1:
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
          <Check className="w-3 h-3 mr-1" /> Accepted
        </Badge>
      );
    case 0:
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" /> Pending
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

export function SessionBadge({ status }) {
  switch (status) {
    case 3:
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
          <X className="w-3 h-3 mr-1" /> Cancelled
        </Badge>
      );
    case 1:
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
          <Clock className="w-3 h-3 mr-1" /> Not Yet
        </Badge>
      );
    case 2:
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
          <Check className="w-3 h-3 mr-1" /> Finished
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

export function ClassBadge({ status }) {
  switch (status) {
    case 0:
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
          <X className="w-3 h-3 mr-1" /> Inactive
        </Badge>
      );
    case 1:
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
          <Check className="w-3 h-3 mr-1" /> Upcoming
        </Badge>
      );
    case 2:
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
          <Check className="w-3 h-3 mr-1" /> Studying
        </Badge>
      );
    case 3:
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
          <Clock className="w-3 h-3 mr-1" /> Finished
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

export function CourseBadge({ status }) {
  switch (status) {
    case 0:
      return (
        <Badge variant="outline" className="bg-red-200 text-red-900 border-red-300">
          <X className="w-3 h-3 mr-1" /> Cancelled
        </Badge>
      );
    case 1:
      return (
        <Badge variant="outline" className="bg-green-200 text-green-900 border-green-300">
          <Check className="w-3 h-3 mr-1" /> Active
        </Badge>
      );
    case 2:
      return (
        <Badge variant="outline" className="bg-yellow-200 text-yellow-900 border-yellow-300">
          <Clock className="w-3 h-3 mr-1" /> Pending
        </Badge>
      );
    case 3:
      return (
        <Badge variant="outline" className="bg-gray-200 text-gray-900 border-gray-400">
          <AlertTriangle className="w-3 h-3 mr-1" /> Obsolete
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

export function AttendanceBadge({ status }) {
  switch (status) {
    case 0: // Absent
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
          <X className="w-3 h-3 mr-1" /> Absent
        </Badge>
      );
    case 1: // Attended
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
          <Check className="w-3 h-3 mr-1" /> Attended
        </Badge>
      );
    case 2: // Upcoming
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
          <Clock className="w-3 h-3 mr-1" /> Upcoming
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}
