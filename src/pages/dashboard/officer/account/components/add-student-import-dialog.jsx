import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, CircleAlert, CircleCheck, CircleXIcon, Save } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function ImportAccountsOfficerDialog({ isOpen, onClose, onImport, accountsData, type }) {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [fileData, setFileData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [columnMapping, setColumnMapping] = useState({
    email: -1,
    fullName: -1,
    phoneNumber: -1,
    dob: -1,
    gender: -1,
    createdDate: -1,
  });
  const [parsedAccounts, setParsedAccounts] = useState([]);
  const [step, setStep] = useState("upload");

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      const rows = text.split("\n").map((row) => row.split(",").map((cell) => cell.trim()));

      if (rows.length > 0) {
        setHeaders(rows[0]);
        setFileData(rows.slice(1).filter((row) => row.some((cell) => cell !== "")));

        // Try to auto-map columns
        const newMapping = { ...columnMapping };
        rows[0].forEach((header, index) => {
          const lowerHeader = header.toLowerCase();
          if (lowerHeader.includes("email")) newMapping.email = index;
          if (lowerHeader.includes("name")) newMapping.fullName = index;
          if (lowerHeader.includes("phone")) newMapping.phoneNumber = index;
          if (lowerHeader.includes("birth") || lowerHeader.includes("dob")) newMapping.dob = index;
          if (lowerHeader.includes("gender")) newMapping.gender = index;
        });

        setColumnMapping(newMapping);
        setStep("mapping");
      }
    };

    reader.readAsText(file);
  };

  // Handle column mapping change
  const handleMappingChange = (field, value) => {
    setColumnMapping({
      ...columnMapping,
      [field]: Number.parseInt(value),
    });
  };

  //normalize email
  const normalizeEmail = (email) => {
    // Loại bỏ ký tự không hợp lệ, chỉ giữ lại a-z, A-Z, 0-9, @ và .
    email = email.replace(/[^a-zA-Z0-9@.]/g, "");

    // Đảm bảo không có nhiều hơn một @ và ít nhất một .
    const atCount = (email.match(/@/g) || []).length;
    const dotCount = (email.match(/\./g) || []).length;

    if (atCount !== 1 || dotCount < 1) {
      return null; // Không thể sửa thành email hợp lệ
    }

    return email;
  };

  // Process data after mapping
  const handleProcessData = () => {
    if (columnMapping.email === -1) {
      alert("Email column must be mapped");
      return;
    }

    const existingEmails = new Set(accountsData.map((account) => account.email));

    const newAccounts = fileData.map((row) => {
      let hasInvalidField = false;

      // 1. Email
      let rawEmail = columnMapping.email !== -1 ? row[columnMapping.email] : "";
      rawEmail = rawEmail?.toString().trim();
      let email = normalizeEmail(rawEmail);
      if (!email) {
        email = rawEmail; // Giữ nguyên email nếu không hợp lệ
        hasInvalidField = true;
      }

      const isEmailExisted = existingEmails.has(email);

      // Nếu email đã tồn tại, không cần kiểm tra các trường còn lại
      if (isEmailExisted) {
        hasInvalidField = false;
      }

      // 2. Full name
      let fullName = row[columnMapping.fullName];
      if (columnMapping.fullName !== -1 && row[columnMapping.fullName]) {
        const name = row[columnMapping.fullName]
          .toString()
          .replace(/[^a-zA-ZÀ-ỹ\s]/g, "")
          .trim();
        if (name) {
          fullName = name;
        } else {
          fullName = row[columnMapping.fullName]; // Giữ nguyên tên nếu có lỗi
          hasInvalidField = true;
        }
      } else {
        fullName = "Invalid Name";
        hasInvalidField = true;
      }

      // 3. Phone number
      let phoneNumber = "";
      if (columnMapping.phoneNumber !== -1) {
        const digits = (row[columnMapping.phoneNumber] || "").toString().replace(/\D/g, "");
        if (digits.length === 10) {
          phoneNumber = digits;
        } else {
          phoneNumber = row[columnMapping.phoneNumber] || "Invalid Phone"; // Giữ nguyên số điện thoại nếu có lỗi
          hasInvalidField = true;
        }
      } else {
        phoneNumber = "Invalid Phone";
        hasInvalidField = true;
      }

      // 4. Date of birth
      let dob = new Date();
      if (columnMapping.dob !== -1 && row[columnMapping.dob]) {
        const parsedDate = new Date(row[columnMapping.dob]);
        if (!isNaN(parsedDate)) {
          dob = parsedDate.toISOString();
        } else {
          dob = "Invalid DOB";
          hasInvalidField = true;
        }
      } else {
        dob = "Invalid DOB";
        hasInvalidField = true;
      }

      // 5. Gender
      let gender = "";
      if (columnMapping.gender !== -1 && row[columnMapping.gender]) {
        const genderValue = row[columnMapping.gender].toString().toLowerCase();
        if (["female", "f", "0", "false"].includes(genderValue)) {
          gender = false;
        } else if (["male", "m", "1", "true"].includes(genderValue)) {
          gender = true;
        } else {
          gender = "Invalid Gender";
          hasInvalidField = true;
        }
      } else {
        gender = "Invalid Gender";
        hasInvalidField = true;
      }

      return {
        email,
        fullName,
        roleId: null,
        fulltime: null,
        phoneNumber,
        dob,
        gender,
        imgUrl: null,
        meetUrl: null,
        status: null,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        role: null,
        available: true,
        existed: isEmailExisted,
        invalid: hasInvalidField,
        // Additional invalid fields to be explicitly marked
        invalidFields: {
          email: isEmailExisted ? false : email === "Invalid Email",
          fullName: fullName === "Invalid Name",
          phoneNumber: phoneNumber === "Invalid Phone",
          dob: dob === "Invalid DOB",
          gender: gender === "Invalid Gender",
        },
      };
    });

    // Sort accounts: !invalid !existed -> invalid -> existed
    setParsedAccounts(
      newAccounts.sort((a, b) => {
        const getPriority = (acc) => {
          if (acc.existed) return 2; // Existed accounts have the lowest priority
          if (acc.invalid) return 1; // Invalid accounts come second
          return 0; // Valid accounts have the highest priority
        };
        return getPriority(a) - getPriority(b);
      })
    );

    setStep("preview");
  };

  const handleImport = () => {
    const filteredAccounts = parsedAccounts.filter((account) => account.existed === false || account.existed === undefined);
    onImport(filteredAccounts); // Chỉ import tài khoản chưa tồn tại
    resetDialog();
    onClose();
  };

  // Reset dialog state
  const resetDialog = () => {
    setFileName("");
    setFileData([]);
    setHeaders([]);
    setColumnMapping({
      email: -1,
      fullName: -1,
      phoneNumber: -1,
      dob: -1,
      gender: -1,
      createdDate: -1,
    });
    setParsedAccounts([]);
    setStep("upload");

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle dialog close
  const handleClose = () => {
    resetDialog();
    onClose();
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...parsedAccounts];
    updated[index][field] = value;

    // Sau khi chỉnh sửa có thể reset invalid của field
    if (updated[index].invalid?.[field]) {
      delete updated[index].invalid[field];
      if (Object.keys(updated[index].invalid).length === 0) {
        delete updated[index].invalid;
      }
    }

    setParsedAccounts(updated);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>Import {type}</DialogTitle>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <Input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="flex-1 cursor-pointer" />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Please upload a CSV file with {type} information.</p>
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
              {/* email */}
              <div className="space-y-2">
                <Label htmlFor="email-mapping">Email (Required)</Label>
                <Select value={columnMapping.email.toString()} onValueChange={(value) => handleMappingChange("email", value)}>
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
              {/* fullName */}
              <div className="space-y-2">
                <Label htmlFor="fullName-mapping">Full Name</Label>
                <Select value={columnMapping.fullName.toString()} onValueChange={(value) => handleMappingChange("fullName", value)}>
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

              {/* phoneNumber */}
              <div className="space-y-2">
                <Label htmlFor="phone-mapping">Phone Number</Label>
                <Select value={columnMapping.phoneNumber.toString()} onValueChange={(value) => handleMappingChange("phoneNumber", value)}>
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

              {/* dob */}
              <div className="space-y-2">
                <Label htmlFor="dob-mapping">Date of Birth</Label>
                <Select value={columnMapping.dob.toString()} onValueChange={(value) => handleMappingChange("dob", value)}>
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

              {/* gender */}
              <div className="space-y-2">
                <Label htmlFor="gender-mapping">Gender</Label>
                <Select value={columnMapping.gender.toString()} onValueChange={(value) => handleMappingChange("gender", value)}>
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
            <p className="text-sm font-medium">
              Preview: {parsedAccounts.length} {type} found
            </p>

            <ScrollArea className="h-[400px] rounded-md border p-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead></TableHead>
                    <TableHead>#</TableHead>

                    <TableHead>Email</TableHead>
                    {parsedAccounts.some((account) => account.existed) ? (
                      <TableHead colSpan={4} className="text-center">
                        Available
                      </TableHead>
                    ) : (
                      <>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Date Of Birth</TableHead>
                        <TableHead>Gender</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {parsedAccounts.map((account, index) => (
                    <TableRow key={index}>
                      <TableCell className="">
                        {!account.invalid && !account.existed ? (
                          <CircleCheck className="w-4 h-4 text-green-500" />
                        ) : account.invalid ? (
                          <CircleAlert className="w-4 h-4 text-yellow-500" /> // Biểu tượng cảnh báo cho invalid
                        ) : account.existed ? (
                          <CircleXIcon className="w-4 h-4 text-red-500" /> // Biểu tượng X cho existed
                        ) : null}
                      </TableCell>
                      <TableCell className="">{index + 1}</TableCell>

                      {/* Email */}
                      <TableCell>
                        <Input value={account.email} disabled={!account.invalid} className={cn("w-full", account.invalidFields?.email && "border-red-500")} onChange={(e) => handleInputChange(index, "email", e.target.value)} />
                      </TableCell>

                      {account.existed ? (
                        <TableCell colSpan={4} className="text-red-500 text-center">
                          Existed
                        </TableCell>
                      ) : (
                        <>
                          {/* Full Name */}
                          <TableCell>
                            <Input value={account.fullName} disabled={!account.invalid} className={cn("w-full", account.invalidFields?.fullName && "border-red-500")} onChange={(e) => handleInputChange(index, "fullName", e.target.value)} />
                          </TableCell>

                          {/* Phone Number */}
                          <TableCell>
                            <Input value={account.phoneNumber} disabled={!account.invalid} className={cn("w-full", account.invalidFields?.phoneNumber && "border-red-500")} onChange={(e) => handleInputChange(index, "phoneNumber", e.target.value)} />
                          </TableCell>

                          {/* DOB */}
                          <TableCell>
                            <Input
                              type="date"
                              value={account.dob !== "Invalid DOB" ? format(new Date(account.dob), "yyyy-MM-dd") : ""}
                              placeholder="Invalid DOB"
                              disabled={!account.invalid}
                              className={cn("w-full", account.invalidFields?.dob && "border-red-500")}
                              onChange={(e) => handleInputChange(index, "dob", e.target.value)}
                            />
                          </TableCell>

                          {/* Gender */}
                          <TableCell>
                            <Select
                              disabled={!account.invalid} // Disable khi không hợp lệ
                              value={account.gender === "Invalid Gender" ? "" : account.gender ? "Male" : "Female"}
                              onValueChange={(value) => handleInputChange(index, "gender", value === "Male" ? true : value === "Female" ? false : null)} // Cập nhật giá trị khi người dùng chọn
                              className={cn("w-full px-2 py-1 border rounded", account.invalidFields ? "border-red-500" : "")} // Thêm border đỏ khi invalid
                            >
                              <SelectTrigger className={` ${account.invalidFields?.gender && "border border-red-500"} `}>
                                <SelectValue placeholder="Select Gender" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
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
                Save {type}s
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
