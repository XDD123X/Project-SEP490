import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";

export default function ResponseTimeChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
        <XAxis dataKey="time" tickFormatter={(value) => `${value}s`} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} ms`} />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <Card>
                  <CardContent className="py-2 px-3">
                    <div className="text-sm font-medium">{payload[0].value} ms</div>
                  </CardContent>
                </Card>
              );
            }
            return null;
          }}
        />
        <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} activeDot={{ r: 6, style: { fill: "#2563eb" } }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
