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
import {
  createApprovalApi,
  downloadApprovalAttachmentApi,
  getApprovalApi,
  getMyApprovalsApi,
  uploadApprovalFileApi,
} from "@/api/approvalApi";

const TYPE_OPTIONS = ["전체", "지출결재", "휴가결재", "업무결재", "기타"];

const TYPE_COLORS = {
  지출결재: "bg-purple-100 text-purple-700",
  휴가결재: "bg-blue-100 text-blue-700",
  업무결재: "bg-green-100 text-green-700",
  기타: "bg-gray-100 text-gray-700",
};

const STATUS_COLORS = {
  대기중: "bg-yellow-100 text-yellow-700",
  승인: "bg-green-100 text-green-700",
  반려: "bg-red-100 text-red-700",
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
          <h2 className="text-2xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <FileCheck className="size-7 text-blue-600" />
            결재신청
          </h2>
          <p className="text-gray-600">결재가 필요한 사항을 신청하세요</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="size-5 mr-2" />
              결재 신청
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>새 결재 신청</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="type">결재 유형</Label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger>
                    <SelectValue placeholder="유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
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
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
                >
                  <Upload className="size-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
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
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? "신청 중..." : "신청하기"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDialog(false)}
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
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {TYPE_OPTIONS.map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(type)}
              className={selectedType === type ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredRequests.map((request) => (
          <Card
            key={request.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleOpenDetail(request)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-1">
                  <h3 className="font-semibold text-gray-900 flex-1">
                    {request.title}
                  </h3>
                  <Badge className={STATUS_COLORS[request.status] ?? "bg-gray-100 text-gray-700"}>
                    {request.status}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {request.content}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-3">
                  <Badge className={TYPE_COLORS[request.type] ?? "bg-gray-100 text-gray-700"}>
                    {request.type}
                  </Badge>
                  <span>{request.requester}</span>
                  {request.amount ? (
                    <span className="font-semibold text-gray-700">
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
          <p className="text-gray-500">결재 내역이 없습니다.</p>
        </div>
      )}

      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <DialogTitle className="text-2xl mb-2">
                    {selectedRequest.title}
                  </DialogTitle>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Badge className={TYPE_COLORS[selectedRequest.type] ?? "bg-gray-100 text-gray-700"}>
                      {selectedRequest.type}
                    </Badge>
                    <Badge className={STATUS_COLORS[selectedRequest.status] ?? "bg-gray-100 text-gray-700"}>
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
                  <h4 className="font-semibold text-gray-900 mb-2">요청 금액</h4>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-blue-700">
                      {selectedRequest.amount.toLocaleString()}원
                    </p>
                  </div>
                </div>
              ) : null}

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">요청 내용</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedRequest.content}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">첨부파일</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedRequest.attachments?.length ? (
                    <div className="space-y-2">
                      {selectedRequest.attachments.map((attachment) => (
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

              {selectedRequest.rejectReason ? (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">반려 사유</h4>
                  <div className="bg-red-50 rounded-lg p-4 text-sm text-red-700">
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
