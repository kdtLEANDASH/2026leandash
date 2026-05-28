import { useState } from "react";
import { Calendar as CalendarComp } from "@/components/UI/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Badge } from "@/components/UI/badge";
import { Button } from "@/components/UI/button";
import { Plus, Users, Trash2 } from "lucide-react";
import { useAppContext } from "@/store/AppProvider";
import { cn } from "@/components/UI/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/UI/dialog";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Textarea } from "@/components/UI/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";

export function CalendarPage() {
  const {
    calendarEvents,
    addCalendarEvent,
    deleteCalendarEvent,
    vacationRequests,
    employees,
    customSettings,
  } = useAppContext();

  const isDark = customSettings?.darkMode;

  const [date, setDate] = useState(new Date());
  const [showDialog, setShowDialog] = useState(false);
  const [filterType, setFilterType] = useState("전체");

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    type: "개인",
    description: "",
  });

  const darkCardClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "bg-white border-gray-200";

  const darkHoverClass = isDark ? "hover:bg-[#3f3f48]" : "hover:bg-gray-50";

  const primaryButtonClass = isDark
    ? "bg-[#5c5c73] hover:bg-[#6a6a82] text-white"
    : "bg-blue-600 hover:bg-blue-700 text-white";

  const activeFilterButtonClass = isDark
    ? "bg-[#5c5c73] hover:bg-[#6a6a82] text-white"
    : "bg-blue-600 hover:bg-blue-700 text-white";

  const textMainClass = isDark ? "text-white" : "text-gray-900";
  const textSubClass = isDark ? "text-zinc-300" : "text-gray-600";

  const handleAddEvent = () => {
    if (!formData.title || !formData.date) {
      alert("제목과 날짜를 입력해주세요.");
      return;
    }

    addCalendarEvent({
      title: formData.title,
      date: formData.date,
      startTime: formData.startTime || undefined,
      endTime: formData.endTime || undefined,
      type: formData.type,
      description: formData.description || undefined,
    });

    setFormData({
      title: "",
      date: "",
      startTime: "",
      endTime: "",
      type: "개인",
      description: "",
    });

    setShowDialog(false);
  };

  const approvedVacations = vacationRequests
    .filter((req) => req.status === "승인")
    .map((req) => ({
      id: req.id + 10000,
      title: `${req.employeeName} - ${req.type}`,
      date: req.startDate,
      type: "휴가",
      description: req.reason,
    }));

  const allEvents = [...calendarEvents, ...approvedVacations];

  const filteredEvents =
    filterType === "전체"
      ? allEvents
      : allEvents.filter((event) => event.type === filterType);

  const selectedDateEvents = date
    ? filteredEvents.filter((event) => {
        const [eventYear, eventMonth, eventDay] = event.date
          .split("-")
          .map(Number);

        return (
          eventDay === date.getDate() &&
          eventMonth === date.getMonth() + 1 &&
          eventYear === date.getFullYear()
        );
      })
    : [];

  const getDatesWithEvents = () => {
    const dates = new Set();

    allEvents.forEach((event) => {
      if (event.type !== "공휴일") {
        dates.add(event.date);
      }
    });

    return Array.from(dates).map((dateStr) => {
      const [year, month, day] = dateStr.split("-").map(Number);
      return new Date(year, month - 1, day);
    });
  };

  const datesWithEvents = getDatesWithEvents();

  const getHolidayDates = () => {
    return allEvents
      .filter((event) => event.type === "공휴일")
      .map((event) => {
        const [year, month, day] = event.date.split("-").map(Number);
        return new Date(year, month - 1, day);
      });
  };

  const holidayDates = getHolidayDates();

  const getEventColor = (type) => {
    const colors = {
      개인: "bg-purple-100 text-purple-700 border-purple-300",
      팀: "bg-blue-100 text-blue-700 border-blue-300",
      전사: "bg-green-100 text-green-700 border-green-300",
      휴가: "bg-orange-100 text-orange-700 border-orange-300",
      공휴일: "bg-red-100 text-red-700 border-red-300",
    };

    return colors[type] || colors["개인"];
  };

  const vacationsByDept = employees.reduce((acc, emp) => {
    const empVacations = vacationRequests.filter(
      (req) => req.employeeId === emp.id && req.status === "승인"
    );

    if (empVacations.length > 0) {
      if (!acc[emp.department]) {
        acc[emp.department] = [];
      }

      acc[emp.department].push({
        employee: emp.name,
        vacations: empVacations,
      });
    }

    return acc;
  }, {});

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className={cn("text-2xl font-semibold mb-1", textMainClass)}>
            캘린더
          </h2>
          <p className={textSubClass}>
            일정을 관리하고 팀원 휴가를 확인하세요
          </p>
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className={cn(primaryButtonClass)}>
              <Plus className="size-5 mr-2" />
              일정 추가
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>새 일정 추가</DialogTitle>
            </DialogHeader>

            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="일정 제목을 입력하세요"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">날짜 *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">유형</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="개인">개인</SelectItem>
                      <SelectItem value="팀">팀</SelectItem>
                      <SelectItem value="전사">전사</SelectItem>
                      <SelectItem value="공휴일">공휴일</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">시작 시간</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">종료 시간</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  placeholder="일정 설명을 입력하세요"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={handleAddEvent}
                  className={cn("flex-1", primaryButtonClass)}
                >
                  추가하기
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                >
                  취소
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className={cn(darkCardClass)}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>월간 캘린더</CardTitle>

                <div className="flex gap-2">
                  {["전체", "개인", "팀", "전사", "휴가", "공휴일"].map(
                    (type) => (
                      <Button
                        key={type}
                        size="sm"
                        variant={filterType === type ? "default" : "outline"}
                        onClick={() => setFilterType(type)}
                        className={cn(
                          filterType === type ? activeFilterButtonClass : ""
                        )}
                      >
                        {type}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <CalendarComp
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                datesWithEvents={datesWithEvents}
                holidayDates={holidayDates}
              />

              <div className="mt-4">
                <h4 className={cn("font-semibold mb-2", textMainClass)}>
                  범례
                </h4>

                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                    개인
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                    팀
                  </Badge>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    전사
                  </Badge>
                  <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                    휴가
                  </Badge>
                  <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                    공휴일
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn("mt-6", darkCardClass)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5" />
                부서별 휴가 현황
              </CardTitle>
            </CardHeader>

            <CardContent>
              {Object.keys(vacationsByDept).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(vacationsByDept).map(([dept, data]) => (
                    <div
                      key={dept}
                      className="border-l-4 border-l-orange-500 pl-4"
                    >
                      <h4 className={cn("font-semibold mb-2", textMainClass)}>
                        {dept}
                      </h4>

                      <div className="space-y-2">
                        {data.map((item, idx) => (
                          <div key={idx} className={cn("text-sm", textSubClass)}>
                            <span className="font-medium">
                              {item.employee}
                            </span>

                            {item.vacations.map((vac) => (
                              <span key={vac.id} className="ml-2">
                                • {vac.startDate} ~ {vac.endDate} ({vac.days}일)
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  className={cn(
                    "text-center py-8",
                    isDark ? "text-zinc-400" : "text-gray-500"
                  )}
                >
                  현재 휴가 중인 직원이 없습니다
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className={cn(darkCardClass)}>
            <CardHeader>
              <CardTitle>
                {date
                  ? `${date.getMonth() + 1}월 ${date.getDate()}일 일정`
                  : "일정 선택"}
              </CardTitle>
            </CardHeader>

            <CardContent>
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`p-3 rounded-lg border ${getEventColor(
                        event.type
                      )}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{event.title}</h4>

                        {event.id < 10000 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteCalendarEvent(event.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>

                      {event.startTime && event.endTime && (
                        <p className="text-sm mb-1">
                          {event.startTime} - {event.endTime}
                        </p>
                      )}

                      {event.description && (
                        <p className="text-sm">{event.description}</p>
                      )}

                      <Badge className="mt-2" variant="outline">
                        {event.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  className={cn(
                    "text-center py-8",
                    isDark ? "text-zinc-400" : "text-gray-500"
                  )}
                >
                  이 날짜에 일정이 없습니다
                </p>
              )}
            </CardContent>
          </Card>

          <Card className={cn("mt-6", darkCardClass)}>
            <CardHeader>
              <CardTitle>다가오는 일정</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {filteredEvents
                  .filter((event) => new Date(event.date) >= new Date())
                  .sort(
                    (a, b) =>
                      new Date(a.date).getTime() -
                      new Date(b.date).getTime()
                  )
                  .slice(0, 5)
                  .map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        "flex items-start gap-3 p-2 rounded-lg cursor-pointer",
                        darkHoverClass
                      )}
                      onClick={() => setDate(new Date(event.date))}
                    >
                      <div className="flex-1">
                        <h5 className={cn("font-medium text-sm", textMainClass)}>
                          {event.title}
                        </h5>

                        <p className={cn("text-xs", textSubClass)}>
                          {new Date(event.date).toLocaleDateString("ko-KR")}
                        </p>
                      </div>

                      <Badge className={`text-xs ${getEventColor(event.type)}`}>
                        {event.type}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}