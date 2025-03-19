import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Eye, UserPlus } from "lucide-react";
import { StudentDetailsDialog } from "./student-detail-dialog";

export function AllStudentsCard({ students, onAddStudents }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sortedByEmail = students.sort((a, b) => {
    return a.email.localeCompare(b.email, undefined, { numeric: true });
  });

  // Filter students based on search term
  const filteredStudents = sortedByEmail.filter((student) => student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || student.email.toLowerCase().includes(searchTerm.toLowerCase()));

  // Handle student selection
  const handleStudentSelect = (studentId) => {
    if (selectedStudentIds.includes(studentId)) {
      setSelectedStudentIds(selectedStudentIds.filter((id) => id !== studentId));
    } else {
      setSelectedStudentIds([...selectedStudentIds, studentId]);
    }
  };

  // Handle select all students
  const handleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((student) => student.accountId));
    }
  };

  // Handle view student details
  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setIsDialogOpen(true);
  };

  // Handle add selected students to class
  const handleAddToClass = () => {
    if (selectedStudentIds.length > 0) {
      onAddStudents(selectedStudentIds);
      setSelectedStudentIds([]);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>All Students ({students.length})</CardTitle>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search students..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No students available</div>
        ) : (
          <ScrollArea className="h-[400px] rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input type="checkbox" checked={selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0} onChange={handleSelectAll} className="h-4 w-4" />
                  </TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.accountId}>
                    <TableCell>
                      <input type="checkbox" checked={selectedStudentIds.includes(student.accountId)} onChange={() => handleStudentSelect(student.accountId)} className="h-4 w-4" />
                    </TableCell>
                    <TableCell>{student.fullName}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.phoneNumber}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleViewStudent(student)} title="View student details">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onAddStudents([student.accountId])} title="Add to class" className="text-green-500 hover:text-green-700 hover:bg-green-50">
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleAddToClass} disabled={selectedStudentIds.length === 0} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add Selected to Class ({selectedStudentIds.length})
        </Button>
      </CardFooter>

      {/* Student Details Dialog */}
      <StudentDetailsDialog student={selectedStudent} isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </Card>
  );
}
