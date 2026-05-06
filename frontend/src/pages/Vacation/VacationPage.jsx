import { useEffect, useMemo, useState } from "react";
import { Calendar as CalendarIcon, Search, X, Check, CheckCircle2, XCircle, } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Textarea } from "@/components/UI/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/UI/select";
import { Badge } from "@/components/UI/badge";
import { Calendar as CalendarComp } from "@/components/UI/calendar";
import { useAppContext } from "@/store/AppProvider";
import { cn } from "@/components/UI/utils";
export function VacationPage() {
    const { vacationRequests, addVacationRequest, cancelVacation, approveVacation, rejectVacation, currentUser, employees, getVacationBalance, calendarEvents, } = useAppContext();
    const isHrAdmin = currentUser?.department === "인사팀";

    const isManager =
      !!currentUser &&
      (
        currentUser.role === "팀장" ||
        currentUser.role === "최고관리자" ||
        currentUser.department === "인사팀"
      );

    const canViewVacationStatus =
      !!currentUser &&
      (
        currentUser.role === "팀장" ||
        currentUser.role === "최고관리자" ||
        currentUser.department === "인사팀"
      );
    const [viewMode, setViewMode] = useState(isHrAdmin ? "list" : "info");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [formData, setFormData] = useState({
        type: "",
        startDate: "",
        endDate: "",
        reason: "",
        days: 0,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState("전체");
    const [statusSearchKeyword, setStatusSearchKeyword] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("전체");
    const [showCurrentOnly, setShowCurrentOnly] = useState(false);
    const [statusSortOption, setStatusSortOption] = useState("startAsc");
    const itemsPerPage = 5;
    const visibleVacationRequests = useMemo(() => {
        return vacationRequests.filter((vacation) => {
            if (currentUser?.role === "최고관리자" || isHrAdmin)
                return true;
            if (currentUser?.role === "팀장") {
                const employee = employees.find((emp) => emp.id === vacation.employeeId);
                return (!!employee &&
                    (employee.department === currentUser.department ||
                        vacation.employeeId === currentUser.id));
            }
            return vacation.employeeId === currentUser?.id;
        });
    }, [vacationRequests, currentUser, employees, isHrAdmin]);
    const filteredVacationRequests = useMemo(() => {
        const keyword = searchKeyword.trim().toLowerCase();
        return visibleVacationRequests.filter((vacation) => {
            const matchesStatus = statusFilter === "전체" ? true : vacation.status === statusFilter;
            const matchesKeyword = keyword === ""
                ? true
                : vacation.employeeName.toLowerCase().includes(keyword) ||
                    vacation.type.toLowerCase().includes(keyword) ||
                    vacation.reason.toLowerCase().includes(keyword);
            return matchesStatus && matchesKeyword;
        });
    }, [visibleVacationRequests, searchKeyword, statusFilter]);
    const visibleApprovedVacations = vacationRequests.filter((vacation) => {
      if (vacation.status !== "승인") return false;

      if (currentUser?.role === "최고관리자") return true;

      if (currentUser?.department === "인사팀") return true;

      if (currentUser?.role === "팀장") {
        const employee = employees.find((emp) => emp.id === vacation.employeeId);
        return !!employee && employee.department === currentUser.department;
      }

      return vacation.employeeId === currentUser?.id;
    });
    const vacationStatusList = useMemo(() => {
        return [...visibleApprovedVacations].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }, [visibleApprovedVacations]);
    const vacationBalance = currentUser
        ? getVacationBalance(currentUser.id)
        : { total: 15, used: 0, remaining: 15 };
    const totalItems = filteredVacationRequests.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedVacationRequests = filteredVacationRequests.slice(startIndex, startIndex + itemsPerPage);
    useEffect(() => {
        setCurrentPage(1);
    }, [searchKeyword, statusFilter, viewMode]);
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);
    const calculateDays = (start, end) => {
        if (!start || !end)
            return 0;
        const startDate = new Date(start);
        const endDate = new Date(end);
        return (Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    };
    const handleDateChange = (field, value) => {
        const next = { ...formData, [field]: value };
        next.days = calculateDays(next.startDate, next.endDate);
        setFormData(next);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.type ||
            !formData.startDate ||
            !formData.endDate ||
            !formData.reason) {
            alert("모든 항목을 입력해주세요.");
            return;
        }
        addVacationRequest({ ...formData });
        alert("휴가 신청이 제출되었습니다.");
        setViewMode("list");
        setCurrentPage(1);
        setFormData({
            type: "",
            startDate: "",
            endDate: "",
            reason: "",
            days: 0,
        });
    };
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    const getStatusBadge = (status) => {
        const map = {
            승인: "bg-green-100 text-green-700 hover:bg-green-100",
            대기: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
            반려: "bg-red-100 text-red-700 hover:bg-red-100",
        };
        return <Badge className={map[status] || map["대기"]}>{status}</Badge>;
    };
    const datesWithEvents = Array.from(new Set([
        ...calendarEvents
            .filter((event) => event.type !== "공휴일")
            .map((event) => event.date),
        ...visibleApprovedVacations.flatMap((vacation) => {
            const result = [];
            const cur = new Date(vacation.startDate);
            const end = new Date(vacation.endDate);
            while (cur <= end) {
                result.push(cur.toISOString().split("T")[0]);
                cur.setDate(cur.getDate() + 1);
            }
            return result;
        }),
    ])).map((dateStr) => {
        const [y, m, d] = dateStr.split("-").map(Number);
        return new Date(y, m - 1, d);
    });
    const holidayDates = calendarEvents
        .filter((event) => event.type === "공휴일")
        .map((event) => {
        const [y, m, d] = event.date.split("-").map(Number);
        return new Date(y, m - 1, d);
    });
    const selectedDateData = (() => {
        if (!selectedDate)
            return { events: [], vacations: [] };
        const y = selectedDate.getFullYear();
        const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const d = String(selectedDate.getDate()).padStart(2, "0");
        const dateStr = `${y}-${m}-${d}`;
        return {
            events: calendarEvents.filter((event) => event.date === dateStr),
            vacations: visibleApprovedVacations.filter((v) => v.startDate <= dateStr && v.endDate >= dateStr),
        };
    })();
    const today = new Date().toISOString().split("T")[0];
    const departmentOptions = [
        "전체",
        ...Array.from(new Set(employees.map((employee) => employee.department))),
    ];
    const filteredVacationStatusList = vacationStatusList.filter((vacation) => {
        const keyword = statusSearchKeyword.trim().toLowerCase();
        const employee = employees.find((emp) => emp.id === vacation.employeeId);
        const department = employee?.department || "";
        const matchesKeyword = keyword === ""
            ? true
            : vacation.employeeName.toLowerCase().includes(keyword) ||
                vacation.type.toLowerCase().includes(keyword) ||
                vacation.reason.toLowerCase().includes(keyword);
        const matchesDepartment = selectedDepartment === "전체" ? true : department === selectedDepartment;
        const vacationStart = new Date(vacation.startDate);
        const vacationEnd = new Date(vacation.endDate);
        const matchesCurrentOnly = showCurrentOnly
            ? vacation.startDate <= today && vacation.endDate >= today
            : true;
        return matchesKeyword && matchesDepartment && matchesCurrentOnly;
    });
    const sortedVacationStatusList = [...filteredVacationStatusList].sort((a, b) => {
        switch (statusSortOption) {
            case "startAsc":
                return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
            case "startDesc":
                return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
            case "endAsc":
                return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
            case "nameAsc":
                return a.employeeName.localeCompare(b.employeeName, "ko");
            default:
                return 0;
        }
    });
    const filteredOngoingVacationCount = filteredVacationStatusList.filter((vacation) => vacation.startDate <= today && vacation.endDate >= today).length;
    const filteredUpcomingVacationCount = filteredVacationStatusList.filter((vacation) => vacation.startDate > today).length;
    return (<div className="flex h-full">
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {canViewVacationStatus ? "휴가 관리 / 현황" : "휴가 관리"}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {isHrAdmin ? "부서별 휴가 승인 및 반려" : "Vacation Management"}
          </p>
        </div>

        <div className="flex-1 p-3 space-y-2">
          {!isHrAdmin && (<button onClick={() => setViewMode("info")} className={cn("w-full text-left px-4 py-3 rounded-lg transition-colors text-sm font-medium", viewMode === "info"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-50")}>
              내 휴가 정보
            </button>)}

          {!isHrAdmin && (<button onClick={() => setViewMode("request")} className={cn("w-full text-left px-4 py-3 rounded-lg transition-colors text-sm font-medium", viewMode === "request"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-50")}>
              휴가 신청하기
            </button>)}

          <button onClick={() => {
            setViewMode("list");
            setCurrentPage(1);
        }} className={cn("w-full text-left px-4 py-3 rounded-lg transition-colors text-sm font-medium", viewMode === "list"
            ? "bg-blue-50 text-blue-700"
            : "text-gray-700 hover:bg-gray-50")}>
            {isHrAdmin ? "휴가 승인/반려" : "신청 휴가 목록"}
          </button>

          {canViewVacationStatus && (
            <button
              onClick={() => setViewMode("status")}
              className={cn(
                "w-full text-left px-4 py-3 rounded-lg transition-colors text-sm font-medium",
                viewMode === "status"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50",
              )}
            >
              휴가 현황
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {viewMode === "info" && "[ 내 휴가 정보 ]"}
            {viewMode === "request" && "[ 휴가 신청하기 ]"}
            {viewMode === "list" &&
            (isHrAdmin ? "[ 휴가 승인 및 반려 ]" : "[ 신청 휴가 목록 ]")}
            {viewMode === "status" && isHrAdmin && "[ 휴가 현황 ]"}
          </h2>
        </div>

        {viewMode === "info" && !isHrAdmin && (<div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-gray-600 mb-2">총 휴가</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {vacationBalance.total}일
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-gray-600 mb-2">사용</div>
                  <div className="text-3xl font-bold text-orange-600">
                    {vacationBalance.used}일
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-gray-600 mb-2">잔여</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {vacationBalance.remaining}일
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="size-5"/>
                  캘린더
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 flex justify-center p-4">
                    <CalendarComp mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-md border text-base" datesWithEvents={datesWithEvents} holidayDates={holidayDates}/>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">선택한 날짜 일정</h3>

                    {selectedDateData.events.map((event) => (<div key={event.id} className="p-3 bg-white border rounded-lg text-sm">
                        {event.title}
                      </div>))}

                    {selectedDateData.vacations.map((vacation) => (<div key={vacation.id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm">
                        {vacation.employeeName} · {vacation.type}
                      </div>))}

                    {selectedDateData.events.length === 0 &&
                selectedDateData.vacations.length === 0 && (<div className="text-sm text-gray-500 py-8 text-center">
                          일정이 없습니다
                        </div>)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>)}

        {viewMode === "request" && !isHrAdmin && (<Card>
            <CardHeader>
              <CardTitle>휴가 신청서</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">휴가 유형 *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="휴가 유형 선택"/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="연차">연차</SelectItem>
                        <SelectItem value="반차">반차</SelectItem>
                        <SelectItem value="병가">병가</SelectItem>
                        <SelectItem value="경조사">경조사</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>신청 기간</Label>
                    <div className="h-10 flex items-center px-3 border border-gray-300 rounded-md bg-gray-50">
                      <span className="text-lg font-semibold text-blue-600">
                        {formData.days > 0 ? `${formData.days}일` : "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">시작일 *</Label>
                    <Input id="startDate" type="date" value={formData.startDate} onChange={(e) => handleDateChange("startDate", e.target.value)} required/>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">종료일 *</Label>
                    <Input id="endDate" type="date" value={formData.endDate} onChange={(e) => handleDateChange("endDate", e.target.value)} required/>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">사유 *</Label>
                  <Textarea id="reason" placeholder="휴가 사유를 입력하세요" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} rows={4} required/>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    <Check className="size-4 mr-2"/>
                    신청하기
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setFormData({
                type: "",
                startDate: "",
                endDate: "",
                reason: "",
                days: 0,
            })}>
                    <X className="size-4 mr-2"/>
                    초기화
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>)}

        {viewMode === "list" && (<div className="space-y-6">
            {isHrAdmin && (<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-5">
                    <div className="text-sm text-gray-600">전체 신청</div>
                    <div className="text-3xl font-bold text-gray-900">
                      {visibleVacationRequests.length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <div className="text-sm text-gray-600">대기</div>
                    <div className="text-3xl font-bold text-yellow-600">
                      {visibleVacationRequests.filter((v) => v.status === "대기").length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <div className="text-sm text-gray-600">승인</div>
                    <div className="text-3xl font-bold text-green-600">
                      {visibleVacationRequests.filter((v) => v.status === "승인").length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <div className="text-sm text-gray-600">반려</div>
                    <div className="text-3xl font-bold text-red-600">
                      {visibleVacationRequests.filter((v) => v.status === "반려").length}
                    </div>
                  </CardContent>
                </Card>
              </div>)}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CalendarIcon className="size-5"/>
                    {isHrAdmin ? "휴가 신청 내역 및 승인" : "휴가 신청 내역"}
                  </span>
                  <span className="text-sm font-normal text-gray-600">
                    총 {filteredVacationRequests.length}건
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400"/>
                    <Input value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} placeholder="이름, 휴가유형, 사유로 검색" className="pl-9"/>
                  </div>

                  <div className="w-full md:w-48">
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="상태 선택"/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="전체">전체</SelectItem>
                        <SelectItem value="대기">대기</SelectItem>
                        <SelectItem value="승인">승인</SelectItem>
                        <SelectItem value="반려">반려</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {filteredVacationRequests.length === 0 ? (<div className="text-center py-12 text-gray-500">
                    <CalendarIcon className="size-12 mx-auto mb-3 text-gray-400"/>
                    <p>조건에 맞는 휴가 신청 내역이 없습니다</p>
                  </div>) : (<>
                    <div className="space-y-3">
                      {paginatedVacationRequests.map((vacation) => (<div key={vacation.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center flex-wrap gap-2 mb-2">
                                <span className="font-semibold text-gray-900">
                                  {vacation.type}
                                </span>
                                {getStatusBadge(vacation.status)}
                                <span className="text-sm text-gray-600">
                                  {vacation.employeeName}
                                </span>
                              </div>

                              <div className="text-sm text-gray-600 mb-1">
                                {vacation.startDate} ~ {vacation.endDate} ({vacation.days}일)
                              </div>

                              <div className="text-sm text-gray-700 mb-1">
                                사유: {vacation.reason}
                              </div>

                              <div className="text-xs text-gray-500">
                                신청일: {vacation.requestDate}
                                {vacation.approver && ` · 처리자: ${vacation.approver}`}
                              </div>
                            </div>

                            {vacation.status === "대기" && (<div className="flex gap-2">
                                {isManager && (<>
                                    <Button variant="outline" size="sm" onClick={() => currentUser &&
                                (approveVacation(vacation.id, currentUser.name),
                                    alert("휴가를 승인했습니다."))} className="text-green-600 hover:text-green-700 hover:bg-green-50">
                                      <CheckCircle2 className="size-4 mr-1"/>
                                      승인
                                    </Button>

                                    <Button variant="outline" size="sm" onClick={() => currentUser &&
                                (rejectVacation(vacation.id, currentUser.name),
                                    alert("휴가를 반려했습니다."))} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                      <XCircle className="size-4 mr-1"/>
                                      반려
                                    </Button>
                                  </>)}

                                {vacation.employeeId === currentUser?.id && !isManager && (<Button variant="outline" size="sm" onClick={() => {
                                cancelVacation(vacation.id);
                                alert("휴가 신청을 취소했습니다.");
                                if (paginatedVacationRequests.length === 1 &&
                                    currentPage > 1) {
                                    setCurrentPage(currentPage - 1);
                                }
                            }} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                    취소
                                  </Button>)}
                              </div>)}
                          </div>
                        </div>))}
                    </div>

                    {totalPages > 1 && (<div className="flex items-center justify-center gap-2 pt-6">
                        <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
                          이전
                        </Button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (<Button key={page} size="sm" variant={currentPage === page ? "default" : "outline"} onClick={() => handlePageChange(page)} className="min-w-9">
                              {page}
                            </Button>))}

                        <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>
                          다음
                        </Button>
                      </div>)}
                  </>)}
              </CardContent>
            </Card>
          </div>)}

        {viewMode === "status" && canViewVacationStatus && (<div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-5">
                  <div className="text-sm text-gray-600">승인된 휴가</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {filteredVacationStatusList.length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="text-sm text-gray-600">오늘 휴가 중</div>
                  <div className="text-3xl font-bold text-green-600">
                    {filteredOngoingVacationCount}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="text-sm text-gray-600">예정된 휴가</div>
                  <div className="text-3xl font-bold text-orange-600">
                    {filteredUpcomingVacationCount}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CalendarIcon className="size-5"/>
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
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400"/>
                    <Input value={statusSearchKeyword} onChange={(e) => setStatusSearchKeyword(e.target.value)} placeholder="이름, 휴가유형, 사유로 검색" className="pl-9"/>
                  </div>

                  <div className="w-full lg:w-48">
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger>
                        <SelectValue placeholder="부서 선택"/>
                      </SelectTrigger>
                      <SelectContent>
                        {departmentOptions.map((department) => (<SelectItem key={department} value={department}>
                            {department}
                          </SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full lg:w-48">
                    <Select value={statusSortOption} onValueChange={(value) => setStatusSortOption(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="정렬 선택"/>
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
                    <input type="checkbox" checked={showCurrentOnly} onChange={(e) => setShowCurrentOnly(e.target.checked)}/>
                    현재 휴가 중만 보기
                  </label>
                </div>

                {sortedVacationStatusList.length === 0 ? (<div className="text-center py-12 text-gray-500">
                    <CalendarIcon className="size-12 mx-auto mb-3 text-gray-400"/>
                    <p>조건에 맞는 휴가 현황이 없습니다</p>
                  </div>) : (<div className="space-y-3">
                    {sortedVacationStatusList.map((vacation) => {
                    const currentStatus = vacation.startDate <= today && vacation.endDate >= today
                        ? "휴가 중"
                        : vacation.startDate > today
                            ? "예정"
                            : "종료";
                    const statusClass = currentStatus === "휴가 중"
                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                        : currentStatus === "예정"
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-100";
                    const employee = employees.find((emp) => emp.id === vacation.employeeId);
                    return (<div key={vacation.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
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
                                {employee?.department && (<Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                                    {employee.department}
                                  </Badge>)}
                              </div>

                              <div className="text-sm text-gray-700 mb-1">
                                휴가 기간: {vacation.startDate} ~ {vacation.endDate} ({vacation.days}일)
                              </div>

                              <div className="text-sm text-gray-600 mb-1">
                                사유: {vacation.reason}
                              </div>

                              <div className="text-xs text-gray-500">
                                신청일: {vacation.requestDate}
                                {vacation.approver && ` · 승인자: ${vacation.approver}`}
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
                        </div>);
                })}
                  </div>)}
              </CardContent>
            </Card>
          </div>)}
      </div>
    </div>);
}
