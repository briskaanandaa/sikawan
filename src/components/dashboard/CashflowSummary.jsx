import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/shared";

function CashflowCard({ icon: Icon, label, amount, colorClass, bgClass }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 ">
        <div className={`rounded-md p-2.5 ${bgClass} ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <CurrencyDisplay
            amount={amount}
            className={`text-xl font-bold ${colorClass}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function CashflowSummary({ cashIncome, cashOutcome }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <CashflowCard
        icon={TrendingUp}
        label={<span>Total Pemasukan</span>}
        amount={cashIncome}
        colorClass="text-green-600"
        bgClass="bg-green-100"
      />
      <CashflowCard
        icon={TrendingDown}
        label="Total Pengeluaran"
        amount={cashOutcome}
        colorClass="text-red-500"
        bgClass="bg-red-100"
      />
    </div>
  );
}
