import { useEffect, useMemo, useState } from "react";
import { CheckCircle, Clock, FileText, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Badge } from "@/components/UI/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/UI/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";
import { useAppContext } from "@/store/AppProvider";
import { cn } from "@/components/UI/utils";
import {
  downloadApprovalAttachmentApi,
  approveApprovalApi,
  getDepartmentApprovalApi,
  getDepartmentApprovalsApi,
  rejectApprovalApi,
} from "@/api/approvalApi";

const STATUS_COLORS = {
  대기중: "bg-orange-100 text-orange-700 hover:bg-orange-100",
  승인: "bg-green-100 text-green-700 hover:bg-green-100",
  반려: "bg-red-100 text-red-700 hover:bg-red-100",
};

const TYPE_COLORS = {
  지출결재: "text-purple-600",
  휴가결재: "text-blue-600",
  업무결재: "text-green-600",
  기타: "text-gray-600",
};

function unwrapResponse(result) {
  if (Array.isArray(result)) return result;
  return result?.data ?? result ?? null;
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toISOString().slice(0, 10);
}

function toListItem(item) {
  return {
    id: item.approvalId,
    title: item.title,
    type: item.approvalType,
    requester: item.userName ?? "-",
    date: formatDate(item.createdAt),
    status: item.status,
    amount: item.amount ?? null,
    description: item.content ?? "",
  };
}

function toDetail(item) {
  return {
    id: item.approvalId,
    title: item.title,
    type: item.approvalType,
    requester: item.userName ?? "-",
    departmentName: item.departmentName ?? "-",
    date: formatDate(item.createdAt),
    status: item.status,
    amount: item.amount ?? null,
    description: item.content ?? "",
    attachments: item.attachments ?? [],
    rejectReason: item.rejectReason ?? "",
  };
}

