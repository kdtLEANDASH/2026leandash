import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Bell,
  TrendingUp,
  Users,
  Clock,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/UI/card";
import { Badge } from "../../components/UI/badge";
import { Button } from "../../components/UI/button";
import { Calendar as CalendarComp } from "../../components/UI/calendar";
import { useAppContext } from "../../store/AppProvider";
import { cn } from "../../components/UI/utils";
import { scheduleApi } from "../../api/scheduleApi";
import { vacationApi } from "../../api/vacationApi";
import { getNoticesApi } from "../../api/noticeApi";

export function DashboardPage() {
  const {
    getVacationBalance,
    currentUser,
    employees = [],
    customSettings,
  } = useAppContext() || {};

  const isDark = customSettings?.darkMode;

  const cardClass = isDark
    ? "!bg-zinc-700 !border-zinc-600 !text-zinc-100"
    : "";

  const innerCardClass = isDark
    ? "!bg-zinc-600 !border-zinc-500 !text-zinc-100"
    : "bg-white border-gray-200";

  const textMain = isDark ? "text-zinc-100" : "text-gray-900";
  const textSub = isDark ? "text-zinc-300" : "text-gray-600";
  const textMuted = isDark ? "text-zinc-400" : "text-gray-500";
  const hoverClass = isDark ? "hover:!bg-zinc-500" : "hover:bg-gray-50";

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [vacationRequests, setVacationRequests] = useState([]);
  const [apiUsers, setApiUsers] = useState([]);
  const [apiNotices, setApiNotices] = useState([]);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  const getAuthHeader = () => {
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");

    return token ? { Authorization: `Bearer ${token}` } : {};
  };

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

  const unwrapResponse = (result) => {
    if (Array.isArray(result)) return result;
    return result?.data ?? result ?? [];
  };

  const toLocalDate = (dateStr) => {
    if (!dateStr) return new Date();

    const [year, month, day] = dateStr.split("-").map(Number);
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

  const normalizeSchedule = (schedule) => {
    const start = schedule.startDatetime || schedule.startDateTime;
    const end = schedule.endDatetime || schedule.endDateTime;

    return {
      id: schedule.scheduleId,
      title: schedule.title,
      description: schedule.content,
      date: formatDate(start),
      endDate: formatDate(end),
      startTime: formatTime(start),
      endTime: formatTime(end),
      type: schedule.isHoliday
        ? "공휴일"
        : typeLabelMap[schedule.scheduleType] || "개인",
      raw: schedule,
    };
  };

  const normalizeUserId = (value) => {
    if (value === null || value === undefined) return "";
    return String(value);
  };

  const findUserByUserId = (userId) => {
    const targetId = normalizeUserId(userId);

    return (
      apiUsers.find(
        (user) =>
          normalizeUserId(user.userId) === targetId ||
          normalizeUserId(user.id) === targetId
      ) ||
      employees.find(
        (employee) =>
          normalizeUserId(employee.userId) === targetId ||
          normalizeUserId(employee.id) === targetId ||
          normalizeUserId(employee.employeeId) === targetId
      )
    );
  };

  const normalizeVacation = (vacation) => {
    const userId =
      vacation.userId ||
      vacation.employeeId ||
      vacation.user?.userId ||
      vacation.user?.id;

    const user = findUserByUserId(userId);

    const startDate = vacation.startDate || "";
    const endDate = vacation.endDate || "";

    return {
      id: vacation.vacationId || vacation.id,
      employeeId: userId,
      employeeName:
        vacation.employeeName ||
        vacation.userName ||
        vacation.user?.userName ||
        vacation.user?.name ||
        user?.userName ||
        user?.employeeName ||
        user?.name ||
        "이름 없음",
      type: vacation.vacationType || vacation.type || "휴가",
      startDate,
      endDate,
      reason: vacation.reason || "",
      status: vacation.status || "PENDING",
      days: vacation.days || calculateDays(startDate, endDate),
      raw: vacation,
    };
  };

  useEffect(() => {
    const loadSchedules = async () => {
      try {
        const data = await scheduleApi.getMonthlySchedules();
        const normalized = Array.isArray(data)
          ? data.map(normalizeSchedule)
          : [];

        setCalendarEvents(normalized);
      } catch (error) {
        console.error("대시보드 일정 조회 실패:", error);
      }
    };

    loadSchedules();
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/users`, {
          headers: getAuthHeader(),
        });

        setApiUsers(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("대시보드 사용자 조회 실패:", error.response?.data || error);
        setApiUsers([]);
      }
    };

    loadUsers();
  }, [API_BASE_URL]);

  useEffect(() => {
    const loadNotices = async () => {
      try {
        const data = unwrapResponse(await getNoticesApi());
        const normalized = Array.isArray(data)
          ? data.map((notice) => ({
              id: notice.noticeId ?? notice.id,
              title: notice.title ?? "",
              author: notice.writerName ?? notice.author ?? "관리자",
              date: formatDate(notice.createdAt ?? notice.date),
              isPinned: Boolean(notice.isPinned),
            }))
          : [];

        setApiNotices(normalized);
      } catch (error) {
        console.error("대시보드 공지 조회 실패:", error);
        setApiNotices([]);
      }
    };

    loadNotices();
  }, []);

  useEffect(() => {
    const loadVacations = async () => {
      try {
        const data = await vacationApi.getAll();

        const normalized = Array.isArray(data)
          ? data.map(normalizeVacation)
          : [];

        setVacationRequests(normalized);
      } catch (error) {
        console.error("대시보드 휴가 조회 실패:", error.response?.data || error);
        setVacationRequests([]);
      }
    };

    loadVacations();
  }, [apiUsers, employees]);

  const loginUser =
    currentUser || {
      id: employees[0]?.id || "demo-user",
      userId: employees[0]?.userId,
      name:
        employees[0]?.name ||
        employees[0]?.userName ||
        localStorage.getItem("userEmail")?.split("@")[0] ||
        "테스트 사용자",
      email: employees[0]?.email || localStorage.getItem("userEmail") || "",
      role: employees[0]?.role || "일반직원",
      department: employees[0]?.department || "개발팀",
      status: employees[0]?.status || "업무 중",
    };

  let vacationBalance = {
    total: 15,
    used: 0,
    remaining: 15,
  };

  try {
    const loginUserId = loginUser?.userId || loginUser?.id;

    if (typeof getVacationBalance === "function" && loginUserId) {
      vacationBalance = getVacationBalance(loginUserId) || vacationBalance;
    }
  } catch (error) {
    vacationBalance = {
      total: 15,
      used: 0,
      remaining: 15,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formattedDate = `${today.getFullYear()}년 ${
    today.getMonth() + 1
  }월 ${today.getDate()}일`;

  const dayOfWeek = ["일", "월", "화", "수", "목", "금", "토"][today.getDay()];

  const todayStr = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const todayEvents = calendarEvents.filter((event) => event.date === todayStr);

  const upcomingEvents = calendarEvents
    .filter((event) => {
      const eventDate = toLocalDate(event.date);
      eventDate.setHours(0, 0, 0, 0);

      const diffTime = eventDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays >= 0 && diffDays <= 7;
    })
    .sort((a, b) => toLocalDate(a.date) - toLocalDate(b.date))
    .slice(0, 5);

  const recentNotices = apiNotices.slice(0, 5);

  const isAdmin =
    loginUser.role === "ADMIN" || loginUser.role === "최고관리자";

  const isTeamLeader = loginUser.role === "팀장";
  const isManager = isAdmin || isTeamLeader;

  const pendingVacations = isManager
    ? vacationRequests.filter((req) => {
        const isPending = req.status === "PENDING" || req.status === "대기";

        if (!isPending) return false;

        if (isAdmin) return true;

        const user = findUserByUserId(req.employeeId);

        return user && user.department === loginUser.department;
      })
    : [];

  const activeEmployees = (apiUsers.length > 0 ? apiUsers : employees).filter(
    (emp) => emp.status !== "오프라인"
  ).length;

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

  const myApprovedVacationDates = useMemo(() => {
    const currentUserId = loginUser?.userId || loginUser?.id;
    const result = [];

    vacationRequests
      .filter(
        (vacation) =>
          (vacation.status === "APPROVED" || vacation.status === "승인") &&
          String(vacation.employeeId) === String(currentUserId)
      )
      .forEach((vacation) => {
        if (!vacation.startDate || !vacation.endDate) return;

        const current = toLocalDate(vacation.startDate);
        const end = toLocalDate(vacation.endDate);

        while (current <= end) {
          result.push(new Date(current));
          current.setDate(current.getDate() + 1);
        }
      });

    return result;
  }, [vacationRequests, loginUser]);

  const holidayDates = useMemo(() => {
    return calendarEvents
      .filter((event) => event.type === "공휴일")
      .map((event) => toLocalDate(event.date));
  }, [calendarEvents]);

  const getSelectedDateEvents = () => {
    if (!selectedDate) return [];

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    return calendarEvents.filter((event) => event.date === dateStr);
  };
  
  const selectedDateVacations = useMemo(() => {
    if (!selectedDate) return [];

    const currentUserId = loginUser?.userId || loginUser?.id;
    const dateStr = [
      selectedDate.getFullYear(),
      String(selectedDate.getMonth() + 1).padStart(2, "0"),
      String(selectedDate.getDate()).padStart(2, "0"),
    ].join("-");

    return vacationRequests.filter(
      (vacation) =>
        (vacation.status === "APPROVED" || vacation.status === "승인") &&
        String(vacation.employeeId) === String(currentUserId) &&
        vacation.startDate <= dateStr &&
        vacation.endDate >= dateStr
    );
  }, [selectedDate, vacationRequests, loginUser]);

  const selectedDateEvents = getSelectedDateEvents();

  const getEventTypeBadge = (type) => {
    const configs = {
      개인: { bg: "bg-purple-100", text: "text-purple-700" },
      팀: { bg: "bg-blue-100", text: "text-blue-700" },
      전사: { bg: "bg-green-100", text: "text-green-700" },
      공휴일: { bg: "bg-red-100", text: "text-red-700" },
      휴가: { bg: "bg-amber-100", text: "text-amber-700" },
    };

    const config = configs[type] || configs["개인"];

    return (
      <Badge className={`${config.bg} ${config.text} hover:${config.bg}`}>
        {type}
      </Badge>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              안녕하세요, {loginUser.name || loginUser.userName}님! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              {formattedDate} ({dayOfWeek}요일)
            </p>
          </div>

          <div className="text-right">
            <div className="text-sm text-blue-100 mb-1">오늘의 일정</div>
            <div className="text-4xl font-bold">{todayEvents.length}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={cardClass}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn("text-sm font-medium", textSub)}>잔여 휴가</p>
                <p className={cn("text-2xl font-bold mt-2", textMain)}>
                  {vacationBalance.remaining}일
                </p>
                <p className={cn("text-xs mt-1", textMuted)}>
                  총 {vacationBalance.total}일 중 {vacationBalance.used}일 사용
                </p>
              </div>

              <div className="size-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="size-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn("text-sm font-medium", textSub)}>오늘 일정</p>
                <p className={cn("text-2xl font-bold mt-2", textMain)}>
                  {todayEvents.length}개
                </p>
                <p className={cn("text-xs mt-1", textMuted)}>예정된 일정</p>
              </div>

              <div className="size-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="size-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn("text-sm font-medium", textSub)}>
                  미확인 공지
                </p>
                <p className={cn("text-2xl font-bold mt-2", textMain)}>
                  {recentNotices.length}개
                </p>
                <p className={cn("text-xs mt-1", textMuted)}>
                  새로운 공지사항
                </p>
              </div>

              <div className="size-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Bell className="size-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn("text-sm font-medium", textSub)}>
                  활동 중인 직원
                </p>
                <p className={cn("text-2xl font-bold mt-2", textMain)}>
                  {activeEmployees}명
                </p>
                <p className={cn("text-xs mt-1", textMuted)}>
                  전체 {employees.length}명
                </p>
              </div>

              <div className="size-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="size-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isManager && pendingVacations.length > 0 && (
        <Card className={cn("border-l-4 border-l-orange-500", cardClass)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-400">
              <Bell className="size-5" />
              승인 대기 중인 휴가 신청 ({pendingVacations.length}건)
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-2">
              {pendingVacations.slice(0, 3).map((vacation) => (
                <div
                  key={vacation.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg",
                    isDark ? "bg-zinc-600" : "bg-orange-50"
                  )}
                >
                  <div>
                    <div className={cn("font-medium", textMain)}>
                      {vacation.employeeName}
                    </div>
                    <div className={cn("text-sm", textSub)}>
                      {vacation.startDate} ~ {vacation.endDate} (
                      {vacation.days}일)
                    </div>
                  </div>

                  <Link to="/vacation/list">
                    <Button size="sm" variant="outline">
                      확인하기
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className={cn("lg:col-span-2 lg:row-span-2", cardClass)}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className={cn("flex items-center gap-2", textMain)}>
                <Calendar className="size-5" />
                캘린더
                <span className={cn("text-sm font-normal", textMuted)}>
                  {selectedDate &&
                    `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일`}
                </span>
              </CardTitle>

              <Link to="/calendar">
                <Button variant="ghost" size="sm">
                  전체 보기
                </Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex justify-center">
                <CalendarComp
                  mode="single"
                  selected={selectedDate}
                  onSelect={(selected) => {
                    if (selected) setSelectedDate(selected);
                  }}
                  className={cn(
                    "rounded-md border text-base",
                    isDark ? "bg-zinc-700 border-zinc-500 text-zinc-100" : ""
                  )}
                  classNames={{
                    months:
                      "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-lg font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button:
                      "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: cn(
                      "rounded-md w-10 font-normal text-sm",
                      isDark ? "text-zinc-300" : "text-gray-500"
                    ),
                    row: "flex w-full mt-2",
                    cell: "h-10 w-10 text-center text-sm p-0 relative",
                    day: "h-10 w-10 p-0 font-normal",
                  }}
                  personalDates={personalDates}
                  teamDates={teamDates}
                  companyDates={companyDates}
                  vacationDates={myApprovedVacationDates}
                  holidayDates={holidayDates}
                />
              </div>

              <div className="space-y-3">
                <h3 className={cn("font-semibold", textMain)}>
                  {selectedDate
                    ? `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 일정`
                    : "날짜를 선택하세요"}
                </h3>

                {selectedDateEvents.length > 0 || selectedDateVacations.length > 0 ? (
                  <div className="space-y-2">
				  {selectedDateEvents.length > 0 || selectedDateVacations.length > 0 ? (
				    <div className="space-y-2">
				      {selectedDateEvents.map((event) => (
				        <div
				          key={event.id}
				          className={cn("p-3 border rounded-lg", innerCardClass)}
				        >
				          <div className="flex items-start justify-between gap-2 mb-1">
				            <span className={cn("text-sm font-medium", textMain)}>
				              {event.title}
				            </span>
				            {getEventTypeBadge(event.type)}
				          </div>

				          {event.startTime && event.endTime && (
				            <div className={cn("text-xs", textSub)}>
				              {event.startTime} - {event.endTime}
				            </div>
				          )}

				          {event.description && (
				            <div className={cn("text-xs mt-1", textSub)}>
				              {event.description}
				            </div>
				          )}
				        </div>
				      ))}

				      {selectedDateVacations.map((vacation) => (
				        <div
				          key={`vacation-${vacation.id}`}
				          className={cn("p-3 border rounded-lg", innerCardClass)}
				        >
				          <div className="flex items-start justify-between gap-2 mb-1">
				            <span className={cn("text-sm font-medium", textMain)}>
				              {vacation.employeeName} 휴가
				            </span>
				            {getEventTypeBadge("휴가")}
				          </div>

				          <div className={cn("text-xs", textSub)}>
				            {vacation.startDate} ~ {vacation.endDate}
				          </div>

				          {vacation.reason && (
				            <div className={cn("text-xs mt-1", textSub)}>
				              {vacation.reason}
				            </div>
				          )}
				        </div>
				      ))}
				    </div>
				  ) : (
				    <div className={cn("text-center py-8", textMuted)}>
				      <Calendar className="size-8 mx-auto mb-2 text-gray-400" />
				      <p className="text-sm">일정이 없습니다</p>
				    </div>
				  )}
                  </div>
                ) : (
                  <div className={cn("text-center py-8", textMuted)}>
                    <Calendar className="size-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">일정이 없습니다</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className={cn("flex items-center gap-2", textMain)}>
                <FileText className="size-5" />
                사내 공지
              </CardTitle>

              <Link to="/notice">
                <Button variant="ghost" size="sm">
                  더보기
                </Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {recentNotices.slice(0, 3).map((notice) => (
                <Link key={notice.id} to="/notice">
                  <div
                    className={cn(
                      "p-3 rounded-lg transition-colors cursor-pointer border",
                      innerCardClass,
                      hoverClass
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span
                        className={cn(
                          "font-medium text-sm line-clamp-1",
                          textMain
                        )}
                      >
                        {notice.title}
                      </span>

                      {notice.isPinned && (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs">
                          중요
                        </Badge>
                      )}
                    </div>

                    <div className={cn("text-xs", textMuted)}>
                      {typeof notice.author === "object"
                        ? notice.author?.name
                        : notice.author}{" "}
                      · {notice.date}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className={cn("flex items-center gap-2", textMain)}>
                <Clock className="size-5" />
                금일 일정
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent>
            {todayEvents.length > 0 ? (
              <div className="space-y-2">
                {todayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "p-3 border rounded-lg transition-shadow",
                      innerCardClass
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {getEventTypeBadge(event.type)}

                      {event.startTime && event.endTime && (
                        <span className={cn("text-xs", textSub)}>
                          {event.startTime} - {event.endTime}
                        </span>
                      )}
                    </div>

                    <div className={cn("font-medium text-sm mb-1", textMain)}>
                      {event.title}
                    </div>

                    {event.description && (
                      <div className={cn("text-xs line-clamp-1", textSub)}>
                        {event.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="size-8 text-gray-300 mx-auto mb-2" />
                <p className={cn("text-sm", textMuted)}>
                  오늘 예정된 일정이 없습니다
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className={cardClass}>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", textMain)}>
            <TrendingUp className="size-5" />
            다가오는 일정 (7일 이내)
          </CardTitle>
        </CardHeader>

        <CardContent>
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "p-4 border rounded-lg transition-shadow",
                    innerCardClass
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    {getEventTypeBadge(event.type)}

                    <span className={cn("text-xs", textMuted)}>
                      {event.date}
                    </span>
                  </div>

                  <div className={cn("font-medium mb-1", textMain)}>
                    {event.title}
                  </div>

                  {event.startTime && event.endTime && (
                    <div className={cn("text-sm", textSub)}>
                      {event.startTime} - {event.endTime}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className={textMuted}>다가오는 일정이 없습니다</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardPage;
