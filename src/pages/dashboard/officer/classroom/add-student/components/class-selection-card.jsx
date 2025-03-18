import React, { useEffect } from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { GetClassList } from "@/services/classService";
import { toast } from "sonner";

// Sample data for demonstration
const sampleClasses = [
  {
    classId: "e6c59b7f-0bc5-4fe0-ad9e-0e6eea3cba18",
    classCode: "IELTS25-03/25",
    className: "Lớp IELTS25 Khai Giảng 03-25",
    lecturerId: "8ee77ef5-aa1b-4a6e-ac80-86c4f62e7f00",
    courseId: 1,
    totalSession: 32,
    startDate: "2025-03-18T20:52:54.467",
    endDate: null,
    classUrl: "https://example.com/meet/euf-nwbu-cet",
    scheduled: false,
    status: 0,
    classStudents: [
      {
        classStudentId: 1,
        classId: "e6c59b7f-0bc5-4fe0-ad9e-0e6eea3cba18",
        studentId: "00211a26-1617-47c3-b00e-02f2e06a9f8c",
        student: {
          accountId: "00211a26-1617-47c3-b00e-02f2e06a9f8c",
          email: "student6@gmail.com",
          fullName: "Cao Văn Linh",
          roleId: "b5ec52be-e7ea-442c-927e-f023416f2202",
          fulltime: true,
          phoneNumber: "0123456789",
          dob: "2000-01-01",
          gender: true,
          imgUrl: "https://ui.shadcn.com/avatars/shadcn.jpg",
          meetUrl: "https://example.com/meet/euf-nwbu-cet",
          status: 1,
          createdAt: "2025-03-18T20:52:54.453",
          updatedAt: null,
          role: null,
        },
      },
      {
        classStudentId: 2,
        classId: "e6c59b7f-0bc5-4fe0-ad9e-0e6eea3cba18",
        studentId: "ace11161-60ae-4dfb-ae5a-36b3c0feb037",
        student: {
          accountId: "ace11161-60ae-4dfb-ae5a-36b3c0feb037",
          email: "student7@gmail.com",
          fullName: "Tôn Nữ Minh",
          roleId: "b5ec52be-e7ea-442c-927e-f023416f2202",
          fulltime: true,
          phoneNumber: "0123456789",
          dob: "2000-01-01",
          gender: false,
          imgUrl: "https://ui.shadcn.com/avatars/shadcn.jpg",
          meetUrl: "https://example.com/meet/euf-nwbu-cet",
          status: 1,
          createdAt: "2025-03-18T20:52:54.453",
          updatedAt: null,
          role: null,
        },
      },
    ],
    course: {
      courseName: "IELTS",
      description: "Khóa Học IETLS 2025",
    },
    lecturer: {
      accountId: "8ee77ef5-aa1b-4a6e-ac80-86c4f62e7f00",
      email: "lecturer1@gmail.com",
      fullName: "Lê Thanh Hải",
      roleId: "10292866-5f52-4356-9150-cf75dc453c83",
      fulltime: true,
      phoneNumber: "0123456789",
      dob: "2000-01-01",
      gender: true,
      imgUrl: "https://ui.shadcn.com/avatars/shadcn.jpg",
      meetUrl: "https://example.com/meet/euf-nwbu-cet",
      status: 1,
      createdAt: "2025-03-18T20:52:54.453",
      updatedAt: null,
      role: null,
    },
  },
  {
    classId: "f7d59b7f-0bc5-4fe0-ad9e-0e6eea3cba19",
    classCode: "TOEIC25-04/25",
    className: "Lớp TOEIC25 Khai Giảng 04-25",
    lecturerId: "9fe77ef5-aa1b-4a6e-ac80-86c4f62e7f01",
    courseId: 2,
    totalSession: 24,
    startDate: "2025-04-15T10:00:00.000",
    endDate: null,
    classUrl: "https://example.com/meet/abc-defg-hij",
    scheduled: false,
    status: 0,
    classStudents: [],
    course: {
      courseName: "TOEIC",
      description: "Khóa Học TOEIC 2025",
    },
    lecturer: {
      accountId: "9fe77ef5-aa1b-4a6e-ac80-86c4f62e7f01",
      email: "lecturer2@gmail.com",
      fullName: "Nguyễn Văn An",
      roleId: "10292866-5f52-4356-9150-cf75dc453c83",
      fulltime: true,
      phoneNumber: "0987654321",
      dob: "1995-05-15",
      gender: true,
      imgUrl: "https://ui.shadcn.com/avatars/shadcn.jpg",
      meetUrl: "https://example.com/meet/abc-defg-hij",
      status: 1,
      createdAt: "2025-03-10T15:30:00.000",
      updatedAt: null,
      role: null,
    },
  },
];

