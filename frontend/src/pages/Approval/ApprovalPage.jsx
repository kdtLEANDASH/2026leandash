import { useEffect, useMemo, useState } from "react";
import { CheckCircle, Clock, FileText, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Badge } from "@/components/UI/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/UI/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/UI/dialog";
import {
  downloadApprovalAttachmentApi,
  approveApprovalApi,
  getDepartmentApprovalApi,
  getDepartmentApprovalsApi,
  rejectApprovalApi,
} from "@/api/approvalApi";

const STATUS_COLORS = {
  대기중: "bg-orange-100 text-orange-700",
  승인: "bg-green-100 text-green-700",
  반려: "bg-red-100 text-red-700",
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
  const [approvals, setApprovals] = useState([]);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const approvedCount = approvals.filter((approval) => approval.status === "승인").length;
  const rejectedCount = approvals.filter((approval) => approval.status === "반려").length;

  const getStatusBadge = (status) => {
    const configs = {
      대기중: { icon: Clock, className: STATUS_COLORS["대기중"] },
      승인: { icon: CheckCircle, className: STATUS_COLORS["승인"] },
      반려: { icon: XCircle, className: STATUS_COLORS["반려"] },
    };

    const config = configs[status] ?? {
      icon: FileText,
      className: "bg-gray-100 text-gray-700",
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
      await rejectApprovalApi(approvalId, { rejectReason: rejectReason.trim() });
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
    <Card key={approval.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {approval.title}
              </h3>
              {getStatusBadge(approval.status)}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className={`font-medium ${TYPE_COLORS[approval.type] ?? "text-gray-600"}`}>
                {approval.type}
              </span>
              <span>신청자: {approval.requester}</span>
              <span>{approval.date}</span>
            </div>
          </div>
          {approval.amount ? (
            <div className="text-right">
              <div className="text-sm text-gray-600">금액</div>
              <div className="text-lg font-semibold text-blue-600">
                {approval.amount.toLocaleString()}원
              </div>
            </div>
          ) : null}
        </div>

        <p className="text-sm text-gray-700 mb-4 p-3 bg-gray-50 rounded">
          {approval.description}
        </p>

        <div className="flex gap-3">
          {showActions ? (
            <>
              <Button
                className="bg-green-600 hover:bg-green-700"
                disabled={isProcessing}
                onClick={() => handleApprove(approval.id)}
              >
                <CheckCircle className="size-4 mr-2" />
                승인
              </Button>
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={isProcessing}
                onClick={() => handleReject(approval.id)}
              >
                <XCircle className="size-4 mr-2" />
                반려
              </Button>
            </>
          ) : null}
          <Button variant="outline" onClick={() => openDetail(approval.id)}>
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
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">전자 결재</h2>
          <p className="text-gray-600">부서 결재 요청을 확인하고 처리하세요</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">대기중</div>
                <div className="text-2xl font-semibold text-orange-600">
                  {pendingApprovals.length}
                </div>
              </div>
              <Clock className="size-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">승인 완료</div>
                <div className="text-2xl font-semibold text-green-600">
                  {approvedCount}
                </div>
              </div>
              <CheckCircle className="size-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">반려</div>
                <div className="text-2xl font-semibold text-red-600">
                  {rejectedCount}
                </div>
              </div>
              <XCircle className="size-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">전체</div>
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
        <TabsList>
          <TabsTrigger value="pending">
            결재 대기 ({pendingApprovals.length})
          </TabsTrigger>
          <TabsTrigger value="processed">
            처리 내역 ({processedApprovals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="space-y-4">
            {pendingApprovals.map((approval) => renderApprovalCard(approval, true))}
            {!isLoading && pendingApprovals.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                현재 처리할 결재가 없습니다.
              </div>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="processed">
          <div className="space-y-4">
            {processedApprovals.map((approval) => renderApprovalCard(approval, false))}
            {!isLoading && processedApprovals.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                처리된 결재가 없습니다.
              </div>
            ) : null}
          </div>
        </TabsContent>
      </Tabs>

      {selectedApproval && (
        <Dialog open={!!selectedApproval} onOpenChange={() => setSelectedApproval(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedApproval.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-5">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                {getStatusBadge(selectedApproval.status)}
                <Badge className="bg-gray-100 text-gray-700">
                  {selectedApproval.type}
                </Badge>
                <span>{selectedApproval.requester}</span>
                <span>{selectedApproval.departmentName}</span>
                <span>{selectedApproval.date}</span>
              </div>

              {selectedApproval.amount ? (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">요청 금액</div>
                  <div className="text-2xl font-semibold text-blue-700">
                    {selectedApproval.amount.toLocaleString()}원
                  </div>
                </div>
              ) : null}

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">상세 내용</h4>
                <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-gray-700">
                  {selectedApproval.description}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">첨부파일</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedApproval.attachments?.length ? (
                    <div className="space-y-2">
                      {selectedApproval.attachments.map((attachment) => (
                        <button
                          key={attachment.fileId}
                          type="button"
                          onClick={() => handleDownloadAttachment(attachment)}
                          className="block text-sm text-blue-600 hover:underline"
                        >
                          {attachment.fileName}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">첨부파일이 없습니다.</p>
                  )}
                </div>
              </div>

              {selectedApproval.rejectReason ? (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">반려 사유</h4>
                  <div className="bg-red-50 rounded-lg p-4 text-red-700 text-sm">
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
