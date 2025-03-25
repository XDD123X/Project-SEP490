import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CourseBadge } from "../BadgeComponent";
import { checkUsageByCourseId } from "@/services/courseService";
import { toast } from "sonner";

export default function StatusCheck({ course, onStatusChange, onCancel }) {
  const [isInUse, setIsInUse] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  // Mock function to check if course is in use
  const checkCourseUsage = async () => {
    try {
      const checkResponse = await checkUsageByCourseId(course.courseId);
      if (checkResponse.status === 200) {
        const classCount = checkResponse.data.classCount;
        setIsInUse(classCount > 0);
        if (classCount === 0) {
          setSelectedStatus(course.status);
        } else {
          setSelectedStatus(course.status);
        }
        console.log("course status:", course.status);
      }
    } catch (error) {
      toast.error(error);
    }
  };

  const handleSave = () => {
    // Cập nhật course.status với selectedStatus
    const updatedCourse = { ...course, status: selectedStatus };

    if (selectedStatus !== null) {
      onStatusChange(selectedStatus);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Check Course Status</h2>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <span className="font-medium">Course:</span>
          <span>{course.courseName}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-medium">Description:</span>
          <span>{course.description}</span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-medium">Current Status:</span>
          <span>
            <CourseBadge status={course.status} />
          </span>
        </div>

        <Button onClick={checkCourseUsage} className="w-full">
          <AlertCircle className="mr-2 h-4 w-4" />
          Check if course is in use
        </Button>

        {isInUse !== null && (
          <Alert variant={isInUse ? "destructive" : "default"}>
            {isInUse ? (
              <>
                <XCircle className="h-4 w-4" />
                <AlertTitle>Course is in use</AlertTitle>
                <AlertDescription>This course is currently being used in classes. You can only set it to Pending status.</AlertDescription>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Course is not in use</AlertTitle>
                <AlertDescription>This course is not being used in any classes. You can set it to Cancelled or Pending.</AlertDescription>
              </>
            )}
          </Alert>
        )}

        {isInUse !== null && (
          <div className="space-y-2">
            <div className="font-medium">Change status to:</div>
            <RadioGroup value={selectedStatus?.toString()} onValueChange={(value) => setSelectedStatus(Number.parseInt(value))}>
              {(!isInUse || course.status === 0) && (
                <>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="bbsolete" disabled={isInUse} />
                    <Label htmlFor="obsolete">Obsolete</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="cancelled" disabled={isInUse} />
                    <Label htmlFor="cancelled">Cancelled</Label>
                  </div>
                </>
              )}
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="active" />
                <Label htmlFor="active">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="pending" />
                <Label htmlFor="pending">Pending</Label>
              </div>
            </RadioGroup>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isInUse === null || selectedStatus === null}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
