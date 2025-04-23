import React, { useEffect } from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { GetClassList } from "@/services/classService";
import { toast } from "sonner";
import { format } from "date-fns";



export function ClassSelectionCard({ onClassSelect }) {
  const [classes, setClasses] = useState();
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
      setClasses(classes);
      return;
    }
    const filtered = classes.filter((c) => c.classCode.toLowerCase().includes(term.toLowerCase()) || c.className.toLowerCase().includes(term.toLowerCase()) || c.lecturer.fullName.toLowerCase().includes(term.toLowerCase()));
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
                  Start{sortConfig.key === "startDate" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                </TableHead>
                <TableHead>End</TableHead>
                <TableHead>Students</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No classes found
                  </TableCell>
                </TableRow>
              ) : (
                classes && classes.map((classItem) => (
                  <TableRow key={classItem.classId} className={selectedClassId === classItem.classId ? "bg-muted" : ""} onClick={() => setSelectedClassId(classItem.classId)}>
                    <TableCell>
                      <input type="radio" checked={selectedClassId === classItem.classId} onChange={() => setSelectedClassId(classItem.classId)} className="h-4 w-4" />
                    </TableCell>
                    <TableCell>{classItem.classCode}</TableCell>
                    <TableCell>{classItem.className}</TableCell>
                    <TableCell>{classItem.lecturer?.fullName || '-'}</TableCell>
                    <TableCell>{classItem.startDate ? format(classItem.startDate, "dd/MM/yyyy") : "N/A"}</TableCell>
                    <TableCell>{classItem.endDate ? format(classItem.endDate, "dd/MM/yyyy") : "N/A"}</TableCell>
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
