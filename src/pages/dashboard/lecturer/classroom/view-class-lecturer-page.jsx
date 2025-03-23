import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { GetLecturerClassList } from "@/services/classService";

// Using mock data for demonstration
const mockData = [
  {
    classId: "5d1ea9e9-d471-412b-9169-c8f93555adb6",
    classCode: "IELTS25-03/25",
    className: "Lớp IELTS25 Khai Giảng 03-25",
    lecturerId: "97f10668-37ae-4488-9029-aad76f842cb9",
    courseId: 1,
    totalSession: 32,
    startDate: "2025-03-23T20:49:53.447",
    endDate: null,
    classUrl: "https://meet.google.com/abc-defg-hjk",
    scheduled: false,
    status: 1,
    course: {
      courseName: "IELTS",
      description: "Khóa Học IETLS 2025",
    },
    lecturer: {
      accountId: "97f10668-37ae-4488-9029-aad76f842cb9",
      email: "lecturer1@gmail.com",
      fullName: "Lê Thanh Hải",
      roleId: "7a6d031a-11f0-4b44-9ad2-712d037a781e",
      fulltime: true,
      phoneNumber: "0123456789",
      dob: "2000-01-01",
      gender: true,
      imgUrl: "https://i.imgur.com/McuGRDf.png",
      meetUrl: null,
      status: 1,
      createdAt: "2025-03-23T20:49:53.38",
      updatedAt: null,
      parents: [],
      role: null,
    },
    classStudents: [],
  },
  {
    classId: "9c4139c9-e3f1-4df1-a7d2-e9a2f33dcaaa",
    classCode: "SAT25-03/25",
    className: "Lớp SAT25 Khai Giảng 03-25",
    lecturerId: "97d520b6-796a-4ace-8ca6-b36f7104c8aa",
    courseId: 2,
    totalSession: 32,
    startDate: "2025-03-23T20:49:53.447",
    endDate: null,
    classUrl: "https://meet.google.com/abc-defg-hjk",
    scheduled: true,
    status: 1,
    course: {
      courseName: "SAT",
      description: "Khóa học SAT 2025",
    },
    lecturer: {
      accountId: "97d520b6-796a-4ace-8ca6-b36f7104c8aa",
      email: "lecturer2@gmail.com",
      fullName: "Nguyễn Thị Lan",
      roleId: "7a6d031a-11f0-4b44-9ad2-712d037a781e",
      fulltime: true,
      phoneNumber: "0123456789",
      dob: "2000-01-01",
      gender: false,
      imgUrl: "https://i.imgur.com/0dTvSSQ.png",
      meetUrl: null,
      status: 1,
      createdAt: "2025-03-23T20:49:53.38",
      updatedAt: null,
      parents: [],
      role: null,
    },
    classStudents: [],
  },
];

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
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
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
      <CardFooter className="flex flex-col sm:flex-row items-center w-full gap-2">
        <Link to={classItem.classUrl} className="w-full" target="_blank" rel="noopener noreferrer">
          <Button className="flex-1 w-full">
            <ExternalLink className="mr-2 h-4 w-4" />
            Join Online Class
          </Button>
        </Link>
        <Link to={`/lecturer/class/detail/${classItem.classId}`} className="w-full">
          <Button variant="outline" className="flex-1 w-full">
            <Info className="mr-2 h-4 w-4" />
            Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
