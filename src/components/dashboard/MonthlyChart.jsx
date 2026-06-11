import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatIDR } from "@/components/shared";

/* ── Config ─────────────────────────────────────────────────────────────── */
const chartConfig = {
  income: { label: " (Pemasukan)", color: "var(--primary)" },
  outcome: { label: " (Pengeluaran)", color: "var(--destructive)" },
  saldo: { label: " (Saldo)", color: "var(--muted-foreground)" },
};

const MONTH_LABELS = {
  "01": "Jan",
  "02": "Feb",
  "03": "Mar",
  "04": "Apr",
  "05": "Mei",
  "06": "Jun",
  "07": "Jul",
  "08": "Agu",
  "09": "Sep",
  10: "Okt",
  11: "Nov",
  12: "Des",
};

function formatMonthShort(key) {
  // key = "2025-06" → "Jun"
  const month = key?.split("-")[1];
  return MONTH_LABELS[month] ?? key;
}

/* ── Component ───────────────────────────────────────────────────────────── */
export default function MonthlyChart({
  data,
  chartYear,
  setChartYear,
  availableYears,
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Ringkasan Keuangan Bulanan</CardTitle>
            <CardDescription>Januari – Desember {chartYear}</CardDescription>
          </div>

          <Select
            value={String(chartYear)}
            onValueChange={(v) => setChartYear(Number(v))}
          >
            <SelectTrigger className="w-28 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={formatMonthShort}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dashed"
                  formatter={(value, name) => [
                    formatIDR(value),
                    chartConfig[name]?.label ?? name,
                  ]}
                  labelFormatter={formatMonthShort}
                />
              }
            />
            <Bar dataKey="income" fill="var(--color-income)" radius={4} />
            <Bar dataKey="outcome" fill="var(--color-outcome)" radius={4} />
            <Bar dataKey="saldo" fill="var(--color-saldo)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-center gap-2 text-sm">
        <p className="leading-none text-muted-foreground">
          pemasukan, pengeluaran, dan saldo per bulan
          {/* tahun {chartYear} */}
        </p>
      </CardFooter>
    </Card>
  );
}
