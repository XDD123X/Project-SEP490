import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function ErrorLogsTable({ data }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Endpoint</TableHead>
          <TableHead>Message</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((log) => (
          <TableRow key={log.id}>
            <TableCell className="font-medium">{new Date(log.timestamp).toLocaleTimeString()}</TableCell>
            <TableCell>
              <Badge variant="destructive">{log.type}</Badge>
            </TableCell>
            <TableCell>{log.endpoint}</TableCell>
            <TableCell className="text-muted-foreground">{log.message}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
