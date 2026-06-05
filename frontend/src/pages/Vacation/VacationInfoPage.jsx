import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Calendar as CalendarComp } from "@/components/UI/calendar";

export default function VacationInfoPage() {
  const {
    isHrAdmin,
    vacationBalance,
    selectedDate,
    setSelectedDate,
    calendarEvents = [],
    visibleApprovedVacations = [],
    holidayDates = [],
  } = useOutletContext();

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

  if (isHrAdmin) {
    return (
      <div className="text-sm text-gray-500">
        인사팀은 휴가 신청 목록을 이용해주세요.
      </div>
    );
  }

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
                  className="p-3 bg-white border rounded-lg text-sm"
                >
                  <div className="font-medium text-gray-900">{event.title}</div>

                  <div className="text-xs text-gray-500 mt-1">
                    {event.type}
                    {event.startTime && event.endTime
                      ? ` · ${event.startTime} - ${event.endTime}`
                      : ""}
                  </div>

                  {event.description && (
                    <div className="text-xs text-gray-500 mt-1">
                      {event.description}
                    </div>
                  )}
                </div>
              ))}

              {selectedDateData.vacations.map((vacation) => (
                <div
                  key={vacation.id}
                  className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm"
                >
                  <div className="font-medium text-orange-800">
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