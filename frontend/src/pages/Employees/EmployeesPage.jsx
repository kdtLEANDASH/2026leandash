import { useEffect, useMemo, useState } from "react";
import { Mail, Phone, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/UI/card";
import { Badge } from "@/components/UI/badge";
import { Button } from "@/components/UI/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/UI/dialog";
import { useAppContext } from "@/store/AppProvider";
import { cn } from "@/components/UI/utils";
import { getUsersApi } from "@/api/userApi";
import { getDepartmentsApi } from "@/api/departmentApi";
import { createDirectChatRoomApi } from "@/api/chatApi";

function unwrapResponse(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.result)) return response.result;
  return [];
}

function normalizeStatus(status) {
  const map = {
    ONLINE: "업무 중",
    AWAY: "자리 비움",
    FOCUS: "집중 모드",
    VACATION: "휴가 중",
    OFFLINE: "오프라인",
  };
  return map[status] || status || "업무 중";
}

function normalizeRole(role) {
  const map = {
    ADMIN: "최고관리자",
    MANAGER: "관리자",
    USER: "일반직원",
  };
  return map[role] || role || "일반직원";
}

function mapUserToEmployee(user) {
  return {
    id: user.userId ?? user.id,
    employeeNo: user.employeeNo ?? "",
    name: user.userName ?? user.name ?? "",
    department: user.departmentName ?? user.department ?? "",
    departmentId: user.departmentId,
    position: user.position ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    status: normalizeStatus(user.userStatus ?? user.status),
    role: normalizeRole(user.role),
    mbti: user.mbti ?? "",
    hireDate:
      user.createdAt?.slice?.(0, 10) ||
      user.created_at?.slice?.(0, 10) ||
      user.hireDate ||
      "",
  };
}

