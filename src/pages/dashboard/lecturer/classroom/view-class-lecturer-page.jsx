import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Info, Settings, Settings2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { GetLecturerClassList } from "@/services/classService";
import { format } from "date-fns";

export default function ViewClassLecturerPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulate API fetch
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await GetLecturerClassList();

        if (response.status === 200 && response.data != null) {
          setClasses(response.data);
          setLoading(false);
        }
      } catch (error) {
        toast.error(error);
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-primary border-solid rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Classes</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <ClassCard key={classItem.classId} classItem={classItem} />
        ))}
      </div>
    </div>
  );
}

function ClassCard({ classItem }) {
  const formatDate = (dateString) => {
    if (!dateString) return "TBD";

    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl">{classItem.className}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Class Code:</span>
            <span className="font-medium">{classItem.classCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Lecturer:</span>
            <span className="font-medium">{classItem.lecturer.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sessions:</span>
            <span className="font-medium">{classItem.totalSession}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Start Date:</span>
            <span className="font-medium">{formatDate(classItem.startDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">End Date:</span>
            <span className="font-medium">{formatDate(classItem.endDate)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center w-full gap-2">
        <Link to={classItem.lecturer?.meetUrl || "#"} className="w-full" target="_blank" rel="noopener noreferrer">
          <Button className="flex-1 w-full" disabled={!classItem.lecturer?.meetUrl}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Join Online Class
          </Button>
        </Link>
        <Link to={`/lecturer/class/detail/${classItem.classId}`} className="w-full">
          <Button variant="outline" className="flex-1 w-full">
            <Settings className="mr-2 h-4 w-4" />
            Manager Student
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
