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
import { vacationApi } from "@/api/vacationApi";
import { useAppContext } from "@/store/AppProvider";
import { cn } from "@/components/UI/utils";

export function CalendarPage() {
  const { currentUser, customSettings } = useAppContext();

  const isDark = customSettings?.darkMode;

  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [vacations, setVacations] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [filterType, setFilterType] = useState("전체");
  const [loading, setLoading] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    type: "PERSONAL",
    description: "",
  });

  const selectedYear = calendarMonth.getFullYear();
  const selectedMonth = calendarMonth.getMonth() + 1;

  const currentUserId = currentUser?.userId || currentUser?.id;

const isSuperAdmin =
  currentUser?.role === "최고관리자" || currentUser?.role === "ADMIN";

const isHrAdmin = currentUser?.department === "인사팀";

const canCreateOfficialSchedule = isSuperAdmin || isHrAdmin;

const pageClass = isDark
  ? "bg-[#27272a] text-white min-h-full"
  : "bg-gray-50 text-gray-900 min-h-full";

const cardClass = isDark
  ? "bg-[#35353d] border-[#5c5c73] text-white"
  : "bg-white border-gray-200";

const innerCardClass = isDark
  ? "bg-[#2f2f36] border-[#5c5c73] text-white"
  : "bg-white border-gray-200";

const inputClass = isDark
  ? "bg-[#2f2f36] border-[#5c5c73] text-white placeholder:text-zinc-400"
  : "";

const selectContentClass = isDark
  ? "bg-[#35353d] border-[#5c5c73] text-white"
  : "";

const modalClass = isDark
  ? "bg-[#35353d] border-[#5c5c73] text-white"
  : "";

const primaryButtonClass = isDark
  ? "bg-[#5c5c73] hover:bg-[#6a6a82] text-white"
  : "bg-blue-600 hover:bg-blue-700 text-white";

const outlineButtonClass = isDark
  ? "bg-[#2f2f36] border-[#5c5c73] text-white hover:bg-[#48484f]"
  : "";

const ghostButtonClass = isDark
  ? "text-zinc-200 hover:bg-[#48484f] hover:text-white"
  : "";

const textMain = isDark ? "text-white" : "text-gray-900";
const textSub = isDark ? "text-zinc-300" : "text-gray-600";
const textMuted = isDark ? "text-zinc-400" : "text-gray-500";

