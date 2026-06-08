import { useEffect, useMemo, useRef, useState } from "react";
import { FileCheck, Plus, Search as SearchIcon, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/UI/card";
import { Input } from "@/components/UI/input";
import { Button } from "@/components/UI/button";
import { Badge } from "@/components/UI/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/UI/dialog";
import { Label } from "@/components/UI/label";
import { Textarea } from "@/components/UI/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { useAppContext } from "@/store/AppProvider";
import { cn } from "@/components/UI/utils";
import {
  createApprovalApi,
  downloadApprovalAttachmentApi,
  getApprovalApi,
  getMyApprovalsApi,
  uploadApprovalFileApi,
} from "@/api/approvalApi";

const TYPE_OPTIONS = ["전체", "지출결재", "휴가결재", "업무결재", "기타"];

const TYPE_COLORS = {
  지출결재: "bg-purple-100 text-purple-700 hover:bg-purple-100",
  휴가결재: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  업무결재: "bg-green-100 text-green-700 hover:bg-green-100",
  기타: "bg-gray-100 text-gray-700 hover:bg-gray-100",
};

const STATUS_COLORS = {
  대기중: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  승인: "bg-green-100 text-green-700 hover:bg-green-100",
  반려: "bg-red-100 text-red-700 hover:bg-red-100",
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

function toDisplayRequest(item) {
  return {
    id: item.approvalId,
    title: item.title,
    content: item.content ?? "",
    type: item.approvalType ?? "기타",
    requester: item.requester ?? item.userName ?? "-",
    date: formatDate(item.createdAt),
    status: item.status ?? "대기중",
    amount: item.amount ?? null,
    attachments: item.attachments ?? [],
    rejectReason: item.rejectReason ?? "",
  };
}

export function ApprovalRequestPage() {
  const { customSettings } = useAppContext() || {};
  const isDark = customSettings?.darkMode;

  const fileInputRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("전체");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requests, setRequests] = useState([]);

  const [formType, setFormType] = useState("지출결재");
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const selectedButtonClass = isDark
    ? "bg-[#5c5c73] hover:bg-[#6a6a82] text-white border-[#5c5c73]"
    : "bg-blue-600 hover:bg-blue-700 text-white";

  const inactiveTypeButtonClass = isDark
    ? "bg-transparent border-transparent text-zinc-100 hover:bg-[#3f3f48] hover:border-[#5c5c73]"
    : "";

  const cardClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "bg-white border-gray-200";

  const hoverCardClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white hover:bg-[#3f3f48]"
    : "bg-white border-gray-200 hover:shadow-lg";

  const inputClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white placeholder:text-zinc-400"
    : "";

  const modalClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "";

  const selectContentClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "";

  const outlineButtonClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white hover:bg-[#48484f]"
    : "";

  const innerBoxClass = isDark
    ? "bg-[#2f2f36] border border-[#5c5c73] text-zinc-100"
    : "bg-gray-50 text-gray-700";

  const uploadBoxClass = isDark
    ? "border-[#5c5c73] bg-[#2f2f36] hover:border-[#8b8b96]"
    : "border-gray-300 hover:border-blue-400";

  const textMain = isDark ? "text-white" : "text-gray-900";
  const textSub = isDark ? "text-zinc-300" : "text-gray-600";
  const textMuted = isDark ? "text-zinc-400" : "text-gray-500";

  const loadApprovals = async () => {
    try {
      setIsLoading(true);

      const result = await getMyApprovalsApi();
      const list = unwrapResponse(result) ?? [];

      setRequests(list.map(toDisplayRequest));
    } catch (error) {
      console.error("결재 목록 조회 실패:", error);
      alert("결재 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const filteredRequests = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesSearch =
        !keyword ||
        request.title.toLowerCase().includes(keyword) ||
        request.content.toLowerCase().includes(keyword);

      const matchesType =
        selectedType === "전체" || request.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [requests, searchTerm, selectedType]);

  const handleOpenDetail = async (request) => {
    try {
      const result = await getApprovalApi(request.id);
      const detail = unwrapResponse(result);

      setSelectedRequest(toDisplayRequest(detail));
    } catch (error) {
      console.error("결재 상세 조회 실패:", error);
      alert("결재 상세 정보를 불러오지 못했습니다.");
    }
  };

  const resetForm = () => {
    setFormType("지출결재");
    setFormTitle("");
    setFormContent("");
    setFormAmount("");
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formTitle.trim() || !formContent.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        title: formTitle.trim(),
        approvalType: formType,
        content: formContent.trim(),
        amount: formType === "지출결재" && formAmount ? Number(formAmount) : null,
      };

      const createdResult = await createApprovalApi(payload);
      const createdApproval = unwrapResponse(createdResult);

      if (selectedFile && createdApproval?.approvalId) {
        await uploadApprovalFileApi(createdApproval.approvalId, selectedFile);
      }

      await loadApprovals();
      resetForm();
      setShowDialog(false);
    } catch (error) {
      console.error("결재 신청 실패:", error);
      alert("결재 신청에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className={cn("text-2xl font-semibold mb-1 flex items-center gap-2", textMain)}>
            <FileCheck className="size-7 text-blue-600" />
            결재 신청
          </h2>

          <p className={textSub}>결재가 필요한 사항을 신청하세요</p>
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className={selectedButtonClass}>
              <Plus className="size-5 mr-2" />
              결재 신청
            </Button>
          </DialogTrigger>

          <DialogContent className={cn("max-w-2xl", modalClass)}>
            <DialogHeader>
              <DialogTitle>새 결재 신청</DialogTitle>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="type">결재 유형</Label>

                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="유형 선택" />
                  </SelectTrigger>

                  <SelectContent className={selectContentClass}>
                    <SelectItem value="지출결재">지출결재</SelectItem>
                    <SelectItem value="휴가결재">휴가결재</SelectItem>
                    <SelectItem value="업무결재">업무결재</SelectItem>
                    <SelectItem value="기타">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>

                <Input
                  id="title"
                  placeholder="결재 제목을 입력하세요"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className={inputClass}
                />
              </div>

              {formType === "지출결재" && (
                <div className="space-y-2">
                  <Label htmlFor="amount">금액</Label>

                  <Input
                    id="amount"
                    type="number"
                    placeholder="금액을 입력하세요"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className={inputClass}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="content">내용</Label>

                <Textarea
                  id="content"
                  placeholder="결재 내용을 작성하세요"
                  rows={8}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">첨부파일</Label>

                <input
                  ref={fileInputRef}
                  id="file"
                  type="file"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "w-full border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                    uploadBoxClass
                  )}
                >
                  <Upload className="size-8 text-gray-400 mx-auto mb-2" />

                  <p className={cn("text-sm", textMuted)}>
                    {selectedFile
                      ? selectedFile.name
                      : "파일을 드래그하거나 클릭하여 업로드"}
                  </p>
                </button>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn("flex-1", selectedButtonClass)}
                >
                  {isSubmitting ? "신청 중..." : "신청하기"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                  className={outlineButtonClass}
                >
                  취소
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />

          <Input
            type="text"
            placeholder="결재 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn("pl-10", inputClass)}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {TYPE_OPTIONS.map((type) => {
            const isSelected = selectedType === type;

            return (
              <Button
                key={type}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type)}
                className={cn(
                  isSelected ? selectedButtonClass : inactiveTypeButtonClass
                )}
              >
                {type}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {filteredRequests.map((request) => (
          <Card
            key={request.id}
            className={cn("transition-colors cursor-pointer border", hoverCardClass)}
            onClick={() => handleOpenDetail(request)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-1">
                  <h3 className={cn("font-semibold flex-1", textMain)}>
                    {request.title}
                  </h3>

                  <Badge
                    className={
                      STATUS_COLORS[request.status] ??
                      "bg-gray-100 text-gray-700 hover:bg-gray-100"
                    }
                  >
                    {request.status}
                  </Badge>
                </div>
              </div>

              <p className={cn("text-sm mb-3 line-clamp-2", isDark ? "text-zinc-200" : "text-gray-600")}>
                {request.content}
              </p>

              <div className={cn("flex items-center justify-between text-sm", textSub)}>
                <div className="flex items-center gap-3">
                  <Badge
                    className={
                      TYPE_COLORS[request.type] ??
                      "bg-gray-100 text-gray-700 hover:bg-gray-100"
                    }
                  >
                    {request.type}
                  </Badge>

                  <span>{request.requester}</span>

                  {request.amount ? (
                    <span className={cn("font-semibold", textMain)}>
                      {request.amount.toLocaleString()}원
                    </span>
                  ) : null}
                </div>

                <span>{request.date}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isLoading && filteredRequests.length === 0 && (
        <div className="text-center py-16">
          <FileCheck className="size-16 text-gray-300 mx-auto mb-4" />
          <p className={textMuted}>결재 내역이 없습니다.</p>
        </div>
      )}

      {selectedRequest && (
        <Dialog
          open={!!selectedRequest}
          onOpenChange={() => setSelectedRequest(null)}
        >
          <DialogContent className={cn("max-w-3xl max-h-[80vh] overflow-y-auto", modalClass)}>
            <DialogHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <DialogTitle className={cn("text-2xl mb-2", textMain)}>
                    {selectedRequest.title}
                  </DialogTitle>

                  <div className={cn("flex items-center gap-3 text-sm", textSub)}>
                    <Badge
                      className={
                        TYPE_COLORS[selectedRequest.type] ??
                        "bg-gray-100 text-gray-700 hover:bg-gray-100"
                      }
                    >
                      {selectedRequest.type}
                    </Badge>

                    <Badge
                      className={
                        STATUS_COLORS[selectedRequest.status] ??
                        "bg-gray-100 text-gray-700 hover:bg-gray-100"
                      }
                    >
                      {selectedRequest.status}
                    </Badge>

                    <span>{selectedRequest.requester}</span>
                    <span>{selectedRequest.date}</span>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="mt-6 space-y-6">
              {selectedRequest.amount ? (
                <div>
                  <h4 className={cn("font-semibold mb-2", textMain)}>
                    요청 금액
                  </h4>

                  <div className={cn("rounded-lg p-4", innerBoxClass)}>
                    <p className={cn("text-2xl font-bold", isDark ? "text-white" : "text-blue-700")}>
                      {selectedRequest.amount.toLocaleString()}원
                    </p>
                  </div>
                </div>
              ) : null}

              <div>
                <h4 className={cn("font-semibold mb-2", textMain)}>
                  요청 내용
                </h4>

                <div className={cn("rounded-lg p-4", innerBoxClass)}>
                  <p className={cn("whitespace-pre-wrap leading-relaxed", isDark ? "text-zinc-100" : "text-gray-700")}>
                    {selectedRequest.content}
                  </p>
                </div>
              </div>

              <div>
                <h4 className={cn("font-semibold mb-2", textMain)}>
                  첨부파일
                </h4>

                <div className={cn("rounded-lg p-4", innerBoxClass)}>
                  {selectedRequest.attachments?.length ? (
                    <div className="space-y-2">
                      {selectedRequest.attachments.map((attachment) => (
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

              {selectedRequest.rejectReason ? (
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
                    {selectedRequest.rejectReason}
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

export default ApprovalRequestPage;