import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Calendar as CalendarComp } from "@/components/UI/calendar";
import { cn } from "@/components/UI/utils";

export default function VacationInfoPage() {
  const {
    isDark,
    currentUser,
    vacationBalance,
    selectedDate,
    setSelectedDate,
    calendarEvents = [],
    visibleApprovedVacations = [],
    holidayDates = [],
  } = useOutletContext();

  const currentUserId = currentUser?.userId || currentUser?.id;

  const cardClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "bg-white border-gray-200";

  const calendarBoxClass = isDark
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

  const getEventBoxClass = (type) => {
    if (isDark) {
      const darkMap = {
        개인: "bg-purple-500/15 border-purple-400/40 text-purple-200",
        팀: "bg-blue-500/15 border-blue-400/40 text-blue-200",
        전사: "bg-green-500/15 border-green-400/40 text-green-200",
        공휴일: "bg-red-500/15 border-red-400/40 text-red-200",
        휴가: "bg-orange-500/15 border-orange-400/40 text-orange-200",
      };

      return darkMap[type] || "bg-[#2f2f36] border-[#5c5c73] text-zinc-200";
    }

    const map = {
      개인: "bg-purple-50 border-purple-200 text-purple-800",
      팀: "bg-blue-50 border-blue-200 text-blue-800",
      전사: "bg-green-50 border-green-200 text-green-800",
      공휴일: "bg-red-50 border-red-200 text-red-800",
      휴가: "bg-orange-50 border-orange-200 text-orange-800",
    };

    return map[type] || "bg-white border-gray-200 text-gray-800";
  };

  const getSubTextClass = (type) => {
    if (isDark) {
      const darkMap = {
        개인: "text-purple-200",
        팀: "text-blue-200",
        전사: "text-green-200",
        공휴일: "text-red-200",
        휴가: "text-orange-200",
      };

      return darkMap[type] || "text-zinc-400";
    }

    const map = {
      개인: "text-purple-700",
      팀: "text-blue-700",
      전사: "text-green-700",
      공휴일: "text-red-700",
      휴가: "text-orange-700",
    };

    return map[type] || "text-gray-500";
  };

  const myApprovedVacations = useMemo(() => {
    return visibleApprovedVacations.filter(
      (vacation) => String(vacation.employeeId) === String(currentUserId)
    );
  }, [visibleApprovedVacations, currentUserId]);

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
    const result = [];

    myApprovedVacations.forEach((vacation) => {
      if (!vacation.startDate || !vacation.endDate) return;

      const current = toLocalDate(vacation.startDate);
      const end = toLocalDate(vacation.endDate);

      while (current <= end) {
        result.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    });

    return result;
  }, [myApprovedVacations]);

  const selectedDateData = useMemo(() => {
    if (!selectedDate) return { events: [], vacations: [] };

    const dateStr = formatDateText(selectedDate);

    return {
      events: calendarEvents.filter((event) => event.date === dateStr),
      vacations: myApprovedVacations.filter(
        (vacation) =>
          vacation.startDate <= dateStr && vacation.endDate >= dateStr
      ),
    };
  }, [selectedDate, calendarEvents, myApprovedVacations]);

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
                className={cn("rounded-md border text-base", calendarBoxClass)}
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
                  className={cn(
                    "p-3 border rounded-lg text-sm",
                    getEventBoxClass(event.type)
                  )}
                >
                  <div className="font-medium">{event.title}</div>

                  <div className={cn("text-xs mt-1", getSubTextClass(event.type))}>
                    {event.type}
                    {event.startTime && event.endTime
                      ? ` · ${event.startTime} - ${event.endTime}`
                      : ""}
                  </div>

                  {event.description && (
                    <div className={cn("text-xs mt-1", getSubTextClass(event.type))}>
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
                      ? "bg-orange-500/15 border-orange-400/40 text-orange-200"
                      : "bg-orange-50 border-orange-200 text-orange-800"
                  )}
                >
                  <div className="font-medium">
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