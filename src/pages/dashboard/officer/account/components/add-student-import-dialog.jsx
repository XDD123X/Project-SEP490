import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, CircleAlert, CircleCheck, CircleXIcon, Save, Trash2, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

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
  const [isAddable, setIsAddable] = useState(false);

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

    const existingEmails = new Set(accountsData.map((a) => a.email));

    const newAccounts = fileData.map((row) => {
      let hasInvalidField = false;

      /* 1️⃣  Email (raw) */
      const rawEmail = (row[columnMapping.email] || "").toString().trim();
      const emailExisted = existingEmails.has(rawEmail);

      if (emailExisted) {
        return quickObj(rawEmail, true, false); // existed, không invalid
      }

      const normalized = normalizeEmail(rawEmail);
      const emailInvalid = !normalized;
      if (emailInvalid) hasInvalidField = true;

      /* 2️⃣  Full name (raw) */
      const rawName = row[columnMapping.fullName] || "";

      const cleanedName = rawName
        .toString()
        .replace(/[^a-zA-ZÀ-ỹ\s]/g, "")
        .trim();

      const nameInvalid = cleanedName.length === 0;
      if (nameInvalid) hasInvalidField = true;

      // Nếu hợp lệ → dùng cleanedName; nếu không → giữ rawName
      const fullName = nameInvalid ? rawName : cleanedName;

      /* 3️⃣  Phone (raw) */
      const rawPhone = row[columnMapping.phoneNumber] || "";
      const digits = rawPhone.toString().replace(/\D/g, "");
      const phoneInvalid = digits.length !== 10;
      if (phoneInvalid) hasInvalidField = true;

      /* 3️⃣  Dob (raw) */
      const rawDob = row[columnMapping.dob] || ""; // Đảm bảo giá trị mặc định là một chuỗi rỗng
      let dobDate = new Date(rawDob);

      // Kiểm tra nếu dobDate là giá trị hợp lệ
      const dobInvalid = isNaN(dobDate.getTime()); // `getTime()` sẽ trả về NaN nếu ngày không hợp lệ
      if (dobInvalid) {
        hasInvalidField = true;
        dobDate = null; // Gán null hoặc giá trị mặc định nào đó nếu ngày không hợp lệ
      }

      /* 5️⃣  Gender (raw) */
      const rawGender = row[columnMapping.gender] || "";
      const g = rawGender.toString().toLowerCase();

      let gender; // sẽ gán vào object kết quả
      let genderInvalid = false;

      if (["female", "f", "0", "false"].includes(g)) {
        gender = false; // Female  → false
      } else if (["male", "m", "1", "true"].includes(g)) {
        gender = true; // Male    → true
      } else {
        gender = ""; // giữ nguyên giá trị gốc để người dùng thấy
        genderInvalid = true;
        hasInvalidField = true;
      }

      return {
        id: uuidv4(),
        email: rawEmail, // giữ RAW
        fullName: fullName,
        phoneNumber: rawPhone,
        dob: dobDate ? dobDate.toISOString() : "Invalid DOB",
        gender,
        roleId: null,
        fulltime: null,
        imgUrl: null,
        meetUrl: null,
        status: null,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        role: null,
        available: true,
        existed: false,
        invalid: hasInvalidField,
        invalidFields: {
          email: emailInvalid,
          fullName: nameInvalid,
          phoneNumber: phoneInvalid,
          dob: dobInvalid,
          gender: genderInvalid,
        },
      };
    });

    /* Sắp xếp: valid → invalid → existed */
    setParsedAccounts(
      newAccounts.sort((a, b) => {
        const p = (x) => (x.existed ? 2 : x.invalid ? 1 : 0);
        return p(a) - p(b);
      })
    );

    setStep("preview");
  };

  /* Hàm rút gọn khi email đã tồn tại */
  const quickObj = (rawEmail, existed, invalid) => ({
    id: uuidv4(),
    email: rawEmail,
    fullName: null,
    roleId: null,
    fulltime: null,
    phoneNumber: null,
    dob: null,
    gender: null,
    imgUrl: null,
    meetUrl: null,
    status: null,
    createdAt: new Date().toISOString(),
    updatedAt: null,
    role: null,
    available: true,
    existed,
    invalid,
    invalidFields: { email: existed, fullName: false, phoneNumber: false, dob: false, gender: false },
  });

  //revalidate field
  const revalidateAccount = (account) => {
    let hasInvalidField = false;

    // Validate email (định dạng chuẩn)
    let email = account.email?.toString().trim();
    const emailRegex = /^(?!\.)(?!.*\.\.)[A-Za-z0-9.]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

    // kiểm tra trùng email (không phân biệt hoa thường)
    const emailExists = [...accountsData, ...parsedAccounts] // gộp 2 nguồn
      .some(
        (acc) => acc.email?.toLowerCase() === email?.toLowerCase() && acc.id !== account.id // bỏ qua chính bản thân
      );

    if (!emailRegex.test(email) || emailExists) {
      hasInvalidField = true;
      if (emailExists) {
        email = `(Existed)${email}`; // thêm tiền tố cảnh báo
      }
    }

    // Validate full name
    let fullName = account.fullName?.toString().trim();
    const isInvalidName = fullName?.toLowerCase() === "invalid name" || !fullName;
    if (isInvalidName) {
      hasInvalidField = true; // Chỉ đánh dấu là không hợp lệ mà không thay đổi giá trị fullName
    }

    // Validate phone number
    let phoneNumber = account.phoneNumber?.toString().replace(/\D/g, "");
    if (phoneNumber.length !== 10) {
      hasInvalidField = true; // Chỉ đánh dấu là không hợp lệ mà không thay đổi giá trị phoneNumber
    }

    // Validate DOB
    let dob = account.dob;
    const parsedDate = new Date(dob);
    if (isNaN(parsedDate.getTime())) {
      hasInvalidField = true; // Chỉ đánh dấu là không hợp lệ mà không thay đổi giá trị dob
    } else {
      dob = parsedDate.toISOString(); // Đảm bảo rằng nếu hợp lệ, giá trị là ISO string
    }

    // Validate gender
    let genderRaw = account.gender; // giá trị gốc
    const genderVal = genderRaw?.toString().toLowerCase();

    let gender; // giá trị chuẩn hoá đưa vào state
    let genderInvalid = false;

    if (["female", "f", "0", "false"].includes(genderVal)) {
      gender = false; // Female  → false
    } else if (["male", "m", "1", "true"].includes(genderVal)) {
      gender = true; // Male    → true
    } else {
      gender = genderRaw || "Invalid"; // giữ raw để user thấy
      genderInvalid = true;
      hasInvalidField = true;
    }

    // Nếu không có trường nào bị lỗi, set invalid = false
    const invalid = hasInvalidField;

    return {
      ...account,
      email,
      fullName,
      phoneNumber,
      dob,
      gender,
      invalid, // Set invalid là true nếu có lỗi, false nếu không có lỗi
      invalidFields: {
        email: !emailRegex.test(email), // Nếu không hợp lệ, email sẽ bị đánh dấu là invalid
        fullName: isInvalidName,
        phoneNumber: phoneNumber.length !== 10,
        dob: isNaN(parsedDate.getTime()),
        gender: genderInvalid,
      },
    };
  };

  const handleImport = () => {
    /* 1. Lấy các dòng cần re‑validate */
    const available = parsedAccounts.filter((acc) => !acc.existed && acc.invalid);

    /* 2. Re‑validate */
    const revalidated = available.map(revalidateAccount);

    /* 3. Cập nhật UI */
    setParsedAccounts((prev) => {
      const map = new Map(revalidated.map((acc) => [acc.id, acc]));
      const updated = prev.map((acc) => map.get(acc.id) ?? acc);

      const priority = (x) => (x.existed ? 2 : x.invalid ? 1 : 0);
      return updated.sort((a, b) => priority(a) - priority(b));
    });

    /* 4. Đánh giá kết quả ngay bằng revalidated + các account đã OK sẵn */
    const stillInvalid = revalidated.filter((acc) => acc.invalid);

    if (stillInvalid.length === 0) {
      // Gọi import cho tất cả account hợp lệ (đã tồn tại + mới hợp lệ)

      if (parsedAccounts.length === 0) {
        toast.error(`No ${type}s Added`);
        resetDialog();
        onClose();
        return;
      }

      const accountsToImport = parsedAccounts.filter((acc) => !acc.existed && !acc.invalid).concat(revalidated); // revalidated đã hợp lệ
      onImport(accountsToImport);
      resetDialog();
      onClose();
    } else {
      toast.error("Please validate all fields");
    }
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

  const handleInputChange = (id, field, value) => {
    setParsedAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id !== id) return acc;

        /* ----- clone và cập nhật field ----- */
        const updated = { ...acc };

        // Xử lý riêng cho gender: giữ chuỗi trong state
        if (field === "gender") {
          updated.gender = value === "Male" ? true : value === "Female" ? false : null;
        } else {
          updated[field] = value;
        }

        /* ----- cập nhật invalidFields ----- */
        if (updated.invalidFields?.[field]) {
          const nf = { ...updated.invalidFields };
          delete nf[field];
          updated.invalidFields = Object.keys(nf).length ? nf : undefined;
        }

        updated.invalid = !!updated.invalidFields; // true nếu còn bất kỳ field lỗi
        return updated;
      })
    );
  };

  const handleDeleteAccount = (id) => {
    setParsedAccounts((prev) => prev.filter((acc) => acc.id !== id));
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
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {parsedAccounts.map((account, index) => (
                    <TableRow
                      key={account.id}
                      className={`${
                        !account.existed && !account.invalid
                          ? "" // Màu xanh nếu existed = false và invalid = false
                          : account.invalid && !account.existed
                          ? "" // Màu vàng nếu existed = false và invalid = true
                          : account.existed
                          ? "" // Màu đỏ nếu existed = true
                          : ""
                      }`}
                    >
                      <TableCell className="">
                        {!account.invalid && !account.existed ? (
                          <CircleCheck className="w-4 h-4 text-green-500" />
                        ) : account.invalid && !account.existed ? (
                          <CircleAlert className="w-4 h-4 text-yellow-500" /> // Biểu tượng cảnh báo cho invalid
                        ) : account.existed ? (
                          <CircleXIcon className="w-4 h-4 text-red-500" /> // Biểu tượng X cho existed
                        ) : null}
                      </TableCell>
                      <TableCell className="">{index + 1}</TableCell>

                      {/* Email */}
                      <TableCell>
                        <Input value={account.email} disabled={!account.invalid} className={cn("w-full", account.invalidFields?.email && !account.existed && "border-red-500")} onChange={(e) => handleInputChange(account.id, "email", e.target.value)} />
                      </TableCell>

                      {account.existed ? (
                        <TableCell colSpan={4} className="text-red-500 text-center">
                          Existed
                        </TableCell>
                      ) : (
                        <>
                          {/* Full Name */}
                          <TableCell>
                            <Input value={account.fullName} disabled={!account.invalid} className={cn("w-full", account.invalidFields?.fullName && "border-red-500")} onChange={(e) => handleInputChange(account.id, "fullName", e.target.value)} />
                          </TableCell>

                          {/* Phone Number */}
                          <TableCell>
                            <Input value={account.phoneNumber} disabled={!account.invalid} className={cn("w-full", account.invalidFields?.phoneNumber && "border-red-500")} onChange={(e) => handleInputChange(account.id, "phoneNumber", e.target.value)} />
                          </TableCell>

                          {/* DOB */}
                          <TableCell>
                            <Input
                              type="date"
                              value={
                                account.dob && account.dob !== "Invalid DOB"
                                  ? format(new Date(account.dob), "yyyy-MM-dd") // Đảm bảo ngày được format theo định dạng "yyyy-MM-dd"
                                  : "" // Nếu dob là "Invalid DOB" hoặc không hợp lệ, để trống input
                              }
                              placeholder="Invalid DOB"
                              disabled={!account.invalid}
                              className={cn("w-full", account.invalidFields?.dob && "border-red-500")}
                              onChange={(e) => handleInputChange(account.id, "dob", e.target.value)}
                            />
                          </TableCell>

                          {/* Gender */}
                          <TableCell>
                            <Select
                              disabled={!account.invalid}
                              value={account.gender === true ? "Male" : account.gender === false ? "Female" : "" /* invalid → "" để placeholder rỗng */}
                              onValueChange={
                                (val) => handleInputChange(account.id, "gender", val) // lưu "Male"/"Female"
                              }
                              className={cn("w-full px-2 py-1 border rounded", account.invalidFields?.gender && "border-red-500")}
                            >
                              <SelectTrigger className={account.invalidFields?.gender ? "border border-red-500" : ""}>
                                {account.invalidFields?.gender ? <span className="text-red-500">{String(account.gender || "Invalid")}</span> : <SelectValue placeholder="Select Gender" />}
                              </SelectTrigger>

                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteAccount(account.id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
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
