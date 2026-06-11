import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DatePicker from "@/components/cashflow/DatePicker";

export default function CashflowFilterBar({
  searchNote,
  onSearchNote,
  typeFilter,
  onTypeFilter,
  dateFilter,
  onDateFilter,
}) {
  const hasFilter = typeFilter !== "all" || dateFilter || searchNote.trim();

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      {/* Search keterangan */}
      <div className="relative flex-1 md:min-w-[180px] w-ful">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari keterangan..."
          value={searchNote}
          onChange={(e) => onSearchNote(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filter jenis */}
      <Select value={typeFilter} onValueChange={onTypeFilter}>
        <SelectTrigger className="w-full md:w-44  h-9 text-sm">
          <SelectValue placeholder="Semua Jenis" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Jenis</SelectItem>
          <SelectItem value="income">Pemasukan</SelectItem>
          <SelectItem value="outcome">Pengeluaran</SelectItem>
        </SelectContent>
      </Select>

      {/* Filter tanggal — shadcn DatePicker (single) */}
      <DatePicker date={dateFilter} onDateChange={onDateFilter} />
    </div>
  );
}