export function ClassSelectionCard({ onClassSelect }) {
  const [classes, setClasses] = useState(sampleClasses);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const classList = await GetClassList();

        if (classList.status === 200 || classList.data !== null) {
          setClasses(classList.data);
        } else {
          toast.error("Failed Fetching Data");
        }
      } catch (error) {
        toast.error(error);
      }
    };
    fetchData();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.trim() === "") {
      setClasses(sampleClasses);
      return;
    }

    const filtered = sampleClasses.filter(
      (c) => c.classCode.toLowerCase().includes(term.toLowerCase()) 
      || c.className.toLowerCase().includes(term.toLowerCase()) 
      || c.lecturer.fullName.toLowerCase().includes(term.toLowerCase()));

    setClasses(filtered);
  };

  // Handle sorting
  const requestSort = (key) => {
    let direction = "ascending";

    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }

    setSortConfig({ key, direction });

    const sortedClasses = [...classes].sort((a, b) => {
      if (key === "className" || key === "classCode") {
        if (direction === "ascending") {
          return a[key].localeCompare(b[key]);
        } else {
          return b[key].localeCompare(a[key]);
        }
      } else if (key === "startDate") {
        const dateA = new Date(a.startDate).getTime();
        const dateB = new Date(b.startDate).getTime();

        if (direction === "ascending") {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      } else if (key === "lecturer") {
        if (direction === "ascending") {
          return a.lecturer.fullName.localeCompare(b.lecturer.fullName);
        } else {
          return b.lecturer.fullName.localeCompare(a.lecturer.fullName);
        }
      }

      return 0;
    });

    setClasses(sortedClasses);
  };

  // Handle class selection
  const handleSelect = () => {
    if (!selectedClassId) return;

    const selectedClass = classes.find((c) => c.classId === selectedClassId);
    if (selectedClass) {
      onClassSelect(selectedClass);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Select Class</CardTitle>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by class code, name, or lecturer..." className="pl-8" value={searchTerm} onChange={handleSearch} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort("classCode")}>
                  Class Code {sortConfig.key === "classCode" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort("className")}>
                  Class Name {sortConfig.key === "className" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort("lecturer")}>
                  Lecturer {sortConfig.key === "lecturer" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort("startDate")}>
                  Start Date {sortConfig.key === "startDate" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Students</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No classes found
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((classItem) => (
                  <TableRow key={classItem.classId} className={selectedClassId === classItem.classId ? "bg-muted" : ""} onClick={() => setSelectedClassId(classItem.classId)}>
                    <TableCell>
                      <input type="radio" checked={selectedClassId === classItem.classId} onChange={() => setSelectedClassId(classItem.classId)} className="h-4 w-4" />
                    </TableCell>
                    <TableCell>{classItem.classCode}</TableCell>
                    <TableCell>{classItem.className}</TableCell>
                    <TableCell>{classItem.lecturer.fullName}</TableCell>
                    <TableCell>{new Date(classItem.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{classItem.endDate ? new Date(classItem.endDate).toLocaleDateString() : "N/A"}</TableCell>
                    <TableCell>{classItem.classStudents.length}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSelect} disabled={!selectedClassId}>
          Select Class
        </Button>
      </CardFooter>
    </Card>
  );
}
