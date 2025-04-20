import { ClassBadge } from "@/components/BadgeComponent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { GetClassList, GetLecturerClassList } from "@/services/classService";
import { useStore } from "@/services/StoreContext";
import { format } from "date-fns";
import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function ViewReportByClassPage() {
  const [classes, setClasses] = useState([]);
  const { state } = useStore();
  const { user } = state;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await GetLecturerClassList(user.uid);
        setClasses(response.data);
      } catch (error) {
        toast.error(error);
      }
    };
    fetchData();
  }, []);

  const handleSelect = (id) => {
    navigate(`/lecturer/report/${id}`);
  };

  if (!classes) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Class Reports</h1>
      <p className="text-muted-foreground mb-8">Select a class to view report</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem) => (
          <Card key={classItem.classId} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start min-h-[3.5rem]">
                <CardTitle className="text-xl">{classItem.className}</CardTitle>
                <ClassBadge status={classItem.status} />
              </div>
            </CardHeader>
            <CardContent className="flex-grow pb-4">
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
                  <span className="font-medium">{classItem.startDate ? format(classItem.startDate, "dd/MM/yyyy") : "TBD"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">End Date:</span>
                  <span className="font-medium">{classItem.endDate ? format(classItem.endDate, "dd/MM/yyyy") : "TBD"}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSelect(classItem.classId)} className="w-full">
                Select
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
