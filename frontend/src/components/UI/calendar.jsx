"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "./utils";
import { buttonVariants } from "./button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  personalDates = [],
  teamDates = [],
  companyDates = [],
  vacationDates = [],
  holidayDates = [],
  recommendedDates = [],
  underlineDate,
  ...props
}) {
  const modifiers = {
    personal: personalDates || [],
    team: teamDates || [],
    company: companyDates || [],
    vacation: vacationDates || [],
    holiday: holidayDates || [],

    // 추천 휴가 카드를 눌렀을 때 실제 휴가 사용일만 하늘색 표시
    recommended: recommendedDates || [],

    underline: underlineDate ? [underlineDate] : [],

    saturday: (date) => date.getDay() === 6,
    sunday: (date) => date.getDay() === 0,
  };

  const modifiersClassNames = {
    personal: "bg-purple-100 text-purple-900 font-semibold",
    team: "bg-blue-100 text-blue-900 font-semibold",
    company: "bg-green-100 text-green-900 font-semibold",
    vacation: "bg-orange-100 text-orange-900 font-semibold",
    holiday: "bg-red-100 text-red-700 font-semibold",

    recommended:
      "!bg-sky-100 !text-sky-900 hover:!bg-sky-100 hover:!text-sky-900 font-bold",

    saturday: "text-blue-600",
    sunday: "text-red-600",

    underline: "border-b-4 border-gray-900 rounded-none font-bold",
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-x-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : ""
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_start:
          "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_range_end:
          "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_selected:
          "bg-slate-100 text-gray-900 hover:bg-slate-100 hover:text-gray-900",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      modifiers={modifiers}
      modifiersClassNames={modifiersClassNames}
      components={{
        IconLeft: ({ className, ...iconProps }) => (
          <ChevronLeft className={cn("size-4", className)} {...iconProps} />
        ),
        IconRight: ({ className, ...iconProps }) => (
          <ChevronRight className={cn("size-4", className)} {...iconProps} />
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };