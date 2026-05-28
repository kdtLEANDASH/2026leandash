import { useEffect, useState } from "react";
import {
  Bell,
  Pin,
  Search as SearchIcon,
  Plus,
  FileText,
  Upload,
} from "lucide-react";
import { Card, CardContent } from "@/components/UI/card";
import { Input } from "@/components/UI/input";
import { Badge } from "@/components/UI/badge";
import { Button } from "@/components/UI/button";
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
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { cn } from "@/components/UI/utils";

export function NoticePage() {
  const {
    notices,
    addNotice,
    incrementNoticeViews,
    currentUser,
    customSettings,
  } = useAppContext();

  const isDark = customSettings?.darkMode;

  const location = useLocation();
  const navigate = useNavigate();
  const { noticeId } = useParams();

  const isHrAdmin =
    currentUser?.department === "인사팀" && currentUser?.role === "팀장";

  const canWriteNotice =
    currentUser?.role === "최고관리자" ||
    currentUser?.role === "팀장" ||
    isHrAdmin;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");

  const [formCategory, setFormCategory] = useState("전체");
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formIsPinned, setFormIsPinned] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [viewedNoticeId, setViewedNoticeId] = useState(null);

  const noticesPerPage = 4;

  const categories = ["전체", "인사", "개발", "마케팅", "경영"];

  const darkCardClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "bg-white border-gray-200";

  const darkHoverCardClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white hover:bg-[#3f3f48]"
    : "bg-white border-gray-200 hover:bg-gray-50";

  const darkInnerBoxClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-zinc-100"
    : "bg-gray-50 border-gray-200 text-gray-700";

  const activeTabClass = isDark
    ? "bg-[#6b6b78] hover:bg-[#747482] border-[#8b8b96] text-white shadow-sm"
    : "bg-blue-600 hover:bg-blue-700 border-blue-600 text-white";

  const inactiveTabClass = isDark
    ? "bg-transparent border-transparent text-zinc-100 hover:bg-[#3f3f48] hover:border-[#5c5c73]"
    : "bg-white hover:bg-gray-50 border-gray-200 text-gray-700";

  const primaryButtonClass = isDark
    ? "bg-[#5c5c73] hover:bg-[#6a6a82] text-white"
    : "bg-blue-600 hover:bg-blue-700 text-white";

  const isWriteMode =
    noticeId === "write" || location.pathname === "/notice/write";

  const selectedNotice =
    noticeId && noticeId !== "write"
      ? notices.find((notice) => String(notice.id) === String(noticeId))
      : null;

  const filteredNotices = notices.filter((notice) => {
    const title = notice.title || "";
    const content = notice.content || "";

    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "전체" || notice.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const pinnedNotices = filteredNotices.filter((notice) => notice.isPinned);
  const regularNotices = filteredNotices.filter((notice) => !notice.isPinned);

  const totalPages = Math.ceil(regularNotices.length / noticesPerPage);

  const paginatedRegularNotices = regularNotices.slice(
    (currentPage - 1) * noticesPerPage,
    currentPage * noticesPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    if (!selectedNotice) return;
    if (viewedNoticeId === selectedNotice.id) return;

    incrementNoticeViews(selectedNotice.id);
    setViewedNoticeId(selectedNotice.id);
  }, [selectedNotice, viewedNoticeId, incrementNoticeViews]);

  const getCategoryColor = (category) => {
    const colors = {
      전체: isDark
        ? "bg-[#5c5c73] text-white hover:bg-[#5c5c73]"
        : "bg-gray-100 text-gray-700 hover:bg-gray-100",
      인사: "bg-blue-100 text-blue-700 hover:bg-blue-100",
      개발: "bg-green-100 text-green-700 hover:bg-green-100",
      마케팅: "bg-purple-100 text-purple-700 hover:bg-purple-100",
      경영: "bg-orange-100 text-orange-700 hover:bg-orange-100",
    };

    return colors[category] || colors["전체"];
  };

  const resetForm = () => {
    setFormTitle("");
    setFormContent("");
    setFormCategory("전체");
    setFormIsPinned(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formTitle.trim() || !formContent.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    addNotice({
      title: formTitle,
      content: formContent,
      category: formCategory,
      author: currentUser?.name || "관리자",
      isPinned: formIsPinned,
      isNew: true,
    });

    resetForm();
    alert("공지사항이 등록되었습니다.");
    navigate("/notice");
  };

  const NoticeItem = ({ notice }) => {
    return (
      <Card
        className={cn(
          "transition-shadow cursor-pointer border",
          darkHoverCardClass
        )}
        onClick={() => navigate(`/notice/${notice.id}`)}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-1">
              {notice.isPinned && (
                <Pin className="size-4 text-red-500 flex-shrink-0" />
              )}

              <h3
                className={cn(
                  "font-semibold flex-1",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                {notice.title}
              </h3>

              {notice.isNew && (
                <Badge className="bg-red-500 text-white hover:bg-red-500 flex-shrink-0">
                  NEW
                </Badge>
              )}
            </div>
          </div>

          <p
            className={cn(
              "text-sm mb-3 line-clamp-2",
              isDark ? "text-zinc-200" : "text-gray-600"
            )}
          >
            {notice.content}
          </p>

          <div
            className={cn(
              "flex items-center justify-between text-sm",
              isDark ? "text-zinc-300" : "text-gray-500"
            )}
          >
            <div className="flex items-center gap-3">
              <Badge className={getCategoryColor(notice.category)}>
                {notice.category}
              </Badge>
              <span>{notice.author}</span>
            </div>

            <div className="flex items-center gap-3">
              <span>{notice.date}</span>
              <span>조회 {notice.views}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isWriteMode) {
    if (!canWriteNotice) {
      return (
        <div className="p-6">
          <Card className={cn(darkCardClass)}>
            <CardContent className="py-16 text-center">
              <p className="text-gray-500 mb-4">
                공지사항 작성 권한이 없습니다.
              </p>
              <Button variant="outline" onClick={() => navigate("/notice")}>
                목록으로 돌아가기
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="p-6">
        <Card className={cn("rounded-xl shadow-none border", darkCardClass)}>
          <CardContent className="p-6">
            <h2
              className={cn(
                "text-lg font-semibold mb-6",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              공지사항 등록
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">공지 제목</Label>
                <Input
                  id="title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="공지 제목을 입력하세요"
                  className={cn(
                    "h-11 border",
                    isDark
                      ? "bg-[#2f2f36] border-[#5c5c73] text-white"
                      : "bg-gray-100 border-0"
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">카테고리</Label>

                <div className="w-33">
                  <Select
                    value={formCategory}
                    onValueChange={(value) => setFormCategory(value)}
                  >
                    <SelectTrigger
                      className={cn(
                        "h-11 rounded-md border px-4 text-sm shadow-sm focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                        isDark
                          ? "bg-[#2f2f36] border-[#5c5c73] text-white"
                          : "bg-white border-gray-300 focus:border-gray-400"
                      )}
                    >
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="전체">전체</SelectItem>
                      <SelectItem value="인사">인사</SelectItem>
                      <SelectItem value="개발">개발</SelectItem>
                      <SelectItem value="마케팅">마케팅</SelectItem>
                      <SelectItem value="경영">경영</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">공지 내용</Label>
                <Textarea
                  id="content"
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="공지 내용을 입력하세요."
                  className={cn(
                    "min-h-[260px] resize-none border",
                    isDark
                      ? "bg-[#2f2f36] border-[#5c5c73] text-white"
                      : "bg-gray-100 border-0"
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notice-file">첨부파일</Label>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <FileText className="size-7 text-gray-400" />
                    <Plus className="absolute -right-2 bottom-0 size-4 text-gray-400" />
                  </div>

                  <label
                    htmlFor="notice-file"
                    className={cn(
                      "inline-flex h-10 cursor-pointer items-center border px-5 text-sm font-medium",
                      isDark
                        ? "border-[#5c5c73] bg-[#2f2f36] text-white hover:bg-[#3f3f48]"
                        : "border-gray-400 bg-white text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    파일 선택
                  </label>

                  <input id="notice-file" type="file" className="hidden" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinned"
                  checked={formIsPinned}
                  onChange={(e) => setFormIsPinned(e.target.checked)}
                  className="size-4 rounded border-gray-300"
                />
                <Label
                  htmlFor="pinned"
                  className="text-sm font-normal cursor-pointer"
                >
                  상단 고정
                </Label>
              </div>

              <div
                className={cn(
                  "flex justify-end gap-3 border-t pt-5",
                  isDark ? "border-[#5c5c73]" : "border-gray-100"
                )}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    navigate("/notice");
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

  if (noticeId && noticeId !== "write" && !selectedNotice) {
    return (
      <div className="p-6">
        <Card className={cn(darkCardClass)}>
          <CardContent className="py-16 text-center">
            <p className="text-gray-500 mb-4">존재하지 않는 공지사항입니다.</p>
            <Button variant="outline" onClick={() => navigate("/notice")}>
              목록으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedNotice) {
    return (
      <div className="p-6">
        <Card className={cn("mb-6", darkCardClass)}>
          <CardContent className="p-6">
            <div
              className={cn(
                "border-b pb-4 mb-6",
                isDark ? "border-[#5c5c73]" : "border-gray-200"
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <h2
                  className={cn(
                    "text-2xl font-bold",
                    isDark ? "text-white" : "text-gray-900"
                  )}
                >
                  공지사항 게시
                </h2>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/notice")}
                >
                  목록으로
                </Button>
              </div>

              <div
                className={cn(
                  "text-sm",
                  isDark ? "text-zinc-300" : "text-gray-600"
                )}
              >
                <p className="mb-1">
                  작성자: {selectedNotice.author} / 날짜: {selectedNotice.date}
                </p>
                <p>조회수: {selectedNotice.views}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3
                className={cn(
                  "text-xl font-semibold mb-2",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                제목
              </h3>

              <div className="flex items-center gap-2">
                {selectedNotice.isPinned && (
                  <Pin className="size-5 text-red-500" />
                )}

                <p className={isDark ? "text-zinc-100" : "text-gray-800"}>
                  {selectedNotice.title}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h3
                className={cn(
                  "text-xl font-semibold mb-4",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                공지 내용
              </h3>

              <div
                className={cn(
                  "border rounded-lg p-6 min-h-[200px]",
                  darkInnerBoxClass
                )}
              >
                <p className="whitespace-pre-wrap leading-relaxed">
                  {selectedNotice.content}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h3
                className={cn(
                  "text-xl font-semibold mb-4",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                첨부 파일
              </h3>

              <div className={cn("border rounded-lg p-4", darkInnerBoxClass)}>
                <p
                  className={cn(
                    "text-sm",
                    isDark ? "text-zinc-300" : "text-gray-500"
                  )}
                >
                  첨부된 파일이 없습니다.
                </p>
              </div>
            </div>

            <div
              className={cn(
                "flex items-center justify-end pt-4 border-t",
                isDark ? "border-[#5c5c73]" : "border-gray-200"
              )}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/notice")}
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
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />

            <Input
              type="text"
              placeholder="공지사항 검색..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex gap-2">
          {categories.map((category) => {
            const isSelected = selectedCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1);
                }}
                className={cn(
                  "h-9 px-4 rounded-md text-sm font-medium border transition-colors",
                  isSelected ? activeTabClass : inactiveTabClass
                )}
              >
                {category}
              </button>
            );
          })}

          {canWriteNotice && (
            <Button
              size="sm"
              className={cn("ml-auto", primaryButtonClass)}
              onClick={() => navigate("/notice/write")}
            >
              <Plus className="size-4 mr-2" />
              {isHrAdmin ? "사내공지 작성" : "공지 작성"}
            </Button>
          )}
        </div>
      </div>

      {pinnedNotices.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Pin className="size-5 text-red-500" />
            <h3
              className={cn(
                "font-semibold",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              고정 공지
            </h3>
          </div>

          <div className="space-y-3">
            {pinnedNotices.map((notice) => (
              <NoticeItem key={notice.id} notice={notice} />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {paginatedRegularNotices.map((notice) => (
          <NoticeItem key={notice.id} notice={notice} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
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
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "h-8 min-w-8 px-3 rounded-md text-sm font-medium border transition-colors",
                  currentPage === page ? activeTabClass : inactiveTabClass
                )}
              >
                {page}
              </button>
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

      {filteredNotices.length === 0 && (
        <div className="text-center py-16">
          <Bell className="size-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">검색 결과가 없습니다.</p>
        </div>
      )}

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">▲ 페이지 진입화면</p>
      </div>
    </div>
  );
}