const calendarBoxClass = isDark
  ? "bg-[#2f2f36] border-[#5c5c73] text-white"
  : "bg-white border-gray-200";

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
    if (!dateStr) return null;

    const [year, month, day] = dateStr.split("-").map(Number);

    if (!year || !month || !day) return null;

    return new Date(year, month - 1, day);
  };

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return 0;
    }

    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const typeLabelMap = {
    PERSONAL: "개인",
    TEAM: "팀",
    COMPANY: "전사",
    HOLIDAY: "공휴일",
    VACATION: "휴가",
  };

  const normalizeEvent = (schedule) => {
    const startDate = formatDate(
      schedule.startDatetime || schedule.startDateTime
    );

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
        : typeLabelMap[schedule.scheduleType] ||
          schedule.scheduleType ||
          "개인",
      color: schedule.color,
      raw: schedule,
    };
  };

  const normalizeVacation = (vacation) => {
    const userId =
      vacation.userId ||
      vacation.employeeId ||
      vacation.user?.userId ||
      vacation.user?.id;

    return {
      id: vacation.vacationId || vacation.id,
      employeeId: userId,
      employeeName:
        vacation.employeeName ||
        vacation.userName ||
        vacation.user?.userName ||
        vacation.user?.name ||
        currentUser?.userName ||
        currentUser?.name ||
        "내",
      title: "내 휴가",
      type: "휴가",
      startDate: vacation.startDate,
      endDate: vacation.endDate,
      reason: vacation.reason || "",
      status: vacation.status || "PENDING",
      days: vacation.days || calculateDays(vacation.startDate, vacation.endDate),
      raw: vacation,
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
      console.error("일정 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVacations = async () => {
    try {
      const data = await vacationApi.getAll();

      const normalized = Array.isArray(data)
        ? data.map(normalizeVacation)
        : [];

      setVacations(normalized);
    } catch (error) {
      console.error("휴가 조회 실패:", error.response?.data || error);
      setVacations([]);
    }
  };

  useEffect(() => {
    fetchSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    fetchVacations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);
  
  useEffect(() => {
    console.log("선택된 날짜:", date);
  }, [date]);

  const myApprovedVacations = useMemo(() => {
    return vacations.filter((vacation) => {
      const isApproved =
        vacation.status === "APPROVED" || vacation.status === "승인";

      return isApproved && String(vacation.employeeId) === String(currentUserId);
    });
  }, [vacations, currentUserId]);

  const handleAddEvent = async () => {
    if (!formData.title || !formData.date) {
      alert("제목과 날짜를 입력해주세요.");
      return;
    }

    if (
      !canCreateOfficialSchedule &&
      (formData.type === "COMPANY" || formData.type === "HOLIDAY")
    ) {
      alert("전사 일정과 공휴일은 관리자 또는 인사팀만 추가할 수 있습니다.");
      return;
    }

    try {
      const startTime = formData.startTime || "00:00";
      const endTime = formData.endTime || "23:59";

      const payload = {
        userId: currentUserId || 1,
        title: formData.title,
        content: formData.description,
        startDatetime: `${formData.date}T${startTime}:00`,
        endDatetime: `${formData.date}T${endTime}:00`,
        scheduleType: formData.type,
        isAllDay: !formData.startTime && !formData.endTime,
        departmentId: null,
        isOfficial: canCreateOfficialSchedule && formData.type === "COMPANY",
        isHoliday: canCreateOfficialSchedule && formData.type === "HOLIDAY",
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

  const vacationEvents = useMemo(() => {
    const result = [];

    myApprovedVacations.forEach((vacation) => {
      if (!vacation.startDate || !vacation.endDate) return;

      const current = toLocalDate(vacation.startDate);
      const end = toLocalDate(vacation.endDate);

      while (current <= end) {
        const dateText = [
          current.getFullYear(),
          String(current.getMonth() + 1).padStart(2, "0"),
          String(current.getDate()).padStart(2, "0"),
        ].join("-");

        result.push({
          id: `vacation-${vacation.id}-${dateText}`,
          vacationId: vacation.id,
          title: "내 휴가",
          description: vacation.reason,
          date: dateText,
          endDate: vacation.endDate,
          startTime: "",
          endTime: "",
          type: "휴가",
          isVacation: true,
          raw: vacation,
        });

        current.setDate(current.getDate() + 1);
      }
    });

    return result;
  }, [myApprovedVacations]);

  const combinedEvents = useMemo(() => {
    return [...events, ...vacationEvents];
  }, [events, vacationEvents]);

  const filteredEvents = useMemo(() => {
    if (filterType === "전체") return combinedEvents;

    return combinedEvents.filter((event) => event.type === filterType);
  }, [combinedEvents, filterType]);

  const selectedDateEvents = useMemo(() => {
    const selectedDateText = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    return filteredEvents.filter((event) => event.date === selectedDateText);
  }, [date, filteredEvents]);

  const personalDates = useMemo(() => {
    return combinedEvents
      .filter((event) => event.type === "개인")
      .map((event) => toLocalDate(event.date))
      .filter(Boolean);
  }, [combinedEvents]);

  const teamDates = useMemo(() => {
    return combinedEvents
      .filter((event) => event.type === "팀")
      .map((event) => toLocalDate(event.date))
      .filter(Boolean);
  }, [combinedEvents]);

  const companyDates = useMemo(() => {
    return combinedEvents
      .filter((event) => event.type === "전사")
      .map((event) => toLocalDate(event.date))
      .filter(Boolean);
  }, [combinedEvents]);

  const vacationDates = useMemo(() => {
    return combinedEvents
      .filter((event) => event.type === "휴가")
      .map((event) => toLocalDate(event.date))
      .filter(Boolean);
  }, [combinedEvents]);

  const holidayDates = useMemo(() => {
    return combinedEvents
      .filter((event) => event.type === "공휴일")
      .map((event) => toLocalDate(event.date))
      .filter(Boolean);
  }, [combinedEvents]);

  const getEventColor = (type) => {
    if (isDark) {
      const colors = {
        개인: "bg-purple-500/15 text-purple-200 border-purple-400/40",
        팀: "bg-blue-500/15 text-blue-200 border-blue-400/40",
        전사: "bg-green-500/15 text-green-200 border-green-400/40",
        휴가: "bg-orange-500/15 text-orange-200 border-orange-400/40",
        공휴일: "bg-red-500/15 text-red-200 border-red-400/40",
      };

      return colors[type] || colors["개인"];
    }

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
    <div className={cn("p-6", pageClass)}>
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

                      {canCreateOfficialSchedule && (
                        <>
                          <SelectItem value="COMPANY">전사</SelectItem>
                          <SelectItem value="HOLIDAY">공휴일</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {!canCreateOfficialSchedule && (
                <div className="text-xs text-gray-500">
                  일반 직원은 개인/팀 일정만 추가할 수 있습니다.
                </div>
              )}

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
                <div className="flex justify-center">
                  <CalendarComp
                    mode="single"
                    selected={date}
                    onSelect={(selected) => {
                      if (selected) setDate(selected);
                    }}
                    className={cn("rounded-md border", calendarBoxClass)}
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
              )}

              <div className="mt-4">
                <h4 className={cn("font-semibold mb-2", textMain)}>범례</h4>

                <div className="flex flex-wrap gap-2">
                  <Badge className={getEventColor("개인")}>개인</Badge>
                  <Badge className={getEventColor("팀")}>팀</Badge>
                  <Badge className={getEventColor("전사")}>전사</Badge>
                  <Badge className={getEventColor("휴가")}>휴가</Badge>
                  <Badge className={getEventColor("공휴일")}>공휴일</Badge>
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
                      key={`${event.type}-${event.id || event.date}-${event.title}`}
                      className={cn(
                        "p-3 rounded-lg border",
                        getEventColor(event.type)
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{event.title}</h4>

                        {!event.isVacation && event.type !== "휴가" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteEvent(event.id)}
                            className={cn("h-6 w-6 p-0", ghostButtonClass)}
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

                      <Badge
                        className={cn("mt-2", getEventColor(event.type))}
                        variant="outline"
                      >
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
                      key={`upcoming-${event.type}-${event.id || event.date}-${event.title}`}
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

                      <Badge className={cn("text-xs", getEventColor(event.type))}>
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