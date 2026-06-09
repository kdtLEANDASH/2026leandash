import { useEffect, useMemo, useState } from "react";
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Search,
  Plus,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { useAppContext } from "@/store/AppProvider";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Badge } from "@/components/UI/badge";
import { Label } from "@/components/UI/label";
import { Textarea } from "@/components/UI/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/UI/card";
import { cn } from "@/components/UI/utils";
import {
  deleteDocumentApi,
  downloadDocumentApi,
  getDocumentApi,
  getDocumentsApi,
  uploadDocumentApi,
} from "@/api/documentApi";

function unwrapResponse(result) {
  if (Array.isArray(result)) return result;
  return result?.data ?? result?.result ?? result ?? null;
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toISOString().slice(0, 10);
}

function formatFileSize(size) {
  if (!size) return "-";

  const kb = Number(size) / 1024;
  const mb = kb / 1024;

  if (mb >= 1) return `${mb.toFixed(1)} MB`;

  return `${kb.toFixed(0)} KB`;
}

function normalizeDocument(item) {
  const fileName =
    item.originalFileName ??
    item.fileName ??
    item.filename ??
    item.title ??
    "document";

  return {
    id: item.documentId ?? item.id,
    title: item.title ?? fileName,
    department: item.department ?? "-",
    fileName,
    fileSize: formatFileSize(item.fileSize),
    rawFileSize: item.fileSize,
    uploaderId: item.uploaderId,
    uploader: item.uploaderName ?? item.uploader ?? item.writerName ?? "-",
    description: item.description ?? "",
    uploadDate: formatDate(item.createdAt),
    contentType: item.contentType ?? "",
    raw: item,
  };
}

