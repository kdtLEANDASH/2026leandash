import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  Search,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";

export default function VacationListPage() {
  const {
    isHrAdmin,
    isManager,
    currentUser,
    cancelVacation,
    approveVacation,
    rejectVacation,
    visibleVacationRequests,
    filteredVacationRequests,
    currentPage,
    setCurrentPage,
    searchKeyword,
    setSearchKeyword,
    statusFilter,
    setStatusFilter,
    itemsPerPage,
    getStatusBadge,
  } = useOutletContext();

  const totalItems = filteredVacationRequests.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedVacationRequests = filteredVacationRequests.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, statusFilter, setCurrentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages, setCurrentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      {isHrAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CalendarIcon className="size-5" />
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="이름, 휴가유형, 사유로 검색"
                className="pl-9"
              />
            </div>

            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="상태 선택" />
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

          {filteredVacationRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <CalendarIcon className="size-12 mx-auto mb-3 text-gray-400" />
              <p>조건에 맞는 휴가 신청 내역이 없습니다</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedVacationRequests.map((vacation) => (
                  <div
                    key={vacation.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
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
                          {vacation.startDate} ~ {vacation.endDate} (
                          {vacation.days}일)
                        </div>

                        <div className="text-sm text-gray-700 mb-1">
                          사유: {vacation.reason}
                        </div>

                        <div className="text-xs text-gray-500">
                          신청일: {vacation.requestDate}
                          {vacation.approver && ` · 처리자: ${vacation.approver}`}
                        </div>
                      </div>

                      {vacation.status === "대기" && (
                        <div className="flex gap-2">
                          {isManager && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  currentUser &&
                                  (approveVacation(vacation.id, currentUser.name),
                                  alert("휴가를 승인했습니다."))
                                }
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle2 className="size-4 mr-1" />
                                승인
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  currentUser &&
                                  (rejectVacation(vacation.id, currentUser.name),
                                  alert("휴가를 반려했습니다."))
                                }
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <XCircle className="size-4 mr-1" />
                                반려
                              </Button>
                            </>
                          )}

                          {vacation.employeeId === currentUser?.id && !isManager && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                cancelVacation(vacation.id);
                                alert("휴가 신청을 취소했습니다.");

                                if (
                                  paginatedVacationRequests.length === 1 &&
                                  currentPage > 1
                                ) {
                                  setCurrentPage(currentPage - 1);
                                }
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              취소
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
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
                        className="min-w-9"
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}