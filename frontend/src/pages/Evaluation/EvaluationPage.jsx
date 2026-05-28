import { useMemo, useRef, useState } from "react";
import { useAppContext } from "@/store/AppProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Badge } from "@/components/UI/badge";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Textarea } from "@/components/UI/textarea";
import { cn } from "@/components/UI/utils";
import {
  Award,
  Building2,
  ChevronDown,
  ClipboardEdit,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";

export function EvaluationPage() {
  const { currentUser, employees, customSettings } = useAppContext();
  const isDark = customSettings?.darkMode;

  const isHrUser = currentUser?.department === "인사팀";
  const isAdmin = currentUser?.role === "최고관리자";

  const departments = useMemo(() => {
    return [...new Set(employees.map((emp) => emp.department))]
      .filter((dept) => dept !== "경영진")
      .filter((dept) =>
        isHrUser || isAdmin ? true : dept === currentUser.department
      );
  }, [employees, currentUser, isHrUser, isAdmin]);

  const [selectedDepartment, setSelectedDepartment] = useState(
    isHrUser || isAdmin
      ? departments.find((dept) => dept !== "인사팀") || departments[0]
      : currentUser.department
  );

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [evaluationRecords, setEvaluationRecords] = useState([]);

  const employeeListRef = useRef(null);

  const [form, setForm] = useState({
    performance: 4,
    cooperation: 4,
    expertise: 4,
    communication: 4,
    goal: 4,
    comment: "",
  });

  const targetEmployees = employees.filter(
    (emp) => emp.department === selectedDepartment && emp.role !== "최고관리자"
  );

  const selectedEmployee = employees.find(
    (emp) => String(emp.id) === String(selectedEmployeeId)
  );

  const averageScore = (
    (Number(form.performance) +
      Number(form.cooperation) +
      Number(form.expertise) +
      Number(form.communication) +
      Number(form.goal)) /
    5
  ).toFixed(1);

  const getGrade = (score) => {
    if (score >= 4.5) return "A+";
    if (score >= 4.0) return "A";
    if (score >= 3.5) return "B+";
    if (score >= 3.0) return "B";
    return "C";
  };

  const handleScoreChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleSubmit = () => {
    if (!selectedEmployee) {
      alert("평가할 직원을 선택해주세요.");
      return;
    }

    const newRecord = {
      id: Date.now(),
      evaluator: currentUser.name,
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      department: selectedEmployee.department,
      position: selectedEmployee.position,
      scores: {
        performance: form.performance,
        cooperation: form.cooperation,
        expertise: form.expertise,
        communication: form.communication,
        goal: form.goal,
      },
      averageScore,
      grade: getGrade(Number(averageScore)),
      comment: form.comment,
      date: new Date().toISOString().slice(0, 10),
    };

    setEvaluationRecords((prev) => [newRecord, ...prev]);

    setSelectedEmployeeId("");
    setForm({
      performance: 4,
      cooperation: 4,
      expertise: 4,
      communication: 4,
      goal: 4,
      comment: "",
    });

    setTimeout(() => {
      employeeListRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const departmentAverage =
    evaluationRecords.filter((record) => record.department === selectedDepartment)
      .length > 0
      ? (
          evaluationRecords
            .filter((record) => record.department === selectedDepartment)
            .reduce((sum, record) => sum + Number(record.averageScore), 0) /
          evaluationRecords.filter(
            (record) => record.department === selectedDepartment
          ).length
        ).toFixed(1)
      : "-";

  const scoreItems = [
    { key: "performance", label: "업무 성과" },
    { key: "cooperation", label: "협업 능력" },
    { key: "expertise", label: "전문성" },
    { key: "communication", label: "의사소통" },
    { key: "goal", label: "목표 달성도" },
  ];

  const darkCardClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "bg-white border-gray-200";

  const darkHoverCardClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white hover:bg-[#3f3f48]"
    : "bg-white border-gray-200 hover:bg-gray-50";

  const darkInnerBoxClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-zinc-100"
    : "bg-blue-50 border-blue-100 text-blue-700";

  const darkRecordBoxClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-zinc-100"
    : "bg-gray-50 border-gray-200 text-gray-700";

  const darkSelectClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white"
    : "bg-white border-gray-300 text-gray-900";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2
          className={cn(
            "text-2xl font-semibold mb-1",
            isDark ? "text-white" : "text-gray-900"
          )}
        >
          사내 평가
        </h2>

        <p className={isDark ? "text-zinc-300" : "text-gray-600"}>
          {isHrUser || isAdmin
            ? "인사팀은 부서를 선택하여 직원 평가를 진행할 수 있습니다."
            : `${currentUser.department} 팀원의 평가 결과를 확인하세요.`}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className={cn(darkCardClass)}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("text-sm", isDark ? "text-zinc-300" : "text-gray-600")}>
                선택 부서
              </div>
              <Building2 className="size-8 text-blue-500" />
            </div>

            <div
              className={cn(
                "text-2xl font-bold",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              {selectedDepartment}
            </div>
          </CardContent>
        </Card>

        <Card className={cn(darkCardClass)}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("text-sm", isDark ? "text-zinc-300" : "text-gray-600")}>
                평가 대상 인원
              </div>
              <Users className="size-8 text-purple-500" />
            </div>

            <div
              className={cn(
                "text-4xl font-bold",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              {targetEmployees.length}
            </div>

            <div className={cn("text-sm", isDark ? "text-zinc-300" : "text-gray-600")}>
              명
            </div>
          </CardContent>
        </Card>

        <Card className={cn(darkCardClass)}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("text-sm", isDark ? "text-zinc-300" : "text-gray-600")}>
                부서 평균
              </div>
              <Award className="size-8 text-yellow-500" />
            </div>

            <div
              className={cn(
                "text-4xl font-bold",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              {departmentAverage}
            </div>

            <div className={cn("text-sm", isDark ? "text-zinc-300" : "text-gray-600")}>
              / 5.0
            </div>
          </CardContent>
        </Card>

        <Card className={cn(darkCardClass)}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("text-sm", isDark ? "text-zinc-300" : "text-gray-600")}>
                평가 기간
              </div>
              <TrendingUp className="size-8 text-green-500" />
            </div>

            <div
              className={cn(
                "text-xl font-bold",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              2026년 1분기
            </div>
          </CardContent>
        </Card>
      </div>

      {(isHrUser || isAdmin) && (
        <Card className={cn("mb-6", darkCardClass)}>
          <CardHeader>
            <CardTitle>평가 부서 선택</CardTitle>
          </CardHeader>

          <CardContent>
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setSelectedEmployeeId("");
              }}
              className={cn(
                "w-full md:w-35 h-10 rounded-md border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                darkSelectClass
              )}
            >
              {departments
                .filter((dept) => dept !== "인사팀")
                .map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
            </select>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className={cn(darkCardClass)}>
          <CardHeader>
            <CardTitle>직원 평가 입력</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div>
              <label
                className={cn(
                  "text-sm font-medium mb-2 block",
                  isDark ? "text-zinc-200" : "text-gray-700"
                )}
              >
                평가 대상 직원
              </label>

              <div className="relative w-[220px]">
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className={cn(
                    "w-full h-12 appearance-none rounded-lg border px-4 pr-12 text-sm focus:outline-none focus:ring-0",
                    darkSelectClass
                  )}
                >
                  <option value="">직원을 선택하세요</option>
                  {targetEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} / {emp.position}
                    </option>
                  ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            {scoreItems.map((item) => (
              <div key={item.key}>
                <div className="flex items-center justify-between mb-2">
                  <label
                    className={cn(
                      "text-sm font-medium",
                      isDark ? "text-zinc-200" : "text-gray-700"
                    )}
                  >
                    {item.label}
                  </label>

                  <span
                    className={cn(
                      "text-sm font-semibold",
                      isDark ? "text-white" : "text-gray-900"
                    )}
                  >
                    {form[item.key]}점
                  </span>
                </div>

                <Input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={form[item.key]}
                  onChange={(e) => handleScoreChange(item.key, e.target.value)}
                />

                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                </div>
              </div>
            ))}

            <div className={cn("p-4 border rounded-lg", darkInnerBoxClass)}>
              <div className="flex items-center justify-between">
                <span className={isDark ? "text-zinc-200" : "text-blue-700"}>
                  평균 점수
                </span>

                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-2xl font-bold",
                      isDark ? "text-white" : "text-blue-700"
                    )}
                  >
                    {averageScore}
                  </span>

                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                    {getGrade(Number(averageScore))}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <label
                className={cn(
                  "text-sm font-medium mb-2 block",
                  isDark ? "text-zinc-200" : "text-gray-700"
                )}
              >
                평가 의견
              </label>

              <Textarea
                value={form.comment}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, comment: e.target.value }))
                }
                placeholder="평가 의견을 입력하세요."
                className="min-h-28"
              />
            </div>

            <Button
              onClick={handleSubmit}
              className={cn(
                "w-full",
                isDark
                  ? "bg-[#5c5c73] hover:bg-[#6a6a82] text-white"
                  : ""
              )}
            >
              <ClipboardEdit className="size-4 mr-2" />
              평가 저장
            </Button>
          </CardContent>
        </Card>

        <div ref={employeeListRef}>
          <Card className={cn(darkCardClass)}>
            <CardHeader>
              <CardTitle>{selectedDepartment} 직원 목록</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {targetEmployees.map((emp) => {
                  const latestRecord = evaluationRecords.find(
                    (record) => record.employeeId === emp.id
                  );

                  return (
                    <div
                      key={emp.id}
                      className={cn(
                        "flex items-center justify-between p-3 border rounded-lg transition-colors",
                        darkHoverCardClass
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                          {emp.name.charAt(0)}
                        </div>

                        <div>
                          <h4
                            className={cn(
                              "font-semibold",
                              isDark ? "text-white" : "text-gray-900"
                            )}
                          >
                            {emp.name}
                          </h4>

                          <p
                            className={cn(
                              "text-xs",
                              isDark ? "text-zinc-300" : "text-gray-600"
                            )}
                          >
                            {emp.position}
                          </p>
                        </div>
                      </div>

                      {latestRecord ? (
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div
                              className={cn(
                                "text-lg font-bold",
                                isDark ? "text-white" : "text-gray-900"
                              )}
                            >
                              {latestRecord.averageScore}
                            </div>

                            <div
                              className={cn(
                                "text-xs",
                                isDark ? "text-zinc-300" : "text-gray-600"
                              )}
                            >
                              / 5.0
                            </div>
                          </div>

                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            {latestRecord.grade}
                          </Badge>
                        </div>
                      ) : (
                        <Badge variant="outline">미평가</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className={cn("mt-6", darkCardClass)}>
        <CardHeader>
          <CardTitle>평가 기록</CardTitle>
        </CardHeader>

        <CardContent>
          {evaluationRecords.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              아직 저장된 평가 기록이 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {evaluationRecords.map((record) => (
                <div
                  key={record.id}
                  className={cn("p-4 border rounded-lg", darkHoverCardClass)}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className={cn(
                            "font-semibold",
                            isDark ? "text-white" : "text-gray-900"
                          )}
                        >
                          {record.employeeName}
                        </h4>

                        <Badge variant="outline">{record.department}</Badge>

                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                          {record.grade}
                        </Badge>
                      </div>

                      <p
                        className={cn(
                          "text-sm",
                          isDark ? "text-zinc-300" : "text-gray-600"
                        )}
                      >
                        {record.position} · 평가자 {record.evaluator} ·{" "}
                        {record.date}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="size-5 fill-current" />

                      <span
                        className={cn(
                          "text-xl font-bold",
                          isDark ? "text-white" : "text-gray-900"
                        )}
                      >
                        {record.averageScore}
                      </span>
                    </div>
                  </div>

                  <p className={cn("text-sm rounded-lg p-3", darkRecordBoxClass)}>
                    {record.comment || "평가 의견 없음"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}