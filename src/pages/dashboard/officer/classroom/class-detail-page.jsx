import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GetClassById } from "@/services/classService";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
const classData = {
  classId: "e3b2e679-9e06-416a-8a1b-b3988b49b02c",
  classCode: "SAT02-25",
  className: "Lớp SAT Khai Giảng 02-25",
  lecturerId: "8292a89d-07c8-4b18-8494-8d1a5d3bfb32",
  courseId: 2,
  totalSession: 25,
  startDate: "2025-03-15T21:56:42.067",
  endDate: "2025-06-14T21:56:42.067",
  classUrl: null,
  status: 1,
  classStudents: [
    {
      classStudentId: 9,
      classId: "e3b2e679-9e06-416a-8a1b-b3988b49b02c",
      studentId: "95281bf1-2ce7-4d83-b3b2-a5fa36511afd",
      student: {
        accountId: "95281bf1-2ce7-4d83-b3b2-a5fa36511afd",
        email: "student10@gmail.com",
        fullName: "Đặng Thị Phan",
        roleId: "917a7fee-2d11-44f1-a0a8-895502e97e21",
        fulltime: true,
        phoneNumber: "0123456789",
        dob: "2000-01-01",
        imgUrl: "https://ui.shadcn.com/avatars/shadcn.jpg",
        meetUrl: "https://example.com/meet/euf-nwbu-cet",
        status: 1,
        createdAt: "2025-03-15T21:56:42.057",
        updatedAt: null,
        role: null,
      },
    },
    {
      classStudentId: 10,
      classId: "e3b2e679-9e06-416a-8a1b-b3988b49b02c",
      studentId: "055beefb-61bb-43bc-a40a-b3e4d049188c",
      student: {
        accountId: "055beefb-61bb-43bc-a40a-b3e4d049188c",
        email: "student2@gmail.com",
        fullName: "Bùi Văn Hiện",
        roleId: "917a7fee-2d11-44f1-a0a8-895502e97e21",
        fulltime: true,
        phoneNumber: "0123456789",
        dob: "2000-01-01",
        imgUrl: "https://ui.shadcn.com/avatars/shadcn.jpg",
        meetUrl: "https://example.com/meet/euf-nwbu-cet",
        status: 1,
        createdAt: "2025-03-15T21:56:42.057",
        updatedAt: null,
        role: null,
      },
    },
    {
      classStudentId: 11,
      classId: "e3b2e679-9e06-416a-8a1b-b3988b49b02c",
      studentId: "9067d815-0f1a-4be2-b8c9-b90f4db9b423",
      student: {
        accountId: "9067d815-0f1a-4be2-b8c9-b90f4db9b423",
        email: "student11@gmail.com",
        fullName: "Hoàng Minh Quân",
        roleId: "917a7fee-2d11-44f1-a0a8-895502e97e21",
        fulltime: true,
        phoneNumber: "0123456789",
        dob: "2000-01-01",
        imgUrl: "https://ui.shadcn.com/avatars/shadcn.jpg",
        meetUrl: "https://example.com/meet/euf-nwbu-cet",
        status: 1,
        createdAt: "2025-03-15T21:56:42.057",
        updatedAt: null,
        role: null,
      },
    },
    {
      classStudentId: 12,
      classId: "e3b2e679-9e06-416a-8a1b-b3988b49b02c",
      studentId: "1145bb7b-e256-4548-834a-c98e31069f58",
      student: {
        accountId: "1145bb7b-e256-4548-834a-c98e31069f58",
        email: "student3@gmail.com",
        fullName: "Nguyễn Hoàng Linh",
        roleId: "917a7fee-2d11-44f1-a0a8-895502e97e21",
        fulltime: true,
        phoneNumber: "0123456789",
        dob: "2000-01-01",
        imgUrl: "https://ui.shadcn.com/avatars/shadcn.jpg",
        meetUrl: "https://example.com/meet/euf-nwbu-cet",
        status: 1,
        createdAt: "2025-03-15T21:56:42.057",
        updatedAt: null,
        role: null,
      },
    },
    {
      classStudentId: 13,
      classId: "e3b2e679-9e06-416a-8a1b-b3988b49b02c",
      studentId: "f7740682-8414-4551-bd36-ebd1dc8cc398",
      student: {
        accountId: "f7740682-8414-4551-bd36-ebd1dc8cc398",
        email: "student1@gmail.com",
        fullName: "Đỗ Quốc Đạt",
        roleId: "917a7fee-2d11-44f1-a0a8-895502e97e21",
        fulltime: true,
        phoneNumber: "0123456789",
        dob: "2000-01-01",
        imgUrl: "https://ui.shadcn.com/avatars/shadcn.jpg",
        meetUrl: "https://example.com/meet/euf-nwbu-cet",
        status: 1,
        createdAt: "2025-03-15T21:56:42.057",
        updatedAt: null,
        role: null,
      },
    },
    {
      classStudentId: 14,
      classId: "e3b2e679-9e06-416a-8a1b-b3988b49b02c",
      studentId: "cf9a4152-4822-4872-b64d-f05bc0d8137a",
      student: {
        accountId: "cf9a4152-4822-4872-b64d-f05bc0d8137a",
        email: "student7@gmail.com",
        fullName: "Tôn Nữ Minh",
        roleId: "917a7fee-2d11-44f1-a0a8-895502e97e21",
        fulltime: true,
        phoneNumber: "0123456789",
        dob: "2000-01-01",
        imgUrl: "https://ui.shadcn.com/avatars/shadcn.jpg",
        meetUrl: "https://example.com/meet/euf-nwbu-cet",
        status: 1,
        createdAt: "2025-03-15T21:56:42.057",
        updatedAt: null,
        role: null,
      },
    },
    {
      classStudentId: 15,
      classId: "e3b2e679-9e06-416a-8a1b-b3988b49b02c",
      studentId: "a7d804b7-075a-44fb-8ee1-fe4a91faff0f",
      student: {
        accountId: "a7d804b7-075a-44fb-8ee1-fe4a91faff0f",
        email: "student9@gmail.com",
        fullName: "Huỳnh Văn Trọng",
        roleId: "917a7fee-2d11-44f1-a0a8-895502e97e21",
        fulltime: true,
        phoneNumber: "0123456789",
        dob: "2000-01-01",
        imgUrl: "https://ui.shadcn.com/avatars/shadcn.jpg",
        meetUrl: "https://example.com/meet/euf-nwbu-cet",
        status: 1,
        createdAt: "2025-03-15T21:56:42.057",
        updatedAt: null,
        role: null,
      },
    },
    {
      classStudentId: 16,
      classId: "e3b2e679-9e06-416a-8a1b-b3988b49b02c",
      studentId: "ce2362a5-1cbb-48f0-ac09-fef66b23de71",
      student: {
        accountId: "ce2362a5-1cbb-48f0-ac09-fef66b23de71",
        email: "student8@gmail.com",
        fullName: "Tô Minh NHật",
        roleId: "917a7fee-2d11-44f1-a0a8-895502e97e21",
        fulltime: true,
        phoneNumber: "0123456789",
        dob: "2000-01-01",
        imgUrl: "https://ui.shadcn.com/avatars/shadcn.jpg",
        meetUrl: "https://example.com/meet/euf-nwbu-cet",
        status: 1,
        createdAt: "2025-03-15T21:56:42.057",
        updatedAt: null,
        role: null,
      },
    },
  ],
  course: {
    courseName: "SAT",
    description: "Lớp học SAT Tháng 2/25",
  },
  lecturer: {
    accountId: "8292a89d-07c8-4b18-8494-8d1a5d3bfb32",
    email: "lecturer2@gmail.com",
    fullName: "Nguyễn Thị Lan",
    roleId: "db1681cd-8c54-4065-9c13-47ae3c1bb780",
    fulltime: true,
    phoneNumber: "0123456789",
    dob: "2000-01-01",
    imgUrl: "https://ui.shadcn.com/avatars/shadcn.jpg",
    meetUrl: "https://example.com/meet/euf-nwbu-cet",
    status: 1,
    createdAt: "2025-03-15T21:56:42.057",
    updatedAt: null,
    role: null,
  },
};
export default function ClassDetailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentClass, setCurrentClass] = useState(classData);
  const classId = searchParams.get("classId");

  useEffect(() => {
    if (!classId) {
      navigate("/officer/class", { replace: true });
    }
  }, [classId, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!classId) return;

      try {
        const classResponse = await GetClassById(classId);

        if (classResponse.status === 200) {
          setCurrentClass(classResponse.data);
        } else {
          toast.error("Class not found!");
          navigate("/404", { replace: true });
        }
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Error Occurred. Please Try Again.");
        navigate("/404", { replace: true });
      }
    };

    fetchData();
  }, [classId, navigate]);

  return (
    <div className="grid grid-cols-6 gap-4 grid-rows-auto">
      {/* Card: Thông tin lớp học (Chiếm 3 phần) */}
      <Card className="col-span-2 w-full">
        <CardHeader>
          <CardTitle>View Class Detail</CardTitle>
          <CardDescription>All Detail Information Of Class Below.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form>
            <div className="grid w-full gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-span-1 flex flex-col space-y-1.5">
                  <Label className="text-xs text-secondary-foreground">Code</Label>
                  <Input value={currentClass.classCode} readOnly />
                </div>
                <div className="col-span-3 flex flex-col space-y-1.5">
                  <Label>Name</Label>
                  <Input value={currentClass.className} readOnly />
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="col-span-1 flex flex-col space-y-1.5">
                  <Label>Course</Label>
                  <Input value={currentClass.course.courseName} className="font-semibold" readOnly />
                </div>
                <div className="col-span-3 flex flex-col space-y-1.5">
                  <Label>Description</Label>
                  <Input value={currentClass.course.description} readOnly />
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label>Lecturer</Label>
                  <Input value={currentClass.lecturer.fullName} className="w-full" readOnly />
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label>Start Date</Label>
                  <Input value={format(new Date(currentClass.startDate), "dd/MM/yyyy")} className="w-full" readOnly />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label>End Date</Label>
                  <Input value={format(new Date(currentClass.endDate), "dd/MM/yyyy")} className="w-full" readOnly />
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label>Total Session</Label>
                  <Input value={currentClass.totalSession} className="w-full" readOnly />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label>Status</Label>
                  <Input value={currentClass.status === 0 ? "Upcoming" : currentClass.status === 1 ? "Studying" : "Finished"} className="w-full" readOnly />
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="col-span-4 w-full">
        <CardHeader>
          <CardTitle>Class Students</CardTitle>
          <CardDescription>List of students in this class</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Avatar</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>DOB</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {currentClass.classStudents?.map((cs, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <img className="w-20 h-20 rounded-lg" src={cs.student?.imgUrl || "/default-avatar.png"} alt="Student Avatar" />
                  </TableCell>
                  <TableCell>
                    <Link className="underline underline-offset-4" target="_blank" to={`/officer/account/detail?accountId=${cs.student.accountId}`}>
                      {cs.student?.fullName || "N/A"}
                    </Link>
                  </TableCell>
                  <TableCell>{cs.student?.phoneNumber || "N/A"}</TableCell>
                  <TableCell>{format(new Date(cs.student?.dob), "dd/MM/yyyy") || "N/A"}</TableCell>
                  <TableCell>{cs.student?.email || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
