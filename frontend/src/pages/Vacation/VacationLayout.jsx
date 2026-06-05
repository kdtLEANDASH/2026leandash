import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Badge } from "@/components/UI/badge";
import { useAppContext } from "@/store/AppProvider";
import { cn } from "@/components/UI/utils";
import { scheduleApi } from "@/api/scheduleApi";

export default function VacationLayout() {
  const {
    vacationRequests,
    addVacationRequest,
    cancelVacation,
    approveVacation,
    rejectVacation,
    currentUser,
    employees,
    getVacationBalance,
    customSettings,
  } = useAppContext();

  const isDark = customSettings?.darkMode;

  const navigate = useNavigate();
  const location = useLocation();

  const isHrAdmin = currentUser?.department === "인사팀";

  const isManager =
    !!currentUser &&
    (currentUser.role === "팀장" ||
      currentUser.role === "최고관리자" ||
      currentUser.department === "인사팀");

  const canViewVacationStatus =
    !!currentUser &&
    (currentUser.role === "팀장" ||
      currentUser.role === "최고관리자" ||
      currentUser.department === "인사팀");

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);

  const [formData, setFormData] = useState({
    type: "",
    startDate: "",
    endDate: "",
    reason: "",
    days: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("전체");

  const [statusSearchKeyword, setStatusSearchKeyword] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("전체");
  const [showCurrentOnly, setShowCurrentOnly] = useState(false);
  const [statusSortOption, setStatusSortOption] = useState("startAsc");

  const [recommendationTypeFilter, setRecommendationTypeFilter] =
    useState("전체");
  const [recommendationDaysFilter, setRecommendationDaysFilter] =
    useState("전체");
  const [recommendationPeriod, setRecommendationPeriod] = useState("90");
  const [previewRecommendation, setPreviewRecommendation] = useState(null);
  const [previewDate, setPreviewDate] = useState(new Date());

  const itemsPerPage = 5;
  const recommendationSearchDays = Number(recommendationPeriod);

  const pageClass = isDark
    ? "bg-[#27272a] text-white"
    : "bg-gray-50 text-gray-900";

  const sidebarClass = isDark
    ? "bg-[#35353d] border-[#5c5c73]"
    : "bg-white border-gray-200";

  const textMain = isDark ? "text-white" : "text-gray-900";
  const textMuted = isDark ? "text-zinc-400" : "text-gray-500";

  const formatScheduleDate = (value) => {
    if (!value) return "";

    if (typeof value === "string") {
      return value.includes("T") ? value.split("T")[0] : value.slice(0, 10);
    }

    return "";
  };

  const formatScheduleTime = (value) => {
    if (!value || typeof value !== "string") return "";
    if (!value.includes("T")) return "";

    return value.split("T")[1]?.slice(0, 5) || "";
  };

  const normalizeSchedule = (schedule) => {
    const start = schedule.startDatetime || schedule.startDateTime;
    const end = schedule.endDatetime || schedule.endDateTime;

    const typeMap = {
      PERSONAL: "개인",
      TEAM: "팀",
      COMPANY: "전사",
      HOLIDAY: "공휴일",
      VACATION: "휴가",
    };

    return {
      id: schedule.scheduleId,
      title: schedule.title,
      description: schedule.content,
      date: formatScheduleDate(start),
      endDate: formatScheduleDate(end),
      startTime: formatScheduleTime(start),
      endTime: formatScheduleTime(end),
      type: schedule.isHoliday
        ? "공휴일"
        : typeMap[schedule.scheduleType] || "개인",
      raw: schedule,
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
        console.error("휴가 페이지 일정 조회 실패:", error);
      }
    };

    loadSchedules();
  }, []);

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;

    const startDate = new Date(start);
    const endDate = new Date(end);

    return (
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1
    );
  };

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
  };

  const parseDate = (dateStr) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const addDays = (date, days) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  };

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const visibleVacationRequests = useMemo(() => {
    return vacationRequests.filter((vacation) => {
      if (currentUser?.role === "최고관리자" || isHrAdmin) return true;

      if (currentUser?.role === "팀장") {
        const employee = employees.find((emp) => emp.id === vacation.employeeId);

        return (
          !!employee &&
          (employee.department === currentUser.department ||
            vacation.employeeId === currentUser.id)
        );
      }

      return vacation.employeeId === currentUser?.id;
    });
  }, [vacationRequests, currentUser, employees, isHrAdmin]);

  const filteredVacationRequests = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return visibleVacationRequests.filter((vacation) => {
      const matchesStatus =
        statusFilter === "전체" ? true : vacation.status === statusFilter;

      const matchesKeyword =
        keyword === ""
          ? true
          : vacation.employeeName.toLowerCase().includes(keyword) ||
            vacation.type.toLowerCase().includes(keyword) ||
            vacation.reason.toLowerCase().includes(keyword);

      return matchesStatus && matchesKeyword;
    });
  }, [visibleVacationRequests, searchKeyword, statusFilter]);

  const visibleApprovedVacations = vacationRequests.filter((vacation) => {
    if (vacation.status !== "승인") return false;

    if (currentUser?.role === "최고관리자") return true;
    if (currentUser?.department === "인사팀") return true;

    if (currentUser?.role === "팀장") {
      const employee = employees.find((emp) => emp.id === vacation.employeeId);
      return !!employee && employee.department === currentUser.department;
    }

    return vacation.employeeId === currentUser?.id;
  });

  const vacationStatusList = useMemo(() => {
    return [...visibleApprovedVacations].sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }, [visibleApprovedVacations]);

  const vacationBalance = currentUser
    ? getVacationBalance(currentUser.id)
    : { total: 15, used: 0, remaining: 15 };

  const recommendedVacations = useMemo(() => {
    if (!currentUser) return [];

    const todayDate = new Date();

    const holidayBridgeRecommendations = [];
    const weekendLinkRecommendations = [];
    const lowLoadRecommendations = [];
    const balanceRecommendations = [];

    const hasCompanyEvent = (dateStr) => {
      return calendarEvents.some(
        (event) => event.date === dateStr && event.type !== "공휴일"
      );
    };

    const hasHoliday = (dateStr) => {
      return calendarEvents.some(
        (event) => event.date === dateStr && event.type === "공휴일"
      );
    };

    const isWeekdayHoliday = (date) => {
      const dateStr = formatDate(date);
      return hasHoliday(dateStr) && !isWeekend(date);
    };

    const isRestDay = (date) => {
      const dateStr = formatDate(date);
      return isWeekend(date) || hasHoliday(dateStr);
    };

    const calculateRestPeriod = (startDate, endDate) => {
      let realStart = new Date(startDate);
      let realEnd = new Date(endDate);

      while (isRestDay(addDays(realStart, -1))) {
        realStart = addDays(realStart, -1);
      }

      while (isRestDay(addDays(realEnd, 1))) {
        realEnd = addDays(realEnd, 1);
      }

      return {
        restStartDate: formatDate(realStart),
        restEndDate: formatDate(realEnd),
        totalRestDays: calculateDays(formatDate(realStart), formatDate(realEnd)),
      };
    };

    const getTeamVacationCount = (dateStr) => {
      return vacationRequests.filter((vacation) => {
        const employee = employees.find((emp) => emp.id === vacation.employeeId);

        return (
          vacation.status === "승인" &&
          employee?.department === currentUser.department &&
          vacation.startDate <= dateStr &&
          vacation.endDate >= dateStr
        );
      }).length;
    };

    for (let i = 1; i <= recommendationSearchDays; i++) {
      const targetDate = addDays(todayDate, i);
      const dateStr = formatDate(targetDate);

      if (isWeekend(targetDate)) continue;
      if (hasCompanyEvent(dateStr)) continue;

      const prevDate = addDays(targetDate, -1);
      const nextDate = addDays(targetDate, 1);
      const prev2Date = addDays(targetDate, -2);
      const next2Date = addDays(targetDate, 2);

      const prevIsWeekend = isWeekend(prevDate);
      const nextIsWeekend = isWeekend(nextDate);

      const hasNearWeekdayHoliday =
        isWeekdayHoliday(prevDate) ||
        isWeekdayHoliday(nextDate) ||
        isWeekdayHoliday(prev2Date) ||
        isWeekdayHoliday(next2Date);

      const teamVacationCount = getTeamVacationCount(dateStr);

      if (hasNearWeekdayHoliday) {
        const restInfo = calculateRestPeriod(targetDate, targetDate);

        holidayBridgeRecommendations.push({
          id: `holiday-bridge-${dateStr}`,
          category: "공휴일 징검다리",
          title: "공휴일 징검다리 휴가",
          startDate: dateStr,
          endDate: dateStr,
          days: 1,
          type: "연차",
          reason: "평일 공휴일과 연결되는 징검다리 휴가입니다.",
          description: `평일 공휴일과 연결되어 ${restInfo.totalRestDays}일 연속 휴식이 가능한 날짜입니다.`,
          teamVacationCount,
          totalRestDays: restInfo.totalRestDays,
          restStartDate: restInfo.restStartDate,
          restEndDate: restInfo.restEndDate,
          reasons: [
            "평일 공휴일 인접",
            "회사 일정 없음",
            `팀 휴가자 ${teamVacationCount}명`,
            `예상 연휴 ${restInfo.totalRestDays}일`,
          ],
          score: restInfo.totalRestDays + (teamVacationCount === 0 ? 2 : 0),
        });
      }

      if (!hasNearWeekdayHoliday && (prevIsWeekend || nextIsWeekend)) {
        const restInfo = calculateRestPeriod(targetDate, targetDate);

        weekendLinkRecommendations.push({
          id: `weekend-link-${dateStr}`,
          category: "주말 연장",
          title: "주말 연장 휴가",
          startDate: dateStr,
          endDate: dateStr,
          days: 1,
          type: "연차",
          reason: "주말과 이어붙여 사용하는 휴가입니다.",
          description: `주말과 연결하여 ${restInfo.totalRestDays}일 연속 휴식이 가능합니다.`,
          teamVacationCount,
          totalRestDays: restInfo.totalRestDays,
          restStartDate: restInfo.restStartDate,
          restEndDate: restInfo.restEndDate,
          reasons: [
            "주말과 연결",
            "회사 일정 없음",
            `팀 휴가자 ${teamVacationCount}명`,
            `예상 연휴 ${restInfo.totalRestDays}일`,
          ],
          score: restInfo.totalRestDays + (teamVacationCount === 0 ? 2 : 0),
        });
      }

      if (teamVacationCount === 0) {
        lowLoadRecommendations.push({
          id: `lowload-${dateStr}`,
          category: "승인 가능성",
          title: "승인 가능성 높은 휴가",
          startDate: dateStr,
          endDate: dateStr,
          days: 1,
          type: "연차",
          reason: "팀 휴가자가 적어 업무 공백 부담이 적은 날짜입니다.",
          description:
            "같은 부서 휴가자가 없어 승인 가능성이 높은 날짜입니다.",
          teamVacationCount,
          totalRestDays: 1,
          restStartDate: dateStr,
          restEndDate: dateStr,
          reasons: [
            "팀 휴가자 없음",
            "회사 일정 없음",
            "업무 공백 부담 낮음",
          ],
          score: 2,
        });
      }

      if (vacationBalance.remaining >= 10) {
        const endDate = addDays(targetDate, 1);
        const endDateStr = formatDate(endDate);

        if (
          !isWeekend(endDate) &&
          !hasCompanyEvent(endDateStr) &&
          getTeamVacationCount(endDateStr) <= 1
        ) {
          const restInfo = calculateRestPeriod(targetDate, endDate);

          balanceRecommendations.push({
            id: `balance-${dateStr}`,
            category: "잔여 연차 활용",
            title: "잔여 연차 활용 추천",
            startDate: dateStr,
            endDate: endDateStr,
            days: 2,
            type: "연차",
            reason: "잔여 연차가 충분하여 2일 연속 휴가 사용을 추천합니다.",
            description: `남은 연차를 활용해 ${restInfo.totalRestDays}일 연속 휴식을 만들 수 있습니다.`,
            teamVacationCount,
            totalRestDays: restInfo.totalRestDays,
            restStartDate: restInfo.restStartDate,
            restEndDate: restInfo.restEndDate,
            reasons: [
              `잔여 연차 ${vacationBalance.remaining}일`,
              "2일 연속 사용 가능",
              "회사 일정 없음",
              `예상 연휴 ${restInfo.totalRestDays}일`,
            ],
            score: restInfo.totalRestDays,
          });
        }
      }
    }

    const sortByBest = (list) => {
      return [...list].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.startDate.localeCompare(b.startDate);
      });
    };

    const usedDates = new Set();

    const pickMultipleUnique = (list, limit) => {
      const result = [];

      sortByBest(list).forEach((recommendation) => {
        if (result.length >= limit) return;
        if (usedDates.has(recommendation.startDate)) return;

        usedDates.add(recommendation.startDate);
        result.push(recommendation);
      });

      return result;
    };

    const baseRecommendations = [
      ...pickMultipleUnique(holidayBridgeRecommendations, 2),
      ...pickMultipleUnique(weekendLinkRecommendations, 2),
      ...pickMultipleUnique(lowLoadRecommendations, 2),
      ...pickMultipleUnique(balanceRecommendations, 2),
    ].filter(Boolean);

    return baseRecommendations.filter((recommendation) => {
      const matchesType =
        recommendationTypeFilter === "전체"
          ? true
          : recommendation.category === recommendationTypeFilter;

      const matchesDays =
        recommendationDaysFilter === "전체"
          ? true
          : recommendationDaysFilter === "1"
          ? recommendation.days === 1
          : recommendation.days >= 2;

      return matchesType && matchesDays;
    });
  }, [
    currentUser,
    calendarEvents,
    vacationRequests,
    employees,
    vacationBalance.remaining,
    recommendationSearchDays,
    recommendationTypeFilter,
    recommendationDaysFilter,
  ]);

  useEffect(() => {
    if (recommendedVacations.length > 0) {
      const first = recommendedVacations[0];
      setPreviewRecommendation(first);
      setPreviewDate(parseDate(first.startDate));
    } else {
      setPreviewRecommendation(null);
    }
  }, [recommendedVacations]);

  const handleDateChange = (field, value) => {
    const next = { ...formData, [field]: value };
    next.days = calculateDays(next.startDate, next.endDate);
    setFormData(next);
  };

  const handleApplyRecommendation = (recommendation) => {
    setFormData({
      type: recommendation.type,
      startDate: recommendation.startDate,
      endDate: recommendation.endDate,
      reason: recommendation.reason,
      days: recommendation.days,
    });

    navigate("/vacation/request");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.type ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.reason
    ) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    addVacationRequest({ ...formData });

    alert("휴가 신청이 제출되었습니다.");

    setCurrentPage(1);
    navigate("/vacation/list");

    setFormData({
      type: "",
      startDate: "",
      endDate: "",
      reason: "",
      days: 0,
    });
  };

  const getStatusBadge = (status) => {
    const map = {
      승인: "bg-green-100 text-green-700 hover:bg-green-100",
      대기: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
      반려: "bg-red-100 text-red-700 hover:bg-red-100",
    };

    return <Badge className={map[status] || map["대기"]}>{status}</Badge>;
  };

  const holidayDates = calendarEvents
    .filter((event) => event.type === "공휴일")
    .map((event) => {
      const [y, m, d] = event.date.split("-").map(Number);
      return new Date(y, m - 1, d);
    });

  const today = new Date().toISOString().split("T")[0];

  const departmentOptions = [
    "전체",
    ...Array.from(new Set(employees.map((employee) => employee.department))),
  ];

  const pageTitleMap = {
    "/vacation/info": "[ 내 휴가 정보 ]",
    "/vacation/recommend": "[ 휴가 추천 ]",
    "/vacation/request": "[ 휴가 신청하기 ]",
    "/vacation/list": isHrAdmin ? "[ 휴가 승인 및 반려 ]" : "[ 신청 휴가 목록 ]",
    "/vacation/status": "[ 휴가 현황 ]",
  };

  const contextValue = {
    vacationRequests,
    cancelVacation,
    approveVacation,
    rejectVacation,
    currentUser,
    employees,
    calendarEvents,

    isDark,

    isHrAdmin,
    isManager,
    canViewVacationStatus,

    selectedDate,
    setSelectedDate,
    formData,
    setFormData,
    currentPage,
    setCurrentPage,
    searchKeyword,
    setSearchKeyword,
    statusFilter,
    setStatusFilter,

    statusSearchKeyword,
    setStatusSearchKeyword,
    selectedDepartment,
    setSelectedDepartment,
    showCurrentOnly,
    setShowCurrentOnly,
    statusSortOption,
    setStatusSortOption,

    recommendationTypeFilter,
    setRecommendationTypeFilter,
    recommendationDaysFilter,
    setRecommendationDaysFilter,
    recommendationPeriod,
    setRecommendationPeriod,
    recommendationSearchDays,
    previewRecommendation,
    setPreviewRecommendation,
    previewDate,
    setPreviewDate,

    itemsPerPage,
    today,
    departmentOptions,

    vacationBalance,
    visibleVacationRequests,
    filteredVacationRequests,
    visibleApprovedVacations,
    vacationStatusList,
    recommendedVacations,
    holidayDates,

    formatDate,
    parseDate,
    handleDateChange,
    handleApplyRecommendation,
    handleSubmit,
    getStatusBadge,
  };

  const linkClass = ({ isActive }) =>
    cn(
      "w-full block text-left px-4 py-3 rounded-lg transition-colors text-sm font-medium",
      isActive
        ? isDark
          ? "bg-[#5c5c73] text-white"
          : "bg-blue-50 text-blue-700"
        : isDark
        ? "text-zinc-300 hover:bg-[#48484f]"
        : "text-gray-700 hover:bg-gray-50"
    );

  return (
    <div className={cn("flex h-full", pageClass)}>
      <div className={cn("w-64 border-r flex flex-col", sidebarClass)}>
        <div
          className={cn(
            "p-4 border-b",
            isDark ? "border-[#5c5c73]" : "border-gray-200"
          )}
        >
          <h2 className={cn("text-lg font-semibold", textMain)}>
            {canViewVacationStatus ? "휴가 관리 / 현황" : "휴가 관리"}
          </h2>
          <p className={cn("text-xs mt-1", textMuted)}>
            {isHrAdmin ? "부서별 휴가 승인 및 반려" : "Vacation Management"}
          </p>
        </div>

        <div className="flex-1 p-3 space-y-2">
          <NavLink to="/vacation/info" className={linkClass}>
            내 휴가 정보
          </NavLink>

          <NavLink to="/vacation/recommend" className={linkClass}>
            휴가 추천
          </NavLink>

          <NavLink to="/vacation/request" className={linkClass}>
            휴가 신청하기
          </NavLink>

          <NavLink to="/vacation/list" className={linkClass}>
            {isHrAdmin ? "휴가 승인/반려" : "신청 휴가 목록"}
          </NavLink>

          {canViewVacationStatus && (
            <NavLink to="/vacation/status" className={linkClass}>
              휴가 현황
            </NavLink>
          )}
        </div>
      </div>

      <div className={cn("flex-1 overflow-auto p-6", pageClass)}>
        <div className="mb-4">
          <h2 className={cn("text-xl font-semibold", textMain)}>
            {pageTitleMap[location.pathname] || "[ 휴가 관리 ]"}
          </h2>
        </div>

        <Outlet context={contextValue} />
      </div>
    </div>
  );
}