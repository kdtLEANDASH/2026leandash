import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar as CalendarIcon,
  MessageSquare,
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
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/UI/dropdown-menu";
import { ChatWidget } from "@/components/Chat/ChatWidget";

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    currentUser,
    updateEmployeeStatus,
    logout,
    notifications = [],
    vacationRequests = [],
    notices = [],
  } = useAppContext() || {};

  const [showNotifications, setShowNotifications] = useState(false);
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
  const isHrAdmin = loginUser?.department === "인사팀";
  const canApproveVacation = isHrAdmin || loginUser?.role === "팀장";

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
      label: "공지사항",
      icon: FileText,
      roles: ["최고관리자", "팀장", "일반직원"],
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
      path: "/vacation",
      label: isHrAdmin ? "휴가 신청현황" : "휴가 신청",
      icon: Plane,
      roles: ["최고관리자", "팀장", "일반직원"],
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
      path: "/chat",
      label: "채팅",
      icon: MessageSquare,
      roles: ["최고관리자", "팀장", "일반직원"],
      public: true,
    },
    {
      path: "/inquiry",
      label: isHrAdmin ? "문의 관리" : "문의",
      icon: HelpCircle,
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

    if (item.path === "/evaluation") {
      return canAccessEvaluation;
    }

    return item.roles.includes(loginUser.role);
  });

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }

    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center h-16 px-6">
          <Link
            to={isLoggedIn ? "/dashboard" : "/"}
            className="flex items-center mr-8"
          >
            <img
              src="/leandash-logo.png"
              alt="Leandash 로고"
              className="h-10 w-auto object-contain"
            />
          </Link>

          <nav className="flex items-center gap-4 overflow-x-auto scrollbar-hide whitespace-nowrap">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "relative flex shrink-0 items-center gap-1.5 whitespace-nowrap text-base font-medium transition-colors py-2",
                    active
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  <Icon className="size-4" />

                  <span className="relative inline-block">
                    {item.label}

                    {isLoggedIn &&
                      item.path === "/vacation" &&
                      canApproveVacation &&
                      pendingVacationCount > 0 && (
                        <span className="absolute -top-1.5 -right-2 w-[8px] h-[8px] rounded-full bg-red-500" />
                      )}
                  </span>
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
                  className="flex items-center gap-2"
                  onClick={() => navigate("/mypage")}
                >
                  <User className="size-4" />
                  <span>내 정보</span>
                </Button>

                <div className="relative">
                  <button
                    className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <Bell className="size-5 text-gray-600" />

                    {hasAlarmItems && (
                      <span className="absolute top-1 right-1 size-2 bg-red-500 rounded-full"></span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-gray-200 bg-white shadow-lg">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">알림</h3>
                        <p className="text-xs text-gray-500">
                          최근 공지사항과 휴가 처리 결과를 확인하세요.
                        </p>
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        {recentNotices.length > 0 && (
                          <div className="p-3">
                            <div className="mb-2 text-xs font-semibold text-gray-500">
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
                                  className="w-full rounded-lg bg-gray-50 px-3 py-2 text-left hover:bg-gray-100"
                                >
                                  <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                    {notice.title}
                                  </div>
                                  <div className="mt-1 text-xs text-gray-500">
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
                          <div className="p-3 border-t border-gray-100">
                            <div className="mb-2 text-xs font-semibold text-gray-500">
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
                                    navigate("/vacation");
                                  }}
                                  className="w-full rounded-lg bg-gray-50 px-3 py-2 text-left hover:bg-gray-100"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="text-sm font-medium text-gray-900">
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

                                  <div className="mt-1 text-xs text-gray-500">
                                    {request.startDate} ~ {request.endDate}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {!hasAlarmItems && (
                          <div className="px-4 py-10 text-center text-sm text-gray-500">
                            확인할 알림이 없습니다.
                          </div>
                        )}
                      </div>

                      <div className="border-t border-gray-100 p-2">
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
                          className="w-full rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                        >
                          닫기
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                      <div className="relative">
                        <div className="size-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-sm font-semibold">
                          {loginUser?.name?.charAt(0) || "?"}
                        </div>

                        <div
                          className={cn(
                            "absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white",
                            getStatusColor(loginUser?.status || "오프라인")
                          )}
                        ></div>
                      </div>

                      <ChevronDown className="size-4 text-gray-400" />
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