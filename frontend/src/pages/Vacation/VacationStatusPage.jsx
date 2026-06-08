import { useOutletContext } from "react-router-dom";
import { Calendar as CalendarIcon, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Input } from "@/components/UI/input";
import { Badge } from "@/components/UI/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { cn } from "@/components/UI/utils";

export default function VacationStatusPage() {
  const {
    isDark,
    canViewVacationStatus,
    employees,
    vacationStatusList,
    statusSearchKeyword,
    setStatusSearchKeyword,
    selectedDepartment,
    setSelectedDepartment,
    showCurrentOnly,
    setShowCurrentOnly,
    statusSortOption,
    setStatusSortOption,
    departmentOptions,
    today,
  } = useOutletContext();

  const cardClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "bg-white border-gray-200";

  const itemClass = isDark
    ? "p-4 border border-[#5c5c73] rounded-lg bg-[#2f2f36] hover:bg-[#3f3f48] transition-colors"
    : "p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors";

  const inputClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white placeholder:text-zinc-400"
    : "";

  const selectContentClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "";

  const checkboxLabelClass = isDark
    ? "flex items-center gap-2 px-3 h-10 border border-[#5c5c73] rounded-md bg-[#2f2f36] text-sm text-zinc-200"
    : "flex items-center gap-2 px-3 h-10 border border-gray-200 rounded-md bg-white text-sm text-gray-700";

  const textMain = isDark ? "text-white" : "text-gray-900";
  const textSub = isDark ? "text-zinc-300" : "text-gray-600";
  const textMuted = isDark ? "text-zinc-400" : "text-gray-500";

  if (!canViewVacationStatus) {
    return (
      <div className={cn("text-sm", textMuted)}>
        휴가 현황을 조회할 권한이 없습니다.
      </div>
    );
  }

  const filteredVacationStatusList = vacationStatusList.filter((vacation) => {
    const keyword = statusSearchKeyword.trim().toLowerCase();

    const employee = employees.find(
      (emp) =>
        String(emp.id) === String(vacation.employeeId) ||
        String(emp.userId) === String(vacation.employeeId) ||
        String(emp.employeeId) === String(vacation.employeeId)
    );

    const department = employee?.department || "";

    const matchesKeyword =
      keyword === ""
        ? true
        : vacation.employeeName.toLowerCase().includes(keyword) ||
          vacation.type.toLowerCase().includes(keyword) ||
          vacation.reason.toLowerCase().includes(keyword);

    const matchesDepartment =
      selectedDepartment === "전체" ? true : department === selectedDepartment;

    const matchesCurrentOnly = showCurrentOnly
      ? vacation.startDate <= today && vacation.endDate >= today
      : true;

    return matchesKeyword && matchesDepartment && matchesCurrentOnly;
  });

  const sortedVacationStatusList = [...filteredVacationStatusList].sort(
    (a, b) => {
      switch (statusSortOption) {
        case "startAsc":
          return (
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          );
        case "startDesc":
          return (
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          );
        case "endAsc":
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        case "nameAsc":
          return a.employeeName.localeCompare(b.employeeName, "ko");
        default:
          return 0;
      }
    }
  );

  const filteredOngoingVacationCount = filteredVacationStatusList.filter(
    (vacation) => vacation.startDate <= today && vacation.endDate >= today
  ).length;

  const filteredUpcomingVacationCount = filteredVacationStatusList.filter(
    (vacation) => vacation.startDate > today
  ).length;

  const getCurrentStatus = (vacation) => {
    if (vacation.startDate <= today && vacation.endDate >= today) {
      return "휴가 중";
    }

    if (vacation.startDate > today) {
      return "예정";
    }

    return "종료";
  };

  const getCurrentStatusClass = (status) => {
    if (isDark) {
      if (status === "휴가 중") {
        return "bg-green-500/20 text-green-300 border border-green-400/30 hover:bg-green-500/20";
      }

      if (status === "예정") {
        return "bg-blue-500/20 text-blue-300 border border-blue-400/30 hover:bg-blue-500/20";
      }

      return "bg-zinc-600 text-zinc-200 border border-zinc-500 hover:bg-zinc-600";
    }

    if (status === "휴가 중") {
      return "bg-green-100 text-green-700 hover:bg-green-100";
    }

    if (status === "예정") {
      return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    }

    return "bg-gray-100 text-gray-700 hover:bg-gray-100";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={cardClass}>
          <CardContent className="p-5">
            <div className={cn("text-sm", textSub)}>승인된 휴가</div>
            <div
              className={cn(
                "text-3xl font-bold",
                isDark ? "text-[#d8d8e3]" : "text-blue-600"
              )}
            >
              {filteredVacationStatusList.length}
            </div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardContent className="p-5">
            <div className={cn("text-sm", textSub)}>오늘 휴가 중</div>
            <div
              className={cn(
                "text-3xl font-bold",
                isDark ? "text-green-300" : "text-green-600"
              )}
            >
              {filteredOngoingVacationCount}
            </div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardContent className="p-5">
            <div className={cn("text-sm", textSub)}>예정된 휴가</div>
            <div
              className={cn(
                "text-3xl font-bold",
                isDark ? "text-orange-300" : "text-orange-600"
              )}
            >
              {filteredUpcomingVacationCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={cardClass}>
        <CardHeader className={isDark ? "border-b border-[#5c5c73]" : ""}>
          <CardTitle className="flex items-center justify-between">
            <span className={cn("flex items-center gap-2", textMain)}>
              <CalendarIcon className="size-5" />
              휴가 현황
            </span>

            <span className={cn("text-sm font-normal", textSub)}>
              총 {filteredVacationStatusList.length}건
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col lg:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search
                className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 size-4",
                  isDark ? "text-zinc-400" : "text-gray-400"
                )}
              />

              <Input
                value={statusSearchKeyword}
                onChange={(e) => setStatusSearchKeyword(e.target.value)}
                placeholder="이름, 휴가유형, 사유로 검색"
                className={cn("pl-9", inputClass)}
              />
            </div>

            <div className="w-full lg:w-48">
              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder="부서 선택" />
                </SelectTrigger>

                <SelectContent className={selectContentClass}>
                  {departmentOptions.map((department) => (
                    <SelectItem key={department} value={department}>
                      {department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full lg:w-48">
              <Select
                value={statusSortOption}
                onValueChange={setStatusSortOption}
              >
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder="정렬 선택" />
                </SelectTrigger>

                <SelectContent className={selectContentClass}>
                  <SelectItem value="startAsc">시작일 빠른순</SelectItem>
                  <SelectItem value="startDesc">시작일 늦은순</SelectItem>
                  <SelectItem value="endAsc">종료일 빠른순</SelectItem>
                  <SelectItem value="nameAsc">이름순</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <label className={checkboxLabelClass}>
              <input
                type="checkbox"
                checked={showCurrentOnly}
                onChange={(e) => setShowCurrentOnly(e.target.checked)}
              />
              현재 휴가 중만 보기
            </label>
          </div>

          {sortedVacationStatusList.length === 0 ? (
            <div className={cn("text-center py-12", textMuted)}>
              <CalendarIcon
                className={cn(
                  "size-12 mx-auto mb-3",
                  isDark ? "text-zinc-600" : "text-gray-400"
                )}
              />
              <p>조건에 맞는 휴가 현황이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedVacationStatusList.map((vacation) => {
                const currentStatus = getCurrentStatus(vacation);

                const employee = employees.find(
                  (emp) =>
                    String(emp.id) === String(vacation.employeeId) ||
                    String(emp.userId) === String(vacation.employeeId) ||
                    String(emp.employeeId) === String(vacation.employeeId)
                );

                return (
                  <div key={vacation.id} className={itemClass}>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          <span className={cn("font-semibold", textMain)}>
                            {vacation.employeeName}
                          </span>

                          <Badge className={getCurrentStatusClass(currentStatus)}>
                            {currentStatus}
                          </Badge>

                          <span className={cn("text-sm", textSub)}>
                            {employee?.department || "-"}
                          </span>

                          <span className={cn("text-sm", textSub)}>
                            {vacation.type}
                          </span>
                        </div>

                        <div className={cn("text-sm mb-1", textSub)}>
                          {vacation.startDate} ~ {vacation.endDate} (
                          {vacation.days}일)
                        </div>

                        <div
                          className={cn(
                            "text-sm mb-1",
                            isDark ? "text-zinc-300" : "text-gray-700"
                          )}
                        >
                          사유: {vacation.reason || "-"}
                        </div>

                        <div className={cn("text-xs", textMuted)}>
                          신청일: {vacation.requestDate || "-"}
                          {vacation.approver &&
                            ` · 처리자: ${vacation.approver}`}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}