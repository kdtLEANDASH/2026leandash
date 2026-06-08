import { createContext, useContext, useState, useEffect } from "react";
import { getMyProfileApi } from "@/api/userApi";
export const AppContext = createContext(undefined);
const SETTINGS_KEY = "leandash_custom_settings";

const defaultCustomSettings = {
  darkMode: false,
  notificationEnabled: true,
  headerSize: "default",
  headerDisplayMode: "iconText",
  hiddenHeaderItems: [],
  headerOrder: [
    "/dashboard",
    "/notice",
    "/inquiry",
    "/employees",
    "/documents",
    "/vacation",
    "/calendar",
    "/community",
    "/approval-request",
    "/evaluation",
    "/approval",
    "/registration-approval",
  ],
};
const initialEmployees = [
   
];
const initialNotices = [
    {
        id: 1,
        title: "2026년 2분기 전사 회의 안내",
        content: "다음 주 목요일 오후 2시에 전사 회의가 있습니다. 전 직원 참석 부탁드립니다.\n\n일시: 2026년 4월 10일 (목) 14:00\n장소: 본사 대회의실\n내용: 1분기 성과 발표 및 2분기 계획 공유",
        category: "전체",
        author: "인사팀",
        date: "2026-04-08",
        isPinned: true,
        views: 245,
        isNew: true,
    },
    {
        id: 2,
        title: "개발팀 신규 프로젝트 착수 공지",
        content: "모바일 앱 리뉴얼 프로젝트가 시작됩니다.\n\n프로젝트명: 모바일 앱 3.0 리뉴얼\n기간: 2026.04.15 ~ 2026.08.31\n참여 인원: 개발팀 전체\n\n상세 내용은 추후 공유하겠습니다.",
        category: "개발",
        author: "개발팀장",
        date: "2026-04-07",
        isPinned: true,
        views: 189,
        isNew: true,
    },
    {
        id: 3,
        title: "근무 시간 조정 안내",
        content: "하절기(5월~9월) 근무 시간이 조정됩니다.\n\n변경 전: 09:00 ~ 18:00\n변경 후: 08:30 ~ 17:30\n\n5월 1일부터 적용됩니다.",
        category: "인사",
        author: "인사팀",
        date: "2026-04-05",
        isPinned: false,
        views: 312,
        isNew: false,
    },
    {
        id: 4,
        title: "Q2 마케팅 캠페인 런칭 안내",
        content: "2분기 마케팅 캠페인이 시작됩니다.\n\n캠페인명: Spring Innovation 2026\n기간: 2026.04.20 ~ 2026.06.30\n목표: 신규 고객 확보 20% 증가",
        category: "마케팅",
        author: "마케팅팀",
        date: "2026-04-03",
        isPinned: false,
        views: 156,
        isNew: false,
    },
    {
        id: 5,
        title: "사내 복지 제도 개선 안내",
        content: "직원 복지 제도가 개선됩니다.\n\n1. 자기계발비 연 100만원 → 150만원 증액\n2. 건강검진 지원 범위 확대\n3. 동호회 활동비 지원 신설\n\n자세한 내용은 인사팀으로 문의 바랍니다.",
        category: "인사",
        author: "인사팀",
        date: "2026-04-01",
        isPinned: false,
        views: 421,
        isNew: false,
    },
    {
        id: 6,
        title: "경영 실적 보고 - 2026년 1분기",
        content: "1분기 경영 실적을 보고드립니다.\n\n매출: 목표 대비 108% 달성\n영업이익: 전년 동기 대비 15% 증가\n신규 고객: 45개사\n\n모든 임직원의 노고에 감사드립니다.",
        category: "경영",
        author: "경영지원팀",
        date: "2026-03-31",
        isPinned: false,
        views: 387,
        isNew: false,
    },
    {
        id: 7,
        title: "서버 정기 점검 안내",
        content: "서버 정기 점검이 예정되어 있습니다.\n\n일시: 2026년 4월 13일 (토) 02:00 ~ 06:00\n영향: 사내 시스템 일시 중단\n\n점검 시간에는 시스템 접속이 불가합니다.",
        category: "개발",
        author: "개발팀",
        date: "2026-03-28",
        isPinned: false,
        views: 234,
        isNew: false,
    },
];
const initialVacationRequests = [

]