export function ApprovalPage() {
  const { customSettings } = useAppContext() || {};
  const isDark = customSettings?.darkMode;

  const [approvals, setApprovals] = useState([]);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const cardClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "bg-white border-gray-200";

  const requestCardClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white hover:bg-[#3f3f48]"
    : "bg-white border-gray-200 hover:shadow-lg";

  const innerBoxClass = isDark
    ? "bg-[#2f2f36] border border-[#5c5c73] text-zinc-200"
    : "bg-gray-50 text-gray-700";

  const modalClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "";

  const modalInnerClass = isDark
    ? "bg-[#2f2f36] border border-[#5c5c73] text-zinc-200"
    : "bg-gray-50 text-gray-700";

  const textMain = isDark ? "text-white" : "text-gray-900";
  const textSub = isDark ? "text-zinc-300" : "text-gray-600";
  const textMuted = isDark ? "text-zinc-400" : "text-gray-500";

  const tabsListClass = isDark
    ? "bg-[#2f2f36] border border-[#5c5c73]"
    : "";

  const tabsTriggerClass = isDark
    ? "text-zinc-300 data-[state=active]:bg-[#5c5c73] data-[state=active]:text-white"
    : "";

  const outlineButtonClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white hover:bg-[#48484f]"
    : "";

  const approveButtonClass = isDark
    ? "bg-green-700 hover:bg-green-800 text-white"
    : "bg-green-600 hover:bg-green-700 text-white";

  const rejectButtonClass = isDark
    ? "border-red-400 text-red-300 hover:bg-red-950"
    : "text-red-600 hover:text-red-700 hover:bg-red-50";

  const loadDepartmentApprovals = async () => {
    try {
      setIsLoading(true);

      const result = await getDepartmentApprovalsApi();
      const list = unwrapResponse(result) ?? [];

      setApprovals(list.map(toListItem));
    } catch (error) {
      console.error("부서 결재 목록 조회 실패:", error);
      alert("부서 결재 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDepartmentApprovals();
  }, []);

  const pendingApprovals = useMemo(
    () => approvals.filter((approval) => approval.status === "대기중"),
    [approvals]
  );

  const processedApprovals = useMemo(
    () => approvals.filter((approval) => approval.status !== "대기중"),
    [approvals]
  );

  const approvedCount = approvals.filter(
    (approval) => approval.status === "승인"
  ).length;

  const rejectedCount = approvals.filter(
    (approval) => approval.status === "반려"
  ).length;

  const getStatusBadge = (status) => {
    const configs = {
      대기중: { icon: Clock, className: STATUS_COLORS["대기중"] },
      승인: { icon: CheckCircle, className: STATUS_COLORS["승인"] },
      반려: { icon: XCircle, className: STATUS_COLORS["반려"] },
    };

    const config = configs[status] ?? {
      icon: FileText,
      className: "bg-gray-100 text-gray-700 hover:bg-gray-100",
    };

    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="size-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const openDetail = async (approvalId) => {
    try {
      const result = await getDepartmentApprovalApi(approvalId);
      const detail = unwrapResponse(result);

      setSelectedApproval(toDetail(detail));
    } catch (error) {
      console.error("결재 상세 조회 실패:", error);
      alert("결재 상세 정보를 불러오지 못했습니다.");
    }
  };

  const refreshSelectedApproval = async (approvalId) => {
    const result = await getDepartmentApprovalApi(approvalId);
    setSelectedApproval(toDetail(unwrapResponse(result)));
  };

  const handleApprove = async (approvalId) => {
    try {
      setIsProcessing(true);

      await approveApprovalApi(approvalId, {});
      await loadDepartmentApprovals();

      if (selectedApproval?.id === approvalId) {
        await refreshSelectedApproval(approvalId);
      }
    } catch (error) {
      console.error("결재 승인 실패:", error);
      alert("결재 승인에 실패했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (approvalId) => {
    const rejectReason = window.prompt("반려 사유를 입력해주세요.");

    if (!rejectReason || !rejectReason.trim()) {
      return;
    }

    try {
      setIsProcessing(true);

      await rejectApprovalApi(approvalId, {
        rejectReason: rejectReason.trim(),
      });

      await loadDepartmentApprovals();

      if (selectedApproval?.id === approvalId) {
        await refreshSelectedApproval(approvalId);
      }
    } catch (error) {
      console.error("결재 반려 실패:", error);
      alert("결재 반려에 실패했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadAttachment = async (attachment) => {
    try {
      await downloadApprovalAttachmentApi(
        attachment.downloadUrl,
        attachment.fileName
      );
    } catch (error) {
      console.error("첨부파일 다운로드 실패:", error);
      alert("첨부파일 다운로드에 실패했습니다.");
    }
  };

  const renderApprovalCard = (approval, showActions) => (
    <Card
      key={approval.id}
      className={cn("transition-all", requestCardClass)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4 gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className={cn("text-lg font-semibold", textMain)}>
                {approval.title}
              </h3>

              {getStatusBadge(approval.status)}
            </div>

            <div className={cn("flex items-center gap-4 text-sm", textSub)}>
              <span
                className={cn(
                  "font-medium",
                  TYPE_COLORS[approval.type] ?? "text-gray-600"
                )}
              >
                {approval.type}
              </span>
              <span>신청자: {approval.requester}</span>
              <span>{approval.date}</span>
            </div>
          </div>

          {approval.amount ? (
            <div className="text-right">
              <div className={cn("text-sm", textSub)}>금액</div>
              <div
                className={cn(
                  "text-lg font-semibold",
                  isDark ? "text-blue-300" : "text-blue-600"
                )}
              >
                {approval.amount.toLocaleString()}원
              </div>
            </div>
          ) : null}
        </div>

        <p className={cn("text-sm mb-4 p-3 rounded", innerBoxClass)}>
          {approval.description}
        </p>

        <div className="flex gap-3">
          {showActions ? (
            <>
              <Button
                className={approveButtonClass}
                disabled={isProcessing}
                onClick={() => handleApprove(approval.id)}
              >
                <CheckCircle className="size-4 mr-2" />
                승인
              </Button>

              <Button
                variant="outline"
                className={rejectButtonClass}
                disabled={isProcessing}
                onClick={() => handleReject(approval.id)}
              >
                <XCircle className="size-4 mr-2" />
                반려
              </Button>
            </>
          ) : null}

          <Button
            variant="outline"
            onClick={() => openDetail(approval.id)}
            className={outlineButtonClass}
          >
            상세보기
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className={cn("text-2xl font-semibold mb-1", textMain)}>
            전자 결재
          </h2>
          <p className={textSub}>부서 결재 요청을 확인하고 처리하세요</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className={cardClass}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className={cn("text-sm mb-1", textSub)}>대기중</div>
                <div className="text-2xl font-semibold text-orange-600">
                  {pendingApprovals.length}
                </div>
              </div>
              <Clock className="size-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className={cn("text-sm mb-1", textSub)}>승인 완료</div>
                <div className="text-2xl font-semibold text-green-600">
                  {approvedCount}
                </div>
              </div>
              <CheckCircle className="size-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className={cn("text-sm mb-1", textSub)}>반려</div>
                <div className="text-2xl font-semibold text-red-600">
                  {rejectedCount}
                </div>
              </div>
              <XCircle className="size-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className={cn("text-sm mb-1", textSub)}>전체</div>
                <div className="text-2xl font-semibold text-blue-600">
                  {approvals.length}
                </div>
              </div>
              <FileText className="size-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className={tabsListClass}>
          <TabsTrigger value="pending" className={tabsTriggerClass}>
            결재 대기 ({pendingApprovals.length})
          </TabsTrigger>

          <TabsTrigger value="processed" className={tabsTriggerClass}>
            처리 내역 ({processedApprovals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="space-y-4">
            {pendingApprovals.map((approval) =>
              renderApprovalCard(approval, true)
            )}

            {isLoading ? (
              <div className={cn("text-center py-10", textMuted)}>
                결재 목록을 불러오는 중입니다...
              </div>
            ) : null}

            {!isLoading && pendingApprovals.length === 0 ? (
              <div className={cn("text-center py-10", textMuted)}>
                현재 처리할 결재가 없습니다.
              </div>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="processed">
          <div className="space-y-4">
            {processedApprovals.map((approval) =>
              renderApprovalCard(approval, false)
            )}

            {isLoading ? (
              <div className={cn("text-center py-10", textMuted)}>
                결재 목록을 불러오는 중입니다...
              </div>
            ) : null}

            {!isLoading && processedApprovals.length === 0 ? (
              <div className={cn("text-center py-10", textMuted)}>
                처리된 결재가 없습니다.
              </div>
            ) : null}
          </div>
        </TabsContent>
      </Tabs>

      {selectedApproval && (
        <Dialog
          open={!!selectedApproval}
          onOpenChange={() => setSelectedApproval(null)}
        >
          <DialogContent
            className={cn("max-w-3xl max-h-[80vh] overflow-y-auto", modalClass)}
          >
            <DialogHeader>
              <DialogTitle className={cn("text-2xl", textMain)}>
                {selectedApproval.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5">
              <div className={cn("flex flex-wrap items-center gap-3 text-sm", textSub)}>
                {getStatusBadge(selectedApproval.status)}

                <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                  {selectedApproval.type}
                </Badge>

                <span>{selectedApproval.requester}</span>
                <span>{selectedApproval.departmentName}</span>
                <span>{selectedApproval.date}</span>
              </div>

              {selectedApproval.amount ? (
                <div
                  className={cn(
                    "rounded-lg p-4",
                    isDark
                      ? "bg-[#2f2f36] border border-[#5c5c73]"
                      : "bg-blue-50"
                  )}
                >
                  <div className={cn("text-sm mb-1", textSub)}>요청 금액</div>
                  <div
                    className={cn(
                      "text-2xl font-semibold",
                      isDark ? "text-blue-300" : "text-blue-700"
                    )}
                  >
                    {selectedApproval.amount.toLocaleString()}원
                  </div>
                </div>
              ) : null}

              <div>
                <h4 className={cn("font-semibold mb-2", textMain)}>
                  상세 내용
                </h4>

                <div
                  className={cn(
                    "rounded-lg p-4 whitespace-pre-wrap",
                    modalInnerClass
                  )}
                >
                  {selectedApproval.description}
                </div>
              </div>

              <div>
                <h4 className={cn("font-semibold mb-2", textMain)}>
                  첨부파일
                </h4>

                <div className={cn("rounded-lg p-4", modalInnerClass)}>
                  {selectedApproval.attachments?.length ? (
                    <div className="space-y-2">
                      {selectedApproval.attachments.map((attachment) => (
                        <button
                          key={attachment.fileId}
                          type="button"
                          onClick={() => handleDownloadAttachment(attachment)}
                          className={cn(
                            "block text-sm hover:underline",
                            isDark ? "text-blue-300" : "text-blue-600"
                          )}
                        >
                          {attachment.fileName}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className={cn("text-sm", textMuted)}>
                      첨부파일이 없습니다.
                    </p>
                  )}
                </div>
              </div>

              {selectedApproval.rejectReason ? (
                <div>
                  <h4 className={cn("font-semibold mb-2", textMain)}>
                    반려 사유
                  </h4>

                  <div
                    className={cn(
                      "rounded-lg p-4 text-sm",
                      isDark
                        ? "bg-red-950/40 border border-red-500/40 text-red-300"
                        : "bg-red-50 text-red-700"
                    )}
                  >
                    {selectedApproval.rejectReason}
                  </div>
                </div>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default ApprovalPage;