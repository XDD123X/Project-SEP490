import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ClassBadge } from "@/components/BadgeComponent";
import { GetClassList } from "@/services/classService";
import { toast } from "sonner";

export default function SelectClassReportPage() {
  const [selectedClass, setSelectedClass] = useState(null);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await GetClassList();
        setClasses(response.data);
      } catch (error) {
        toast.error(error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Analyze Class Record</h1>
      <p className="text-muted-foreground mb-8">Select a class to analyze record</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes &&
          classes.map((classItem) => (
            <Card key={classItem.classId} className={`transition-all ${selectedClass === classItem.classId ? "ring-2 ring-primary" : ""}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start min-h-[3.5rem]">
                  <CardTitle className="text-xl leading-snug line-clamp-2">{classItem.className}</CardTitle>
                  <ClassBadge status={classItem.status} />
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-2 text-sm">
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
                    <span className="font-medium">{classItem.startDate ? format(classItem.startDate, "MMM dd, yyyy") : "TBD"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">End Date:</span>
                    <span className="font-medium">{classItem.endDate ? format(classItem.endDate, "MMM dd, yyyy") : "TBD"}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link to={`/officer/report/analyze/${classItem.classId}`} className="w-full">
                  <Button className="w-full" onClick={() => setSelectedClass(classItem.classId)} disabled={classItem.status !== 2 || classItem.totalSession === 0}>
                    Select Class
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
      </div>
    </div>
  );
}
