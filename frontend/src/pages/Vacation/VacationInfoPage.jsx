import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Calendar as CalendarComp } from "@/components/UI/calendar";
import { cn } from "@/components/UI/utils";

export default function VacationInfoPage() {
  const {
    isDark,
    vacationBalance,
    selectedDate,
    setSelectedDate,
    calendarEvents = [],
    visibleApprovedVacations = [],
    holidayDates = [],
  } = useOutletContext();

  const cardClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "bg-white border-gray-200";

  const innerClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white"
    : "bg-white border-gray-200";

  const textMain = isDark ? "text-white" : "text-gray-900";
  const textSub = isDark ? "text-zinc-300" : "text-gray-600";
  const textMuted = isDark ? "text-zinc-400" : "text-gray-500";

  const toLocalDate = (dateStr) => {
    if (!dateStr) return new Date();

    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const formatDateText = (date) => {
    if (!date) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const personalDates = useMemo(() => {
    return calendarEvents
      .filter((event) => event.type === "개인")
      .map((event) => toLocalDate(event.date));
  }, [calendarEvents]);

  const teamDates = useMemo(() => {
    return calendarEvents
      .filter((event) => event.type === "팀")
      .map((event) => toLocalDate(event.date));
  }, [calendarEvents]);

  const companyDates = useMemo(() => {
    return calendarEvents
      .filter((event) => event.type === "전사")
      .map((event) => toLocalDate(event.date));
  }, [calendarEvents]);

  const vacationDates = useMemo(() => {
    return visibleApprovedVacations
      .map((vacation) => vacation.startDate)
      .filter(Boolean)
      .map((dateStr) => toLocalDate(dateStr));
  }, [visibleApprovedVacations]);

  const selectedDateData = useMemo(() => {
    if (!selectedDate) return { events: [], vacations: [] };

    const dateStr = formatDateText(selectedDate);

    return {
      events: calendarEvents.filter((event) => event.date === dateStr),
      vacations: visibleApprovedVacations.filter(
        (vacation) =>
          vacation.startDate <= dateStr && vacation.endDate >= dateStr
      ),
    };
  }, [selectedDate, calendarEvents, visibleApprovedVacations]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={cardClass}>
          <CardContent className="p-6">
            <div className={cn("text-sm mb-2", textSub)}>총 휴가</div>
            <div className={cn("text-3xl font-bold", textMain)}>
              {vacationBalance.total}일
            </div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardContent className="p-6">
            <div className={cn("text-sm mb-2", textSub)}>사용</div>
            <div
              className={cn(
                "text-3xl font-bold",
                isDark ? "text-orange-300" : "text-orange-600"
              )}
            >
              {vacationBalance.used}일
            </div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardContent className="p-6">
            <div className={cn("text-sm mb-2", textSub)}>잔여</div>
            <div
              className={cn(
                "text-3xl font-bold",
                isDark ? "text-[#d8d8e3]" : "text-blue-600"
              )}
            >
              {vacationBalance.remaining}일
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={cardClass}>
        <CardHeader className={isDark ? "border-b border-[#5c5c73]" : ""}>
          <CardTitle className={cn("flex items-center gap-2", textMain)}>
            <CalendarIcon className="size-5" />
            캘린더
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex justify-center p-4">
              <CalendarComp
                mode="single"
                selected={selectedDate}
                onSelect={(selected) => {
                  if (selected) setSelectedDate(selected);
                }}
                className={cn(
                  "rounded-md border text-base",
                  isDark
                    ? "bg-[#2f2f36] border-[#5c5c73] text-white"
                    : ""
                )}
                classNames={{
                  months:
                    "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-lg font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: cn(
                    "h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100",
                    isDark ? "hover:bg-[#48484f]" : ""
                  ),
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: cn(
                    "rounded-md w-10 font-normal text-sm",
                    isDark ? "text-zinc-300" : "text-gray-500"
                  ),
                  row: "flex w-full mt-2",
                  cell: "h-10 w-10 text-center text-sm p-0 relative",
                  day: cn(
                    "h-10 w-10 p-0 font-normal rounded-md",
                    isDark ? "hover:bg-[#48484f]" : ""
                  ),
                }}
                personalDates={personalDates}
                teamDates={teamDates}
                companyDates={companyDates}
                vacationDates={vacationDates}
                holidayDates={holidayDates}
              />
            </div>

            <div className="space-y-3">
              <h3 className={cn("font-semibold", textMain)}>
                선택한 날짜 일정
              </h3>

              {selectedDateData.events.map((event) => (
                <div
                  key={event.id}
                  className={cn("p-3 border rounded-lg text-sm", innerClass)}
                >
                  <div className={cn("font-medium", textMain)}>
                    {event.title}
                  </div>

                  <div className={cn("text-xs mt-1", textMuted)}>
                    {event.type}
                    {event.startTime && event.endTime
                      ? ` · ${event.startTime} - ${event.endTime}`
                      : ""}
                  </div>

                  {event.description && (
                    <div className={cn("text-xs mt-1", textMuted)}>
                      {event.description}
                    </div>
                  )}
                </div>
              ))}

              {selectedDateData.vacations.map((vacation) => (
                <div
                  key={vacation.id}
                  className={cn(
                    "p-3 border rounded-lg text-sm",
                    isDark
                      ? "bg-[#2f2f36] border-orange-400/50"
                      : "bg-orange-50 border-orange-200"
                  )}
                >
                  <div
                    className={cn(
                      "font-medium",
                      isDark ? "text-orange-300" : "text-orange-800"
                    )}
                  >
                    {vacation.employeeName} · {vacation.type}
                  </div>

                  <div
                    className={cn(
                      "text-xs mt-1",
                      isDark ? "text-orange-200" : "text-orange-700"
                    )}
                  >
                    {vacation.startDate} ~ {vacation.endDate}
                  </div>
                </div>
              ))}

              {selectedDateData.events.length === 0 &&
                selectedDateData.vacations.length === 0 && (
                  <div className={cn("text-sm py-8 text-center", textMuted)}>
                    일정이 없습니다
                  </div>
                )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}