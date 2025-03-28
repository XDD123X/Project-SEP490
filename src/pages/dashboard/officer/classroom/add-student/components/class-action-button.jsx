import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Upload, FileDown } from "lucide-react"
import { ImportStudentsDialog } from "./import-student-dialog"

export function ClassActionButtons({ classData, onImportStudents, studentsData }) {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)

  // Handle export class students
  const handleExport = () => {
    // Create CSV content
    const headers = ["Full Name", "Email", "Phone Number", "Date of Birth", "Gender"]
    const rows = classData.classStudents.map((cs) => [
      cs.student.fullName,
      cs.student.email,
      cs.student.phoneNumber,
      cs.student.dob,
      cs.student.gender ? "Male" : "Female",
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${classData.classCode}_students.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle download template
  const handleDownloadTemplate = () => {
    const templateHeaders = ["Full Name", "Email", "Phone Number", "Date of Birth", "Gender"]
    const templateRow = ["John Doe", "john.doe@example.com", "0123456789", "2000-01-01", "Male"]

    const csvContent = [templateHeaders.join(","), templateRow.join(",")].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "student_import_template.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-wrap gap-3 justify-end">
      <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsImportDialogOpen(true)}>
        <Upload className="h-4 w-4" />
        Import Students
      </Button>

      <Button variant="outline" className="flex items-center gap-2" onClick={handleExport}>
        <Download className="h-4 w-4" />
        Export Students
      </Button>

      <Button variant="outline" className="flex items-center gap-2" onClick={handleDownloadTemplate}>
        <FileDown className="h-4 w-4" />
        Download Template
      </Button>

      <ImportStudentsDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={onImportStudents}
        studentsData = {studentsData}
        classData={classData}
      />
    </div>
  )
}

