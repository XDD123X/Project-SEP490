import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

export default function TopEndpointsTable({ data }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Endpoint</TableHead>
          <TableHead className="text-right">Count</TableHead>
          <TableHead className="text-right">%</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((endpoint) => (
          <TableRow key={endpoint.endpoint}>
            <TableCell className="font-medium">{endpoint.endpoint}</TableCell>
            <TableCell className="text-right">{endpoint.count.toLocaleString()}</TableCell>
            <TableCell className="w-[100px]">
              <div className="flex items-center gap-2">
                <Progress value={endpoint.percentage} className="h-2" />
                <span className="text-xs text-muted-foreground w-9">{endpoint.percentage.toFixed(1)}%</span>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
