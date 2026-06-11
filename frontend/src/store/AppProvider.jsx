import { createContext, useContext, useState, useEffect } from "react";
import {
  getMyProfileApi,
  getMySettingsApi,
  updateMySettingsApi,
} from "@/api/userApi";
export const AppContext = createContext(undefined);
const SETTINGS_KEY_PREFIX = "leandash_custom_settings";

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

const normalizeCustomSettings = (settings = {}) => ({
  ...defaultCustomSettings,
  ...settings,
  hiddenHeaderItems: Array.isArray(settings.hiddenHeaderItems)
    ? settings.hiddenHeaderItems
    : defaultCustomSettings.hiddenHeaderItems,
  headerOrder: Array.isArray(settings.headerOrder) && settings.headerOrder.length > 0
    ? settings.headerOrder
    : defaultCustomSettings.headerOrder,
});

const getSettingsStorageKey = (user) => {
  const accountKey =
    user?.userId ||
    user?.id ||
    user?.employeeNo ||
    user?.employee_no ||
    localStorage.getItem("employeeNo") ||
    "guest";

  return `${SETTINGS_KEY_PREFIX}_${accountKey}`;
};

const loadSettingsFromStorage = (user) => {
  const saved = localStorage.getItem(getSettingsStorageKey(user));

  if (!saved) {
    return defaultCustomSettings;
  }

  try {
    return normalizeCustomSettings(JSON.parse(saved));
  } catch {
    localStorage.removeItem(getSettingsStorageKey(user));
    return defaultCustomSettings;
  }
};
const initialEmployees = [
   
];
const initialNotices = [
    
];
const initialVacationRequests = [

]

const initialDocuments = [
  
];

const initialCalendarEvents = [
    
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
  const [customSettings, setCustomSettings] = useState(defaultCustomSettings);

  const saveSettingsToStorage = (settings, user = currentUser) => {
    localStorage.setItem(
      getSettingsStorageKey(user),
      JSON.stringify(normalizeCustomSettings(settings))
    );
  };

  const loadMySettings = async (user = currentUser) => {
    const token = localStorage.getItem("accessToken");

    if (!user) {
      setCustomSettings(defaultCustomSettings);
      return defaultCustomSettings;
    }

    const localSettings = loadSettingsFromStorage(user);
    setCustomSettings(localSettings);

    if (!token || localStorage.getItem("loginMode") !== "api") {
      return localSettings;
    }

    try {
      const apiSettings = await getMySettingsApi();
      const normalizedSettings = normalizeCustomSettings(apiSettings);

      setCustomSettings(normalizedSettings);
      saveSettingsToStorage(normalizedSettings, user);

      return normalizedSettings;
    } catch (error) {
      console.warn("계정별 환경설정 조회 실패. 로컬 설정을 임시 사용합니다.", error);
      return localSettings;
    }
  };

  const updateCustomSettings = (updates) => {
    setCustomSettings((prev) => {
      const nextSettings = normalizeCustomSettings({
        ...prev,
        ...updates,
      });

      saveSettingsToStorage(nextSettings);

      if (localStorage.getItem("accessToken") && localStorage.getItem("loginMode") === "api") {
        updateMySettingsApi(nextSettings).catch((error) => {
          console.error("계정별 환경설정 저장 실패:", error);
        });
      }

      return nextSettings;
    });
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
      mbti: apiUser?.mbti || fallbackEmployee?.mbti || "",
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
    localStorage.setItem("userMbti", user?.mbti || "");
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
      await loadMySettings(normalizedUser);

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
    const savedMbti = localStorage.getItem("userMbti");
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
          mbti: savedMbti || savedEmployee?.mbti || "",
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
          mbti: savedMbti || "",
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
      localStorage.setItem("userMbti", user.mbti || "");
      localStorage.setItem("loginMode", "dummy");

      setCurrentUser(user);
      setIsAuthenticated(true);
      setCustomSettings(loadSettingsFromStorage(user));
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
    localStorage.removeItem("userMbti");
    localStorage.removeItem("loginMode");

    setCurrentUser(null);
    setIsAuthenticated(false);
    setCustomSettings(defaultCustomSettings);
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
        refreshMyProfile: loadMyProfile,
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
