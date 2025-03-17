"use client";

import { useState } from "react";
import { Search, Download, Upload, Save } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Sample data
const sampleClasses = [
  {
    id: "1",
    code: "CS101",
    name: "Introduction to Computer Science",
    lecturerName: "Dr. Smith",
    startDate: new Date(2023, 8, 1),
    endDate: new Date(2023, 11, 15),
    students: ["1", "2", "3"],
  },
  {
    id: "2",
    code: "MATH202",
    name: "Advanced Calculus",
    lecturerName: "Prof. Johnson",
    startDate: new Date(2023, 8, 5),
    endDate: new Date(2023, 11, 20),
    students: ["4", "5"],
  },
  {
    id: "3",
    code: "ENG105",
    name: "English Composition",
    lecturerName: "Ms. Davis",
    startDate: new Date(2023, 8, 3),
    endDate: new Date(2023, 11, 18),
    students: ["6", "7", "8"],
  },
];

const sampleStudents = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "123-456-7890",
    dob: new Date(2000, 5, 15),
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "123-456-7891",
    dob: new Date(2001, 3, 22),
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    phone: "123-456-7892",
    dob: new Date(1999, 8, 10),
  },
  {
    id: "4",
    name: "Alice Williams",
    email: "alice.williams@example.com",
    phone: "123-456-7893",
    dob: new Date(2000, 11, 5),
  },
  {
    id: "5",
    name: "Charlie Brown",
    email: "charlie.brown@example.com",
    phone: "123-456-7894",
    dob: new Date(2001, 1, 28),
  },
  {
    id: "6",
    name: "Diana Miller",
    email: "diana.miller@example.com",
    phone: "123-456-7895",
    dob: new Date(1999, 4, 17),
  },
  {
    id: "7",
    name: "Edward Davis",
    email: "edward.davis@example.com",
    phone: "123-456-7896",
    dob: new Date(2000, 7, 9),
  },
  {
    id: "8",
    name: "Fiona Wilson",
    email: "fiona.wilson@example.com",
    phone: "123-456-7897",
    dob: new Date(2001, 9, 3),
  },
  {
    id: "9",
    name: "George Taylor",
    email: "george.taylor@example.com",
    phone: "123-456-7898",
    dob: new Date(1999, 2, 25),
  },
  {
    id: "10",
    name: "Hannah Moore",
    email: "hannah.moore@example.com",
    phone: "123-456-7899",
    dob: new Date(2000, 10, 12),
  },
];

