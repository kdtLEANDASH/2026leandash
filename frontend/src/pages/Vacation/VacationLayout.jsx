import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Badge } from "@/components/UI/badge";
import { useAppContext } from "@/store/AppProvider";
import { cn } from "@/components/UI/utils";
import { scheduleApi } from "@/api/scheduleApi";
import { vacationApi } from "@/api/vacationApi";

export default function VacationLayout() {
  const {
    vacationRequests,
    currentUser,
    employees,
    getVacationBalance,
    customSettings,
  } = useAppContext();

  const isDark = customSettings?.darkMode;

  const navigate = useNavigate();
  const location = useLocation();

  const isSuperAdmin =
    currentUser?.role === "최고관리자" || currentUser?.role === "ADMIN";

  const isHrAdmin = currentUser?.department === "인사팀";
  const isTeamLeader = currentUser?.role === "팀장";

  const canApproveVacation = !!currentUser && isSuperAdmin;
  const canViewVacationStatus =
    !!currentUser && (isTeamLeader || canApproveVacation);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [apiVacationRequests, setApiVacationRequests] = useState([]);
  const [apiUsers, setApiUsers] = useState([]);
  const [isVacationLoading, setIsVacationLoading] = useState(false);

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

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  const getAuthHeader = () => {
    const token =
      localStorage.getItem("accessToken") || localStorage.getItem("token");

    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return 0;
    }

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

  const getCurrentUserId = useCallback(() => {
    return currentUser?.userId || currentUser?.id;
  }, [currentUser]);

  const findEmployeeByUserId = useCallback(
    (userId) => {
      if (userId === null || userId === undefined) return null;

      const targetId = String(userId);

      return (
        apiUsers.find(
          (user) =>
            String(user.userId) === targetId ||
            String(user.id) === targetId ||
            String(user.employeeId) === targetId
        ) ||
        employees.find(
          (employee) =>
            String(employee.userId) === targetId ||
            String(employee.id) === targetId ||
            String(employee.employeeId) === targetId
        ) ||
        null
      );
    },
    [apiUsers, employees]
  );

  const normalizeVacation = useCallback(
    (vacation) => {
      const statusMap = {
        PENDING: "대기",
        APPROVED: "승인",
        REJECTED: "반려",
        CANCELED: "취소",
        대기: "대기",
        승인: "승인",
        반려: "반려",
        취소: "취소",
      };

      const userId =
        vacation.userId ||
        vacation.employeeId ||
        vacation.user?.userId ||
        vacation.user?.id ||
        vacation.applicantId ||
        vacation.applicant?.userId ||
        vacation.applicant?.id;

      const employee = findEmployeeByUserId(userId);

      const vacationId = vacation.vacationId || vacation.id;

      const startDate = vacation.startDate || "";
      const endDate = vacation.endDate || "";

      return {
        id: vacationId,
        employeeId: userId,
        employeeName:
          vacation.employeeName ||
          vacation.userName ||
          vacation.user?.userName ||
          vacation.user?.name ||
          vacation.applicantName ||
          vacation.applicant?.userName ||
          vacation.applicant?.name ||
          employee?.userName ||
          employee?.employeeName ||
          employee?.name ||
          employee?.user_name ||
          "이름 없음",
        type: vacation.vacationType || vacation.type || "",
        startDate,
        endDate,
        reason: vacation.reason || "",
        status: statusMap[vacation.status] || "대기",
        approver:
          vacation.approverName ||
          vacation.approver?.userName ||
          vacation.approver ||
          "",
        requestDate: vacation.createdAt
          ? String(vacation.createdAt).slice(0, 10)
          : vacation.requestDate || "",
        days: vacation.days || calculateDays(startDate, endDate),
        raw: vacation,
      };
    },
    [findEmployeeByUserId]
  );

  const loadVacations = useCallback(async () => {
    if (!currentUser) return;

    try {
      setIsVacationLoading(true);

      const data = await vacationApi.getAll();

      setApiVacationRequests(
        Array.isArray(data) ? data.map(normalizeVacation) : []
      );
    } catch (error) {
      console.error("휴가 목록 조회 실패:", error);
      setApiVacationRequests([]);
    } finally {
      setIsVacationLoading(false);
    }
  }, [currentUser, normalizeVacation]);

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
    const loadUsers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/users`, {
          headers: getAuthHeader(),
        });

        setApiUsers(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error(
          "휴가 페이지 사용자 조회 실패:",
          error.response?.data || error
        );
        setApiUsers([]);
      }
    };

    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadSchedules = async () => {
      try {
        const data = await scheduleApi.getMonthlySchedules();

        setCalendarEvents(
          Array.isArray(data) ? data.map(normalizeSchedule) : []
        );
      } catch (error) {
        console.error("휴가 페이지 일정 조회 실패:", error);
      }
    };

    loadSchedules();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    loadVacations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, currentUser?.userId, canApproveVacation, apiUsers.length]);

  const sourceVacationRequests =
    apiVacationRequests.length > 0 ? apiVacationRequests : vacationRequests;

  const visibleVacationRequests = useMemo(() => {
    return sourceVacationRequests.filter((vacation) => {
      if (canApproveVacation) return true;

      if (isHrAdmin) return true;

      if (isTeamLeader) {
        const employee = findEmployeeByUserId(vacation.employeeId);

        return (
          !!employee &&
          (employee.department === currentUser?.department ||
            String(vacation.employeeId) === String(getCurrentUserId()))
        );
      }

      return String(vacation.employeeId) === String(getCurrentUserId());
    });
  }, [
    sourceVacationRequests,
    currentUser,
    canApproveVacation,
    isHrAdmin,
    isTeamLeader,
    findEmployeeByUserId,
    getCurrentUserId,
  ]);

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

  const visibleApprovedVacations = useMemo(() => {
    return sourceVacationRequests.filter((vacation) => {
      if (vacation.status !== "승인") return false;

      if (isHrAdmin) return true;

      if (isTeamLeader) {
        const employee = findEmployeeByUserId(vacation.employeeId);
        return !!employee && employee.department === currentUser?.department;
      }

      return String(vacation.employeeId) === String(getCurrentUserId());
    });
  }, [
    sourceVacationRequests,
    isHrAdmin,
    isTeamLeader,
    currentUser,
    findEmployeeByUserId,
    getCurrentUserId,
  ]);

  const vacationStatusList = useMemo(() => {
    return [...visibleApprovedVacations].sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }, [visibleApprovedVacations]);

  const vacationBalance = currentUser
    ? getVacationBalance(getCurrentUserId())
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
      return sourceVacationRequests.filter((vacation) => {
        const employee = findEmployeeByUserId(vacation.employeeId);

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
          description: "같은 부서 휴가자가 없어 승인 가능성이 높은 날짜입니다.",
          teamVacationCount,
          totalRestDays: 1,
          restStartDate: dateStr,
          restEndDate: dateStr,
          reasons: ["팀 휴가자 없음", "회사 일정 없음", "업무 공백 부담 낮음"],
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
    sourceVacationRequests,
    employees,
    vacationBalance.remaining,
    recommendationSearchDays,
    recommendationTypeFilter,
    recommendationDaysFilter,
    findEmployeeByUserId,
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

  const handleSubmit = async (e) => {
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

    if (formData.days <= 0) {
      alert("휴가 종료일은 시작일 이후로 선택해주세요.");
      return;
    }

    try {
      await vacationApi.create({
        vacationType: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
      });

      alert("휴가 신청이 제출되었습니다.");

      await loadVacations();

      setCurrentPage(1);
      navigate("/vacation/list");

      setFormData({
        type: "",
        startDate: "",
        endDate: "",
        reason: "",
        days: 0,
      });
    } catch (error) {
      console.error("휴가 신청 실패:", error);
      alert("휴가 신청에 실패했습니다.");
    }
  };

  const apiApproveVacation = async (vacationId) => {
    try {
      await vacationApi.approve(vacationId);
      await loadVacations();
      alert("휴가를 승인했습니다.");
    } catch (error) {
      console.error("휴가 승인 실패:", error.response?.data || error);
      alert("휴가 승인에 실패했습니다.");
    }
  };

  const apiRejectVacation = async (vacationId) => {
    try {
      await vacationApi.reject(vacationId);
      await loadVacations();
      alert("휴가를 반려했습니다.");
    } catch (error) {
      console.error("휴가 반려 실패:", error.response?.data || error);
      alert("휴가 반려에 실패했습니다.");
    }
  };

  const apiCancelVacation = async (vacationId) => {
    try {
      await vacationApi.cancel(vacationId);
      await loadVacations();
      alert("휴가 신청을 취소했습니다.");
    } catch (error) {
      console.error("휴가 취소 실패:", error.response?.data || error);
      alert("휴가 취소에 실패했습니다.");
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      승인: isDark
        ? "bg-green-500/20 text-green-300 border border-green-400/30 hover:bg-green-500/20"
        : "bg-green-100 text-green-700 hover:bg-green-100",
      대기: isDark
        ? "bg-yellow-500/20 text-yellow-300 border border-yellow-400/30 hover:bg-yellow-500/20"
        : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
      반려: isDark
        ? "bg-red-500/20 text-red-300 border border-red-400/30 hover:bg-red-500/20"
        : "bg-red-100 text-red-700 hover:bg-red-100",
      취소: isDark
        ? "bg-zinc-600 text-zinc-200 border border-zinc-500 hover:bg-zinc-600"
        : "bg-gray-100 text-gray-700 hover:bg-gray-100",
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
    "/vacation/list": canApproveVacation
      ? "[ 휴가 승인 및 반려 ]"
      : "[ 신청 휴가 목록 ]",
    "/vacation/status": "[ 휴가 현황 ]",
  };

  const contextValue = {
    isDark,

    vacationRequests: sourceVacationRequests,
    currentUser,
    employees,
    calendarEvents,

    isHrAdmin,
    isTeamLeader,
    canApproveVacation,
    canViewVacationStatus,
    isVacationLoading,

    apiApproveVacation,
    apiRejectVacation,
    apiCancelVacation,

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
        ? "text-zinc-300 hover:bg-[#48484f] hover:text-white"
        : "text-gray-700 hover:bg-gray-50"
    );

  return (
    <div className={cn("flex h-full", isDark ? "bg-[#27272a] text-white" : "")}>
      <div
        className={cn(
          "w-64 border-r flex flex-col",
          isDark
            ? "bg-[#35353d] border-[#5c5c73]"
            : "bg-white border-gray-200"
        )}
      >
        <div
          className={cn(
            "p-4 border-b",
            isDark ? "border-[#5c5c73]" : "border-gray-200"
          )}
        >
          <h2
            className={cn(
              "text-lg font-semibold",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            {canViewVacationStatus ? "휴가 관리 / 현황" : "휴가 관리"}
          </h2>

          <p
            className={cn(
              "text-xs mt-1",
              isDark ? "text-zinc-400" : "text-gray-500"
            )}
          >
            {canApproveVacation
              ? "부서별 휴가 승인 및 반려"
              : "Vacation Management"}
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
            {canApproveVacation ? "휴가 관리" : "신청 휴가 목록"}
          </NavLink>

          {canViewVacationStatus && (
            <NavLink to="/vacation/status" className={linkClass}>
              휴가 현황
            </NavLink>
          )}
        </div>
      </div>

      <div
        className={cn(
          "flex-1 overflow-auto p-6",
          isDark ? "bg-[#27272a]" : "bg-gray-50"
        )}
      >
        <div className="mb-4">
          <h2
            className={cn(
              "text-xl font-semibold",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            {pageTitleMap[location.pathname] || "[ 휴가 관리 ]"}
          </h2>
        </div>

        <Outlet context={contextValue} />
      </div>
    </div>
  );
}