const initialDocuments = [
  {
    id: 1,
    title: "2026년 사내 보안 가이드",
    department: "인사팀",
    fileName: "security-guide.pdf",
    fileSize: "1.2 MB",
    uploader: "박철수",
    uploadDate: "2026-05-01",
    description: "전 직원 대상 사내 보안 가이드 문서입니다.",
    fileUrl: null,
  },
  {
    id: 2,
    title: "개발팀 API 명세 초안",
    department: "개발팀",
    fileName: "api-spec.docx",
    fileSize: "856 KB",
    uploader: "홍길동",
    uploadDate: "2026-05-01",
    description: "개발팀 백엔드 API 명세 초안입니다.",
    fileUrl: null,
  },
];

const initialCalendarEvents = [
    {
        id: 1,
        title: "전체 회의",
        date: "2026-04-10",
        startTime: "14:00",
        endTime: "16:00",
        type: "전사",
        description: "2분기 전사 회의",
    },
    {
        id: 2,
        title: "분기 평가",
        date: "2026-04-15",
        startTime: "09:00",
        endTime: "12:00",
        type: "전사",
        description: "1분기 성과 평가",
    },
    // 2026년 공휴일
    {
        id: 3,
        title: "신정",
        date: "2026-01-01",
        type: "공휴일",
    },
    {
        id: 4,
        title: "설날",
        date: "2026-02-16",
        type: "공휴일",
    },
    {
        id: 5,
        title: "설날 연휴",
        date: "2026-02-17",
        type: "공휴일",
    },
    {
        id: 6,
        title: "설날 연휴",
        date: "2026-02-18",
        type: "공휴일",
    },
    {
        id: 7,
        title: "삼일절",
        date: "2026-03-01",
        type: "공휴일",
    },
    {
        id: 8,
        title: "어린이날",
        date: "2026-05-05",
        type: "공휴일",
    },
    {
        id: 9,
        title: "노동절",
        date: "2026-05-01",
        type: "공휴일",
    },
    {
        id: 10,
        title: "부처님오신날",
        date: "2026-05-24",
        type: "공휴일",
    },
    {
        id: 11,
        title: "현충일",
        date: "2026-06-06",
        type: "공휴일",
    },
    {
        id: 12,
        title: "광복절",
        date: "2026-08-15",
        type: "공휴일",
    },
    {
        id: 13,
        title: "추석",
        date: "2026-09-24",
        type: "공휴일",
    },
    {
        id: 14,
        title: "추석 연휴",
        date: "2026-09-25",
        type: "공휴일",
    },
    {
        id: 15,
        title: "추석 연휴",
        date: "2026-09-26",
        type: "공휴일",
    },
    {
        id: 16,
        title: "개천절",
        date: "2026-10-03",
        type: "공휴일",
    },
    {
        id: 17,
        title: "한글날",
        date: "2026-10-09",
        type: "공휴일",
    },
    {
        id: 18,
        title: "크리스마스",
        date: "2026-12-25",
        type: "공휴일",
    },
];
export function AppProvider({ children }) {
  const [notices, setNotices] = useState(
    initialNotices.map((notice) => ({
      ...notice,
      author:
        typeof notice.author === "object"
          ? notice.author?.name || "관리자"
          : notice.author,
    }))
  );

  const [vacationRequests, setVacationRequests] = useState(
    initialVacationRequests
  );
  const [employees, setEmployees] = useState(initialEmployees);
  const [notifications, setNotifications] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState(initialCalendarEvents);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [registrationRequests, setRegistrationRequests] = useState([]);
  const [documents, setDocuments] = useState(initialDocuments);
  const [customSettings, setCustomSettings] = useState(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        return {
          ...defaultCustomSettings,
          ...parsed,
          hiddenHeaderItems: Array.isArray(parsed.hiddenHeaderItems)
            ? parsed.hiddenHeaderItems
            : defaultCustomSettings.hiddenHeaderItems,
          headerOrder: Array.isArray(parsed.headerOrder)
            ? parsed.headerOrder
            : defaultCustomSettings.headerOrder,
        };
      } catch {
        localStorage.removeItem(SETTINGS_KEY);
      }
    }

    return defaultCustomSettings;
  });

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(customSettings));
  }, [customSettings]);

  const updateCustomSettings = (updates) => {
    setCustomSettings((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const createInitialChatRooms = () => {
    const departments = [
      ...new Set(initialEmployees.map((emp) => emp.department)),
    ].filter((dept) => dept && dept !== "경영진");

    return departments.map((dept) => {
      const members = initialEmployees.filter((emp) => emp.department === dept);

      return {
        id: `group-${dept}`,
        name: `${dept} 채팅방`,
        lastMessage: "부서 채팅방입니다.",
        timestamp: "방금",
        unread: 0,
        unreadByUser: {},
        avatar: dept.charAt(0),
        online: false,
        isGroup: true,
        participants: members.map((emp) => emp.id),
        };
    });
  };

  const [allChatRooms, setAllChatRooms] = useState(createInitialChatRooms);
  const [allChatMessages, setAllChatMessages] = useState({});

  const getDirectRoomId = (userId1, userId2) => {
    return `dm-${[userId1, userId2].sort((a, b) => a - b).join("-")}`;
  };

  const visibleChatRooms = currentUser
    ? allChatRooms
        .filter((room) => room.participants?.includes(currentUser.id))
        .map((room) => {
          if (room.isGroup) {
            return {
                ...room,
                unread: room.unreadByUser?.[currentUser.id] || 0,
            };
         }

          const otherUserId = room.participants.find(
            (id) => id !== currentUser.id
          );

          const otherUser = employees.find((emp) => emp.id === otherUserId);

          return {
            ...room,
            name: otherUser?.name || room.name,
            avatar: otherUser?.name?.charAt(0) || "?",
            online: otherUser?.status === "업무 중",
            unread: room.unreadByUser?.[currentUser.id] || 0,
            };
        })
    : [];

  const visibleChatMessages = Object.fromEntries(
    Object.entries(allChatMessages).map(([roomId, messages]) => [
      roomId,
      messages.map((message) => ({
        ...message,
        isMe: message.senderId === currentUser?.id,
      })),
    ])
  );

  const normalizeRole = (role) => {
    if (role === "ADMIN" || role === "최고관리자") return "최고관리자";
    if (role === "MANAGER" || role === "팀장") return "팀장";
    return "일반직원";
  };

  const normalizeStatus = (status) => {
    if (status === "ONLINE") return "업무 중";
    if (status === "AWAY") return "자리 비움";
    if (status === "VACATION") return "휴가 중";
    if (status === "FOCUS") return "집중 모드";
    if (status === "OFFLINE") return "오프라인";
    return status || "업무 중";
  };

  const getEmployeeNo = (user) => {
    return user?.employeeNo || user?.employee_no || user?.employeeId || user?.id || "";
  };

  const findEmployeeByEmployeeNo = (employeeNo) => {
    if (!employeeNo) return null;

    const normalizedEmployeeNo = String(employeeNo).trim().toLowerCase();

    return employees.find(
      (emp) => String(getEmployeeNo(emp)).trim().toLowerCase() === normalizedEmployeeNo
    );
  };

  const getDepartmentName = (user) => {
    if (!user) return "";

    if (typeof user.department === "string") return user.department;

    return (
      user.departmentName ||
      user.department_name ||
      user.department?.departmentName ||
      user.department?.department_name ||
      user.department?.name ||
      user.department?.departmentTitle ||
      ""
    );
  };

  const getDepartmentId = (user) => {
    if (!user) return undefined;

    return (
      user.departmentId ||
      user.department_id ||
      user.department?.departmentId ||
      user.department?.department_id ||
      user.department?.id
    );
  };

  const buildApiUser = (apiUser, fallbackEmployee = null) => {
    const employeeNo =
      apiUser?.employeeNo ||
      apiUser?.employee_no ||
      fallbackEmployee?.employeeNo ||
      "";

    const userId =
      apiUser?.userId ||
      apiUser?.user_id ||
      apiUser?.id ||
      fallbackEmployee?.id ||
      employeeNo ||
      "api-user";

    return {
      ...(fallbackEmployee || {}),
      id: userId,
      employeeNo,
      name:
        apiUser?.userName ||
        apiUser?.user_name ||
        apiUser?.name ||
        fallbackEmployee?.name ||
        employeeNo ||
        "사용자",
      email: apiUser?.email || fallbackEmployee?.email || "",
      department: getDepartmentName(apiUser) || fallbackEmployee?.department || "",
      departmentId: getDepartmentId(apiUser) || fallbackEmployee?.departmentId,
      position: apiUser?.position || fallbackEmployee?.position || "",
      phone: apiUser?.phone || fallbackEmployee?.phone || "",
      address: apiUser?.address || fallbackEmployee?.address || "",
      birthDate:
        apiUser?.birthDate ||
        apiUser?.birth_date ||
        fallbackEmployee?.birthDate ||
        "",
      gender: apiUser?.gender || fallbackEmployee?.gender || "",
      status: normalizeStatus(
        apiUser?.userStatus || apiUser?.user_status || apiUser?.status || fallbackEmployee?.status
      ),
      role: normalizeRole(apiUser?.role || fallbackEmployee?.role),
      hireDate:
        apiUser?.hireDate ||
        apiUser?.hire_date ||
        apiUser?.createdAt?.slice?.(0, 10) ||
        apiUser?.created_at?.slice?.(0, 10) ||
        fallbackEmployee?.hireDate ||
        "",
    };
  };

  const saveCurrentUserToStorage = (user, rawUser = {}) => {
    localStorage.setItem("isLogin", "true");
    localStorage.setItem("employeeNo", user?.employeeNo || "");
    localStorage.setItem("userEmail", user?.email || "");
    localStorage.setItem("userName", user?.name || "");
    localStorage.setItem("userRole", rawUser?.role || user?.role || "USER");
    localStorage.setItem(
      "userStatus",
      rawUser?.userStatus || rawUser?.user_status || rawUser?.status || user?.status || "ONLINE"
    );
    localStorage.setItem("userPhone", user?.phone || "");
    localStorage.setItem("userPosition", user?.position || "");
    localStorage.setItem("userDepartment", user?.department || "");
  };

  const loadMyProfile = async (fallbackUser = null) => {
    const token = localStorage.getItem("accessToken");

    if (!token) return null;

    try {
      const profile = await getMyProfileApi();
      const matchedEmployee = findEmployeeByEmployeeNo(
        profile?.employeeNo || profile?.employee_no || fallbackUser?.employeeNo
      );
      const normalizedUser = buildApiUser(profile, matchedEmployee || fallbackUser);

      saveCurrentUserToStorage(normalizedUser, profile);
      setCurrentUser(normalizedUser);
      setIsAuthenticated(true);

      return normalizedUser;
    } catch (error) {
      console.warn("내 정보 API 조회 실패. 저장된 로그인 정보로 임시 표시합니다.", error);
      return null;
    }
  };

  useEffect(() => {
    const savedLogin = localStorage.getItem("isLogin") === "true";
    const savedEmployeeNo = localStorage.getItem("employeeNo");
    const savedEmail = localStorage.getItem("userEmail");
    const savedUserName = localStorage.getItem("userName");
    const savedRole = localStorage.getItem("userRole");
    const savedStatus = localStorage.getItem("userStatus");
    const savedPhone = localStorage.getItem("userPhone");
    const savedPosition = localStorage.getItem("userPosition");
    const savedDepartment = localStorage.getItem("userDepartment");
    const savedLoginMode = localStorage.getItem("loginMode");

    if (!savedLogin) return;

    const savedEmployee =
      findEmployeeByEmployeeNo(savedEmployeeNo) ||
      employees.find(
        (emp) => savedEmail && emp.email?.toLowerCase() === savedEmail.toLowerCase()
      );

    if (savedLoginMode === "api") {
      const fallbackUser = buildApiUser(
        {
          employeeNo: savedEmployeeNo || savedEmployee?.employeeNo || "api-user",
          userName: savedUserName || savedEmployee?.name || savedEmployeeNo || "사용자",
          email: savedEmail || savedEmployee?.email || "",
          phone: savedPhone || savedEmployee?.phone || "",
          position: savedPosition || savedEmployee?.position || "",
          departmentName: savedDepartment || savedEmployee?.department || "",
          role: savedRole || "USER",
          userStatus: savedStatus || "ONLINE",
        },
        savedEmployee
      );

      setCurrentUser(fallbackUser);
      setIsAuthenticated(true);
      loadMyProfile(fallbackUser);
      return;
    }

    if (savedEmployee) {
      setCurrentUser(savedEmployee);
      setIsAuthenticated(true);
      return;
    }

    if (savedEmployeeNo || savedEmail) {
      setCurrentUser(
        buildApiUser({
          employeeNo: savedEmployeeNo || "api-user",
          userName: savedUserName || savedEmployeeNo || "사용자",
          email: savedEmail || "",
          phone: savedPhone || "",
          position: savedPosition || "",
          departmentName: savedDepartment || "",
          role: savedRole || "USER",
          userStatus: savedStatus || "ONLINE",
        })
      );
      setIsAuthenticated(true);
    }
  }, [employees]);

  useEffect(() => {
    if (currentUser && localStorage.getItem("loginMode") !== "api") {
      const updatedUser = findEmployeeByEmployeeNo(currentUser.employeeNo) || employees.find((emp) => emp.id === currentUser.id);

      if (updatedUser) {
        setCurrentUser(updatedUser);
      }
    }
  }, [employees]);

  const addNotice = (notice) => {
    const newNotice = {
      ...notice,
      id: Math.max(...notices.map((n) => n.id), 0) + 1,
      views: 0,
      date: new Date().toISOString().split("T")[0],
      author:
        typeof notice.author === "object"
          ? notice.author?.name || "관리자"
          : notice.author || "관리자",
    };

    setNotices([newNotice, ...notices]);
  };

  const incrementNoticeViews = (id) => {
    setNotices(
      notices.map((notice) =>
        notice.id === id ? { ...notice, views: notice.views + 1 } : notice
      )
    );
  };

  const addVacationRequest = (request) => {
    const newRequest = {
      ...request,
      id: Math.max(...vacationRequests.map((r) => r.id), 0) + 1,
      requestDate: new Date().toISOString().split("T")[0],
      status: "대기",
      employeeId: currentUser ? currentUser.id : 0,
      employeeName: currentUser ? currentUser.name : "",
    };

    setVacationRequests([newRequest, ...vacationRequests]);

    addNotification({
      type: "vacation",
      title: "휴가 신청 완료",
      message: `${request.type} 신청이 제출되었습니다. (${request.startDate} ~ ${request.endDate})`,
      relatedId: newRequest.id,
    });
  };

  const approveVacation = (id, approver) => {
    setVacationRequests(
      vacationRequests.map((req) => {
        if (req.id === id) {
          const today = new Date().toISOString().split("T")[0];

          if (req.startDate <= today && req.endDate >= today) {
            updateEmployeeStatus(req.employeeId, "휴가 중");
          }

          addCalendarEvent({
            title: `${req.employeeName} - ${req.type}`,
            date: req.startDate,
            type: "휴가",
            description: req.reason,
          });

          addNotification({
            type: "vacation",
            title: "휴가 승인",
            message: `${req.type} 신청이 승인되었습니다. (${req.startDate} ~ ${req.endDate})`,
            relatedId: id,
          });

          return { ...req, status: "승인", approver };
        }

        return req;
      })
    );
  };

  const rejectVacation = (id, approver) => {
    const request = vacationRequests.find((r) => r.id === id);

    if (request) {
      addNotification({
        type: "vacation",
        title: "휴가 반려",
        message: `${request.type} 신청이 반려되었습니다. (${request.startDate} ~ ${request.endDate})`,
        relatedId: id,
      });
    }

    setVacationRequests(
      vacationRequests.map((req) =>
        req.id === id ? { ...req, status: "반려", approver } : req
      )
    );
  };

  const cancelVacation = (id) => {
    setVacationRequests(vacationRequests.filter((req) => req.id !== id));
  };

  const addEmployee = (employee) => {
    const newEmployee = {
      ...employee,
      id: Math.max(...employees.map((e) => e.id), 0) + 1,
    };

    setEmployees([...employees, newEmployee]);
  };

  const updateEmployee = (id, updates) => {
    setEmployees(
      employees.map((emp) => (emp.id === id ? { ...emp, ...updates } : emp))
    );
  };

  const deleteEmployee = (id) => {
    setEmployees(employees.filter((emp) => emp.id !== id));
  };

  const updateEmployeeStatus = (id, status) => {
    setEmployees(
      employees.map((emp) => (emp.id === id ? { ...emp, status } : emp))
    );
  };

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: Math.max(...notifications.map((n) => n.id), 0) + 1,
      date: new Date().toISOString(),
      read: false,
    };

    setNotifications([newNotification, ...notifications]);
  };

  const markNotificationRead = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const addCalendarEvent = (event) => {
    const newEvent = {
      ...event,
      id: Math.max(...calendarEvents.map((e) => e.id), 0) + 1,
    };

    setCalendarEvents([...calendarEvents, newEvent]);
  };

  const updateCalendarEvent = (id, updates) => {
    setCalendarEvents(
      calendarEvents.map((event) =>
        event.id === id ? { ...event, ...updates } : event
      )
    );
  };

  const deleteCalendarEvent = (id) => {
    setCalendarEvents(calendarEvents.filter((event) => event.id !== id));
  };

  const getVacationBalance = (employeeId) => {
    const total = 15;
    const approvedRequests = vacationRequests.filter(
      (req) => req.employeeId === employeeId && req.status === "승인"
    );
    const used = approvedRequests.reduce((sum, req) => sum + req.days, 0);
    const remaining = total - used;

    return { total, used, remaining };
  };

  const login = (employeeNo, password, apiResult = null) => {
    const apiUser = apiResult?.user || apiResult?.data?.user || apiResult?.data || apiResult;
    const inputEmployeeNo = String(
      apiUser?.employeeNo || apiUser?.employee_no || employeeNo || ""
    ).trim();

    if (apiResult?.accessToken || apiResult?.token || apiResult?.data?.accessToken || apiResult?.data?.token) {
      const matchedEmployee = findEmployeeByEmployeeNo(inputEmployeeNo);
      const normalizedUser = buildApiUser(apiUser, matchedEmployee);

      saveCurrentUserToStorage(normalizedUser, apiUser);
      localStorage.setItem("loginMode", "api");

      setCurrentUser(normalizedUser);
      setIsAuthenticated(true);
      loadMyProfile(normalizedUser);
      return true;
    }

    const user = findEmployeeByEmployeeNo(inputEmployeeNo);

    if (user) {
      localStorage.setItem("isLogin", "true");
      localStorage.setItem("employeeNo", user.employeeNo || inputEmployeeNo);
      localStorage.setItem("userEmail", user.email || "");
      localStorage.setItem("userName", user.name || "");
      localStorage.setItem("userRole", user.role || "일반직원");
      localStorage.setItem("userStatus", user.status || "업무 중");
      localStorage.setItem("userPhone", user.phone || "");
      localStorage.setItem("userPosition", user.position || "");
      localStorage.setItem("userDepartment", user.department || "");
      localStorage.setItem("loginMode", "dummy");

      setCurrentUser(user);
      setIsAuthenticated(true);
      return true;
    }

    return false;
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("isLogin");
    localStorage.removeItem("employeeNo");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userStatus");
    localStorage.removeItem("userPhone");
    localStorage.removeItem("userPosition");
    localStorage.removeItem("userDepartment");
    localStorage.removeItem("loginMode");

    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const register = (name, email, password, department, position) => {
    const newRequest = {
      id: Math.max(...registrationRequests.map((r) => r.id), 0) + 1,
      name,
      email,
      password,
      department,
      position,
      requestDate: new Date().toISOString().split("T")[0],
      status: "대기",
    };

    setRegistrationRequests([...registrationRequests, newRequest]);
    alert("회원가입 요청이 전송되었습니다. 관리자 승인 후 로그인이 가능합니다.");
  };

  const approveRegistration = (id) => {
    const request = registrationRequests.find((r) => r.id === id);

    if (!request) return;

    const newEmployee = {
      id: Math.max(...employees.map((e) => e.id), 0) + 1,
      name: request.name,
      email: request.email,
      password: request.password,
      department: request.department,
      position: request.position,
      phone: "",
      status: "업무 중",
      hireDate: new Date().toISOString().split("T")[0],
      role: "일반직원",
    };

    setEmployees([...employees, newEmployee]);

    setRegistrationRequests(
      registrationRequests.map((r) =>
        r.id === id ? { ...r, status: "승인" } : r
      )
    );

    alert(`${request.name}님의 가입이 승인되었습니다.`);
  };

  const rejectRegistration = (id) => {
    setRegistrationRequests(
      registrationRequests.map((r) =>
        r.id === id ? { ...r, status: "거절" } : r
      )
    );

    const request = registrationRequests.find((r) => r.id === id);

    if (request) {
      alert(`${request.name}님의 가입 요청이 거절되었습니다.`);
    }
  };

  const addDocument = (document) => {
    const newDocument = {
      ...document,
      id: Math.max(...documents.map((doc) => doc.id), 0) + 1,
      uploadDate: new Date().toISOString().split("T")[0],
    };

    setDocuments([newDocument, ...documents]);
  };

  const deleteDocument = (documentId) => {
    setDocuments(documents.filter((doc) => doc.id !== documentId));
  };

  const addChatRoom = (room) => {
  if (!currentUser) return null;

  // 개인 채팅방 생성
  if (!room.isGroup) {
    const targetUser =
      employees.find((emp) => emp.id === room.targetUserId) ||
      employees.find((emp) => emp.name === room.name);

    if (!targetUser) return null;

    const roomId = getDirectRoomId(currentUser.id, targetUser.id);

    const existingRoom = allChatRooms.find(
      (chatRoom) => chatRoom.id === roomId
    );

    if (existingRoom) {
      return existingRoom.id;
    }

    const newRoom = {
      id: roomId,
      name: targetUser.name,
      lastMessage: "대화를 시작해보세요",
      timestamp: "방금",
      unread: 0,
      unreadByUser: {},
      avatar: targetUser.name.charAt(0),
      online: targetUser.status === "업무 중",
      isGroup: false,
      participants: [currentUser.id, targetUser.id],
    };

    setAllChatRooms((prev) => [...prev, newRoom]);

    return newRoom.id;
  }

  // 그룹 채팅방 생성
  const newRoom = {
    ...room,
    id: `group-custom-${Date.now()}`,
    unread: 0,
    unreadByUser: {},
    participants: room.participants || [currentUser.id],
  };

  setAllChatRooms((prev) => [...prev, newRoom]);

  return newRoom.id;
};

  const updateChatRoom = (id, updates) => {
    if (!currentUser) return;

    setAllChatRooms((prev) =>
        prev.map((room) => {
        if (room.id !== id) return room;

        const { unread, ...restUpdates } = updates;

        if (unread !== undefined) {
            return {
            ...room,
            ...restUpdates,
            unreadByUser: {
                ...(room.unreadByUser || {}),
                [currentUser.id]: unread,
            },
            };
        }

        return {
            ...room,
            ...restUpdates,
        };
        })
    );
    };

  const sendMessage = (roomId, content) => {
    if (!currentUser) return;

    const currentRoomMessages = allChatMessages[roomId] || [];

    const newMessage = {
        id: Math.max(...currentRoomMessages.map((m) => m.id), 0) + 1,
        sender: currentUser.name,
        senderId: currentUser.id,
        content,
        timestamp: new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        }),
    };

    setAllChatMessages((prev) => ({
        ...prev,
        [roomId]: [...(prev[roomId] || []), newMessage],
    }));

    setAllChatRooms((prev) =>
        prev.map((room) => {
        if (room.id !== roomId) return room;

        const nextUnreadByUser = { ...(room.unreadByUser || {}) };

        room.participants?.forEach((userId) => {
            if (userId !== currentUser.id) {
            nextUnreadByUser[userId] = (nextUnreadByUser[userId] || 0) + 1;
            }
        });

        return {
            ...room,
            lastMessage: content,
            timestamp: newMessage.timestamp,
            unreadByUser: nextUnreadByUser,
        };
        })
    );
    };

  return (
    <AppContext.Provider
      value={{
        notices,
        addNotice,
        incrementNoticeViews,

        vacationRequests,
        addVacationRequest,
        approveVacation,
        rejectVacation,
        cancelVacation,

        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        updateEmployeeStatus,

        notifications,
        addNotification,
        markNotificationRead,

        calendarEvents,
        addCalendarEvent,
        updateCalendarEvent,
        deleteCalendarEvent,

        currentUser,
        isAuthenticated,
        login,
        logout,

        register,
        registrationRequests,
        approveRegistration,
        rejectRegistration,

        getVacationBalance,

        chatRooms: visibleChatRooms,
        chatMessages: visibleChatMessages,
        addChatRoom,
        updateChatRoom,
        sendMessage,

        documents,
        addDocument,
        deleteDocument,

        customSettings,
        updateCustomSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }

  return context;
}