export function DocumentsPage() {
  const { currentUser, employees = [], customSettings } = useAppContext();

  const isDark = customSettings?.darkMode;

  const [mode, setMode] = useState("list");
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const [selectedDepartment, setSelectedDepartment] = useState("전체");
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const documentsPerPage = 5;

  const [formTitle, setFormTitle] = useState("");
  const [formDepartment, setFormDepartment] = useState(
    currentUser?.department || "개발팀"
  );
  const [formContent, setFormContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const pageClass = isDark
    ? "bg-[#27272a] text-white"
    : "bg-gray-50 text-gray-900";

  const cardClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "bg-white border-gray-200";

  const innerClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white"
    : "bg-gray-50 border-gray-200";

  const inputClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white placeholder:text-zinc-400"
    : "bg-white";

  const tableHeaderClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-zinc-300"
    : "bg-gray-50 border-gray-200 text-gray-600";

  const rowClass = isDark
    ? "hover:bg-[#48484f] text-zinc-200"
    : "hover:bg-gray-50 text-gray-900";

  const divideClass = isDark ? "divide-[#5c5c73]" : "divide-gray-100";

  const textMain = isDark ? "text-white" : "text-gray-900";
  const textSub = isDark ? "text-zinc-300" : "text-gray-600";
  const textMuted = isDark ? "text-zinc-400" : "text-gray-500";

  const primaryButtonClass = isDark
    ? "bg-[#5c5c73] hover:bg-[#6a6a82] text-white"
    : "bg-blue-600 hover:bg-blue-700 text-white";

  const outlineButtonClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white hover:bg-[#48484f]"
    : "";

  const dangerButtonClass = isDark
    ? "border-red-400 text-red-300 hover:bg-red-950"
    : "text-red-600 hover:text-red-700 hover:bg-red-50";

  const departments = useMemo(() => {
    const employeeDepartments = employees
      .map((emp) => emp.department)
      .filter((dept) => dept && dept !== "경영진");

    const documentDepartments = documents
      .map((doc) => doc.department)
      .filter((dept) => dept && dept !== "-");

    return [
      "전체",
      ...Array.from(new Set([...employeeDepartments, ...documentDepartments])),
    ];
  }, [employees, documents]);

  const filteredDocuments = documents.filter((doc) => {
    const matchesDepartment =
      selectedDepartment === "전체" || doc.department === selectedDepartment;

    return matchesDepartment;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDocuments.length / documentsPerPage)
  );

  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * documentsPerPage,
    currentPage * documentsPerPage
  );

  const currentUserId = currentUser?.userId || currentUser?.id;

  const canDeleteDocument = (document) => {
    if (!currentUser || !document) return false;

    if (currentUser.role === "최고관리자" || currentUser.role === "ADMIN") {
      return true;
    }

    return String(document.uploaderId) === String(currentUserId);
  };

  const getFileTypeColor = (fileName = "") => {
    const extension = fileName.split(".").pop()?.toLowerCase();

    if (isDark) {
      if (extension === "pdf") {
        return "bg-red-500/20 text-red-300 border border-red-400/30 hover:bg-red-500/20";
      }

      if (["doc", "docx", "hwp", "hwpx"].includes(extension)) {
        return "bg-blue-500/20 text-blue-300 border border-blue-400/30 hover:bg-blue-500/20";
      }

      if (["xls", "xlsx"].includes(extension)) {
        return "bg-green-500/20 text-green-300 border border-green-400/30 hover:bg-green-500/20";
      }

      if (["ppt", "pptx"].includes(extension)) {
        return "bg-orange-500/20 text-orange-300 border border-orange-400/30 hover:bg-orange-500/20";
      }

      return "bg-zinc-600 text-zinc-200 border border-zinc-500 hover:bg-zinc-600";
    }

    if (extension === "pdf") {
      return "bg-red-100 text-red-700 hover:bg-red-100";
    }

    if (["doc", "docx", "hwp", "hwpx"].includes(extension)) {
      return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    }

    if (["xls", "xlsx"].includes(extension)) {
      return "bg-green-100 text-green-700 hover:bg-green-100";
    }

    if (["ppt", "pptx"].includes(extension)) {
      return "bg-orange-100 text-orange-700 hover:bg-orange-100";
    }

    return "bg-gray-100 text-gray-700 hover:bg-gray-100";
  };

  const getFileExtension = (fileName = "") => {
    const extension = fileName.split(".").pop();

    if (!extension || extension === fileName) return "FILE";

    return extension.toUpperCase();
  };

  const resetForm = () => {
    setFormTitle("");
    setFormDepartment(currentUser?.department || "개발팀");
    setFormContent("");
    setSelectedFile(null);
  };

  const loadDocuments = async ({
    keyword = submittedKeyword,
    department = selectedDepartment,
  } = {}) => {
    try {
      setIsLoading(true);

      const result = await getDocumentsApi({
        keyword,
        department,
      });

      const list = unwrapResponse(result) ?? [];

      setDocuments(Array.isArray(list) ? list.map(normalizeDocument) : []);
      setCurrentPage(1);
    } catch (error) {
      console.error("문서 목록 조회 실패:", error);
      alert("문서 목록을 불러오지 못했습니다.");
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments({
      keyword: "",
      department: "전체",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const keyword = searchTerm.trim();

    setSubmittedKeyword(keyword);
    loadDocuments({
      keyword,
      department: selectedDepartment,
    });
  };

  const handleDepartmentChange = (department) => {
    setSelectedDepartment(department);
    setCurrentPage(1);

    loadDocuments({
      keyword: submittedKeyword,
      department,
    });
  };

  const handleOpenDetail = async (document) => {
    try {
      const result = await getDocumentApi(document.id);
      const detail = unwrapResponse(result);

      setSelectedDocument(normalizeDocument(detail));
      setMode("detail");
    } catch (error) {
      console.error("문서 상세 조회 실패:", error);
      setSelectedDocument(document);
      setMode("detail");
    }
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();

    if (!currentUserId) {
      alert("로그인 사용자 정보를 찾을 수 없습니다.");
      return;
    }

    if (!formTitle.trim()) {
      alert("문서 제목을 입력해주세요.");
      return;
    }

    if (!formContent.trim()) {
      alert("문서 내용을 입력해주세요.");
      return;
    }

    if (!selectedFile) {
      alert("업로드할 파일을 선택해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);

      await uploadDocumentApi({
        uploaderId: currentUserId,
        title: formTitle.trim(),
        description: formContent.trim(),
        department: formDepartment,
        file: selectedFile,
      });

      alert("문서가 등록되었습니다.");

      resetForm();
      setMode("list");

      await loadDocuments({
        keyword: submittedKeyword,
        department: selectedDepartment,
      });
    } catch (error) {
      console.error("문서 등록 실패:", error);
      alert("문서 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async (document, event) => {
    event?.stopPropagation();

    try {
      setIsDownloading(true);
      await downloadDocumentApi(document.id, document.fileName);
    } catch (error) {
      console.error("문서 다운로드 실패:", error);
      alert("문서 다운로드에 실패했습니다.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async (document, event) => {
    event?.stopPropagation();

    if (!window.confirm("정말 이 문서를 삭제하시겠습니까?")) return;

    try {
      await deleteDocumentApi(document.id);

      alert("문서가 삭제되었습니다.");

      if (selectedDocument?.id === document.id) {
        setSelectedDocument(null);
        setMode("list");
      }

      await loadDocuments({
        keyword: submittedKeyword,
        department: selectedDepartment,
      });
    } catch (error) {
      console.error("문서 삭제 실패:", error);
      alert("문서 삭제에 실패했습니다.");
    }
  };

  if (mode === "create") {
    return (
      <div className={cn("p-6 max-w-5xl mx-auto min-h-full", pageClass)}>
        <Card className={cardClass}>
          <CardHeader className={isDark ? "border-b border-[#5c5c73]" : ""}>
            <CardTitle>문서 등록</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">문서 제목</Label>
                <Input
                  id="title"
                  value={formTitle}
                  onChange={(event) => setFormTitle(event.target.value)}
                  placeholder="문서 제목을 입력하세요"
                  className={cn("h-11", inputClass)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">부서</Label>

                <div className="relative w-52">
                  <select
                    id="department"
                    value={formDepartment}
                    onChange={(event) => setFormDepartment(event.target.value)}
                    className={cn(
                      "w-full h-11 appearance-none rounded-md border px-3 pr-10 text-sm focus:outline-none focus:ring-0",
                      isDark
                        ? "bg-[#2f2f36] border-[#5c5c73] text-white"
                        : "border-gray-300 bg-white text-gray-900 focus:border-gray-300"
                    )}
                  >
                    {departments
                      .filter((dept) => dept !== "전체")
                      .map((dept) => (
                        <option
                          key={dept}
                          value={dept}
                          className={isDark ? "bg-[#2f2f36] text-white" : ""}
                        >
                          {dept}
                        </option>
                      ))}
                  </select>

                  <ChevronDown
                    className={cn(
                      "pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2",
                      isDark ? "text-zinc-400" : "text-gray-500"
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">문서 내용</Label>
                <Textarea
                  id="content"
                  value={formContent}
                  onChange={(event) => setFormContent(event.target.value)}
                  placeholder="문서에 대한 설명, 공유 내용, 참고 사항 등을 작성하세요."
                  className={cn("min-h-[260px] resize-none", inputClass)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">첨부파일</Label>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <FileText
                      className={cn(
                        "size-7",
                        isDark ? "text-zinc-400" : "text-gray-400"
                      )}
                    />
                    <Plus
                      className={cn(
                        "absolute -right-2 bottom-0 size-4",
                        isDark ? "text-zinc-400" : "text-gray-400"
                      )}
                    />
                  </div>

                  <label
                    htmlFor="file"
                    className={cn(
                      "inline-flex cursor-pointer items-center border px-5 py-2 text-sm font-medium",
                      isDark
                        ? "border-[#5c5c73] bg-[#2f2f36] text-white hover:bg-[#48484f]"
                        : "border-gray-400 bg-white text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    파일 선택
                  </label>
                </div>

                <input
                  id="file"
                  type="file"
                  className="hidden"
                  onChange={(event) => setSelectedFile(event.target.files?.[0])}
                />

                {selectedFile && (
                  <div
                    className={cn("mt-3 flex items-center gap-2 text-sm", textSub)}
                  >
                    <FileText
                      className={cn(
                        "size-4",
                        isDark ? "text-zinc-400" : "text-gray-500"
                      )}
                    />
                    <span>{selectedFile.name}</span>
                    <span className={isDark ? "text-zinc-500" : "text-gray-400"}>
                      ·
                    </span>
                    <span>{formatFileSize(selectedFile.size)}</span>
                  </div>
                )}
              </div>

              <div
                className={cn(
                  "flex justify-end gap-3 pt-4 border-t",
                  isDark ? "border-[#5c5c73]" : "border-gray-100"
                )}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setMode("list");
                  }}
                  className={outlineButtonClass}
                  disabled={isSubmitting}
                >
                  취소
                </Button>

                <Button
                  type="submit"
                  className={primaryButtonClass}
                  disabled={isSubmitting}
                >
                  <Upload className="size-4 mr-2" />
                  {isSubmitting ? "등록 중..." : "등록하기"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === "detail" && selectedDocument) {
    return (
      <div className={cn("p-6 max-w-5xl mx-auto min-h-full", pageClass)}>
        <Card className={cardClass}>
          <CardHeader className={isDark ? "border-b border-[#5c5c73]" : ""}>
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant="outline"
                className={isDark ? "border-[#5c5c73] text-zinc-200" : ""}
              >
                {selectedDocument.department}
              </Badge>

              <Badge className={getFileTypeColor(selectedDocument.fileName)}>
                {getFileExtension(selectedDocument.fileName)}
              </Badge>
            </div>

            <CardTitle className="text-2xl">
              {selectedDocument.title}
            </CardTitle>

            <div
              className={cn(
                "mt-3 flex flex-wrap items-center gap-3 text-sm",
                textMuted
              )}
            >
              <span>업로더: {selectedDocument.uploader}</span>
              <span className={isDark ? "text-zinc-600" : "text-gray-300"}>
                |
              </span>
              <span>등록일: {selectedDocument.uploadDate}</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="min-h-[260px]">
              <h3 className={cn("font-semibold mb-3", textMain)}>문서 내용</h3>

              <div className={cn("whitespace-pre-wrap leading-relaxed", textSub)}>
                {selectedDocument.description || "등록된 문서 내용이 없습니다."}
              </div>
            </div>

            <div
              className={cn(
                "border-t pt-5",
                isDark ? "border-[#5c5c73]" : "border-gray-100"
              )}
            >
              <h3 className={cn("font-semibold mb-3", textMain)}>첨부파일</h3>

              <div
                className={cn(
                  "flex items-center justify-between gap-4 rounded-lg border p-4",
                  innerClass
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText
                    className={cn(
                      "size-6 flex-shrink-0",
                      isDark ? "text-zinc-400" : "text-gray-500"
                    )}
                  />

                  <div className="min-w-0">
                    <p className={cn("font-medium truncate", textMain)}>
                      {selectedDocument.fileName}
                    </p>

                    <p className={cn("text-sm", textMuted)}>
                      {selectedDocument.fileSize}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className={outlineButtonClass}
                  disabled={isDownloading}
                  onClick={(event) => handleDownload(selectedDocument, event)}
                >
                  <Download className="size-4 mr-2" />
                  다운로드
                </Button>
              </div>
            </div>

            <div
              className={cn(
                "flex justify-end gap-3 pt-4 border-t",
                isDark ? "border-[#5c5c73]" : "border-gray-100"
              )}
            >
              {canDeleteDocument(selectedDocument) && (
                <Button
                  variant="outline"
                  className={dangerButtonClass}
                  onClick={(event) => handleDelete(selectedDocument, event)}
                >
                  <Trash2 className="size-4 mr-2" />
                  삭제
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  setSelectedDocument(null);
                  setMode("list");
                }}
                className={outlineButtonClass}
              >
                목록으로
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("p-6 max-w-7xl mx-auto min-h-full", pageClass)}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className={cn("text-2xl font-semibold mb-1", textMain)}>
            문서함
          </h2>
          <p className={textSub}>
            부서별 문서를 업로드하고 공유할 수 있습니다.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className={outlineButtonClass}
            onClick={() =>
              loadDocuments({
                keyword: submittedKeyword,
                department: selectedDepartment,
              })
            }
          >
            <RefreshCw className="size-4 mr-2" />
            새로고침
          </Button>

          <Button
            className={primaryButtonClass}
            onClick={() => setMode("create")}
          >
            <Upload className="size-4 mr-2" />
            문서 업로드
          </Button>
        </div>
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-col md:flex-row gap-3 mb-4"
      >
        <div className="relative flex-1">
          <Search
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 size-5",
              isDark ? "text-zinc-400" : "text-gray-400"
            )}
          />

          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="문서명, 파일명, 내용 검색..."
            className={cn("pl-10", inputClass)}
          />
        </div>

        <select
          value={selectedDepartment}
          onChange={(event) => handleDepartmentChange(event.target.value)}
          className={cn(
            "h-10 rounded-md border px-3 text-sm focus:outline-none",
            isDark
              ? "bg-[#2f2f36] border-[#5c5c73] text-white"
              : "border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
          )}
        >
          {departments.map((dept) => (
            <option
              key={dept}
              value={dept}
              className={isDark ? "bg-[#2f2f36] text-white" : ""}
            >
              {dept === "전체" ? "전체 부서" : dept}
            </option>
          ))}
        </select>

        <Button type="submit" className={primaryButtonClass}>
          검색
        </Button>
      </form>

      <div className={cn("border rounded-lg overflow-hidden", cardClass)}>
        <div
          className={cn(
            "grid grid-cols-[70px_120px_1fr_100px_120px_130px_120px] px-4 py-3 border-b text-sm font-medium",
            tableHeaderClass
          )}
        >
          <div>번호</div>
          <div>부서</div>
          <div>문서명</div>
          <div>형식</div>
          <div>업로더</div>
          <div>등록일</div>
          <div className="text-center">관리</div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center">
            <RefreshCw
              className={cn(
                "size-10 mx-auto mb-3 animate-spin",
                isDark ? "text-zinc-500" : "text-gray-300"
              )}
            />
            <p className={textMuted}>문서를 불러오는 중입니다.</p>
          </div>
        ) : filteredDocuments.length > 0 ? (
          <div className={cn("divide-y", divideClass)}>
            {paginatedDocuments.map((doc, index) => (
              <div
                key={doc.id}
                onClick={() => handleOpenDetail(doc)}
                className={cn(
                  "grid grid-cols-[70px_120px_1fr_100px_120px_130px_120px] items-center px-4 py-4 text-sm transition-colors cursor-pointer",
                  rowClass
                )}
              >
                <div className={textMuted}>
                  {filteredDocuments.length -
                    ((currentPage - 1) * documentsPerPage + index)}
                </div>

                <div>
                  <Badge
                    variant="outline"
                    className={isDark ? "border-[#5c5c73] text-zinc-200" : ""}
                  >
                    {doc.department}
                  </Badge>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText
                      className={cn(
                        "size-4 flex-shrink-0",
                        isDark ? "text-zinc-400" : "text-gray-500"
                      )}
                    />

                    <span className={cn("font-medium truncate", textMain)}>
                      {doc.title}
                    </span>
                  </div>

                  <div className={cn("text-xs mt-1 truncate", textMuted)}>
                    {doc.description || doc.fileName}
                  </div>
                </div>

                <div>
                  <Badge className={getFileTypeColor(doc.fileName)}>
                    {getFileExtension(doc.fileName)}
                  </Badge>
                </div>

                <div className={textSub}>{doc.uploader}</div>

                <div className={textMuted}>{doc.uploadDate}</div>

                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={outlineButtonClass}
                    disabled={isDownloading}
                    onClick={(event) => handleDownload(doc, event)}
                  >
                    <Download className="size-4" />
                  </Button>

                  {canDeleteDocument(doc) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className={dangerButtonClass}
                      onClick={(event) => handleDelete(doc, event)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <FileText
              className={cn(
                "size-14 mx-auto mb-3",
                isDark ? "text-zinc-600" : "text-gray-300"
              )}
            />
            <p className={textMuted}>등록된 문서가 없습니다.</p>
          </div>
        )}
      </div>

      {filteredDocuments.length > 0 && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className={outlineButtonClass}
          >
            이전
          </Button>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={
                  currentPage === page ? primaryButtonClass : outlineButtonClass
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
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className={outlineButtonClass}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
}

export default DocumentsPage;