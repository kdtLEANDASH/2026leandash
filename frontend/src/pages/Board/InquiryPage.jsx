import { useEffect, useMemo, useRef, useState } from "react";
import {
  HelpCircle,
  Plus,
  Search as SearchIcon,
  MessageSquareReply,
  Upload,
  Paperclip,
} from "lucide-react";
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
import { useAppContext } from "@/store/AppProvider";
import {
  answerInquiryApi,
  createInquiryApi,
  downloadInquiryAttachmentApi,
  getDepartmentInquiriesApi,
  getDepartmentInquiryApi,
  getInquiryApi,
  getMyInquiriesApi,
  uploadInquiryFileApi,
} from "@/api/inquiryApi";

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

function toInquiryCard(item, isAdmin) {
  return {
    id: item.inquiryId,
    title: item.title,
    content: item.content ?? "",
    author: item.userName ?? "-",
    departmentName: item.departmentName ?? "",
    date: formatDate(item.createdAt),
    status: item.status ?? "PENDING",
    answerContent: item.answerContent ?? "",
    answeredByName: item.answeredByName ?? "",
    answeredAt: item.answeredAt ?? null,
    attachments: item.attachments ?? [],
    isAdmin,
  };
}

function getStatusLabel(status) {
  if (status === "ANSWERED") return "답변완료";
  if (status === "PENDING") return "대기중";
  return status ?? "-";
}

function getStatusColor(status) {
  if (status === "ANSWERED") return "bg-green-100 text-green-700";
  if (status === "PENDING") return "bg-yellow-100 text-yellow-700";
  return "bg-gray-100 text-gray-700";
}

