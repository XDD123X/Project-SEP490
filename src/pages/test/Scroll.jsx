/**
 * v0 by Vercel.
 * @see https://v0.dev/t/7M19noKUAic
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge, Check, Eye, X } from "lucide-react";

const requests = [
  {
    accountId: "af06cf86-5387-4820-a183-f6659ddcad39",
    imgUrlOld: "https://i.imgur.com/McuGRDf.png",
    imgUrlNew: "https://i.imgur.com/McuGRDf.png",
    approvedBy: null,
    description: null,
    approvedDate: null,
    status: 0,
    account: {
      email: "student1@gmail.com",
      fullName: "Đỗ Quốc Đạt",
      phoneNumber: "0123456789",
      gender: true,
    },
    officer: null,
  },
  {
    accountId: "001bf73e-14b8-4c35-8e2b-e0c4b7fc5cbb",
    imgUrlOld: "https://i.imgur.com/McuGRDf.png",
    imgUrlNew: "https://i.imgur.com/0dTvSSQ.png",
    approvedBy: "80f16f9c-4873-41dc-9655-1153f7cbb9f3",
    description: "Accepted",
    approvedDate: "2025-03-23T07:03:07.617",
    status: 1,
    account: {
      email: "student3@gmail.com",
      fullName: "Nguyễn Hoàng Linh",
      phoneNumber: "0123456789",
      gender: false,
    },
    officer: {
      email: "officer1@gmail.com",
      fullName: "Trần Thị Mai",
      phoneNumber: "0123456789",
      gender: false,
    },
  },
  {
    accountId: "cefc337e-8e6b-448f-b208-d9e03e39ccc1",
    imgUrlOld: "https://i.imgur.com/McuGRDf.png",
    imgUrlNew: "https://i.imgur.com/McuGRDf.png",
    approvedBy: "80f16f9c-4873-41dc-9655-1153f7cbb9f3",
    description: "Rejected because student's profile picture is unclear",
    approvedDate: "2025-03-23T07:03:07.617",
    status: 2,
    account: {
      email: "student2@gmail.com",
      fullName: "Bùi Văn Hiện",
      phoneNumber: "0123456789",
      gender: true,
    },
    officer: {
      email: "officer1@gmail.com",
      fullName: "Trần Thị Mai",
      phoneNumber: "0123456789",
      gender: false,
    },
  },
  // Adding more mock data for pagination testing
  {
    accountId: "af06cf86-5387-4820-a183-f6659ddcad40",
    imgUrlOld: "https://i.imgur.com/McuGRDf.png",
    imgUrlNew: "https://i.imgur.com/McuGRDf.png",
    approvedBy: null,
    description: null,
    approvedDate: null,
    status: 0,
    account: {
      email: "student4@gmail.com",
      fullName: "Nguyễn Văn An",
      phoneNumber: "0123456789",
      gender: true,
    },
    officer: null,
  },
  {
    accountId: "af06cf86-5387-4820-a183-f6659ddcad41",
    imgUrlOld: "https://i.imgur.com/McuGRDf.png",
    imgUrlNew: "https://i.imgur.com/McuGRDf.png",
    approvedBy: null,
    description: null,
    approvedDate: null,
    status: 0,
    account: {
      email: "student5@gmail.com",
      fullName: "Trần Thị Hoa",
      phoneNumber: "0123456789",
      gender: false,
    },
    officer: null,
  },
  {
    accountId: "af06cf86-5387-4820-a183-f6659ddcad42",
    imgUrlOld: "https://i.imgur.com/McuGRDf.png",
    imgUrlNew: "https://i.imgur.com/McuGRDf.png",
    approvedBy: null,
    description: null,
    approvedDate: null,
    status: 0,
    account: {
      email: "student6@gmail.com",
      fullName: "Lê Minh Tuấn",
      phoneNumber: "0123456789",
      gender: true,
    },
    officer: null,
  },
  {
    accountId: "af06cf86-5387-4820-a183-f6659ddcad43",
    imgUrlOld: "https://i.imgur.com/McuGRDf.png",
    imgUrlNew: "https://i.imgur.com/McuGRDf.png",
    approvedBy: null,
    description: null,
    approvedDate: null,
    status: 0,
    account: {
      email: "student7@gmail.com",
      fullName: "Phạm Thị Mai",
      phoneNumber: "0123456789",
      gender: false,
    },
    officer: null,
  },
  {
    accountId: "af06cf86-5387-4820-a183-f6659ddcad44",
    imgUrlOld: "https://i.imgur.com/McuGRDf.png",
    imgUrlNew: "https://i.imgur.com/McuGRDf.png",
    approvedBy: null,
    description: null,
    approvedDate: null,
    status: 0,
    account: {
      email: "student8@gmail.com",
      fullName: "Hoàng Văn Bình",
      phoneNumber: "0123456789",
      gender: true,
    },
    officer: null,
  },
  {
    accountId: "af06cf86-5387-4820-a183-f6659ddcad45",
    imgUrlOld: "https://i.imgur.com/McuGRDf.png",
    imgUrlNew: "https://i.imgur.com/McuGRDf.png",
    approvedBy: null,
    description: null,
    approvedDate: null,
    status: 0,
    account: {
      email: "student9@gmail.com",
      fullName: "Vũ Thị Lan",
      phoneNumber: "0123456789",
      gender: false,
    },
    officer: null,
  },
  {
    accountId: "af06cf86-5387-4820-a183-f6659ddcad46",
    imgUrlOld: "https://i.imgur.com/McuGRDf.png",
    imgUrlNew: "https://i.imgur.com/McuGRDf.png",
    approvedBy: null,
    description: null,
    approvedDate: null,
    status: 0,
    account: {
      email: "student10@gmail.com",
      fullName: "Đặng Văn Hùng",
      phoneNumber: "0123456789",
      gender: true,
    },
    officer: null,
  },
  {
    accountId: "af06cf86-5387-4820-a183-f6659ddcad47",
    imgUrlOld: "https://i.imgur.com/McuGRDf.png",
    imgUrlNew: "https://i.imgur.com/McuGRDf.png",
    approvedBy: null,
    description: null,
    approvedDate: null,
    status: 0,
    account: {
      email: "student11@gmail.com",
      fullName: "Ngô Thị Hương",
      phoneNumber: "0123456789",
      gender: false,
    },
    officer: null,
  },
  {
    accountId: "af06cf86-5387-4820-a183-f6659ddcad48",
    imgUrlOld: "https://i.imgur.com/McuGRDf.png",
    imgUrlNew: "https://i.imgur.com/McuGRDf.png",
    approvedBy: null,
    description: null,
    approvedDate: null,
    status: 0,
    account: {
      email: "student12@gmail.com",
      fullName: "Bùi Văn Dũng",
      phoneNumber: "0123456789",
      gender: true,
    },
    officer: null,
  },
];

export default function ScrollTest() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead className="cursor-pointer">
            <div className="flex items-center">Student Name</div>
          </TableHead>
          <TableHead className="cursor-pointer">
            <div className="flex items-center">Email</div>
          </TableHead>
          <TableHead>Current Avatar</TableHead>
          <TableHead>New Avatar</TableHead>
          <TableHead className="cursor-pointer">
            <div className="flex items-center">Status</div>
          </TableHead>
          <TableHead>Approved By</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request, index) => (
          <TableRow key={request.accountId}>
            <TableCell className="font-medium">{index + 1}</TableCell>
            <TableCell>{request.account.fullName}</TableCell>
            <TableCell>{request.account.email}</TableCell>
            <TableCell>
              <div className="flex items-center">
                <img src={request.imgUrlOld || "/placeholder.svg"} alt="Current avatar" className="w-10 h-10 rounded-full object-cover" />
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center">
                <img src={request.imgUrlNew || "/placeholder.svg"} alt="New avatar" className="w-10 h-10 rounded-full object-cover" />
              </div>
            </TableCell>
            <TableCell>
              <Badge>{request.status}</Badge>
            </TableCell>
            <TableCell>{request.officer?.fullName || "-"}</TableCell>
            <TableCell>
              <div className="max-w-[200px] truncate">{request.description || "-"}</div>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>

                {request.status === 0 && (
                  <>
                    <Button variant="outline" size="sm" className="bg-green-50 hover:bg-green-100 text-green-600">
                      <Check className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button variant="outline" size="sm" className="bg-red-50 hover:bg-red-100 text-red-600">
                      <X className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
