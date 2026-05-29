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
    calendarEvents,
    visibleApprovedVacations,
    datesWithEvents,
    holidayDates,
  } = useOutletContext();

  if (isHrAdmin) {
    return <div className="text-sm text-gray-500">인사팀은 휴가 신청 목록을 이용해주세요.</div>;
  }

  const selectedDateData = (() => {
    if (!selectedDate) return { events: [], vacations: [] };

    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;

    return {
      events: calendarEvents.filter((event) => event.date === dateStr),
      vacations: visibleApprovedVacations.filter(
        (v) => v.startDate <= dateStr && v.endDate >= dateStr
      ),
    };
  })();

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
                onSelect={setSelectedDate}
                className="rounded-md border text-base"
                datesWithEvents={datesWithEvents}
                holidayDates={holidayDates}
              />
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">선택한 날짜 일정</h3>

              {selectedDateData.events.map((event) => (
                <div key={event.id} className="p-3 bg-white border rounded-lg text-sm">
                  {event.title}
                </div>
              ))}

              {selectedDateData.vacations.map((vacation) => (
                <div
                  key={vacation.id}
                  className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm"
                >
                  {vacation.employeeName} · {vacation.type}
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