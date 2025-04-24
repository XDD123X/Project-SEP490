import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, CalendarOff, CalendarRange, Hand, ClipboardList } from "lucide-react";

export function AttendanceClassList({ classes, onSelectClass, onSelectReport }) {
  // Function to check if a class has a session today
  const hasTodaySession = (classItem) => {
    if (!classItem.todaySessions) return false;
    return classItem.todaySessions > 0;
  };

  if (classes.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-muted/50">
        <p className="text-muted-foreground">No classes found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {classes.map((classItem) => (
        <Card key={classItem.classId} className={"border-primary"}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>{classItem.className}</CardTitle>
              <Badge variant="outline">{classItem.course.courseName}</Badge>
            </div>
            <CardDescription>{classItem.schedule || "No schedule information"}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <Users className="mr-2 h-4 w-4" />
              <span>{classItem.classStudents?.length || 0} Students Enrolled</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <CalendarRange className="mr-2 h-4 w-4" />
              <span>{classItem.sessions.length || "Not Yet Scheduled"} Sessions</span>
            </div>
            {hasTodaySession(classItem) ? (
              <div className="flex items-center text-sm dark:text-primary text-green-600 mt-2">
                <Calendar className="mr-2 h-4 w-4" />
                <span>Has session today</span>
              </div>
            ) : (
              <div className="flex items-center text-sm text-red-500 mt-2">
                <CalendarOff className="mr-2 h-4 w-4" />
                <span>No session today</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={() => onSelectReport(classItem.classId)}>
              <ClipboardList className="w-4 h-4 " />
              Report
            </Button>
            <Button onClick={() => onSelectClass(classItem.classId)}>
              <Hand className="w-4 h-4" />
              Attendance
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
