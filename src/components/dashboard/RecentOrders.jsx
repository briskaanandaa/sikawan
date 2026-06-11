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
import { StatusBadge, CurrencyDisplay } from "@/components/shared";
import { parseWPDate } from "@/lib/date";
import { ChevronRight } from "lucide-react";

function formatDateWIB(dateStr) {
  const d = parseWPDate(dateStr);
  if (!d || isNaN(d)) return "-";
  return d.toLocaleDateString("id-ID", { timeZone: "Asia/Jakarta" });
}

function getFullName(billing) {
  return (
    [billing?.first_name, billing?.last_name].filter(Boolean).join(" ") || "-"
  );
}

export default function RecentOrders({ orders = [] }) {
  return (
    <Card className="pt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Order Terbaru</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {orders.length === 0 ? (
          <p className="text-sm text-center text-muted-foreground px-6 ">
            Belum ada order.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="px-6">Order</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right px-6">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="px-6 py-2">
                    <p className="font-medium text-foreground">#{order.id}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDateWIB(order.date_created)}
                    </p>
                    <p className="text-xs font-semibold text-primary">
                      {getFullName(order.billing)}
                    </p>
                  </TableCell>
                  <TableCell className="text-center">
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right px-6">
                    <CurrencyDisplay
                      amount={order.total}
                      className="font-semibold"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <CardFooter>
          <Button size="sm" className="w-full" asChild>
            <Link to="/order">
              Lihat semua <ChevronRight className="w-3 h-3" />
            </Link>
          </Button>
        </CardFooter>
      </CardContent>
    </Card>
  );
}
