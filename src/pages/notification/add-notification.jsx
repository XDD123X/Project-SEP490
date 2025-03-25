import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Upload } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { RichTextEditor } from "./rich-text-editor";

// Mock data for roles and accounts
const roleList = [
  { id: 1, name: "Officer" },
  { id: 2, name: "Student" },
  { id: 3, name: "Lecturer" },
];

const accountList = [
  { id: 1, email: "john.doe@example.com", name: "John Doe" },
  { id: 2, email: "jane.smith@example.com", name: "Jane Smith" },
  { id: 3, email: "alex.johnson@example.com", name: "Alex Johnson" },
  { id: 4, email: "sarah.williams@example.com", name: "Sarah Williams" },
  { id: 5, email: "michael.brown@example.com", name: "Michael Brown" },
  { id: 6, email: "emily.davis@example.com", name: "Emily Davis" },
  { id: 7, email: "david.miller@example.com", name: "David Miller" },
  { id: 8, email: "olivia.wilson@example.com", name: "Olivia Wilson" },
];

// Mock data for courses
const classList = [
  { id: 1, name: "Introduction to Computer Science" },
  { id: 2, name: "Advanced Web Development" },
  { id: 3, name: "Data Structures and Algorithms" },
  { id: 4, name: "Machine Learning Fundamentals" },
  { id: 5, name: "Mobile App Development" },
];

export default function AddNotificationPage() {
  const navigate = useNavigate();
  const [notificationType, setNotificationType] = useState("0"); // 0 - common, 1 - role, 2 - account
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedAccounts, setSelectedAccounts] = useState({});
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // In a real application, you would send this data to your backend
    const notificationData = {
      title,
      content,
      type: Number.parseInt(notificationType),
      role: notificationType === "1" ? selectedRole : null,
      class: notificationType === "2" ? selectedClass : null,
      accounts: notificationType === "3" ? Object.keys(selectedAccounts).filter((id) => selectedAccounts[id]) : null,
    };

    console.log("Notification data:", notificationData);

    // Redirect back to notifications page
    navigate("/notification");
  };

  // Handle CSV file upload
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split("\n");
      const headers = rows[0].split(",");

      // Skip header row
      const data = rows
        .slice(1)
        .map((row) => {
          const values = row.split(",");
          return {
            email: values[0]?.trim(),
            name: values[1]?.trim(),
          };
        })
        .filter((item) => item.email && item.name);

      setCsvData(data);

      // Auto-select accounts that match the CSV data
      const newSelectedAccounts = { ...selectedAccounts };
      accountList.forEach((account) => {
        if (data.some((item) => item.email.toLowerCase() === account.email.toLowerCase())) {
          newSelectedAccounts[account.id] = true;
        }
      });
      setSelectedAccounts(newSelectedAccounts);
    };

    reader.readAsText(file);
  };

  // Generate CSV template for download
  const generateCsvTemplate = () => {
    const headers = "email,name";
    const csvContent = `data:text/csv;charset=utf-8,${headers}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "notification_accounts_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle all accounts
  const toggleAllAccounts = (checked) => {
    const newSelectedAccounts = {};
    accountList.forEach((account) => {
      newSelectedAccounts[account.id] = checked;
    });
    setSelectedAccounts(newSelectedAccounts);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Add Notification</h1>
        <Button variant="outline" asChild>
          <Link to="/notification">Back to Notifications</Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Create New Notification</CardTitle>
            <CardDescription>Fill in the details below to create a new notification.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Notification Type */}
            <div className="space-y-2">
              <Label htmlFor="notification-type">Notification Type</Label>
              <Select value={notificationType} onValueChange={setNotificationType}>
                <SelectTrigger id="notification-type">
                  <SelectValue placeholder="Select notification type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">All (For Everyone)</SelectItem>
                  <SelectItem value="1">Role (For Specific Roles)</SelectItem>
                  <SelectItem value="2">Class (For Specific Courses)</SelectItem>
                  <SelectItem value="3">Account (For Specific Users)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Role Selection (if role type is selected) */}
            {notificationType === "1" && (
              <div className="space-y-2">
                <Label htmlFor="role">Select Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleList.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Class Selection (if class type is selected) */}
            {notificationType === "2" && (
              <div className="space-y-2">
                <Label htmlFor="class">Select Course</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger id="class">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {classList.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Account Selection (if account type is selected) */}
            {notificationType === "3" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Select Accounts</Label>
                  <div className="flex space-x-2">
                    <Button type="button" variant="outline" size="sm" onClick={generateCsvTemplate}>
                      <Download className="h-4 w-4 mr-1" />
                      Download Template
                    </Button>
                    <div className="relative">
                      <Input type="file" accept=".csv" onChange={handleCsvUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <Button type="button" variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-1" />
                        Import CSV
                      </Button>
                    </div>
                  </div>
                </div>

                {csvData.length > 0 && <div className="text-sm text-muted-foreground">Imported {csvData.length} accounts from CSV. Matching accounts have been selected.</div>}

                <div className="border rounded-md">
                  <div className="p-2 border-b bg-muted/50 flex items-center">
                    <Checkbox id="select-all" checked={Object.keys(selectedAccounts).length > 0 && Object.keys(selectedAccounts).every((id) => selectedAccounts[id])} onCheckedChange={(checked) => toggleAllAccounts(checked)} />
                    <Label htmlFor="select-all" className="ml-2">
                      Select All
                    </Label>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]"></TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accountList.map((account) => (
                          <TableRow key={account.id}>
                            <TableCell>
                              <Checkbox
                                id={`account-${account.id}`}
                                checked={selectedAccounts[account.id] || false}
                                onCheckedChange={(checked) => {
                                  setSelectedAccounts({
                                    ...selectedAccounts,
                                    [account.id]: checked,
                                  });
                                }}
                              />
                            </TableCell>
                            <TableCell>{account.name}</TableCell>
                            <TableCell>{account.email}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Notification Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter notification title" required />
            </div>

            {/* Notification Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Notification Content</Label>
              <RichTextEditor value={content} onChange={setContent} placeholder="Enter notification content (supports rich text formatting)" minHeight="200px" />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit">Create Notification</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