export function InquiryPage() {
  const { currentUser } = useAppContext();
  const fileInputRef = useRef(null);
  const isAdmin = localStorage.getItem("userRole") === "ADMIN";
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);

  const loadInquiries = async () => {
    try {
      setIsLoading(true);
      const result = isAdmin
        ? await getDepartmentInquiriesApi()
        : await getMyInquiriesApi();
      const list = unwrapResponse(result) ?? [];

      if (isAdmin) {
        setInquiries(
          list.map((item) =>
            toInquiryCard(
              {
                inquiryId: item.inquiryId,
                title: item.title,
                userName: item.userName,
                departmentName: item.departmentName,
                status: item.status,
                createdAt: item.createdAt,
              },
              true
            )
          )
        );
      } else {
        setInquiries(list.map((item) => toInquiryCard(item, false)));
      }
    } catch (error) {
      console.error("문의 목록 조회 실패:", error);
      alert("문의 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, [isAdmin]);

  const filteredInquiries = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return inquiries;

    return inquiries.filter((inquiry) => {
      return (
        inquiry.title.toLowerCase().includes(keyword) ||
        inquiry.content.toLowerCase().includes(keyword) ||
        inquiry.author.toLowerCase().includes(keyword) ||
        inquiry.departmentName.toLowerCase().includes(keyword) ||
        inquiry.answerContent.toLowerCase().includes(keyword)
      );
    });
  }, [inquiries, searchTerm]);

  const handleOpenInquiry = async (inquiry) => {
    try {
      const result = isAdmin
        ? await getDepartmentInquiryApi(inquiry.id)
        : await getInquiryApi(inquiry.id);
      const detail = unwrapResponse(result);
      setSelectedInquiry(toInquiryCard(detail, isAdmin));
      setAnswerText(detail.answerContent ?? "");
    } catch (error) {
      console.error("문의 상세 조회 실패:", error);
      alert("문의 상세를 불러오지 못했습니다.");
    }
  };

  const resetForm = () => {
    setFormTitle("");
    setFormContent("");
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
      const created = unwrapResponse(
        await createInquiryApi({
          title: formTitle.trim(),
          content: formContent.trim(),
        })
      );

      if (selectedFile && created?.inquiryId) {
        await uploadInquiryFileApi(created.inquiryId, selectedFile);
      }

      await loadInquiries();
      resetForm();
      setShowDialog(false);
    } catch (error) {
      console.error("문의 등록 실패:", error);
      alert("문의 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswer = async () => {
    if (!selectedInquiry || !answerText.trim()) {
      alert("답변 내용을 입력해주세요.");
      return;
    }

    try {
      setIsAnswering(true);
      const updated = unwrapResponse(
        await answerInquiryApi(selectedInquiry.id, {
          answerContent: answerText.trim(),
        })
      );

      setSelectedInquiry(toInquiryCard(updated, true));
      await loadInquiries();
      alert("답변이 등록되었습니다.");
    } catch (error) {
      console.error("문의 답변 실패:", error);
      alert("답변 등록에 실패했습니다.");
    } finally {
      setIsAnswering(false);
    }
  };

  const handleDownloadAttachment = async (attachment) => {
    try {
      await downloadInquiryAttachmentApi(
        attachment.downloadUrl,
        attachment.fileName
      );
    } catch (error) {
      console.error("문의 첨부 다운로드 실패:", error);
      alert("첨부파일 다운로드에 실패했습니다.");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <HelpCircle className="size-7 text-blue-600" />
            {isAdmin ? "문의 관리" : "문의"}
          </h2>
          <p className="text-gray-600">
            {isAdmin
              ? "부서 문의를 확인하고 답변을 작성하세요"
              : "궁금한 사항을 문의해보세요"}
          </p>
        </div>

        {!isAdmin && (
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="size-5 mr-2" />
                문의 작성
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>새 문의 작성</DialogTitle>
              </DialogHeader>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="title">제목</Label>
                  <Input
                    id="title"
                    placeholder="문의 제목을 입력하세요"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">내용</Label>
                  <Textarea
                    id="content"
                    placeholder="문의 내용을 작성하세요"
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
                    onChange={(e) =>
                      setSelectedFile(e.target.files?.[0] ?? null)
                    }
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
                    {isSubmitting ? "등록 중..." : "등록하기"}
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
        )}
      </div>

      <div className="mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <Input
            type="text"
            placeholder={isAdmin ? "부서 문의 검색..." : "문의 검색..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredInquiries.map((inquiry) => (
          <Card
            key={inquiry.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleOpenInquiry(inquiry)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-1">
                  <h3 className="font-semibold text-gray-900 flex-1">
                    {inquiry.title}
                  </h3>
                  <Badge className={getStatusColor(inquiry.status)}>
                    {getStatusLabel(inquiry.status)}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {inquiry.content || "상세 내용은 클릭 후 확인할 수 있습니다."}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-3 flex-wrap">
                  <span>{inquiry.author}</span>
                  {isAdmin && inquiry.departmentName ? (
                    <span>{inquiry.departmentName}</span>
                  ) : null}
                </div>
                <span>{inquiry.date}</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {!isLoading && filteredInquiries.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            표시할 문의가 없습니다.
          </div>
        )}
      </div>

      <Dialog
        open={!!selectedInquiry}
        onOpenChange={(open) => !open && setSelectedInquiry(null)}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedInquiry ? (
            <>
              <DialogHeader>
                <DialogTitle>{selectedInquiry.title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <Badge className={getStatusColor(selectedInquiry.status)}>
                    {getStatusLabel(selectedInquiry.status)}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    작성자 {selectedInquiry.author} · {selectedInquiry.date}
                  </span>
                  {selectedInquiry.departmentName ? (
                    <span className="text-sm text-gray-500">
                      {selectedInquiry.departmentName}
                    </span>
                  ) : null}
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-800 whitespace-pre-wrap">
                  {selectedInquiry.content}
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="font-medium text-gray-900 mb-2">첨부파일</div>
                  {selectedInquiry.attachments?.length ? (
                    <div className="space-y-2">
                      {selectedInquiry.attachments.map((attachment) => (
                        <button
                          key={attachment.fileId}
                          type="button"
                          onClick={() => handleDownloadAttachment(attachment)}
                          className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                        >
                          <Paperclip className="size-4" />
                          {attachment.fileName}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      첨부파일이 없습니다.
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="font-medium text-gray-900 mb-2">답변</div>
                  {selectedInquiry.answerContent ? (
                    <div className="space-y-2">
                      <div className="text-sm leading-6 text-gray-700 whitespace-pre-wrap">
                        {selectedInquiry.answerContent}
                      </div>
                      {selectedInquiry.answeredByName ? (
                        <div className="text-xs text-gray-500">
                          답변자 {selectedInquiry.answeredByName}
                          {selectedInquiry.answeredAt
                            ? ` · ${formatDate(selectedInquiry.answeredAt)}`
                            : ""}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      아직 등록된 답변이 없습니다.
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <div className="space-y-2">
                    <Label htmlFor="answer">답변 작성</Label>
                    <Textarea
                      id="answer"
                      rows={5}
                      placeholder="문의에 대한 답변을 입력하세요"
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                    />
                    <Button
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={isAnswering}
                      onClick={handleAnswer}
                    >
                      <MessageSquareReply className="size-4 mr-2" />
                      {isAnswering ? "답변 등록 중..." : "답변 등록"}
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
