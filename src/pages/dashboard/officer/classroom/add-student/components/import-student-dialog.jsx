import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Save } from "lucide-react"

export function ImportStudentsDialog({ isOpen, onClose, onImport }) {
  const fileInputRef = useRef(null)
  const [fileName, setFileName] = useState("")
  const [fileData, setFileData] = useState([])
  const [headers, setHeaders] = useState([])
  const [columnMapping, setColumnMapping] = useState({
    fullName: -1,
    email: -1,
    phoneNumber: -1,
    dob: -1,
    gender: -1,
  })
  const [parsedStudents, setParsedStudents] = useState([])
  const [step, setStep] = useState("upload")
  const [importMode, setImportMode] = useState("add")

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result
      const rows = text.split("\n").map((row) => row.split(",").map((cell) => cell.trim()))

      if (rows.length > 0) {
        setHeaders(rows[0])
        setFileData(rows.slice(1).filter((row) => row.some((cell) => cell !== "")))

        // Try to auto-map columns
        const newMapping = { ...columnMapping }
        rows[0].forEach((header, index) => {
          const lowerHeader = header.toLowerCase()
          if (lowerHeader.includes("name")) newMapping.fullName = index
          if (lowerHeader.includes("email")) newMapping.email = index
          if (lowerHeader.includes("phone")) newMapping.phoneNumber = index
          if (lowerHeader.includes("birth") || lowerHeader.includes("dob")) newMapping.dob = index
          if (lowerHeader.includes("gender")) newMapping.gender = index
        })

        setColumnMapping(newMapping)
        setStep("mapping")
      }
    }

    reader.readAsText(file)
  }

  // Handle column mapping change
  const handleMappingChange = (field, value) => {
    setColumnMapping({
      ...columnMapping,
      [field]: Number.parseInt(value),
    })
  }

  // Process data after mapping
  const handleProcessData = () => {
    // Validate that email column is mapped
    if (columnMapping.email === -1) {
      alert("Email column must be mapped")
      return
    }

    const students = fileData.map((row, index) => {
      // Get gender value
      let gender = true // Default to male
      if (columnMapping.gender !== -1) {
        const genderValue = row[columnMapping.gender].toLowerCase()
        gender = !(genderValue === "female" || genderValue === "f" || genderValue === "0" || genderValue === "false")
      }

      return {
        accountId: `import-${index}`,
        email: columnMapping.email !== -1 ? row[columnMapping.email] : "",
        fullName: columnMapping.fullName !== -1 ? row[columnMapping.fullName] : "",
        roleId: "b5ec52be-e7ea-442c-927e-f023416f2202",
        fulltime: true,
        phoneNumber: columnMapping.phoneNumber !== -1 ? row[columnMapping.phoneNumber] : "",
        dob: columnMapping.dob !== -1 ? row[columnMapping.dob] : "2000-01-01",
        gender: gender,
        imgUrl: "https://ui.shadcn.com/avatars/shadcn.jpg",
        meetUrl: "https://example.com/meet/euf-nwbu-cet",
        status: 1,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        role: null,
      }
    })

    setParsedStudents(students)
    setStep("preview")
  }

  // Handle import
  const handleImport = () => {
    onImport(parsedStudents, importMode)
    resetDialog()
    onClose()
  }

  // Reset dialog state
  const resetDialog = () => {
    setFileName("")
    setFileData([])
    setHeaders([])
    setColumnMapping({
      fullName: -1,
      email: -1,
      phoneNumber: -1,
      dob: -1,
      gender: -1,
    })
    setParsedStudents([])
    setStep("upload")
    setImportMode("add")

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Handle dialog close
  const handleClose = () => {
    resetDialog()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Import Students</DialogTitle>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <Input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="flex-1 cursor-pointer" />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Please upload a CSV file with student information.</p>
              <p>The file should contain columns for name, email, phone, date of birth, and gender.</p>
              <p>You can download a template using the &quot;Download Template&quot; button.</p>
            </div>
          </div>
        )}

        {step === "mapping" && (
          <div className="space-y-4 py-4">
            <p className="text-sm font-medium">File: {fileName}</p>
            <p className="text-sm">Map the columns from your file to the required fields:</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName-mapping">Full Name</Label>
                <Select
                  value={columnMapping.fullName.toString()}
                  onValueChange={(value) => handleMappingChange("fullName", value)}
                >
                  <SelectTrigger id="fullName-mapping">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1">Not mapped</SelectItem>
                    {headers.map((header, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-mapping">Email (Required)</Label>
                <Select
                  value={columnMapping.email.toString()}
                  onValueChange={(value) => handleMappingChange("email", value)}
                >
                  <SelectTrigger id="email-mapping">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1">Not mapped</SelectItem>
                    {headers.map((header, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone-mapping">Phone Number</Label>
                <Select
                  value={columnMapping.phoneNumber.toString()}
                  onValueChange={(value) => handleMappingChange("phoneNumber", value)}
                >
                  <SelectTrigger id="phone-mapping">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1">Not mapped</SelectItem>
                    {headers.map((header, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob-mapping">Date of Birth</Label>
                <Select
                  value={columnMapping.dob.toString()}
                  onValueChange={(value) => handleMappingChange("dob", value)}
                >
                  <SelectTrigger id="dob-mapping">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1">Not mapped</SelectItem>
                    {headers.map((header, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender-mapping">Gender</Label>
                <Select
                  value={columnMapping.gender.toString()}
                  onValueChange={(value) => handleMappingChange("gender", value)}
                >
                  <SelectTrigger id="gender-mapping">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1">Not mapped</SelectItem>
                    {headers.map((header, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={handleProcessData} disabled={columnMapping.email === -1}>
                Process Data
              </Button>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4 py-4">
            <p className="text-sm font-medium">Preview: {parsedStudents.length} students found</p>

            <ScrollArea className="h-[300px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead>Gender</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedStudents.map((student, index) => (
                    <TableRow key={index}>
                      <TableCell>{student.fullName}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.phoneNumber}</TableCell>
                      <TableCell>{student.dob}</TableCell>
                      <TableCell>{student.gender ? "Male" : "Female"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            <div className="pt-4 space-y-2">
              <Label>Import Mode</Label>
              <RadioGroup
                value={importMode}
                onValueChange={(value) => setImportMode(value)}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="add" id="add" />
                  <Label htmlFor="add" className="font-normal">
                    Add to current students
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="replace" id="replace" />
                  <Label htmlFor="replace" className="font-normal">
                    Replace all current students
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === "upload" && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}

          {step === "mapping" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")}>
                Back
              </Button>
              {/* <Button onClick={handleProcessData} disabled={columnMapping.email === -1}>
                Process Data
              </Button> */}
            </>
          )}

          {step === "preview" && (
            <>
              <Button variant="outline" onClick={() => setStep("mapping")}>
                Back
              </Button>
              <Button onClick={handleImport} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Students
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

