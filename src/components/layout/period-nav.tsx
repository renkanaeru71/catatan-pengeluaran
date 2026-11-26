"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface PeriodNavProps {
  label: string;
  prevHref: string;
  nextHref: string;
  nextDisabled?: boolean;
  pickerBasePath: string;
  selectedDate: Date;
  className?: string;
}

export function PeriodNav({
  label,
  prevHref,
  nextHref,
  nextDisabled = false,
  pickerBasePath,
  selectedDate,
  className,
}: PeriodNavProps) {
  const router = useRouter();
  const [pickerOpen, setPickerOpen] = useState(false);

  // The app stores calendar days as UTC midnight. react-day-picker works with
  // local-midnight dates, so convert for display and convert the picked day
  // back from its local calendar fields — never via toISOString(), which would
  // shift the day for any browser west of UTC.
  const selectedLocal = new Date(
    selectedDate.getUTCFullYear(),
    selectedDate.getUTCMonth(),
    selectedDate.getUTCDate(),
  );

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    setPickerOpen(false);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    router.push(`${pickerBasePath}?date=${y}-${m}-${d}`);
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-xl border p-2",
        className,
      )}
    >
      <Link
        href={prevHref}
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
        aria-label="Periode sebelumnya"
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </Link>

      <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="ghost"
              className="flex-1 justify-center gap-2 text-base font-semibold"
              aria-label={`Pilih tanggal, sekarang ${label}`}
            />
          }
        >
          <CalendarDays className="text-muted-foreground size-4" aria-hidden="true" />
          {label}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={selectedLocal}
            onSelect={handleSelect}
            autoFocus
          />
        </PopoverContent>
      </Popover>

      {nextDisabled ? (
        <span
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "opacity-40 pointer-events-none",
          )}
          aria-hidden="true"
        >
          <ChevronRight className="size-5" />
        </span>
      ) : (
        <Link
          href={nextHref}
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          aria-label="Periode berikutnya"
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
