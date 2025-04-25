import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { GetLecturerClassList } from "@/services/classService";

export default function ViewLecturerReportPage() {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await GetLecturerClassList();

        if (response.status === 200) {
          setClasses(response.data);
          console.log(response.data);
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
      <h1 className="text-3xl font-bold mb-6">Class Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.length > 0 ? (
          classes.map((classItem) => (
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
          ))
        ) : (
          <div className="col-span-3 text-center text-gray-400">No classes assigned yet.</div>
        )}
      </div>
    </div>
  );
}
