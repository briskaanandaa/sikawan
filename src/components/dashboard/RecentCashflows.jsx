import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CurrencyDisplay } from "@/components/shared";
import { getMetaValue } from "@/lib/woocommerce";
import { parseWPDate } from "@/lib/date";
import { ChevronRight } from "lucide-react";

function formatDateWIB(dateStr) {
  const d = parseWPDate(dateStr);
  if (!d || isNaN(d)) return "-";
  return d.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" });
}

export default function RecentCashflows({ cashflows = [] }) {
  return (
    <Card className="pt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Arus Kas Terbaru</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {cashflows.length === 0 ? (
          <p className="text-sm text-center text-muted-foreground px-6">
            Belum ada catatan arus kas.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="px-6 w-[55%]">Keterangan</TableHead>
                <TableHead className="text-center w-[20%]">Tipe</TableHead>
                <TableHead className="text-right px-6 w-[25%]">
                  Jumlah
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashflows.map((cf) => {
                const type = getMetaValue(cf.meta_data, "cashflow_type");
                const note = getMetaValue(cf.meta_data, "cashflow_note");
                const isIncome = type === "income";

                return (
                  <TableRow
                    key={cf.id}
                    className="relative w-full overflow-auto"
                  >
                    <TableCell className="px-6 py-2 w-[55%] min-w-0 max-w-0">
                      <p className="font-medium text-foreground break-words whitespace-normal">
                        {note || "(tanpa keterangan)"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDateWIB(cf.date_created)}
                      </p>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          isIncome
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {isIncome ? "Pemasukan" : "Pengeluaran"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <CurrencyDisplay
                        amount={cf.total}
                        className={`font-semibold ${
                          isIncome ? "text-green-600" : "text-red-500"
                        }`}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        <CardFooter>
          <Button size="sm" className="w-full" asChild>
            <Link to="/cashflow">
              Lihat semua <ChevronRight className="w-3 h-3" />
            </Link>
          </Button>
        </CardFooter>
      </CardContent>
    </Card>
  );
}
