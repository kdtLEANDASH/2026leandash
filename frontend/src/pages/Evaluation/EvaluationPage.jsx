import { useEffect, useMemo, useRef, useState } from "react";
import { useAppContext } from "@/store/AppProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Badge } from "@/components/UI/badge";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Textarea } from "@/components/UI/textarea";
import {
  Award,
  Building2,
  ChevronDown,
  ClipboardEdit,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  getDepartmentsApi,
  getDepartmentUsersApi,
} from "@/api/departmentApi";

import {
  getEvaluationsApi,
  createEvaluationApi,
} from "@/api/evaluationApi";

export function EvaluationPage() {
  const { currentUser, employees = [] } = useAppContext();

  const employeeListRef = useRef(null);

  const [apiDepartments, setApiDepartments] = useState([]);
  const [apiEmployees, setApiEmployees] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [evaluationRecords, setEvaluationRecords] = useState([]);

  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    performance: 4,
    cooperation: 4,
    expertise: 4,
    communication: 4,
    goal: 4,
    comment: "",
  });

  const currentDepartment =
    currentUser?.department ||
    currentUser?.departmentName ||
    localStorage.getItem("userDepartment") ||
    "";

  const currentUserId =
    currentUser?.userId ||
    currentUser?.id ||
    Number(localStorage.getItem("userId")) ||
    null;

  const isHrUser = currentDepartment === "?¸ì‚¬?€";

  const isAdmin =
    currentUser?.role === "ìµœê³ ê´€ë¦¬ì" ||
    currentUser?.role === "ADMIN" ||
    localStorage.getItem("userRole") === "ADMIN";

  const fallbackDepartments = useMemo(() => {
    return [
      ...new Set(
        (employees || [])
          .map((emp) => emp?.department || emp?.departmentName)
          .filter(Boolean)
      ),
    ].filter((dept) => dept !== "ê²½ì˜ì§?);
  }, [employees]);

  const visibleDepartments =
    apiDepartments.length > 0
      ? apiDepartments
      : fallbackDepartments.map((name, index) => ({
          departmentId: index + 1,
          departmentName: name,
        }));

  useEffect(() => {
    async function fetchDepartments() {
      try {
        setIsLoadingDepartments(true);

        const response = await getDepartmentsApi();
        const list = response?.data || [];

        setApiDepartments(list);

        if (list.length === 0) {
          if (fallbackDepartments.length > 0) {
            setSelectedDepartment(fallbackDepartments[0]);
          }
          return;
        }

        let defaultDepartment = list[0];

        if (!isHrUser && !isAdmin && currentDepartment) {
          const matchedDepartment = list.find(
            (dept) => dept.departmentName === currentDepartment
          );

          if (matchedDepartment) {
            defaultDepartment = matchedDepartment;
          }
        }

        setSelectedDepartmentId(String(defaultDepartment.departmentId));
        setSelectedDepartment(defaultDepartment.departmentName);
      } catch (error) {
        console.error("ë¶€??ëª©ë¡ ì¡°íšŒ ?¤íŒ¨", error);

        if (fallbackDepartments.length > 0) {
          setSelectedDepartment(fallbackDepartments[0]);
        }
      } finally {
        setIsLoadingDepartments(false);
      }
    }

    fetchDepartments();
  }, [currentDepartment, isHrUser, isAdmin, fallbackDepartments]);

  useEffect(() => {
    if (!selectedDepartmentId) return;

    async function fetchDepartmentUsers() {
      try {
        setIsLoadingEmployees(true);

        const response = await getDepartmentUsersApi(selectedDepartmentId);
        setApiEmployees(response?.data || []);
      } catch (error) {
        console.error("ë¶€?œë³„ ì§ì› ì¡°íšŒ ?¤íŒ¨", error);
        setApiEmployees([]);
      } finally {
        setIsLoadingEmployees(false);
      }
    }

    fetchDepartmentUsers();
  }, [selectedDepartmentId]);

  useEffect(() => {
    async function fetchEvaluations() {
      try {
        const response = await getEvaluationsApi();
        const list = Array.isArray(response) ? response : response?.data || [];

        const mappedRecords = list.map((item) => ({
          id: item.evaluationId || item.id,
          evaluator: item.evaluatorUserName || item.evaluatorName || "?‰ê???,
          employeeId: item.targetUserId,
          employeeName:
            item.targetUserName ||
            item.employeeName ||
            `? ì? ${item.targetUserId}`,
          department:
            item.targetDepartmentName ||
            item.departmentName ||
            selectedDepartment ||
            "",
          position: item.position || "",
          scores: {},
          averageScore: item.score
            ? (Number(item.score) / 20).toFixed(1)
            : "-",
          grade: item.score ? getGrade(Number(item.score) / 20) : "-",
          comment: item.content || "",
          date: item.createdAt ? item.createdAt.slice(0, 10) : "",
        }));

        setEvaluationRecords(mappedRecords);
      } catch (error) {
        console.error("?‰ê? ëª©ë¡ ì¡°íšŒ ?¤íŒ¨", error);
      }
    }

    fetchEvaluations();
  }, [selectedDepartment]);

  const targetEmployees =
    apiEmployees.length > 0
      ? apiEmployees.filter(
          (emp) =>
            emp.role !== "ìµœê³ ê´€ë¦¬ì" &&
            emp.role !== "CEO" &&
            emp.role !== "ê²½ì˜ì§?
        )
      : employees.filter(
          (emp) =>
            (emp.department || emp.departmentName) === selectedDepartment &&
            emp.role !== "ìµœê³ ê´€ë¦¬ì"
        );

  const selectedEmployee = targetEmployees.find(
    (emp) => String(emp.id || emp.userId) === String(selectedEmployeeId)
  );

  const averageScore = (
    (Number(form.performance) +
      Number(form.cooperation) +
      Number(form.expertise) +
      Number(form.communication) +
      Number(form.goal)) /
    5
  ).toFixed(1);

  function getGrade(score) {
    if (score >= 4.5) return "A+";
    if (score >= 4.0) return "A";
    if (score >= 3.5) return "B+";
    if (score >= 3.0) return "B";
    return "C";
  }

  const handleScoreChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleDepartmentChange = (departmentId) => {
    const department = visibleDepartments.find(
      (dept) => String(dept.departmentId) === String(departmentId)
    );

    setSelectedDepartmentId(String(departmentId));
    setSelectedDepartment(department?.departmentName || "");
    setSelectedEmployeeId("");
  };

  const handleSubmit = async () => {

    if (!selectedEmployee) {
      alert("?‰ê???ì§ì›??? íƒ?´ì£¼?¸ìš”.");
      return;
    }

    if (!selectedDepartmentId) {
      alert("?‰ê???ë¶€?œë? ? íƒ?´ì£¼?¸ìš”.");
      return;
    }

    if (!currentUserId) {
      alert("ë¡œê·¸???¬ìš©???•ë³´ë¥??•ì¸?????†ìŠµ?ˆë‹¤. ?¤ì‹œ ë¡œê·¸?¸í•´ì£¼ì„¸??");
      return;
    }

    const targetUserId = selectedEmployee.userId || selectedEmployee.id;
    const targetDepartmentId =
      selectedEmployee.departmentId || Number(selectedDepartmentId);

    const score = Math.round(Number(averageScore) * 20);

    const requestBody = {
      targetUserId: Number(targetUserId),
      targetDepartmentId: Number(targetDepartmentId),
      evaluatorUserId: Number(currentUserId),
      score,
      content: form.comment,
    };

try {
  setIsSaving(true);


  const response = await createEvaluationApi(requestBody);


  const savedEvaluation = response?.data || response;

      const newRecord = {
        id: savedEvaluation?.evaluationId || Date.now(),
        evaluator:
          currentUser?.name ||
          currentUser?.userName ||
          localStorage.getItem("userName") ||
          "?‰ê???,
        employeeId: targetUserId,
        employeeName: selectedEmployee.name || selectedEmployee.userName,
        department:
          selectedEmployee.department ||
          selectedEmployee.departmentName ||
          selectedDepartment,
        position: selectedEmployee.position || "",
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

      alert("?‰ê?ê°€ ?€?¥ë˜?ˆìŠµ?ˆë‹¤.");
    } catch (error) {
      console.error("?‰ê? ?€???¤íŒ¨", error);
      alert("?‰ê? ?€?¥ì— ?¤íŒ¨?ˆìŠµ?ˆë‹¤. ?…ë ¥ê°??ëŠ” ?œë²„ ?íƒœë¥??•ì¸?´ì£¼?¸ìš”.");
    } finally {
      setIsSaving(false);
    }
  };

  const departmentRecords = evaluationRecords.filter(
    (record) => record.department === selectedDepartment
  );

  const departmentAverage =
    departmentRecords.length > 0
      ? (
          departmentRecords.reduce(
            (sum, record) => sum + Number(record.averageScore || 0),
            0
          ) / departmentRecords.length
        ).toFixed(1)
      : "-";

  const scoreItems = [
    { key: "performance", label: "?…ë¬´ ?±ê³¼" },
    { key: "cooperation", label: "?‘ì—… ?¥ë ¥" },
    { key: "expertise", label: "?„ë¬¸?? },
    { key: "communication", label: "?˜ì‚¬?Œí†µ" },
    { key: "goal", label: "ëª©í‘œ ?¬ì„±?? },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">
          ?¬ë‚´ ?‰ê?
        </h2>
        <p className="text-gray-600">
          {isHrUser || isAdmin
            ? "?¸ì‚¬?€ ?ëŠ” ê´€ë¦¬ì??ë¶€?œë? ? íƒ?˜ì—¬ ì§ì› ?‰ê?ë¥?ì§„í–‰?????ˆìŠµ?ˆë‹¤."
            : `${currentDepartment} ?€?ì˜ ?‰ê? ê²°ê³¼ë¥??•ì¸?˜ì„¸??`}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">? íƒ ë¶€??/div>
              <Building2 className="size-8 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {isLoadingDepartments ? "ì¡°íšŒ ì¤?.." : selectedDepartment || "-"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">?‰ê? ?€???¸ì›</div>
              <Users className="size-8 text-purple-500" />
            </div>
            <div className="text-4xl font-bold text-gray-900">
              {isLoadingEmployees ? "-" : targetEmployees.length}
            </div>
            <div className="text-sm text-gray-600">ëª?/div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">ë¶€???‰ê· </div>
              <Award className="size-8 text-yellow-500" />
            </div>
            <div className="text-4xl font-bold text-gray-900">
              {departmentAverage}
            </div>
            <div className="text-sm text-gray-600">/ 5.0</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">?‰ê? ê¸°ê°„</div>
              <TrendingUp className="size-8 text-green-500" />
            </div>
            <div className="text-xl font-bold text-gray-900">2026??1ë¶„ê¸°</div>
          </CardContent>
        </Card>
      </div>

      {(isHrUser || isAdmin) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>?‰ê? ë¶€??? íƒ</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedDepartmentId}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              className="w-full md:w-35 h-10 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {visibleDepartments.map((dept) => (
                <option key={dept.departmentId} value={dept.departmentId}>
                  {dept.departmentName}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ì§ì› ?‰ê? ?…ë ¥</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                ?‰ê? ?€??ì§ì›
              </label>

              <div className="relative w-[220px]">
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full h-12 appearance-none rounded-lg border border-gray-300 bg-white px-4 pr-12 text-sm focus:outline-none focus:ring-0 focus:border-gray-300"
                >
                  <option value="">ì§ì›??? íƒ?˜ì„¸??/option>
                  {targetEmployees.map((emp) => (
                    <option
                      key={emp.id || emp.userId}
                      value={emp.id || emp.userId}
                    >
                      {emp.name || emp.userName} / {emp.position || "ì§ì±… ?†ìŒ"}
                    </option>
                  ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            {scoreItems.map((item) => (
              <div key={item.key}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    {item.label}
                  </label>
                  <span className="text-sm font-semibold text-gray-900">
                    {form[item.key]}??
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

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">?‰ê·  ?ìˆ˜</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-blue-700">
                    {averageScore}
                  </span>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                    {getGrade(Number(averageScore))}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                ?‰ê? ?˜ê²¬
              </label>
              <Textarea
                value={form.comment}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, comment: e.target.value }))
                }
                placeholder="?‰ê? ?˜ê²¬???…ë ¥?˜ì„¸??
                className="min-h-28"
              />
            </div>

            <Button onClick={handleSubmit} className="w-full" disabled={isSaving}>
              <ClipboardEdit className="size-4 mr-2" />
              {isSaving ? "?€??ì¤?.." : "?‰ê? ?€??}
            </Button>
          </CardContent>
        </Card>

        <div ref={employeeListRef}>
          <Card>
            <CardHeader>
              <CardTitle>{selectedDepartment || "-"} ì§ì› ëª©ë¡</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {targetEmployees.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    ì¡°íšŒ??ì§ì›???†ìŠµ?ˆë‹¤.
                  </div>
                ) : (
                  targetEmployees.map((emp) => {
                    const employeeId = emp.id || emp.userId;
                    const employeeName = emp.name || emp.userName;
                    const latestRecord = evaluationRecords.find(
                      (record) => String(record.employeeId) === String(employeeId)
                    );

                    return (
                      <div
                        key={employeeId}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                            {employeeName?.charAt(0) || "?"}
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {employeeName}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {emp.position || "ì§ì±… ?†ìŒ"}
                            </p>
                          </div>
                        </div>

                        {latestRecord ? (
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">
                                {latestRecord.averageScore}
                              </div>
                              <div className="text-xs text-gray-600">/ 5.0</div>
                            </div>

                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              {latestRecord.grade}
                            </Badge>
                          </div>
                        ) : (
                          <Badge variant="outline">ë¯¸í‰ê°€</Badge>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>?‰ê? ê¸°ë¡</CardTitle>
        </CardHeader>

        <CardContent>
          {evaluationRecords.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              ?„ì§ ?€?¥ëœ ?‰ê? ê¸°ë¡???†ìŠµ?ˆë‹¤.
            </div>
          ) : (
            <div className="space-y-3">
              {evaluationRecords.map((record) => (
                <div
                  key={record.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">
                          {record.employeeName}
                        </h4>
                        <Badge variant="outline">{record.department}</Badge>
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                          {record.grade}
                        </Badge>
                      </div>

                      <p className="text-sm text-gray-600">
                        {record.position || "ì§ì±… ?†ìŒ"} Â· ?‰ê???" "}
                        {record.evaluator} Â· {record.date}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="size-5 fill-current" />
                      <span className="text-xl font-bold text-gray-900">
                        {record.averageScore}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                    {record.comment || "?‰ê? ?˜ê²¬ ?†ìŒ"}
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
