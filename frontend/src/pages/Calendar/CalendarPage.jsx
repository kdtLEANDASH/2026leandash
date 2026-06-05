import { useEffect, useMemo, useState } from "react";
import { Calendar as CalendarComp } from "@/components/UI/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Badge } from "@/components/UI/badge";
import { Button } from "@/components/UI/button";
import { Plus, Trash2 } from "lucide-react";
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
import { scheduleApi } from "@/api/scheduleApi";
import { useAppContext } from "@/store/AppProvider";
import { cn } from "@/components/UI/utils";

export function CalendarPage() {
  const { customSettings } = useAppContext() || {};
  const isDark = customSettings?.darkMode;

  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [filterType, setFilterType] = useState("전체");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    type: "PERSONAL",
    description: "",
  });

  const pageClass = isDark
    ? "bg-[#27272a] text-white"
    : "bg-gray-50 text-gray-900";

  const cardClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "bg-white border-gray-200";

  const innerClass = isDark
    ? "bg-[#48484f] border-[#5c5c73] text-white hover:bg-[#54545c]"
    : "bg-white border-gray-200 hover:bg-gray-50";

  const inputClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white placeholder:text-zinc-400"
    : "";

  const modalClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "";

  const selectContentClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "";

  const textMain = isDark ? "text-white" : "text-gray-900";
  const textSub = isDark ? "text-zinc-300" : "text-gray-600";
  const textMuted = isDark ? "text-zinc-400" : "text-gray-500";

  const primaryButtonClass = isDark
    ? "bg-[#5c5c73] hover:bg-[#6a6a82] text-white"
    : "bg-blue-600 hover:bg-blue-700";

  const outlineButtonClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white hover:bg-[#48484f]"
    : "";

  const selectedYear = date.getFullYear();
  const selectedMonth = date.getMonth() + 1;

  const formatDate = (value) => {
    if (!value) return "";

    if (typeof value === "string") {
      return value.includes("T") ? value.split("T")[0] : value.slice(0, 10);
    }

    return "";
  };

  const formatTime = (value) => {
    if (!value || typeof value !== "string") return "";
    if (!value.includes("T")) return "";
    return value.split("T")[1]?.slice(0, 5) || "";
  };

  const toLocalDate = (dateStr) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const typeLabelMap = {
    PERSONAL: "개인",
    TEAM: "팀",
    COMPANY: "전사",
    HOLIDAY: "공휴일",
    VACATION: "휴가",
  };

  const normalizeEvent = (schedule) => {
    const startDate = formatDate(schedule.startDatetime || schedule.startDateTime);
    const endDate = formatDate(schedule.endDatetime || schedule.endDateTime);

    return {
      id: schedule.scheduleId,
      title: schedule.title,
      description: schedule.content,
      date: startDate,
      endDate,
      startTime: formatTime(schedule.startDatetime || schedule.startDateTime),
      endTime: formatTime(schedule.endDatetime || schedule.endDateTime),
      type: schedule.isHoliday
        ? "공휴일"
        : typeLabelMap[schedule.scheduleType] || schedule.scheduleType || "개인",
      color: schedule.color,
      raw: schedule,
    };
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);

      const data = await scheduleApi.getMonthlySchedules(
        selectedYear,
        selectedMonth
      );

      const normalized = Array.isArray(data) ? data.map(normalizeEvent) : [];

      setEvents(normalized);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [selectedYear, selectedMonth]);

  const handleAddEvent = async () => {
    if (!formData.title || !formData.date) {
      alert("제목과 날짜를 입력해주세요.");
      return;
    }

    try {
      const startTime = formData.startTime || "00:00";
      const endTime = formData.endTime || "23:59";

      const payload = {
        userId: 1,
        title: formData.title,
        content: formData.description,
        startDatetime: `${formData.date}T${startTime}:00`,
        endDatetime: `${formData.date}T${endTime}:00`,
        scheduleType: formData.type,
        isAllDay: !formData.startTime && !formData.endTime,
        departmentId: null,
        isOfficial: formData.type === "COMPANY",
        isHoliday: formData.type === "HOLIDAY",
        color: null,
        remindAt: null,
      };

      await scheduleApi.createSchedule(payload);

      setFormData({
        title: "",
        date: "",
        startTime: "",
        endTime: "",
        type: "PERSONAL",
        description: "",
      });

      setShowDialog(false);
      fetchSchedules();
    } catch (error) {
      console.error(error);
      alert("일정 추가에 실패했습니다.");
    }
  };

  const handleDeleteEvent = async (scheduleId) => {
    if (!window.confirm("일정을 삭제하시겠습니까?")) return;

    try {
      await scheduleApi.deleteSchedule(scheduleId);
      fetchSchedules();
    } catch (error) {
      console.error(error);
      alert("일정 삭제에 실패했습니다.");
    }
  };

  const filteredEvents = useMemo(() => {
    if (filterType === "전체") return events;
    return events.filter((event) => event.type === filterType);
  }, [events, filterType]);

  const selectedDateEvents = useMemo(() => {
    const selectedDateText = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    return filteredEvents.filter((event) => event.date === selectedDateText);
  }, [date, filteredEvents]);

  const personalDates = useMemo(() => {
    return events
      .filter((event) => event.type === "개인")
      .map((event) => toLocalDate(event.date));
  }, [events]);

  const teamDates = useMemo(() => {
    return events
      .filter((event) => event.type === "팀")
      .map((event) => toLocalDate(event.date));
  }, [events]);

  const companyDates = useMemo(() => {
    return events
      .filter((event) => event.type === "전사")
      .map((event) => toLocalDate(event.date));
  }, [events]);

  const vacationDates = useMemo(() => {
    return events
      .filter((event) => event.type === "휴가")
      .map((event) => toLocalDate(event.date));
  }, [events]);

  const holidayDates = useMemo(() => {
    return events
      .filter((event) => event.type === "공휴일")
      .map((event) => toLocalDate(event.date));
  }, [events]);

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

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return filteredEvents
      .filter((event) => toLocalDate(event.date) >= today)
      .sort((a, b) => toLocalDate(a.date) - toLocalDate(b.date))
      .slice(0, 5);
  }, [filteredEvents]);

  return (
    <div className={cn("p-6 min-h-full", pageClass)}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className={cn("text-2xl font-semibold mb-1", textMain)}>
            캘린더
          </h2>
          <p className={textSub}>일정을 관리하고 사내 일정을 확인하세요</p>
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className={primaryButtonClass}>
              <Plus className="size-5 mr-2" />
              일정 추가
            </Button>
          </DialogTrigger>

          <DialogContent className={cn("max-w-2xl", modalClass)}>
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
                  className={inputClass}
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
                    className={inputClass}
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
                    <SelectTrigger className={inputClass}>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent className={selectContentClass}>
                      <SelectItem value="PERSONAL">개인</SelectItem>
                      <SelectItem value="TEAM">팀</SelectItem>
                      <SelectItem value="COMPANY">전사</SelectItem>
                      <SelectItem value="HOLIDAY">공휴일</SelectItem>
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
                    className={inputClass}
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
                    className={inputClass}
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
                  className={inputClass}
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
                  className={outlineButtonClass}
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
          <Card className={cardClass}>
            <CardHeader className={isDark ? "border-b border-[#5c5c73]" : ""}>
              <div className="flex items-center justify-between gap-4">
                <CardTitle className={textMain}>월간 캘린더</CardTitle>

                <div className="flex flex-wrap gap-2 justify-end">
                  {["전체", "개인", "팀", "전사", "휴가", "공휴일"].map(
                    (type) => (
                      <Button
                        key={type}
                        size="sm"
                        variant={filterType === type ? "default" : "outline"}
                        onClick={() => setFilterType(type)}
                        className={
                          filterType === type
                            ? primaryButtonClass
                            : outlineButtonClass
                        }
                      >
                        {type}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className={cn("py-20 text-center", textMuted)}>
                  일정을 불러오는 중입니다...
                </div>
              ) : (
                <CalendarComp
                  mode="single"
                  selected={date}
                  onSelect={(selected) => {
                    if (selected) setDate(selected);
                  }}
                  className={cn(
                    "rounded-md border",
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
              )}

              <div className="mt-4">
                <h4 className={cn("font-semibold mb-2", textMain)}>범례</h4>
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
        </div>

        <div className="lg:col-span-1">
          <Card className={cardClass}>
            <CardHeader className={isDark ? "border-b border-[#5c5c73]" : ""}>
              <CardTitle className={textMain}>
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

                        {event.type !== "휴가" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteEvent(event.id)}
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
                <p className={cn("text-center py-8", textMuted)}>
                  이 날짜에 일정이 없습니다
                </p>
              )}
            </CardContent>
          </Card>

          <Card className={cn("mt-6", cardClass)}>
            <CardHeader className={isDark ? "border-b border-[#5c5c73]" : ""}>
              <CardTitle className={textMain}>다가오는 일정</CardTitle>
            </CardHeader>

            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        "flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                        isDark ? "hover:bg-[#48484f]" : "hover:bg-gray-50"
                      )}
                      onClick={() => setDate(toLocalDate(event.date))}
                    >
                      <div className="flex-1">
                        <h5 className={cn("font-medium text-sm", textMain)}>
                          {event.title}
                        </h5>
                        <p className={cn("text-xs", textSub)}>
                          {toLocalDate(event.date).toLocaleDateString("ko-KR")}
                        </p>
                      </div>

                      <Badge className={`text-xs ${getEventColor(event.type)}`}>
                        {event.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={cn("text-center py-8", textMuted)}>
                  다가오는 일정이 없습니다
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CalendarPage;