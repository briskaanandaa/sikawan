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

export default function DatePicker({
  date,
  onDateChange,
  placeholder = "Filter Tanggal",
}) {
  const hasFilter = !!date;

  return (
    <div className="flex items-center gap-2 md:w-[200px] w-full">
      <Popover>
        <PopoverTrigger asChild className="w-full flex justify-start">
          <Button
            variant={hasFilter ? "default" : "outline"}
            size="sm"
            className="gap-2 h-9 w-full"
          >
            <CalendarIcon className="w-4 h-4" />
            {hasFilter
              ? format(date, "d MMM yyyy", { locale: localeID })
              : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => onDateChange(d ?? null)}
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
          onClick={() => onDateChange(null)}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