export default function ClassAddStudentPage() {
  const [classes, setClasses] = useState(sampleClasses);
  const [students, setStudents] = useState(sampleStudents);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classSearch, setClassSearch] = useState("");
  const [classSort, setClassSort] = useState("code");
  const [currentStudentSearch, setCurrentStudentSearch] = useState("");
  const [currentStudentSort, setCurrentStudentSort] = useState("name");
  const [allStudentSearch, setAllStudentSearch] = useState("");
  const [allStudentSort, setAllStudentSort] = useState("name");
  const [importData, setImportData] = useState("");
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // Filter and sort classes
  const filteredClasses = classes.filter((cls) => cls.code.toLowerCase().includes(classSearch.toLowerCase()) || cls.name.toLowerCase().includes(classSearch.toLowerCase()) || cls.lecturerName.toLowerCase().includes(classSearch.toLowerCase()));

  const sortedClasses = [...filteredClasses].sort((a, b) => {
    switch (classSort) {
      case "code":
        return a.code.localeCompare(b.code);
      case "name":
        return a.name.localeCompare(b.name);
      case "lecturer":
        return a.lecturerName.localeCompare(b.lecturerName);
      case "date":
        return a.startDate.getTime() - b.startDate.getTime();
      default:
        return 0;
    }
  });

  // Get current students in the selected class
  const currentStudents = selectedClass ? students.filter((student) => selectedClass.students.includes(student.id)) : [];

  // Filter and sort current students
  const filteredCurrentStudents = currentStudents.filter(
    (student) => student.name.toLowerCase().includes(currentStudentSearch.toLowerCase()) || student.email.toLowerCase().includes(currentStudentSearch.toLowerCase()) || student.phone.includes(currentStudentSearch)
  );

  const sortedCurrentStudents = [...filteredCurrentStudents].sort((a, b) => {
    switch (currentStudentSort) {
      case "name":
        return a.name.localeCompare(b.name);
      case "email":
        return a.email.localeCompare(b.email);
      case "phone":
        return a.phone.localeCompare(b.phone);
      case "dob":
        return a.dob.getTime() - b.dob.getTime();
      default:
        return 0;
    }
  });

  // Get all students not in the selected class
  const allStudents = selectedClass ? students.filter((student) => !selectedClass.students.includes(student.id)) : students;

  // Filter and sort all students
  const filteredAllStudents = allStudents.filter((student) => student.name.toLowerCase().includes(allStudentSearch.toLowerCase()) || student.email.toLowerCase().includes(allStudentSearch.toLowerCase()) || student.phone.includes(allStudentSearch));

  const sortedAllStudents = [...filteredAllStudents].sort((a, b) => {
    switch (allStudentSort) {
      case "name":
        return a.name.localeCompare(b.name);
      case "email":
        return a.email.localeCompare(b.email);
      case "phone":
        return a.phone.localeCompare(b.phone);
      case "dob":
        return a.dob.getTime() - b.dob.getTime();
      default:
        return 0;
    }
  });

  // Handle moving students between lists
  const moveToCurrentStudents = (studentId) => {
    if (!selectedClass) return;

    const updatedClasses = classes.map((cls) => {
      if (cls.id === selectedClass.id) {
        return {
          ...cls,
          students: [...cls.students, studentId],
        };
      }
      return cls;
    });

    setClasses(updatedClasses);
    setSelectedClass(updatedClasses.find((cls) => cls.id === selectedClass.id) || null);
  };

  const moveToAllStudents = (studentId) => {
    if (!selectedClass) return;

    const updatedClasses = classes.map((cls) => {
      if (cls.id === selectedClass.id) {
        return {
          ...cls,
          students: cls.students.filter((id) => id !== studentId),
        };
      }
      return cls;
    });

    setClasses(updatedClasses);
    setSelectedClass(updatedClasses.find((cls) => cls.id === selectedClass.id) || null);
  };

  // Handle import/export
  const handleImport = () => {
    try {
      const data = JSON.parse(importData);
      if (data && data.classId && Array.isArray(data.students)) {
        const updatedClasses = classes.map((cls) => {
          if (cls.id === data.classId) {
            return {
              ...cls,
              students: [...new Set([...cls.students, ...data.students])],
            };
          }
          return cls;
        });
        setClasses(updatedClasses);
        if (selectedClass && selectedClass.id === data.classId) {
          setSelectedClass(updatedClasses.find((cls) => cls.id === data.classId) || null);
        }
        setIsImportDialogOpen(false);
      }
    } catch (error) {
      console.error("Invalid import data", error);
    }
  };

  const handleExport = () => {
    if (!selectedClass) return;

    const exportData = {
      classId: selectedClass.id,
      className: selectedClass.name,
      classCode: selectedClass.code,
      students: selectedClass.students,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `${selectedClass.code}_students.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  // Handle save
  const handleSave = () => {
    console.log("Saving data:", { classes, students });
    // In a real application, this would send the data to a server
    alert("Data saved successfully!");
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Class Management</h1>
        <div className="flex gap-2">
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import from Excel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Students</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <p className="text-sm text-muted-foreground">Paste JSON data in the format: {`{ "classId": "1", "students": ["1", "2", "3"] }`}</p>
                <textarea
                  className="min-h-[200px] p-2 border rounded-md"
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder={`{
                    "classId": "1",
                    "students": ["9", "10"]
                  }`}
                />
                <Button onClick={handleImport}>Import</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handleExport} disabled={!selectedClass}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Class Selection Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Select Class</CardTitle>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search classes..." value={classSearch} onChange={(e) => setClassSearch(e.target.value)} className="h-8" />
            </div>
            <Select value={classSort} onValueChange={(value) => setClassSort(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="code">Class Code</SelectItem>
                <SelectItem value="name">Class Name</SelectItem>
                <SelectItem value="lecturer">Lecturer Name</SelectItem>
                <SelectItem value="date">Date</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {sortedClasses.map((cls) => (
                <div key={cls.id} className={`p-3 rounded-md cursor-pointer ${selectedClass?.id === cls.id ? "bg-primary text-primary-foreground" : "bg-muted"}`} onClick={() => setSelectedClass(cls)}>
                  <div className="font-medium">
                    {cls.code}: {cls.name}
                  </div>
                  <div className="text-sm">{cls.lecturerName}</div>
                  <div className="text-xs">
                    {format(cls.startDate, "MMM d, yyyy")} - {format(cls.endDate, "MMM d, yyyy")}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Students Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Current Students</CardTitle>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search current students..." value={currentStudentSearch} onChange={(e) => setCurrentStudentSearch(e.target.value)} className="h-8" />
            </div>
            <Select value={currentStudentSort} onValueChange={(value) => setCurrentStudentSort(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="dob">Date of Birth</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {selectedClass ? (
                sortedCurrentStudents.length > 0 ? (
                  sortedCurrentStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback>{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm">{student.email}</div>
                          <div className="text-xs">{student.phone}</div>
                          <div className="text-xs">{format(student.dob, "MMM d, yyyy")}</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => moveToAllStudents(student.id)}>
                        &rarr;
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">No students in this class</div>
                )
              ) : (
                <div className="text-center py-4 text-muted-foreground">Select a class to view students</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* All Students Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>All Students</CardTitle>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search all students..." value={allStudentSearch} onChange={(e) => setAllStudentSearch(e.target.value)} className="h-8" />
            </div>
            <Select value={allStudentSort} onValueChange={(value) => setAllStudentSort(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="dob">Date of Birth</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {selectedClass ? (
                sortedAllStudents.length > 0 ? (
                  sortedAllStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback>{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm">{student.email}</div>
                          <div className="text-xs">{student.phone}</div>
                          <div className="text-xs">{format(student.dob, "MMM d, yyyy")}</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => moveToCurrentStudents(student.id)}>
                        &larr;
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">All students are in this class</div>
                )
              ) : (
                <div className="text-center py-4 text-muted-foreground">Select a class to view available students</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
      </div>
    </div>
  );
}
