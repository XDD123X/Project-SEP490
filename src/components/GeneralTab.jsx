import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
export function GeneralTab({ vndRate }) {
  const today = new Date();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Today's Date</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{format(today)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Vietnamese Dong Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">₫1 = ${(1 / vndRate).toFixed(6)}</p>
        </CardContent>
      </Card>
    </div>
  );
}
