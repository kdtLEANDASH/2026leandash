import { useMemo, useState } from "react";
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Search,
  Plus,
  ChevronDown,
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

export function DocumentsPage() {
  const {
    currentUser,
    employees,
    documents,
    addDocument,
    deleteDocument,
    customSettings,
  } = useAppContext();

  const isDark = customSettings?.darkMode;

  const [mode, setMode] = useState("list");
  const [selectedDocument, setSelectedDocument] = useState(null);

  const [selectedDepartment, setSelectedDepartment] = useState("전체");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const documentsPerPage = 3;

  const [formTitle, setFormTitle] = useState("");
  const [formDepartment, setFormDepartment] = useState(
    currentUser?.department || "개발팀"
  );
  const [formContent, setFormContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const primaryButtonClass = isDark
    ? "bg-[#5c5c73] hover:bg-[#6a6a82] text-white"
    : "bg-blue-600 hover:bg-blue-700 text-white";

  const darkCardClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "bg-white border-gray-200";

  const darkInnerBoxClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white"
    : "bg-white border-gray-200";

  const darkTableHeaderClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-zinc-200"
    : "bg-gray-50 border-gray-200 text-gray-600";

  const darkTableRowClass = isDark
    ? "hover:bg-[#3f3f48] border-[#5c5c73] text-zinc-100"
    : "hover:bg-gray-50 border-gray-100 text-gray-900";

  const activePageClass = isDark
    ? "bg-[#5c5c73] hover:bg-[#6a6a82] text-white"
    : "bg-blue-600 hover:bg-blue-700 text-white";

  const departments = useMemo(() => {
    const list = [...new Set(employees.map((emp) => emp.department))];
    return list.filter((dept) => dept && dept !== "경영진");
  }, [employees]);

  const filteredDocuments = documents.filter((doc) => {
    const matchesDepartment =
      selectedDepartment === "전체" || doc.department === selectedDepartment;

    const lowerSearch = searchTerm.toLowerCase();

    const matchesSearch =
      doc.title.toLowerCase().includes(lowerSearch) ||
      doc.fileName.toLowerCase().includes(lowerSearch) ||
      doc.department.toLowerCase().includes(lowerSearch) ||
      doc.uploader.toLowerCase().includes(lowerSearch);

    return matchesDepartment && matchesSearch;
  });

  const totalPages = Math.ceil(filteredDocuments.length / documentsPerPage);

  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * documentsPerPage,
    currentPage * documentsPerPage
  );

  const getFileSize = (size) => {
    if (!size) return "-";

    const kb = size / 1024;
    const mb = kb / 1024;

    if (mb >= 1) {
      return `${mb.toFixed(1)} MB`;
    }

    return `${kb.toFixed(0)} KB`;
  };

  const getFileTypeColor = (fileName) => {
    const extension = fileName.split(".").pop()?.toLowerCase();

    if (extension === "pdf") {
      return "bg-red-100 text-red-700 hover:bg-red-100";
    }

    if (["doc", "docx"].includes(extension)) {
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

  const getFileExtension = (fileName) => {
    return fileName.split(".").pop()?.toUpperCase() || "FILE";
  };

  const resetForm = () => {
    setFormTitle("");
    setFormDepartment(currentUser?.department || "개발팀");
    setFormContent("");
    setSelectedFile(null);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();

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

    addDocument({
      title: formTitle,
      department: formDepartment,
      fileName: selectedFile.name,
      fileSize: getFileSize(selectedFile.size),
      uploader: currentUser?.name || "알 수 없음",
      description: formContent,
      fileUrl: URL.createObjectURL(selectedFile),
    });

    resetForm();
    setMode("list");
  };

  if (mode === "create") {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <Card className={cn(darkCardClass)}>
          <CardHeader>
            <CardTitle>문서 등록</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">문서 제목</Label>
                <Input
                  id="title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="문서 제목을 입력하세요"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">부서</Label>

                <div className="relative w-33">
                  <select
                    id="department"
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className={cn(
                      "w-full h-11 appearance-none rounded-md border px-3 pr-10 text-sm focus:outline-none focus:ring-0",
                      isDark
                        ? "bg-[#2f2f36] border-[#5c5c73] text-white"
                        : "bg-white border-gray-300 text-gray-900 focus:border-gray-300"
                    )}
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">문서 내용</Label>
                <Textarea
                  id="content"
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="문서에 대한 설명, 공유 내용, 참고 사항 등을 작성하세요."
                  className="min-h-[260px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">첨부파일</Label>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <FileText className="size-7 text-gray-400" />
                    <Plus className="absolute -right-2 bottom-0 size-4 text-gray-400" />
                  </div>

                  <label
                    htmlFor="file"
                    className={cn(
                      "inline-flex cursor-pointer items-center border px-5 py-2 text-sm font-medium",
                      isDark
                        ? "border-[#5c5c73] bg-[#2f2f36] text-white hover:bg-[#3f3f48]"
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
                  onChange={(e) => setSelectedFile(e.target.files?.[0])}
                />

                {selectedFile && (
                  <div
                    className={cn(
                      "mt-3 flex items-center gap-2 text-sm",
                      isDark ? "text-zinc-300" : "text-gray-600"
                    )}
                  >
                    <FileText className="size-4 text-gray-500" />
                    <span>{selectedFile.name}</span>
                    <span className="text-gray-400">·</span>
                    <span>{getFileSize(selectedFile.size)}</span>
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
                >
                  취소
                </Button>

                <Button type="submit" className={cn(primaryButtonClass)}>
                  <Upload className="size-4 mr-2" />
                  등록하기
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
      <div className="p-6 max-w-5xl mx-auto">
        <Card className={cn(darkCardClass)}>
          <CardHeader>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline">{selectedDocument.department}</Badge>
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
                isDark ? "text-zinc-300" : "text-gray-500"
              )}
            >
              <span>업로더: {selectedDocument.uploader}</span>
              <span className="text-gray-300">|</span>
              <span>등록일: {selectedDocument.uploadDate}</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="min-h-[260px]">
              <div
                className={cn(
                  "whitespace-pre-wrap leading-relaxed",
                  isDark ? "text-zinc-100" : "text-gray-700"
                )}
              >
                {selectedDocument.description || "등록된 문서 내용이 없습니다."}
              </div>
            </div>

            <div
              className={cn(
                "border-t pt-5",
                isDark ? "border-[#5c5c73]" : "border-gray-100"
              )}
            >
              <h3
                className={cn(
                  "font-semibold mb-3",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                첨부파일
              </h3>

              <div
                className={cn(
                  "flex items-center justify-between gap-4 rounded-lg border p-4",
                  isDark
                    ? "border-[#5c5c73] bg-[#2f2f36]"
                    : "border-gray-200 bg-gray-50"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="size-6 text-gray-500 flex-shrink-0" />

                  <div className="min-w-0">
                    <p
                      className={cn(
                        "font-medium truncate",
                        isDark ? "text-white" : "text-gray-900"
                      )}
                    >
                      {selectedDocument.fileName}
                    </p>
                    <p
                      className={cn(
                        "text-sm",
                        isDark ? "text-zinc-300" : "text-gray-500"
                      )}
                    >
                      {selectedDocument.fileSize}
                    </p>
                  </div>
                </div>

                {selectedDocument.fileUrl ? (
                  <a
                    href={selectedDocument.fileUrl}
                    download={selectedDocument.fileName}
                  >
                    <Button variant="outline">
                      <Download className="size-4 mr-2" />
                      다운로드
                    </Button>
                  </a>
                ) : (
                  <Button variant="outline" disabled>
                    <Download className="size-4 mr-2" />
                    다운로드
                  </Button>
                )}
              </div>
            </div>

            <div
              className={cn(
                "flex justify-end gap-3 pt-4 border-t",
                isDark ? "border-[#5c5c73]" : "border-gray-100"
              )}
            >
              {(currentUser?.role === "최고관리자" ||
                currentUser?.name === selectedDocument.uploader) && (
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => {
                    deleteDocument(selectedDocument.id);
                    setSelectedDocument(null);
                    setMode("list");
                  }}
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2
            className={cn(
              "text-2xl font-semibold mb-1",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            문서함
          </h2>
          <p className={isDark ? "text-zinc-300" : "text-gray-600"}>
            부서별 문서를 업로드하고 공유할 수 있습니다.
          </p>
        </div>

        <Button
          className={cn(primaryButtonClass)}
          onClick={() => setMode("create")}
        >
          <Upload className="size-4 mr-2" />
          문서 업로드
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />

          <Input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="문서명, 파일명, 업로더 검색..."
            className="pl-10"
          />
        </div>

        <select
          value={selectedDepartment}
          onChange={(e) => {
            setSelectedDepartment(e.target.value);
            setCurrentPage(1);
          }}
          className={cn(
            "h-10 rounded-md border px-3 text-sm focus:outline-none focus:ring-2",
            isDark
              ? "bg-[#2f2f36] border-[#5c5c73] text-white focus:ring-[#6a6a82]"
              : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500"
          )}
        >
          <option value="전체">전체 부서</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      <div className={cn("border rounded-lg overflow-hidden", darkInnerBoxClass)}>
        <div
          className={cn(
            "grid grid-cols-[70px_120px_1fr_100px_120px_130px_120px] px-4 py-3 border-b text-sm font-medium",
            darkTableHeaderClass
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

        {filteredDocuments.length > 0 ? (
          <div className={isDark ? "divide-y divide-[#5c5c73]" : "divide-y divide-gray-100"}>
            {paginatedDocuments.map((doc, index) => (
              <div
                key={doc.id}
                onClick={() => {
                  setSelectedDocument(doc);
                  setMode("detail");
                }}
                className={cn(
                  "grid grid-cols-[70px_120px_1fr_100px_120px_130px_120px] items-center px-4 py-4 text-sm transition-colors cursor-pointer",
                  darkTableRowClass
                )}
              >
                <div className={isDark ? "text-zinc-300" : "text-gray-500"}>
                  {filteredDocuments.length -
                    ((currentPage - 1) * documentsPerPage + index)}
                </div>

                <div>
                  <Badge variant="outline">{doc.department}</Badge>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText className="size-4 text-gray-500 flex-shrink-0" />
                    <span
                      className={cn(
                        "font-medium truncate",
                        isDark ? "text-white" : "text-gray-900"
                      )}
                    >
                      {doc.title}
                    </span>
                  </div>

                  <div
                    className={cn(
                      "text-xs mt-1 truncate",
                      isDark ? "text-zinc-300" : "text-gray-500"
                    )}
                  >
                    {doc.description || doc.fileName}
                  </div>
                </div>

                <div>
                  <Badge className={getFileTypeColor(doc.fileName)}>
                    {getFileExtension(doc.fileName)}
                  </Badge>
                </div>

                <div className={isDark ? "text-zinc-300" : "text-gray-600"}>
                  {doc.uploader}
                </div>

                <div className={isDark ? "text-zinc-300" : "text-gray-500"}>
                  {doc.uploadDate}
                </div>

                <div className="flex items-center justify-center gap-2">
                  {doc.fileUrl ? (
                    <a
                      href={doc.fileUrl}
                      download={doc.fileName}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="outline" size="sm">
                        <Download className="size-4" />
                      </Button>
                    </a>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download className="size-4" />
                    </Button>
                  )}

                  {(currentUser?.role === "최고관리자" ||
                    currentUser?.name === doc.uploader) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDocument(doc.id);
                      }}
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
            <FileText className="size-14 text-gray-300 mx-auto mb-3" />
            <p className={isDark ? "text-zinc-400" : "text-gray-500"}>
              등록된 문서가 없습니다.
            </p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
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
                className={currentPage === page ? cn(activePageClass) : ""}
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
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
}

export default DocumentsPage;