import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

export default function ViewOfficerReportPage() {
  const [classes, setClasses] = useState([
    {
      classId: "0824c5a5-bf09-4e45-83da-2a2d8fb37351",
      classCode: "PRN231",
      className: "Building Cross-Platform Back-End Application With .NET",
      lecturerId: "13924b12-c83a-4d46-904b-a5634eea342b",
      courseId: "b197c5d6-19c2-4510-b5e0-b0665d725351",
      totalSession: 48,
      startDate: "2025-04-26T00:00:00",
      endDate: "2025-10-05T00:00:00",
      status: 1,
      course: {
        courseId: "b197c5d6-19c2-4510-b5e0-b0665d725351",
        courseName: "PRN231",
        description: "PRN231",
      },
      lecturer: {
        accountId: "b1973gd6-19c2-4510-b5h6-b0665d126351",
        fullName: "Nguyễn Duy Đức Chính",
      },
      reportStats: {
        total: 48,
        completed: 12,
        inProgress: 3,
        notStarted: 33,
      },
    },
    {
      classId: "1924c5a5-bf09-4e45-83da-2a2d8fb37352",
      classCode: "PRN221",
      className: "Advanced Cross-Platform Application With .NET MAUI",
      lecturerId: "23924b12-c83a-4d46-904b-a5634eea342c",
      courseId: "c197c5d6-19c2-4510-b5e0-b0665d725352",
      totalSession: 36,
      startDate: "2025-05-15T00:00:00",
      endDate: "2025-09-20T00:00:00",
      status: 1,
      course: {
        courseId: "c197c5d6-19c2-4510-b5e0-b0665d725352",
        courseName: "PRN221",
        description: "PRN221",
      },
      lecturer: {
        accountId: "c1973gd6-19c2-4510-b5h6-b0665d126352",
        fullName: "Trần Văn Minh",
      },
      reportStats: {
        total: 36,
        completed: 8,
        inProgress: 2,
        notStarted: 26,
      },
    },
    {
      classId: "2924c5a5-bf09-4e45-83da-2a2d8fb37353",
      classCode: "PRJ301",
      className: "Java Web Application Development",
      lecturerId: "33924b12-c83a-4d46-904b-a5634eea342d",
      courseId: "d197c5d6-19c2-4510-b5e0-b0665d725353",
      totalSession: 30,
      startDate: "2025-04-10T00:00:00",
      endDate: "2025-08-15T00:00:00",
      status: 1,
      course: {
        courseId: "d197c5d6-19c2-4510-b5e0-b0665d725353",
        courseName: "PRJ301",
        description: "PRJ301",
      },
      lecturer: {
        accountId: "d1973gd6-19c2-4510-b5h6-b0665d126353",
        fullName: "Lê Thị Hương",
      },
      reportStats: {
        total: 30,
        completed: 15,
        inProgress: 0,
        notStarted: 15,
      },
    },
  ]);

  function formatDate(dateString) {
    return format(dateString, "dd/MM/yyyy");
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-3xl font-bold">Class Reports (Officer View)</h1>
        <p className="text-muted-foreground">View and download reports for all classes. As an officer, you can access completed reports but cannot initiate new analyses.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <Card key={classItem.classId} className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">{classItem.classCode}</CardTitle>
              <CardDescription className="line-clamp-2">{classItem.className}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{classItem.lecturer.fullName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {formatDate(classItem.startDate)} - {formatDate(classItem.endDate)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{classItem.totalSession} sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm flex items-center gap-1">
                  <span className="text-green-600 font-medium">{classItem.reportStats.completed}</span> completed,
                  <span className="text-amber-600 font-medium">{classItem.reportStats.inProgress}</span> in progress,
                  <span className="text-gray-500 font-medium">{classItem.reportStats.notStarted}</span> not started
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link to={`/officer/reports/${classItem.classId}`} className="w-full">
                <Button className="w-full">View Reports</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
