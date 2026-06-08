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
import { cn } from "@/components/UI/utils";

export default function VacationListPage() {
  const {
    isDark,
    canApproveVacation,
    currentUser,
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
    apiApproveVacation,
    apiRejectVacation,
    apiCancelVacation,
    isVacationLoading,
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

  const currentUserId = currentUser?.userId || currentUser?.id;

  const cardClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "bg-white border-gray-200";

  const innerCardClass = isDark
    ? "p-4 border border-[#5c5c73] rounded-lg bg-[#2f2f36] hover:bg-[#3f3f48] transition-colors"
    : "p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors";

  const inputClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white placeholder:text-zinc-400"
    : "";

  const selectContentClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "";

  const outlineButtonClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white hover:bg-[#48484f]"
    : "";

  const activePageButtonClass = isDark
    ? "bg-[#5c5c73] hover:bg-[#6a6a82] text-white"
    : "";

  const textMain = isDark ? "text-white" : "text-gray-900";
  const textSub = isDark ? "text-zinc-300" : "text-gray-600";
  const textMuted = isDark ? "text-zinc-400" : "text-gray-500";

  const approveButtonClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-green-300 hover:bg-green-500/15 hover:text-green-200"
    : "text-green-600 hover:text-green-700 hover:bg-green-50";

  const rejectButtonClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-red-300 hover:bg-red-500/15 hover:text-red-200"
    : "text-red-600 hover:text-red-700 hover:bg-red-50";

  const cancelButtonClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-red-300 hover:bg-red-500/15 hover:text-red-200"
    : "text-red-600 hover:text-red-700 hover:bg-red-50";

  return (
    <div className="space-y-6">
      {canApproveVacation && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={cardClass}>
            <CardContent className="p-5">
              <div className={cn("text-sm", textSub)}>전체 신청</div>
              <div className={cn("text-3xl font-bold", textMain)}>
                {visibleVacationRequests.length}
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardContent className="p-5">
              <div className={cn("text-sm", textSub)}>대기</div>
              <div
                className={cn(
                  "text-3xl font-bold",
                  isDark ? "text-yellow-300" : "text-yellow-600"
                )}
              >
                {visibleVacationRequests.filter((v) => v.status === "대기").length}
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardContent className="p-5">
              <div className={cn("text-sm", textSub)}>승인</div>
              <div
                className={cn(
                  "text-3xl font-bold",
                  isDark ? "text-green-300" : "text-green-600"
                )}
              >
                {visibleVacationRequests.filter((v) => v.status === "승인").length}
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardContent className="p-5">
              <div className={cn("text-sm", textSub)}>반려</div>
              <div
                className={cn(
                  "text-3xl font-bold",
                  isDark ? "text-red-300" : "text-red-600"
                )}
              >
                {visibleVacationRequests.filter((v) => v.status === "반려").length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className={cardClass}>
        <CardHeader className={isDark ? "border-b border-[#5c5c73]" : ""}>
          <CardTitle className="flex items-center justify-between">
            <span className={cn("flex items-center gap-2", textMain)}>
              <CalendarIcon className="size-5" />
              {canApproveVacation ? "휴가 신청 내역 및 승인" : "휴가 신청 내역"}
            </span>

            <span className={cn("text-sm font-normal", textSub)}>
              총 {filteredVacationRequests.length}건
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 size-4",
                  isDark ? "text-zinc-400" : "text-gray-400"
                )}
              />

              <Input
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="이름, 휴가유형, 사유로 검색"
                className={cn("pl-9", inputClass)}
              />
            </div>

            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>

                <SelectContent className={selectContentClass}>
                  <SelectItem value="전체">전체</SelectItem>
                  <SelectItem value="대기">대기</SelectItem>
                  <SelectItem value="승인">승인</SelectItem>
                  <SelectItem value="반려">반려</SelectItem>
                  <SelectItem value="취소">취소</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isVacationLoading ? (
            <div className={cn("text-center py-12", textMuted)}>
              휴가 신청 내역을 불러오는 중입니다.
            </div>
          ) : filteredVacationRequests.length === 0 ? (
            <div className={cn("text-center py-12", textMuted)}>
              <CalendarIcon
                className={cn(
                  "size-12 mx-auto mb-3",
                  isDark ? "text-zinc-600" : "text-gray-400"
                )}
              />
              <p>조건에 맞는 휴가 신청 내역이 없습니다</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedVacationRequests.map((vacation) => (
                  <div key={vacation.id} className={innerCardClass}>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          <span className={cn("font-semibold", textMain)}>
                            {vacation.type}
                          </span>

                          {getStatusBadge(vacation.status)}

                          <span className={cn("text-sm", textSub)}>
                            {vacation.employeeName}
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
                          사유: {vacation.reason}
                        </div>

                        <div className={cn("text-xs", textMuted)}>
                          신청일: {vacation.requestDate || "-"}
                          {vacation.approver &&
                            ` · 처리자: ${vacation.approver}`}
                        </div>
                      </div>

                      {(vacation.status === "대기" ||
                        vacation.status === "승인") && (
                        <div className="flex gap-2">
                          {canApproveVacation && vacation.status === "대기" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  await apiApproveVacation(vacation.id);
                                }}
                                className={approveButtonClass}
                              >
                                <CheckCircle2 className="size-4 mr-1" />
                                승인
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  await apiRejectVacation(vacation.id);
                                }}
                                className={rejectButtonClass}
                              >
                                <XCircle className="size-4 mr-1" />
                                반려
                              </Button>
                            </>
                          )}

                          {String(vacation.employeeId) === String(currentUserId) &&
                            !canApproveVacation && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  await apiCancelVacation(vacation.id);

                                  if (
                                    paginatedVacationRequests.length === 1 &&
                                    currentPage > 1
                                  ) {
                                    setCurrentPage(currentPage - 1);
                                  }
                                }}
                                className={cancelButtonClass}
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
                    className={outlineButtonClass}
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
                        className={cn(
                          "min-w-9",
                          currentPage === page
                            ? activePageButtonClass
                            : outlineButtonClass
                        )}
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
                    className={outlineButtonClass}
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