export function EmployeesPage() {
  const { currentUser, customSettings } = useAppContext();

  const isDark = customSettings?.darkMode;
  const isHrAdmin =
    currentUser?.department === "인사팀" &&
    (currentUser?.role === "관리자" || currentUser?.role === "최고관리자");

  const [employees, setEmployees] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [selectedDept, setSelectedDept] = useState("전체");
  const [viewMode, setViewMode] = useState("org");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingChat, setIsStartingChat] = useState(false);

  const pageClass = isDark
    ? "bg-[#27272a] text-white"
    : "bg-gray-50 text-gray-900";
  const sidebarClass = isDark
    ? "bg-[#35353d] border-[#5c5c73]"
    : "bg-white border-gray-200";
  const panelClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "bg-white border-gray-200";
  const cardClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white hover:bg-[#3f3f48]"
    : "bg-white border-gray-200 hover:border-blue-300";
  const innerClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white"
    : "bg-gray-50 border-gray-200 text-gray-900";
  const modalClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "";
  const textMain = isDark ? "text-white" : "text-gray-900";
  const textSub = isDark ? "text-zinc-300" : "text-gray-600";
  const textMuted = isDark ? "text-zinc-400" : "text-gray-500";
  const primaryButtonClass = isDark
    ? "bg-[#5c5c73] hover:bg-[#6a6a82] text-white"
    : "";
  const outlineButtonClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white hover:bg-[#48484f]"
    : "";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        const [usersResponse, departmentsResponse] = await Promise.all([
          getUsersApi(),
          getDepartmentsApi(),
        ]);

        if (cancelled) return;

        const users = unwrapResponse(usersResponse).map(mapUserToEmployee);
        const departments = unwrapResponse(departmentsResponse);

        setEmployees(users);
        setDepartmentList(departments);
      } catch (error) {
        console.error("직원 목록 조회 실패:", error);
        alert("직원 목록을 불러오지 못했습니다.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const departments = useMemo(() => {
    const namesFromApi = departmentList.map((dept) => dept.departmentName);
    const namesFromUsers = employees.map((employee) => employee.department);
    return ["전체", ...Array.from(new Set([...namesFromApi, ...namesFromUsers].filter(Boolean)))];
  }, [departmentList, employees]);

  const filteredEmployees = useMemo(() => {
    if (selectedDept === "전체") return employees;
    return employees.filter((employee) => employee.department === selectedDept);
  }, [employees, selectedDept]);

  const buildOrgChart = () => {
    const deptEmployees = selectedDept === "전체"
      ? employees
      : employees.filter((employee) => employee.department === selectedDept);

    const deptMap = new Map();

    deptEmployees.forEach((employee) => {
      if (!deptMap.has(employee.department)) {
        deptMap.set(employee.department, { staff: [] });
      }

      if (employee.role === "최고관리자") {
        deptMap.get(employee.department).ceo = employee;
      } else if (employee.role === "관리자") {
        deptMap.get(employee.department).manager = employee;
      } else {
        deptMap.get(employee.department).staff.push(employee);
      }
    });

    const orgNodes = [];

    deptMap.forEach((value) => {
      if (value.ceo) {
        orgNodes.push(value.ceo);
      }

      if (value.manager) {
        orgNodes.push({
          ...value.manager,
          children: value.staff,
        });
      } else {
        value.staff.forEach((staff) => orgNodes.push(staff));
      }
    });

    return orgNodes;
  };

  const getStatusColor = (status) => {
    const colors = {
      "업무 중": "bg-green-100 text-green-700 hover:bg-green-100",
      "자리 비움": "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
      "집중 모드": "bg-purple-100 text-purple-700 hover:bg-purple-100",
      "휴가 중": "bg-blue-100 text-blue-700 hover:bg-blue-100",
      오프라인: "bg-gray-100 text-gray-700 hover:bg-gray-100",
    };
    return colors[status] || colors["오프라인"];
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      최고관리자: "bg-red-100 text-red-700 hover:bg-red-100",
      관리자: "bg-blue-100 text-blue-700 hover:bg-blue-100",
      일반직원: "bg-gray-100 text-gray-700 hover:bg-gray-100",
    };
    return colors[role] || colors["일반직원"];
  };

  const handleNodeClick = (node) => {
    setSelectedEmployee(node);
    setShowDetailDialog(true);
  };

  const handleStartDirectChat = async () => {
    if (!selectedEmployee?.id) return;

    try {
      setIsStartingChat(true);
      const response = await createDirectChatRoomApi(selectedEmployee.id);
      const room = response?.data || response;

      setShowDetailDialog(false);
      window.dispatchEvent(
        new CustomEvent("open-chat-room", {
          detail: {
            roomId: room.roomId,
            targetUserId: selectedEmployee.id,
            targetUserName: selectedEmployee.name,
          },
        })
      );
    } catch (error) {
      console.error("1:1 채팅방 생성 실패:", error);
      alert("채팅방을 열지 못했습니다.");
    } finally {
      setIsStartingChat(false);
    }
  };

  const OrgNodeComponent = ({ node }) => {
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div className="flex flex-col items-center">
        <Card
          className={cn(
            "transition-all cursor-pointer w-56 border-2",
            cardClass
          )}
          onClick={() => handleNodeClick(node)}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div
                className={cn(
                  "size-10 rounded-full flex items-center justify-center text-white font-semibold text-sm",
                  isDark
                    ? "bg-[#5c5c73]"
                    : "bg-gradient-to-br from-blue-600 to-blue-800"
                )}
              >
                {node.name?.charAt(0) || "?"}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className={cn("font-semibold truncate text-sm", textMain)}>
                  {node.name}
                </h3>
                <p className={cn("text-xs truncate", textSub)}>
                  {node.position}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {node.status && (
                <Badge className={cn(getStatusColor(node.status), "text-xs py-0 px-2")}>
                  {node.status}
                </Badge>
              )}
              {node.mbti && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs py-0 px-2",
                    isDark ? "border-[#5c5c73] text-zinc-200" : ""
                  )}
                >
                  {node.mbti}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {hasChildren && (
          <>
            <div className={cn("w-0.5 h-6", isDark ? "bg-[#5c5c73]" : "bg-gray-300")} />
            <div className="flex gap-6 mt-6">
              {node.children.map((child) => (
                <OrgNodeComponent key={child.id} node={child} />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const orgData = buildOrgChart();

  return (
    <div className={cn("flex h-full", pageClass)}>
      <div className={cn("w-64 border-r flex flex-col", sidebarClass)}>
        <div
          className={cn(
            "p-4 border-b",
            isDark ? "border-[#5c5c73]" : "border-gray-200"
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className={cn("text-lg font-semibold", textMain)}>부서</h2>
          </div>

          <p className={cn("text-xs", textMuted)}>
            부서별 직원 조회 및 정보 수정
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            {departments.map((dept) => {
              const deptCount =
                dept === "전체"
                  ? employees.length
                  : employees.filter((employee) => employee.department === dept).length;

              return (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg transition-colors text-sm",
                    selectedDept === dept
                      ? isDark
                        ? "bg-[#5c5c73] text-white font-medium"
                        : "bg-blue-50 text-blue-700 font-medium"
                      : isDark
                      ? "text-zinc-300 hover:bg-[#48484f]"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{dept}</span>
                    <span className={cn("text-xs", isDark ? "text-zinc-400" : "text-gray-500")}>
                      {deptCount}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div
          className={cn(
            "p-3 border-t space-y-2",
            isDark ? "border-[#5c5c73]" : "border-gray-200"
          )}
        >
          <Button
            variant={viewMode === "org" ? "default" : "outline"}
            className={cn(
              "w-full text-sm",
              viewMode === "org" ? primaryButtonClass : outlineButtonClass
            )}
            onClick={() => setViewMode("org")}
          >
            조직도 표시
          </Button>

          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            className={cn(
              "w-full text-sm",
              viewMode === "list" ? primaryButtonClass : outlineButtonClass
            )}
            onClick={() => setViewMode("list")}
          >
            전체 직원 표시
          </Button>
        </div>
      </div>

      <div className={cn("flex-1 overflow-auto p-6", pageClass)}>
        <div className="mb-4">
          <h2 className={cn("text-xl font-semibold", textMain)}>
            {isHrAdmin ? "[ HR 관리자 직원 조회 ]" : "[ 직원 조회 ]"}
          </h2>
        </div>

        {isLoading ? (
          <div className={cn("rounded-lg border p-6", panelClass)}>직원 정보를 불러오는 중...</div>
        ) : viewMode === "org" ? (
          <div className={cn("rounded-lg border p-6 overflow-x-auto", panelClass)}>
            <div className="inline-block min-w-full">
              <div className="flex flex-wrap gap-6 justify-center">
                {orgData.map((node) => (
                  <OrgNodeComponent key={node.id} node={node} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className={cn("rounded-lg border", panelClass)}>
            <div
              className={cn(
                "p-4 border-b",
                isDark ? "border-[#5c5c73]" : "border-gray-200"
              )}
            >
              <h3 className={cn("font-semibold", textMain)}>전체 직원 목록</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
              {filteredEmployees.map((employee) => (
                <Card
                  key={employee.id}
                  className={cn("transition-all cursor-pointer border-2", cardClass)}
                  onClick={() => {
                    setSelectedEmployee(employee);
                    setShowDetailDialog(true);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={cn(
                          "size-12 rounded-full flex items-center justify-center text-white font-semibold",
                          isDark
                            ? "bg-[#5c5c73]"
                            : "bg-gradient-to-br from-blue-600 to-blue-800"
                        )}
                      >
                        {employee.name?.charAt(0) || "?"}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className={cn("font-semibold truncate", textMain)}>
                          {employee.name}
                        </h3>
                        <p className={cn("text-sm truncate", textSub)}>
                          {employee.position}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className={isDark ? "border-[#5c5c73] text-zinc-200" : "text-xs"}
                      >
                        {employee.department}
                      </Badge>

                      <Badge className={getStatusColor(employee.status)}>
                        {employee.status}
                      </Badge>

                      {employee.mbti && (
                        <Badge
                          variant="outline"
                          className={isDark ? "border-[#5c5c73] text-zinc-200" : "text-xs"}
                        >
                          {employee.mbti}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className={cn("max-w-lg", modalClass)}>
          <DialogHeader>
            <DialogTitle>상세 직원 정보</DialogTitle>
          </DialogHeader>

          {selectedEmployee && (
            <div className="py-4">
              <div
                className={cn(
                  "flex flex-col items-center pb-4 border-b",
                  isDark ? "border-[#5c5c73]" : "border-gray-200"
                )}
              >
                <div
                  className={cn(
                    "size-20 rounded-full flex items-center justify-center text-white text-2xl font-semibold mb-3",
                    isDark
                      ? "bg-[#5c5c73]"
                      : "bg-gradient-to-br from-blue-600 to-blue-800"
                  )}
                >
                  {selectedEmployee.name?.charAt(0) || "?"}
                </div>

                <h3 className={cn("text-lg font-bold", textMain)}>
                  {selectedEmployee.name}
                </h3>
                <p className={cn("text-sm", textSub)}>{selectedEmployee.position}</p>
              </div>

              <div className="space-y-3 mt-4">
                <div className={cn("rounded-lg p-3", innerClass)}>
                  <h4 className={cn("text-xs font-semibold mb-2", textMuted)}>
                    {"<"}해당 직원 정보{">"}
                  </h4>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={textSub}>부서:</span>
                      <span className={cn("font-medium", textMain)}>
                        {selectedEmployee.department}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className={textSub}>직급:</span>
                      <span className={cn("font-medium", textMain)}>
                        {selectedEmployee.position}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className={textSub}>상태:</span>
                      <Badge className={getStatusColor(selectedEmployee.status)}>
                        {selectedEmployee.status}
                      </Badge>
                    </div>

                    <div className="flex justify-between">
                      <span className={textSub}>역할:</span>
                      <Badge className={getRoleBadgeColor(selectedEmployee.role)}>
                        {selectedEmployee.role}
                      </Badge>
                    </div>

                    {selectedEmployee.mbti && (
                      <div className="flex justify-between">
                        <span className={textSub}>MBTI:</span>
                        <span className={cn("font-medium", textMain)}>
                          {selectedEmployee.mbti}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className={cn("space-y-2 text-sm", textSub)}>
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 text-zinc-400" />
                    <span className="truncate">{selectedEmployee.email || "-"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="size-4 text-zinc-400" />
                    <span>{selectedEmployee.phone || "-"}</span>
                  </div>

                  <div>
                    <span className={textMuted}>입사일:</span>{" "}
                    {selectedEmployee.hireDate || "-"}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <div className="flex w-full gap-2">
              <Button
                className={cn("flex-1", primaryButtonClass)}
                onClick={handleStartDirectChat}
                disabled={!selectedEmployee || isStartingChat}
              >
                <MessageCircle className="size-4 mr-2" />
                {isStartingChat ? "채팅방 여는 중..." : "1:1 문의(채팅)하기"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
