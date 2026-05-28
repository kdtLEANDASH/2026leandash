import { useState } from "react";
import {
  Mail,
  Phone,
  MessageCircle,
  Plus,
  Edit,
  Trash2,
  Lock,
} from "lucide-react";
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
import { Label } from "@/components/UI/label";
import { Input } from "@/components/UI/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { useAppContext } from "@/store/AppProvider";
import { cn } from "@/components/UI/utils";

export function EmployeesPage() {
  const {
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    currentUser,
    customSettings,
  } = useAppContext();

  const isDark = customSettings?.darkMode;

  const isAdmin = currentUser?.role === "최고관리자";

  const isHrAdmin =
    currentUser?.department === "인사팀" && currentUser?.role === "팀장";

  const [selectedDept, setSelectedDept] = useState("전체");
  const [viewMode, setViewMode] = useState("org");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    position: "",
    email: "",
    phone: "",
    status: "업무 중",
    mbti: "",
    hireDate: "",
    role: "일반직원",
  });

  const resetPasswordForm = () => {
    setNewPassword("");
    setConfirmPassword("");
  };

  const departments = [
    "전체",
    ...Array.from(new Set(employees.map((e) => e.department))),
  ];

  const filteredEmployees =
    selectedDept === "전체"
      ? employees
      : employees.filter((e) => e.department === selectedDept);

  const buildOrgChart = () => {
    const deptEmployees =
      selectedDept === "전체"
        ? employees
        : employees.filter((e) => e.department === selectedDept);

    const deptMap = new Map();

    deptEmployees.forEach((emp) => {
      if (!deptMap.has(emp.department)) {
        deptMap.set(emp.department, { staff: [] });
      }

      if (emp.role === "최고관리자") {
        deptMap.get(emp.department).ceo = emp;
      } else if (emp.role === "팀장") {
        deptMap.get(emp.department).manager = emp;
      } else {
        deptMap.get(emp.department).staff.push(emp);
      }
    });

    const orgNodes = [];

    deptMap.forEach((value) => {
      if (value.ceo) {
        orgNodes.push({
          id: value.ceo.id,
          name: value.ceo.name,
          position: value.ceo.position,
          department: value.ceo.department,
          mbti: value.ceo.mbti,
          status: value.ceo.status,
          role: value.ceo.role,
          email: value.ceo.email,
          phone: value.ceo.phone,
          hireDate: value.ceo.hireDate,
        });
      }

      if (value.manager) {
        const managerNode = {
          id: value.manager.id,
          name: value.manager.name,
          position: value.manager.position,
          department: value.manager.department,
          mbti: value.manager.mbti,
          status: value.manager.status,
          role: value.manager.role,
          email: value.manager.email,
          phone: value.manager.phone,
          hireDate: value.manager.hireDate,
          children: value.staff.map((s) => ({
            id: s.id,
            name: s.name,
            position: s.position,
            department: s.department,
            mbti: s.mbti,
            status: s.status,
            role: s.role,
            email: s.email,
            phone: s.phone,
            hireDate: s.hireDate,
          })),
        };

        orgNodes.push(managerNode);
      } else if (value.staff.length > 0) {
        value.staff.forEach((s) => {
          orgNodes.push({
            id: s.id,
            name: s.name,
            position: s.position,
            department: s.department,
            mbti: s.mbti,
            status: s.status,
            role: s.role,
            email: s.email,
            phone: s.phone,
            hireDate: s.hireDate,
          });
        });
      }
    });

    return orgNodes;
  };

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-700 hover:bg-gray-100";

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
    if (!role) return "bg-gray-100 text-gray-700 hover:bg-gray-100";

    const colors = {
      최고관리자: "bg-red-100 text-red-700 hover:bg-red-100",
      팀장: "bg-blue-100 text-blue-700 hover:bg-blue-100",
      일반직원: "bg-gray-100 text-gray-700 hover:bg-gray-100",
    };

    return colors[role] || colors["일반직원"];
  };

  const handleAddEmployee = () => {
    if (
      !formData.name ||
      !formData.department ||
      !formData.position ||
      !formData.email ||
      !formData.phone
    ) {
      alert("모든 필수 항목을 입력해주세요.");
      return;
    }

    addEmployee({
      ...formData,
      hireDate: formData.hireDate || new Date().toISOString().split("T")[0],
    });

    resetForm();
    setShowAddDialog(false);
  };

  const handleUpdateEmployee = (id) => {
    if (
      !formData.name ||
      !formData.department ||
      !formData.position ||
      !formData.email ||
      !formData.phone
    ) {
      alert("모든 필수 항목을 입력해주세요.");
      return;
    }

    const hasPasswordInput = newPassword.trim() || confirmPassword.trim();

    if (hasPasswordInput) {
      if (!isAdmin) {
        alert("최고관리자만 비밀번호를 변경할 수 있습니다.");
        return;
      }

      if (!newPassword.trim()) {
        alert("새 비밀번호를 입력해주세요.");
        return;
      }

      if (newPassword.length < 4) {
        alert("새 비밀번호는 최소 4자 이상 입력해주세요.");
        return;
      }

      if (newPassword !== confirmPassword) {
        alert("새 비밀번호가 일치하지 않습니다.");
        return;
      }
    }

    const updates = {
      ...formData,
    };

    if (isAdmin && newPassword.trim()) {
      updates.password = newPassword;
    }

    updateEmployee(id, updates);

    resetForm();
    resetPasswordForm();
    setEditingEmployee(null);

    const updated = employees.find((e) => e.id === id);

    if (updated) {
      setSelectedEmployee({ ...updated, ...updates });
    }

    if (newPassword.trim()) {
      alert("직원 비밀번호가 변경되었습니다.");
    }
  };

  const handleDeleteEmployee = (id) => {
    if (window.confirm("정말 이 직원을 삭제하시겠습니까?")) {
      deleteEmployee(id);
      setSelectedEmployee(null);
      setShowDetailDialog(false);
      resetPasswordForm();
    }
  };

  const startEdit = (employee) => {
    setFormData({
      name: employee.name,
      department: employee.department,
      position: employee.position,
      email: employee.email,
      phone: employee.phone || "",
      status: employee.status,
      mbti: employee.mbti || "",
      hireDate: employee.hireDate,
      role: employee.role,
    });

    resetPasswordForm();
    setEditingEmployee(employee.id);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      department: "",
      position: "",
      email: "",
      phone: "",
      status: "업무 중",
      mbti: "",
      hireDate: "",
      role: "일반직원",
    });

    setEditingEmployee(null);
  };

  const canEditEmployee = (employee) => {
    if (!currentUser) return false;
    if (currentUser.role === "최고관리자") return true;
    if (isHrAdmin) return true;
    return currentUser.id === employee.id;
  };

  const canDeleteEmployee = () => {
    if (!currentUser) return false;
    return currentUser.role === "최고관리자";
  };

  const handleNodeClick = (node) => {
    const employee = employees.find((e) => e.id === node.id);

    if (employee) {
      setSelectedEmployee(employee);
      setShowDetailDialog(true);
      resetPasswordForm();
    }
  };

  const OrgNodeComponent = ({ node, level = 0 }) => {
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div className="flex flex-col items-center">
        <Card
          className={cn(
            "hover:shadow-lg transition-all cursor-pointer w-56 border-2",
            isDark
              ? "bg-[#48484f] border-[#5c5c73] text-white hover:bg-[#54545c]"
              : "bg-white border-gray-200 hover:border-blue-300"
          )}
          onClick={() => handleNodeClick(node)}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="size-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-semibold text-sm">
                {node.name.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    "font-semibold truncate text-sm",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  {node.name}
                </h3>

                <p
                  className={cn(
                    "text-xs truncate",
                    isDark ? "text-zinc-200" : "text-gray-600"
                  )}
                >
                  {node.position}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {node.status && (
                <Badge
                  className={cn(getStatusColor(node.status), "text-xs py-0 px-2")}
                >
                  {node.status}
                </Badge>
              )}

              {node.mbti && (
                <Badge variant="outline" className="text-xs py-0 px-2">
                  {node.mbti}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {hasChildren && <div className="w-0.5 h-6 bg-gray-300"></div>}

        {hasChildren && (
          <div className="flex flex-col items-center">
            {node.children.length > 1 && (
              <div className="relative w-full h-0.5 bg-gray-300">
                <div className="absolute top-0 left-0 w-full h-full flex justify-between">
                  {node.children.map((_, index) => (
                    <div
                      key={index}
                      className="w-0.5 h-6 bg-gray-300"
                      style={{
                        marginLeft: index === 0 ? "0" : "auto",
                        marginRight:
                          index === node.children.length - 1 ? "0" : "auto",
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-6 mt-6">
              {node.children.map((child) => (
                <OrgNodeComponent
                  key={child.id}
                  node={child}
                  level={level + 1}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const orgData = buildOrgChart();

  return (
    <div className="flex h-full">
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
          <div className="flex items-center justify-between mb-3">
            <h2
              className={cn(
                "text-lg font-semibold",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              부서
            </h2>

            {(currentUser?.role === "최고관리자" || isHrAdmin) && (
              <Button size="sm" onClick={() => setShowAddDialog(true)}>
                <Plus className="size-4" />
              </Button>
            )}
          </div>

          <p className={cn("text-xs", isDark ? "text-zinc-400" : "text-gray-500")}>
            부서별 직원 조회 및 정보 수정
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            {departments.map((dept) => {
              const deptCount =
                dept === "전체"
                  ? employees.length
                  : employees.filter((e) => e.department === dept).length;

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
                      ? "text-zinc-200 hover:bg-[#48484f]"
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
            className="w-full text-sm"
            onClick={() => setViewMode("org")}
          >
            조직도 표시
          </Button>

          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            className="w-full text-sm"
            onClick={() => setViewMode("list")}
          >
            전체 직원 표시
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "flex-1 overflow-auto p-6",
          isDark ? "bg-[#242428]" : "bg-gray-50"
        )}
      >
        <div className="mb-4">
          <h2
            className={cn(
              "text-xl font-semibold",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            {isHrAdmin ? "[ HR 관리자 직원 조회 ]" : "[ 직원 조회 ]"}
          </h2>
        </div>

        {viewMode === "org" ? (
          <div
            className={cn(
              "rounded-lg border p-6 overflow-x-auto",
              isDark
                ? "bg-[#393940] border-[#5c5c73]"
                : "bg-white border-gray-200"
            )}
          >
            <div className="inline-block min-w-full">
              <div className="flex flex-wrap gap-6 justify-center">
                {orgData.map((node) => (
                  <OrgNodeComponent key={node.id} node={node} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "rounded-lg border",
              isDark
                ? "bg-[#393940] border-[#5c5c73]"
                : "bg-white border-gray-200"
            )}
          >
            <div
              className={cn(
                "p-4 border-b",
                isDark ? "border-[#5c5c73]" : "border-gray-200"
              )}
            >
              <h3
                className={cn(
                  "font-semibold",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                전체 직원 목록
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
              {filteredEmployees.map((employee) => (
                <Card
                  key={employee.id}
                  className={cn(
                    "hover:shadow-md transition-all cursor-pointer border-2",
                    isDark
                      ? "bg-[#48484f] border-[#5c5c73] text-white hover:bg-[#54545c]"
                      : "bg-white border-gray-200 hover:border-blue-300"
                  )}
                  onClick={() => {
                    setSelectedEmployee(employee);
                    setShowDetailDialog(true);
                    resetPasswordForm();
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="size-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-semibold">
                        {employee.name.charAt(0)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3
                          className={cn(
                            "font-semibold truncate",
                            isDark ? "text-white" : "text-gray-900"
                          )}
                        >
                          {employee.name}
                        </h3>

                        <p
                          className={cn(
                            "text-sm truncate",
                            isDark ? "text-zinc-200" : "text-gray-600"
                          )}
                        >
                          {employee.position}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        {employee.department}
                      </Badge>

                      <Badge className={getStatusColor(employee.status)}>
                        {employee.status}
                      </Badge>

                      {employee.mbti && (
                        <Badge variant="outline" className="text-xs">
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

      <Dialog
        open={showDetailDialog}
        onOpenChange={(open) => {
          setShowDetailDialog(open);

          if (!open) {
            resetForm();
            resetPasswordForm();
            setSelectedEmployee(null);
          }
        }}
      >
        <DialogContent
          className={cn(
            "max-w-lg",
            isDark ? "bg-[#35353d] border-[#5c5c73] text-white" : ""
          )}
        >
          <DialogHeader>
            <DialogTitle>상세 직원 정보</DialogTitle>
          </DialogHeader>

          {selectedEmployee &&
            (editingEmployee === selectedEmployee.id ? (
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-sm">
                    이름 *
                  </Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-department" className="text-sm">
                    부서 *
                  </Label>
                  <Input
                    id="edit-department"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        department: e.target.value,
                      })
                    }
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-position" className="text-sm">
                    직급 *
                  </Label>
                  <Input
                    id="edit-position"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-email" className="text-sm">
                    이메일 *
                  </Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-phone" className="text-sm">
                    전화번호 *
                  </Label>
                  <Input
                    id="edit-phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-status" className="text-sm">
                    상태
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="업무 중">업무 중</SelectItem>
                      <SelectItem value="자리 비움">자리 비움</SelectItem>
                      <SelectItem value="집중 모드">집중 모드</SelectItem>
                      <SelectItem value="휴가 중">휴가 중</SelectItem>
                      <SelectItem value="오프라인">오프라인</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-mbti" className="text-sm">
                    MBTI
                  </Label>
                  <Input
                    id="edit-mbti"
                    value={formData.mbti}
                    onChange={(e) =>
                      setFormData({ ...formData, mbti: e.target.value })
                    }
                    maxLength={4}
                    className="h-9"
                  />
                </div>

                {isAdmin && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-role" className="text-sm">
                      역할
                    </Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        setFormData({ ...formData, role: value })
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="일반직원">일반직원</SelectItem>
                        <SelectItem value="팀장">팀장</SelectItem>
                        <SelectItem value="최고관리자">최고관리자</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {isAdmin && (
                  <div
                    className={cn(
                      "space-y-4 border-t pt-5",
                      isDark ? "border-[#5c5c73]" : "border-gray-200"
                    )}
                  >
                    <div>
                      <h3
                        className={cn(
                          "text-sm font-semibold mb-1 flex items-center gap-2",
                          isDark ? "text-white" : "text-gray-900"
                        )}
                      >
                        <Lock className="size-4" />
                        비밀번호 변경
                      </h3>

                      <p
                        className={cn(
                          "text-xs",
                          isDark ? "text-zinc-400" : "text-gray-500"
                        )}
                      >
                        직원이 비밀번호를 잊어버린 경우 최고관리자가 새
                        비밀번호로 변경할 수 있습니다.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="admin-new-password" className="text-sm">
                        새 비밀번호
                      </Label>
                      <Input
                        id="admin-new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="새 비밀번호를 입력하세요"
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="admin-confirm-password"
                        className="text-sm"
                      >
                        새 비밀번호 확인
                      </Label>
                      <Input
                        id="admin-confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="새 비밀번호를 다시 입력하세요"
                        className="h-9"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-4">
                <div
                  className={cn(
                    "flex flex-col items-center pb-4 border-b",
                    isDark ? "border-[#5c5c73]" : "border-gray-200"
                  )}
                >
                  <div className="size-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-2xl font-semibold mb-3">
                    {selectedEmployee.name.charAt(0)}
                  </div>

                  <h3
                    className={cn(
                      "text-lg font-bold",
                      isDark ? "text-white" : "text-gray-900"
                    )}
                  >
                    {selectedEmployee.name}
                  </h3>

                  <p
                    className={cn(
                      "text-sm",
                      isDark ? "text-zinc-300" : "text-gray-600"
                    )}
                  >
                    {selectedEmployee.position}
                  </p>
                </div>

                <div className="space-y-3 mt-4">
                  <div
                    className={cn(
                      "rounded-lg p-3",
                      isDark ? "bg-[#2f2f36]" : "bg-gray-50"
                    )}
                  >
                    <h4
                      className={cn(
                        "text-xs font-semibold mb-2",
                        isDark ? "text-zinc-400" : "text-gray-500"
                      )}
                    >
                      {"<"}해당 직원 정보{">"}
                    </h4>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className={isDark ? "text-zinc-300" : "text-gray-600"}>
                          부서:
                        </span>
                        <span className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                          {selectedEmployee.department}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className={isDark ? "text-zinc-300" : "text-gray-600"}>
                          직급:
                        </span>
                        <span className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                          {selectedEmployee.position}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className={isDark ? "text-zinc-300" : "text-gray-600"}>
                          상태:
                        </span>
                        <Badge className={getStatusColor(selectedEmployee.status)}>
                          {selectedEmployee.status}
                        </Badge>
                      </div>

                      <div className="flex justify-between">
                        <span className={isDark ? "text-zinc-300" : "text-gray-600"}>
                          역할:
                        </span>
                        <Badge className={getRoleBadgeColor(selectedEmployee.role)}>
                          {selectedEmployee.role}
                        </Badge>
                      </div>

                      {selectedEmployee.mbti && (
                        <div className="flex justify-between">
                          <span className={isDark ? "text-zinc-300" : "text-gray-600"}>
                            MBTI:
                          </span>
                          <span className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                            {selectedEmployee.mbti}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className={cn(
                      "space-y-2 text-sm",
                      isDark ? "text-zinc-200" : "text-gray-700"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="size-4 text-gray-400" />
                      <span className="truncate">{selectedEmployee.email}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="size-4 text-gray-400" />
                      <span>{selectedEmployee.phone || "-"}</span>
                    </div>

                    <div>
                      <span className={isDark ? "text-zinc-300" : "text-gray-600"}>
                        입사일:
                      </span>{" "}
                      {selectedEmployee.hireDate}
                    </div>
                  </div>
                </div>
              </div>
            ))}

          <DialogFooter>
            {selectedEmployee && editingEmployee === selectedEmployee.id ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    resetPasswordForm();
                    setEditingEmployee(null);
                  }}
                >
                  취소
                </Button>

                <Button onClick={() => handleUpdateEmployee(selectedEmployee.id)}>
                  저장
                </Button>
              </>
            ) : (
              selectedEmployee && (
                <div className="flex w-full gap-2">
                  <Button className="flex-1" variant="default">
                    <MessageCircle className="size-4 mr-2" />
                    1:1 문의(채팅)하기
                  </Button>

                  {canEditEmployee(selectedEmployee) && (
                    <Button
                      variant="outline"
                      onClick={() => startEdit(selectedEmployee)}
                    >
                      <Edit className="size-4 mr-2" />
                      수정
                    </Button>
                  )}

                  {canDeleteEmployee(selectedEmployee) && (
                    <Button
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteEmployee(selectedEmployee.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              )
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>새 직원 추가</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="홍길동"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">부서 *</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                placeholder="개발팀"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">직급 *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                placeholder="대리"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일 *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="example@company.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">전화번호 *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="010-0000-0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mbti">MBTI</Label>
              <Input
                id="mbti"
                value={formData.mbti}
                onChange={(e) =>
                  setFormData({ ...formData, mbti: e.target.value })
                }
                placeholder="ENFP"
                maxLength={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">역할 *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="일반직원">일반직원</SelectItem>
                  <SelectItem value="팀장">팀장</SelectItem>

                  {currentUser?.role === "최고관리자" && (
                    <SelectItem value="최고관리자">최고관리자</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setShowAddDialog(false);
              }}
            >
              취소
            </Button>

            <Button onClick={handleAddEmployee}>추가</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}