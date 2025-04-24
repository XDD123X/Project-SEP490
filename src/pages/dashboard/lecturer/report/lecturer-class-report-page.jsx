import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

export default function ViewLecturerReportPage() {
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
    },
  ]);

  function formatDate(dateString) {
    return format(dateString, "dd/MM/yyyy");
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Class Reports</h1>
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
            </CardContent>
            <CardFooter>
              <Link to={`/lecturer/reports/${classItem.classId}`} className="w-full">
                <Button className="w-full">Select</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
