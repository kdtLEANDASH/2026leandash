import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Calendar as CalendarIcon,
  ClipboardCheck,
  UsersRound,
  CheckSquare,
  Plane,
  Bell,
  UserPlus,
  LogOut,
  FileText,
  ChevronDown,
  HelpCircle,
  FileCheck,
  User,
  Settings,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/components/UI/utils";
import { useAppContext } from "@/store/AppProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { Button } from "@/components/UI/button";
import { useEffect, useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/UI/dropdown-menu";
import { ChatWidget } from "@/components/Chat/ChatWidget";

const DEFAULT_HEADER_ORDER = [
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
];

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    currentUser,
    updateEmployeeStatus,
    logout,
    vacationRequests = [],
    notices = [],
    customSettings,
    updateCustomSettings,
  } = useAppContext() || {};

  const settings = {
    darkMode: false,
    notificationEnabled: true,
    headerSize: "default",
    headerDisplayMode: "iconText",
    hiddenHeaderItems: [],
    headerOrder: DEFAULT_HEADER_ORDER,
    ...customSettings,
  };

  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [readAlarmIds, setReadAlarmIds] = useState([]);
  const [localLogin, setLocalLogin] = useState(
    localStorage.getItem("isLogin") === "true"
  );

  useEffect(() => {
    setLocalLogin(localStorage.getItem("isLogin") === "true");
  }, [location.pathname]);

  const fallbackUser = {
    id: "demo-user",
    name: localStorage.getItem("userEmail")?.split("@")[0] || "사용자",
    email: localStorage.getItem("userEmail") || "user@company.com",
    role: "일반직원",
    department: "개발팀",
    status: "업무 중",
  };

  const loginUser = currentUser || (localLogin ? fallbackUser : null);
  const isLoggedIn = !!loginUser;

  const isSuperAdmin =
    loginUser?.role === "최고관리자" || loginUser?.role === "ADMIN";

  const isHrAdmin = loginUser?.department === "인사팀";

  const canApproveVacation = !!loginUser && (isSuperAdmin || isHrAdmin);

  const isManagerOrAdmin =
    loginUser?.role === "최고관리자" || loginUser?.role === "팀장";

  const pendingVacationCount =
    vacationRequests.filter((request) =>
      ["대기중", "대기", "pending", "PENDING"].includes(request.status)
    ).length || 0;

  const getNoticeAlarmId = (notice) => `notice-${notice.id}`;
  const getVacationAlarmId = (request) => `vacation-${request.id}`;

  const recentNotices =
    notices
      .filter((notice) => !readAlarmIds.includes(getNoticeAlarmId(notice)))
      .slice()
      .sort(
        (a, b) =>
          new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
      )
      .slice(0, 3) || [];

  const myVacationResults =
    vacationRequests
      .filter(
        (request) =>
          request.employeeId === loginUser?.id &&
          !["대기중", "대기", "pending", "PENDING"].includes(request.status) &&
          !readAlarmIds.includes(getVacationAlarmId(request))
      )
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.date || b.startDate) -
          new Date(a.createdAt || a.date || a.startDate)
      )
      .slice(0, 3) || [];

  const hasAlarmItems = recentNotices.length > 0 || myVacationResults.length > 0;

  const handleStatusChange = (status) => {
    if (currentUser && updateEmployeeStatus) {
      updateEmployeeStatus(currentUser.id, status);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("userEmail");
    setLocalLogin(false);

    if (logout) {
      logout();
    }

    navigate("/");
  };

  const handleProtectedNavClick = (event) => {
    if (!isLoggedIn) {
      event.preventDefault();
      alert("로그인 후 이용가능합니다.");
      navigate("/login");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "업무 중":
        return "bg-green-500";
      case "자리 비움":
        return "bg-yellow-500";
      case "집중 모드":
        return "bg-purple-500";
      case "휴가 중":
        return "bg-blue-500";
      case "오프라인":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };
  
  const navItems = [
    {
      path: "/dashboard",
      label: "대시보드",
      icon: LayoutDashboard,
      roles: ["최고관리자", "팀장", "일반직원"],
      public: true,
    },
    {
      path: "/notice",
      label: isManagerOrAdmin ? "공지/문의" : "공지사항",
      icon: FileText,
      roles: ["최고관리자", "팀장", "일반직원"],
      public: true,
    },
    {
      path: "/inquiry",
      label: "문의",
      icon: HelpCircle,
      roles: ["일반직원"],
      public: true,
    },
    {
      path: "/employees",
      label: "직원 조회",
      icon: Users,
      roles: ["최고관리자", "팀장", "일반직원"],
      public: true,
    },
    {
      path: "/documents",
      label: "문서",
      icon: FolderOpen,
      roles: ["최고관리자", "팀장", "일반직원"],
      public: true,
    },
	{
	  path: canApproveVacation ? "/vacation/list" : "/vacation/request",
	  label: canApproveVacation ? "휴가 관리" : "휴가 신청",
	  icon: Plane,
	  roles: ["최고관리자", "팀장", "일반직원", "ADMIN"],
	  public: true,
	},
    {
      path: "/calendar",
      label: "캘린더",
      icon: CalendarIcon,
      roles: ["최고관리자", "팀장", "일반직원"],
      public: true,
    },
    {
      path: "/community",
      label: "커뮤니티",
      icon: UsersRound,
      roles: ["최고관리자", "팀장", "일반직원"],
      public: true,
    },
    {
      path: "/approval-request",
      label: "결재신청",
      icon: FileCheck,
      roles: ["최고관리자", "팀장", "일반직원"],
      public: true,
    },
    {
      path: "/evaluation",
      label: "사내 평가",
      icon: ClipboardCheck,
      roles: ["최고관리자", "팀장"],
      public: false,
    },
    {
      path: "/approval",
      label: "결재",
      icon: CheckSquare,
      roles: ["최고관리자", "팀장"],
      public: false,
    },
    {
      path: "/registration-approval",
      label: "회원가입 승인",
      icon: UserPlus,
      roles: ["최고관리자"],
      public: false,
    },
  ];

  const canAccessEvaluation =
    !!loginUser &&
    (loginUser.role === "최고관리자" ||
      loginUser.role === "팀장" ||
      loginUser.department === "인사팀");

	  const filteredNavItems = navItems.filter((item) => {
	    if (!loginUser) {
	      return item.public;
	    }

	    if (item.departments?.includes(loginUser.department)) {
	      return true;
	    }

	    if (item.path === "/evaluation") {
	      return canAccessEvaluation;
	    }

	    if (item.path === "/inquiry") {
	      return !isManagerOrAdmin && item.roles.includes(loginUser.role);
	    }

	    return item.roles?.includes(loginUser.role);
	  });

  const orderedNavItems = useMemo(() => {
    const order = settings.headerOrder?.length
      ? settings.headerOrder
      : DEFAULT_HEADER_ORDER;

    return [...filteredNavItems]
      .filter((item) => !settings.hiddenHeaderItems?.includes(item.path))
      .sort((a, b) => {
        const aIndex = order.indexOf(
          a.path.startsWith("/vacation") ? "/vacation" : a.path
        );
        const bIndex = order.indexOf(
          b.path.startsWith("/vacation") ? "/vacation" : b.path
        );

        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      });
  }, [filteredNavItems, settings.headerOrder, settings.hiddenHeaderItems]);

  const configurableNavItems = filteredNavItems;

  const hiddenNavItems = configurableNavItems.filter((item) =>
    settings.hiddenHeaderItems?.includes(
      item.path.startsWith("/vacation") ? "/vacation" : item.path
    )
  );

  const visibleConfigNavItems = configurableNavItems
    .filter(
      (item) =>
        !settings.hiddenHeaderItems?.includes(
          item.path.startsWith("/vacation") ? "/vacation" : item.path
        )
    )
    .sort((a, b) => {
      const order = settings.headerOrder?.length
        ? settings.headerOrder
        : DEFAULT_HEADER_ORDER;

      const aIndex = order.indexOf(
        a.path.startsWith("/vacation") ? "/vacation" : a.path
      );
      const bIndex = order.indexOf(
        b.path.startsWith("/vacation") ? "/vacation" : b.path
      );

      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }

    if (path.startsWith("/vacation")) {
      return location.pathname.startsWith("/vacation");
    }

    return location.pathname.startsWith(path);
  };

  const updateSettings = (updates) => {
    updateCustomSettings?.(updates);
  };

  const getFullHeaderOrder = () => {
    const currentOrder = settings.headerOrder?.length
      ? settings.headerOrder
      : DEFAULT_HEADER_ORDER;

    const missingPaths = DEFAULT_HEADER_ORDER.filter(
      (path) => !currentOrder.includes(path)
    );

    return [...currentOrder, ...missingPaths];
  };

  const moveHeaderItem = (path, direction) => {
    const normalizedPath = path.startsWith("/vacation") ? "/vacation" : path;
    const currentOrder = getFullHeaderOrder();
    const currentIndex = currentOrder.indexOf(normalizedPath);

    if (currentIndex === -1) return;

    const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (nextIndex < 0 || nextIndex >= currentOrder.length) return;

    const nextOrder = [...currentOrder];

    [nextOrder[currentIndex], nextOrder[nextIndex]] = [
      nextOrder[nextIndex],
      nextOrder[currentIndex],
    ];

    updateSettings({
      headerOrder: nextOrder,
    });
  };

  const hideHeaderItem = (path) => {
    const normalizedPath = path.startsWith("/vacation") ? "/vacation" : path;

    updateSettings({
      hiddenHeaderItems: Array.from(
        new Set([...(settings.hiddenHeaderItems || []), normalizedPath])
      ),
    });
  };

  const showHeaderItem = (path) => {
    const normalizedPath = path.startsWith("/vacation") ? "/vacation" : path;

    updateSettings({
      hiddenHeaderItems: (settings.hiddenHeaderItems || []).filter(
        (item) => item !== normalizedPath
      ),
    });
  };

  const resetHeaderSettings = () => {
    updateSettings({
      headerSize: "default",
      headerDisplayMode: "iconText",
      hiddenHeaderItems: [],
      headerOrder: DEFAULT_HEADER_ORDER,
    });
  };

  const headerHeightClass =
    settings.headerSize === "small"
      ? "h-12"
      : settings.headerSize === "large"
      ? "h-20"
      : "h-16";

  const navTextClass =
    settings.headerSize === "small"
      ? "text-[14px]"
      : settings.headerSize === "large"
      ? "text-[18px]"
      : "text-[16px]";

  const navIconClass =
    settings.headerSize === "small"
      ? "size-3.5"
      : settings.headerSize === "large"
      ? "size-5"
      : "size-4";

  const showNavIcon =
    settings.headerDisplayMode === "iconText" ||
    settings.headerDisplayMode === "iconOnly";

  const showNavText =
    settings.headerDisplayMode === "iconText" ||
    settings.headerDisplayMode === "textOnly";

  return (
    <div
      className={cn(
        "flex flex-col min-h-screen",
        settings.darkMode
          ? "dark bg-zinc-800 text-zinc-100"
          : "bg-gray-50 text-gray-900"
      )}
    >
      <header
        className={cn(
          "sticky top-0 z-40 border-b",
          settings.darkMode
            ? "bg-zinc-700 border-zinc-600"
            : "bg-white border-gray-200"
        )}
      >
        <div className={cn("flex items-center px-6", headerHeightClass)}>
          <Link
            to={isLoggedIn ? "/dashboard" : "/"}
            className={cn(
              "flex items-center mr-8 rounded-lg transition-colors",
              settings.darkMode ? "bg-zinc-600 px-2 py-1" : ""
            )}
          >
            <img
              src="/leandash-logo.png"
              alt="Leandash 로고"
              className={cn(
                "w-auto object-contain",
                settings.headerSize === "small"
                  ? "h-8"
                  : settings.headerSize === "large"
                  ? "h-12"
                  : "h-10"
              )}
            />
          </Link>

          <nav className="flex items-center gap-4 overflow-x-auto scrollbar-hide whitespace-nowrap">
            {orderedNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={`${item.path}-${item.label}`}
                  to={item.path}
                  title={item.label}
                  onClick={handleProtectedNavClick}
                  className={cn(
                    "relative flex shrink-0 items-center gap-1.5 whitespace-nowrap font-medium leading-normal transition-colors py-2",
                    navTextClass,
                    active
                      ? "text-blue-500"
                      : settings.darkMode
                      ? "text-slate-200 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  {showNavIcon && <Icon className={navIconClass} />}

                  {showNavText && (
                    <span className="relative inline-block">
                      {item.label}

                      {isLoggedIn &&
                        item.path.startsWith("/vacation") &&
                        canApproveVacation &&
                        pendingVacationCount > 0 && (
                          <span className="absolute -top-1.5 -right-2 w-[8px] h-[8px] rounded-full bg-red-500" />
                        )}
                    </span>
                  )}

                  {!showNavText &&
                    isLoggedIn &&
                    item.path.startsWith("/vacation") &&
                    canApproveVacation &&
                    pendingVacationCount > 0 && (
                      <span className="absolute top-1 right-0 w-[8px] h-[8px] rounded-full bg-red-500" />
                    )}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-4">
            {!isLoggedIn ? (
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => navigate("/login")}
              >
                <User className="size-4" />
                <span>로그인</span>
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  className={cn(
                    "flex items-center gap-2",
                    settings.darkMode
                      ? "bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700"
                      : ""
                  )}
                  onClick={() => navigate("/mypage")}
                >
                  <User className="size-4" />
                  <span>내 정보</span>
                </Button>

                <div className="relative">
                  <button
                    className={cn(
                      "relative p-2 rounded-lg transition-colors",
                      settings.darkMode
                        ? "hover:bg-slate-800"
                        : "hover:bg-gray-100"
                    )}
                    onClick={() => {
                      setShowSettings(!showSettings);
                      setShowNotifications(false);
                    }}
                  >
                    <Settings
                      className={cn(
                        "size-5",
                        settings.darkMode ? "text-slate-200" : "text-gray-600"
                      )}
                    />
                  </button>

                  {showSettings && (
                    <div
                      className={cn(
                        "absolute right-0 top-11 z-50 w-[420px] rounded-xl border shadow-lg",
                        settings.darkMode
                          ? "border-slate-700 bg-slate-900 text-slate-100"
                          : "border-gray-200 bg-white text-gray-900"
                      )}
                    >
                      <div
                        className={cn(
                          "px-4 py-3 border-b",
                          settings.darkMode
                            ? "border-slate-700"
                            : "border-gray-100"
                        )}
                      >
                        <h3 className="font-semibold">환경 설정</h3>
                        <p
                          className={cn(
                            "text-xs",
                            settings.darkMode
                              ? "text-slate-400"
                              : "text-gray-500"
                          )}
                        >
                          화면 모드, 알림, 헤더 구성을 변경할 수 있습니다.
                        </p>
                      </div>

                      <div className="max-h-[620px] overflow-y-auto p-4 space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium">
                                다크모드
                              </div>
                              <div
                                className={cn(
                                  "text-xs",
                                  settings.darkMode
                                    ? "text-slate-400"
                                    : "text-gray-500"
                                )}
                              >
                                전체 화면을 어두운 모드로 변경합니다.
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                updateSettings({
                                  darkMode: !settings.darkMode,
                                })
                              }
                              className={cn(
                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                settings.darkMode
                                  ? "bg-blue-600"
                                  : "bg-gray-300"
                              )}
                            >
                              <span
                                className={cn(
                                  "inline-block size-5 transform rounded-full bg-white transition-transform",
                                  settings.darkMode
                                    ? "translate-x-5"
                                    : "translate-x-1"
                                )}
                              />
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium">
                                알림 기능
                              </div>
                              <div
                                className={cn(
                                  "text-xs",
                                  settings.darkMode
                                    ? "text-slate-400"
                                    : "text-gray-500"
                                )}
                              >
                                공지사항과 휴가 처리 알림을 표시합니다.
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                updateSettings({
                                  notificationEnabled:
                                    !settings.notificationEnabled,
                                })
                              }
                              className={cn(
                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                settings.notificationEnabled
                                  ? "bg-blue-600"
                                  : "bg-gray-300"
                              )}
                            >
                              <span
                                className={cn(
                                  "inline-block size-5 transform rounded-full bg-white transition-transform",
                                  settings.notificationEnabled
                                    ? "translate-x-5"
                                    : "translate-x-1"
                                )}
                              />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm font-medium">헤더 크기</div>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { value: "small", label: "작게" },
                              { value: "default", label: "기본" },
                              { value: "large", label: "크게" },
                            ].map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() =>
                                  updateSettings({
                                    headerSize: option.value,
                                  })
                                }
                                className={cn(
                                  "rounded-lg border px-3 py-2 text-sm transition-colors",
                                  settings.headerSize === option.value
                                    ? "border-blue-600 bg-blue-50 text-blue-700"
                                    : settings.darkMode
                                    ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                                )}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm font-medium">
                            헤더 표시 방식
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { value: "iconText", label: "아이콘+글씨" },
                              { value: "iconOnly", label: "아이콘만" },
                              { value: "textOnly", label: "글씨만" },
                            ].map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() =>
                                  updateSettings({
                                    headerDisplayMode: option.value,
                                  })
                                }
                                className={cn(
                                  "rounded-lg border px-2 py-2 text-xs transition-colors",
                                  settings.headerDisplayMode === option.value
                                    ? "border-blue-600 bg-blue-50 text-blue-700"
                                    : settings.darkMode
                                    ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
                                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                                )}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium">
                                헤더 메뉴 순서
                              </div>
                              <div
                                className={cn(
                                  "text-xs",
                                  settings.darkMode
                                    ? "text-slate-400"
                                    : "text-gray-500"
                                )}
                              >
                                위/아래 버튼으로 순서를 바꿀 수 있습니다.
                              </div>
                            </div>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={resetHeaderSettings}
                              className={
                                settings.darkMode
                                  ? "bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700"
                                  : ""
                              }
                            >
                              초기화
                            </Button>
                          </div>

                          <div className="space-y-2">
                            {visibleConfigNavItems.map((item, index) => (
                              <div
                                key={item.path}
                                className={cn(
                                  "flex items-center justify-between gap-2 rounded-lg border px-3 py-2",
                                  settings.darkMode
                                    ? "border-slate-700 bg-slate-800"
                                    : "border-gray-200 bg-gray-50"
                                )}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <item.icon className="size-4 shrink-0" />
                                  <span className="truncate text-sm">
                                    {item.label}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    disabled={index === 0}
                                    onClick={() =>
                                      moveHeaderItem(item.path, "up")
                                    }
                                    className={cn(
                                      "rounded-md p-1.5 transition-colors disabled:opacity-30",
                                      settings.darkMode
                                        ? "hover:bg-slate-700"
                                        : "hover:bg-gray-200"
                                    )}
                                  >
                                    <ArrowUp className="size-4" />
                                  </button>

                                  <button
                                    type="button"
                                    disabled={
                                      index === visibleConfigNavItems.length - 1
                                    }
                                    onClick={() =>
                                      moveHeaderItem(item.path, "down")
                                    }
                                    className={cn(
                                      "rounded-md p-1.5 transition-colors disabled:opacity-30",
                                      settings.darkMode
                                        ? "hover:bg-slate-700"
                                        : "hover:bg-gray-200"
                                    )}
                                  >
                                    <ArrowDown className="size-4" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => hideHeaderItem(item.path)}
                                    className={cn(
                                      "rounded-md p-1.5 transition-colors",
                                      settings.darkMode
                                        ? "hover:bg-slate-700"
                                        : "hover:bg-gray-200"
                                    )}
                                  >
                                    <EyeOff className="size-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {hiddenNavItems.length > 0 && (
                            <div className="space-y-2 pt-2">
                              <div className="text-sm font-medium">
                                숨긴 메뉴
                              </div>

                              {hiddenNavItems.map((item) => (
                                <div
                                  key={item.path}
                                  className={cn(
                                    "flex items-center justify-between gap-2 rounded-lg border px-3 py-2",
                                    settings.darkMode
                                      ? "border-slate-700 bg-slate-800"
                                      : "border-gray-200 bg-gray-50"
                                  )}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <item.icon className="size-4 shrink-0" />
                                    <span className="truncate text-sm">
                                      {item.label}
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => showHeaderItem(item.path)}
                                    className={cn(
                                      "rounded-md p-1.5 transition-colors",
                                      settings.darkMode
                                        ? "hover:bg-slate-700"
                                        : "hover:bg-gray-200"
                                    )}
                                  >
                                    <Eye className="size-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div
                        className={cn(
                          "border-t p-2",
                          settings.darkMode
                            ? "border-slate-700"
                            : "border-gray-100"
                        )}
                      >
                        <button
                          onClick={() => setShowSettings(false)}
                          className={cn(
                            "w-full rounded-lg px-3 py-2 text-sm transition-colors",
                            settings.darkMode
                              ? "text-slate-200 hover:bg-slate-800"
                              : "text-gray-600 hover:bg-gray-50"
                          )}
                        >
                          닫기
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    className={cn(
                      "relative p-2 rounded-lg transition-colors",
                      settings.darkMode
                        ? "hover:bg-slate-800"
                        : "hover:bg-gray-100"
                    )}
                    onClick={() => {
                      if (!settings.notificationEnabled) {
                        alert("알림 기능이 꺼져 있습니다.");
                        return;
                      }

                      setShowNotifications(!showNotifications);
                      setShowSettings(false);
                    }}
                  >
                    <Bell
                      className={cn(
                        "size-5",
                        settings.darkMode ? "text-slate-200" : "text-gray-600"
                      )}
                    />

                    {settings.notificationEnabled && hasAlarmItems && (
                      <span className="absolute top-1 right-1 size-2 bg-red-500 rounded-full"></span>
                    )}
                  </button>

                  {showNotifications && (
                    <div
                      className={cn(
                        "absolute right-0 top-11 z-50 w-80 rounded-xl border shadow-lg",
                        settings.darkMode
                          ? "border-slate-700 bg-slate-900"
                          : "border-gray-200 bg-white"
                      )}
                    >
                      <div
                        className={cn(
                          "px-4 py-3 border-b",
                          settings.darkMode
                            ? "border-slate-700"
                            : "border-gray-100"
                        )}
                      >
                        <h3
                          className={cn(
                            "font-semibold",
                            settings.darkMode
                              ? "text-slate-100"
                              : "text-gray-900"
                          )}
                        >
                          알림
                        </h3>
                        <p
                          className={cn(
                            "text-xs",
                            settings.darkMode
                              ? "text-slate-400"
                              : "text-gray-500"
                          )}
                        >
                          최근 공지사항과 휴가 처리 결과를 확인하세요.
                        </p>
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        {recentNotices.length > 0 && (
                          <div className="p-3">
                            <div
                              className={cn(
                                "mb-2 text-xs font-semibold",
                                settings.darkMode
                                  ? "text-slate-400"
                                  : "text-gray-500"
                              )}
                            >
                              최근 공지사항
                            </div>

                            <div className="space-y-2">
                              {recentNotices.map((notice) => (
                                <button
                                  key={notice.id}
                                  onClick={() => {
                                    setReadAlarmIds((prev) => [
                                      ...prev,
                                      getNoticeAlarmId(notice),
                                    ]);
                                    setShowNotifications(false);
                                    navigate("/notice");
                                  }}
                                  className={cn(
                                    "w-full rounded-lg px-3 py-2 text-left transition-colors",
                                    settings.darkMode
                                      ? "bg-slate-800 hover:bg-slate-700"
                                      : "bg-gray-50 hover:bg-gray-100"
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "text-sm font-medium line-clamp-1",
                                      settings.darkMode
                                        ? "text-slate-100"
                                        : "text-gray-900"
                                    )}
                                  >
                                    {notice.title}
                                  </div>
                                  <div
                                    className={cn(
                                      "mt-1 text-xs",
                                      settings.darkMode
                                        ? "text-slate-400"
                                        : "text-gray-500"
                                    )}
                                  >
                                    {notice.date ||
                                      notice.createdAt ||
                                      "날짜 없음"}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {myVacationResults.length > 0 && (
                          <div
                            className={cn(
                              "p-3 border-t",
                              settings.darkMode
                                ? "border-slate-700"
                                : "border-gray-100"
                            )}
                          >
                            <div
                              className={cn(
                                "mb-2 text-xs font-semibold",
                                settings.darkMode
                                  ? "text-slate-400"
                                  : "text-gray-500"
                              )}
                            >
                              휴가 승인 / 반려 결과
                            </div>

                            <div className="space-y-2">
                              {myVacationResults.map((request) => (
                                <button
                                  key={request.id}
                                  onClick={() => {
                                    setReadAlarmIds((prev) => [
                                      ...prev,
                                      getVacationAlarmId(request),
                                    ]);
                                    setShowNotifications(false);
                                    navigate("/vacation/info");
                                  }}
                                  className={cn(
                                    "w-full rounded-lg px-3 py-2 text-left transition-colors",
                                    settings.darkMode
                                      ? "bg-slate-800 hover:bg-slate-700"
                                      : "bg-gray-50 hover:bg-gray-100"
                                  )}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div
                                      className={cn(
                                        "text-sm font-medium",
                                        settings.darkMode
                                          ? "text-slate-100"
                                          : "text-gray-900"
                                      )}
                                    >
                                      {request.type || "휴가 신청"}
                                    </div>

                                    <span
                                      className={
                                        request.status === "승인"
                                          ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
                                          : "rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700"
                                      }
                                    >
                                      {request.status}
                                    </span>
                                  </div>

                                  <div
                                    className={cn(
                                      "mt-1 text-xs",
                                      settings.darkMode
                                        ? "text-slate-400"
                                        : "text-gray-500"
                                    )}
                                  >
                                    {request.startDate} ~ {request.endDate}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {!hasAlarmItems && (
                          <div
                            className={cn(
                              "px-4 py-10 text-center text-sm",
                              settings.darkMode
                                ? "text-slate-400"
                                : "text-gray-500"
                            )}
                          >
                            확인할 알림이 없습니다.
                          </div>
                        )}
                      </div>

                      <div
                        className={cn(
                          "border-t p-2",
                          settings.darkMode
                            ? "border-slate-700"
                            : "border-gray-100"
                        )}
                      >
                        {hasAlarmItems && (
                          <button
                            onClick={() => {
                              const allAlarmIds = [
                                ...recentNotices.map((notice) =>
                                  getNoticeAlarmId(notice)
                                ),
                                ...myVacationResults.map((request) =>
                                  getVacationAlarmId(request)
                                ),
                              ];

                              setReadAlarmIds((prev) => [
                                ...prev,
                                ...allAlarmIds,
                              ]);
                              setShowNotifications(false);
                            }}
                            className="w-full rounded-lg px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
                          >
                            모두 확인
                          </button>
                        )}

                        <button
                          onClick={() => setShowNotifications(false)}
                          className={cn(
                            "w-full rounded-lg px-3 py-2 text-sm transition-colors",
                            settings.darkMode
                              ? "text-slate-200 hover:bg-slate-800"
                              : "text-gray-600 hover:bg-gray-50"
                          )}
                        >
                          닫기
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "flex items-center gap-2 rounded-lg p-2 transition-colors",
                        settings.darkMode
                          ? "hover:bg-slate-800"
                          : "hover:bg-gray-50"
                      )}
                    >
                      <div className="relative">
                        <div className="size-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-sm font-semibold">
                          {loginUser?.name?.charAt(0) || "?"}
                        </div>

                        <div
                          className={cn(
                            "absolute bottom-0 right-0 size-2.5 rounded-full border-2",
                            settings.darkMode ? "border-slate-900" : "border-white",
                            getStatusColor(loginUser?.status || "오프라인")
                          )}
                        ></div>
                      </div>

                      <ChevronDown
                        className={cn(
                          "size-4",
                          settings.darkMode ? "text-slate-400" : "text-gray-400"
                        )}
                      />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {loginUser?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {loginUser?.email}
                      </p>
                    </div>

                    <div className="p-2">
                      <div className="text-xs text-gray-500 mb-2 px-2">
                        상태 변경
                      </div>

                      <Select
                        value={loginUser?.status || "업무 중"}
                        onValueChange={handleStatusChange}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue>
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "size-2 rounded-full",
                                  getStatusColor(loginUser?.status || "업무 중")
                                )}
                              ></div>
                              <span>{loginUser?.status || "업무 중"}</span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="업무 중">
                            <div className="flex items-center gap-2">
                              <div className="size-2 rounded-full bg-green-500"></div>
                              <span>업무 중</span>
                            </div>
                          </SelectItem>

                          <SelectItem value="자리 비움">
                            <div className="flex items-center gap-2">
                              <div className="size-2 rounded-full bg-yellow-500"></div>
                              <span>자리 비움</span>
                            </div>
                          </SelectItem>

                          <SelectItem value="집중 모드">
                            <div className="flex items-center gap-2">
                              <div className="size-2 rounded-full bg-purple-500"></div>
                              <span>집중 모드</span>
                            </div>
                          </SelectItem>

                          <SelectItem value="휴가 중">
                            <div className="flex items-center gap-2">
                              <div className="size-2 rounded-full bg-blue-500"></div>
                              <span>휴가 중</span>
                            </div>
                          </SelectItem>

                          <SelectItem value="오프라인">
                            <div className="flex items-center gap-2">
                              <div className="size-2 rounded-full bg-gray-500"></div>
                              <span>오프라인</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="border-t border-gray-100">
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-red-600 cursor-pointer"
                      >
                        <LogOut className="size-4 mr-2" />
                        로그아웃
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      <ChatWidget />
    </div>
  );
}