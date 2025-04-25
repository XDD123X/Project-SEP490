import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Eye, UserMinus, Flag, TriangleAlert } from "lucide-react";
import { StudentDetailsDialog } from "./student-detail-dialog";

export function ClassStudentsCard({ classData, onRemoveStudent }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useState(() => {
    console.log(classData);
  }, []);

  const sortedByEmail = classData.classStudents.sort((a, b) => {
    return a.student.email.localeCompare(b.student.email, undefined, { numeric: true });
  });

  // Filter students based on search term
  const filteredStudents = sortedByEmail.filter((cs) => cs.student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || cs.student.email.toLowerCase().includes(searchTerm.toLowerCase()));

  // Handle view student details
  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setIsDialogOpen(true);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Students in Class ({classData.classStudents.length})</CardTitle>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search students..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </CardHeader>
      <CardContent>
        {classData.classStudents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No students in this class</div>
        ) : (
          <ScrollArea className="h-[400px] rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((cs, index) => (
                  <TableRow key={cs.studentId} className={cs.student.status === 0 && 'text-yellow-500'}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {cs.student.fullName}
                        {cs.student.status === 0 && <TriangleAlert className="w-4 h-4 text-yellow-500" />}
                      </div>
                    </TableCell>
                    <TableCell>{cs.student.email}</TableCell>
                    <TableCell>{cs.student.phoneNumber}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleViewStudent(cs.student)} title="View student details">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        disabled={cs.student.status === 1 && cs.status === 1 && classData.status === 2}
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveStudent(cs.studentId)}
                        title="Remove from class"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>

      {/* Student Details Dialog */}
      <StudentDetailsDialog student={selectedStudent} isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </Card>
  );
}
