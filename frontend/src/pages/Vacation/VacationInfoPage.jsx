import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Calendar as CalendarComp } from "@/components/UI/calendar";

export default function VacationInfoPage() {
  const {
    currentUser,
    vacationBalance,
    selectedDate,
    setSelectedDate,
    calendarEvents = [],
    visibleApprovedVacations = [],
    holidayDates = [],
  } = useOutletContext();

  const currentUserId = currentUser?.userId || currentUser?.id;

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
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 mb-2">총 휴가</div>
            <div className="text-3xl font-bold text-gray-900">
              {vacationBalance.total}일
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 mb-2">사용</div>
            <div className="text-3xl font-bold text-orange-600">
              {vacationBalance.used}일
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 mb-2">잔여</div>
            <div className="text-3xl font-bold text-blue-600">
              {vacationBalance.remaining}일
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
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
                className="rounded-md border text-base"
                personalDates={personalDates}
                teamDates={teamDates}
                companyDates={companyDates}
                vacationDates={vacationDates}
                holidayDates={holidayDates}
              />
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">선택한 날짜 일정</h3>

              {selectedDateData.events.map((event) => (
                <div
                  key={event.id}
                  className={`p-3 border rounded-lg text-sm ${getEventBoxClass(
                    event.type
                  )}`}
                >
                  <div className="font-medium">{event.title}</div>

                  <div className={`text-xs mt-1 ${getSubTextClass(event.type)}`}>
                    {event.type}
                    {event.startTime && event.endTime
                      ? ` · ${event.startTime} - ${event.endTime}`
                      : ""}
                  </div>

                  {event.description && (
                    <div
                      className={`text-xs mt-1 ${getSubTextClass(event.type)}`}
                    >
                      {event.description}
                    </div>
                  )}
                </div>
              ))}

              {selectedDateData.vacations.map((vacation) => (
                <div
                  key={vacation.id}
                  className={`p-3 border rounded-lg text-sm ${getEventBoxClass(
                    "휴가"
                  )}`}
                >
                  <div className="font-medium">
                    {vacation.employeeName} · {vacation.type}
                  </div>

                  <div className="text-xs text-orange-700 mt-1">
                    {vacation.startDate} ~ {vacation.endDate}
                  </div>
                </div>
              ))}

              {selectedDateData.events.length === 0 &&
                selectedDateData.vacations.length === 0 && (
                  <div className="text-sm text-gray-500 py-8 text-center">
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