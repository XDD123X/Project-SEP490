import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { GetClassList } from "@/services/classService";

export default function ViewOfficerReportPage() {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await GetClassList();
        if (response.status === 200) {
          setClasses(response.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  function formatDate(dateString) {
    if (!dateString) return "TBD";
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
                  {formatDate(classItem?.startDate)} - {formatDate(classItem?.endDate)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{classItem.totalSession} sessions</span>
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
