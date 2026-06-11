import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function buildLabel(dateRange) {
  const { from, to } = dateRange;
  const fmt = (d) => format(d, "d MMM yyyy", { locale: localeID });

  if (from && to) return `${fmt(from)} – ${fmt(to)}`;
  if (from) return `Dari ${fmt(from)}`;
  return "Filter Tanggal";
}

export default function DateRangePicker({ dateRange, onRangeChange }) {
  const hasFilter = dateRange.from || dateRange.to;

  return (
    <div className="flex items-center gap-2 md:w-[230px] w-full ">
      <Popover>
        <PopoverTrigger asChild className="w-full flex justify-start">
          <Button
            variant={hasFilter ? "default" : "outline"}
            size="sm"
            className="gap-2 h-9 w-full"
          >
            <CalendarIcon className="w-4 h-4" />
            {buildLabel(dateRange)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={(range) =>
              onRangeChange(range ?? { from: null, to: null })
            }
            numberOfMonths={2}
            locale={localeID}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {hasFilter && (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          onClick={() => onRangeChange({ from: null, to: null })}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
