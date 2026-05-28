import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Calendar as CalendarIcon, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Input } from "@/components/UI/input";
import { Badge } from "@/components/UI/badge";
import { Button } from "@/components/UI/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { useAppContext } from "@/store/AppProvider";
import { cn } from "@/components/UI/utils";

export default function VacationStatusPage() {
  const { customSettings } = useAppContext();
  const isDark = customSettings?.darkMode;

  const {
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

  const darkCardClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "bg-white border-gray-200";

  const darkInnerCardClass = isDark
    ? "bg-[#48484f] border-[#5c5c73] text-white hover:bg-[#54545c]"
    : "bg-white border-gray-200 hover:bg-gray-50";

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [
    statusSearchKeyword,
    selectedDepartment,
    showCurrentOnly,
    statusSortOption,
  ]);

  if (!canViewVacationStatus) {
    return (
      <div className="text-sm text-gray-500">
        휴가 현황을 조회할 권한이 없습니다.
      </div>
    );
  }

  const filteredVacationStatusList = vacationStatusList.filter((vacation) => {
    const keyword = statusSearchKeyword.trim().toLowerCase();
    const employee = employees.find((emp) => emp.id === vacation.employeeId);
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

  const totalPages = Math.max(
    1,
    Math.ceil(sortedVacationStatusList.length / itemsPerPage)
  );

  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentVacationStatusList = sortedVacationStatusList.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const filteredOngoingVacationCount = filteredVacationStatusList.filter(
    (vacation) => vacation.startDate <= today && vacation.endDate >= today
  ).length;

  const filteredUpcomingVacationCount = filteredVacationStatusList.filter(
    (vacation) => vacation.startDate > today
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={cn(darkCardClass)}>
          <CardContent className="p-5">
            <div className="text-sm text-gray-600">승인된 휴가</div>
            <div className="text-3xl font-bold text-blue-600">
              {filteredVacationStatusList.length}
            </div>
          </CardContent>
        </Card>

        <Card className={cn(darkCardClass)}>
          <CardContent className="p-5">
            <div className="text-sm text-gray-600">오늘 휴가 중</div>
            <div className="text-3xl font-bold text-green-600">
              {filteredOngoingVacationCount}
            </div>
          </CardContent>
        </Card>

        <Card className={cn(darkCardClass)}>
          <CardContent className="p-5">
            <div className="text-sm text-gray-600">예정된 휴가</div>
            <div className="text-3xl font-bold text-orange-600">
              {filteredUpcomingVacationCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={cn(darkCardClass)}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CalendarIcon className="size-5" />
              휴가 현황
            </span>

            <span className="text-sm font-normal text-gray-600">
              총 {filteredVacationStatusList.length}건
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col lg:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                value={statusSearchKeyword}
                onChange={(e) => setStatusSearchKeyword(e.target.value)}
                placeholder="이름, 휴가유형, 사유로 검색"
                className="pl-9"
              />
            </div>

            <div className="w-full lg:w-48">
              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="부서 선택" />
                </SelectTrigger>

                <SelectContent>
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
                <SelectTrigger>
                  <SelectValue placeholder="정렬 선택" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="startAsc">시작일 빠른순</SelectItem>
                  <SelectItem value="startDesc">시작일 늦은순</SelectItem>
                  <SelectItem value="endAsc">종료일 빠른순</SelectItem>
                  <SelectItem value="nameAsc">이름순</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <label className="flex items-center gap-2 px-3 h-10 border border-gray-200 rounded-md bg-white text-sm text-gray-700">
              <input
                type="checkbox"
                checked={showCurrentOnly}
                onChange={(e) => setShowCurrentOnly(e.target.checked)}
              />
              현재 휴가 중만 보기
            </label>
          </div>

          {sortedVacationStatusList.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CalendarIcon className="size-12 mx-auto mb-3 text-gray-400" />
              <p>조건에 맞는 휴가 현황이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentVacationStatusList.map((vacation) => {
                const currentStatus =
                  vacation.startDate <= today && vacation.endDate >= today
                    ? "휴가 중"
                    : vacation.startDate > today
                    ? "예정"
                    : "종료";

                const statusClass =
                  currentStatus === "휴가 중"
                    ? "bg-green-100 text-green-700 hover:bg-green-100"
                    : currentStatus === "예정"
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-100";

                const employee = employees.find(
                  (emp) => emp.id === vacation.employeeId
                );

                return (
                  <div
                    key={vacation.id}
                    className={cn(
                      "p-4 border rounded-lg transition-colors",
                      darkInnerCardClass
                    )}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          <span className="font-semibold text-gray-900">
                            {vacation.employeeName}
                          </span>

                          <Badge className={statusClass}>{currentStatus}</Badge>

                          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                            {vacation.type}
                          </Badge>

                          {employee?.department && (
                            <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                              {employee.department}
                            </Badge>
                          )}
                        </div>

                        <div className="text-sm text-gray-700 mb-1">
                          휴가 기간: {vacation.startDate} ~ {vacation.endDate} (
                          {vacation.days}일)
                        </div>

                        <div className="text-sm text-gray-600 mb-1">
                          사유: {vacation.reason}
                        </div>

                        <div className="text-xs text-gray-500">
                          신청일: {vacation.requestDate}
                          {vacation.approver &&
                            ` · 승인자: ${vacation.approver}`}
                        </div>
                      </div>

                      <div className="text-sm text-gray-500">
                        {currentStatus === "휴가 중"
                          ? `${vacation.endDate}까지`
                          : currentStatus === "예정"
                          ? `${vacation.startDate} 시작`
                          : "휴가 종료"}
                      </div>
                    </div>
                  </div>
                );
              })}

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    이전
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        size="sm"
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => handlePageChange(page)}
                        className={
                          currentPage === page
                            ? "bg-blue-600 hover:bg-blue-700"
                            : ""
                        }
                      >
                        {page}
                      </Button>
                    )
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    다음
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}