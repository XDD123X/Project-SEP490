import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { GetLecturerClassList } from "@/services/classService";
import { format } from "date-fns";
import { ClassBadge } from "@/components/BadgeComponent";

export default function ViewClassRecordMaterialPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchClasses() {
      try {
        const response = await GetLecturerClassList();
        console.log(response.data);
        setClasses(response.data);
      } catch (error) {
        console.error("Failed to fetch classes:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchClasses();
  }, []);

  const handleClassSelect = (classId) => {
    navigate(`/lecturer/record/${classId}`);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">My Classes</h1>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {classes.length > 0 ? (
          classes.map((classItem) => (
            <Card key={classItem.classId} className="transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{classItem.className}</CardTitle>
                  <ClassBadge status={classItem.status} />
                </div>
                <CardDescription>Code: {classItem.classCode}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-2">Lecturer: {classItem.lecturer.fullName}</p>
                <p className="mb-2">Total Sessions: {classItem.totalSession}</p>
                <p className="mb-2">
                  Period: {classItem.startDate ? format(classItem.startDate, "dd/MM/yyyy") : "TBD"} - {classItem.endDate ? format(classItem.endDate, "dd/MM/yyyy") : "TBD"}
                </p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => handleClassSelect(classItem.classId)} className="w-full">
                  Select Class
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center">
            <p className="text-muted-foreground">No classes assigned yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
