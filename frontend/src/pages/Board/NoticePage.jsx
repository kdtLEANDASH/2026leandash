import { useState } from "react";
import { Bell, Pin, Search as SearchIcon, Plus, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/UI/card";
import { Input } from "@/components/UI/input";
import { Badge } from "@/components/UI/badge";
import { Button } from "@/components/UI/button";
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
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

export function NoticePage() {
  const {
    notices,
    addNotice,
    incrementNoticeViews,
    currentUser,
    customSettings,
  } = useAppContext();

  const isDark = customSettings?.darkMode;
  const isHrAdmin =
    currentUser?.department === "인사팀" && currentUser?.role === "팀장";

  const location = useLocation();
  const navigate = useNavigate();
  const { noticeId } = useParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  const [formCategory, setFormCategory] = useState("전체");
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formIsPinned, setFormIsPinned] = useState(false);

  const categories = ["전체", "인사", "개발", "마케팅", "경영"];

  const pageClass = isDark
    ? "bg-[#27272a] text-white"
    : "bg-gray-50 text-gray-900";

  const sidebarClass = isDark
    ? "bg-[#35353d] border-[#5c5c73]"
    : "bg-white border-gray-200";

  const cardClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "bg-white border-gray-200";

  const innerClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white"
    : "bg-gray-50 border-gray-200";

  const inputClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white placeholder:text-zinc-400"
    : "";

  const textMain = isDark ? "text-white" : "text-gray-900";
  const textSub = isDark ? "text-zinc-300" : "text-gray-600";
  const textMuted = isDark ? "text-zinc-400" : "text-gray-500";

  const buttonPrimaryClass = isDark
    ? "bg-[#5c5c73] hover:bg-[#6a6a82] text-white"
    : "bg-blue-600 hover:bg-blue-700";

  const buttonOutlineClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white hover:bg-[#48484f]"
    : "";

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "전체" || notice.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const pinnedNotices = filteredNotices.filter((n) => n.isPinned);
  const regularNotices = filteredNotices.filter((n) => !n.isPinned);

  const getCategoryColor = (category) => {
    const colors = {
      전체: "bg-gray-100 text-gray-700 hover:bg-gray-100",
      인사: "bg-blue-100 text-blue-700 hover:bg-blue-100",
      개발: "bg-green-100 text-green-700 hover:bg-green-100",
      마케팅: "bg-purple-100 text-purple-700 hover:bg-purple-100",
      경영: "bg-orange-100 text-orange-700 hover:bg-orange-100",
    };

    return colors[category];
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
      author: currentUser,
      isPinned: formIsPinned,
      isNew: true,
    });

    setFormTitle("");
    setFormContent("");
    setFormCategory("전체");
    setFormIsPinned(false);
    setShowDialog(false);
  };

  const handleNoticeClick = (notice) => {
    incrementNoticeViews(notice.id);
    setSelectedNotice(notice);
  };

  const NoticeItem = ({ notice }) => (
    <Card
      className={cn(
        "transition-shadow cursor-pointer",
        isDark
          ? "bg-[#35353d] border-[#5c5c73] text-white hover:bg-[#3f3f48]"
          : "bg-white hover:shadow-lg"
      )}
      onClick={() => handleNoticeClick(notice)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1">
            {notice.isPinned && (
              <Pin className="size-4 text-red-500 flex-shrink-0" />
            )}

            <h3 className={cn("font-semibold flex-1", textMain)}>
              {notice.title}
            </h3>

            {notice.isNew && (
              <Badge className="bg-red-500 text-white hover:bg-red-500 flex-shrink-0">
                NEW
              </Badge>
            )}
          </div>
        </div>

        <p className={cn("text-sm mb-3 line-clamp-2", textSub)}>
          {notice.content}
        </p>

        <div
          className={cn(
            "flex items-center justify-between text-sm",
            textMuted
          )}
        >
          <div className="flex items-center gap-3">
            <Badge className={getCategoryColor(notice.category)}>
              {notice.category}
            </Badge>
            <span>
              {typeof notice.author === "object"
                ? notice.author?.name
                : notice.author}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span>{notice.date}</span>
            <span>조회 {notice.views}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={cn("flex h-full", pageClass)}>
      <aside className={cn("w-64 border-r flex flex-col", sidebarClass)}>
        <div className="p-6 space-y-2">
          <Link
            to="/notice"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              location.pathname === "/notice"
                ? isDark
                  ? "bg-[#5c5c73] text-white font-medium"
                  : "bg-blue-50 text-blue-600 font-medium"
                : isDark
                ? "text-zinc-300 hover:bg-[#48484f]"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <Bell className="size-5" />
            <span>공지사항</span>
          </Link>

          <Link
            to="/heart-letter"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              location.pathname === "/heart-letter"
                ? isDark
                  ? "bg-[#5c5c73] text-white font-medium"
                  : "bg-blue-50 text-blue-600 font-medium"
                : isDark
                ? "text-zinc-300 hover:bg-[#48484f]"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <Heart className="size-5" />
            <span>마음의 편지</span>
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <SearchIcon
                  className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 size-5",
                    isDark ? "text-zinc-400" : "text-gray-400"
                  )}
                />
                <Input
                  type="text"
                  placeholder="공지사항 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={cn("pl-10", inputClass)}
                />
              </div>
            </div>
          </div>

          {selectedNotice ? (
            <Card className={cn("mb-6", cardClass)}>
              <CardContent className="p-6">
                <div
                  className={cn(
                    "border-b pb-4 mb-6",
                    isDark ? "border-[#5c5c73]" : "border-gray-200"
                  )}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={cn("text-2xl font-bold", textMain)}>
                      공지사항 게시
                    </h2>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedNotice(null)}
                      className={buttonOutlineClass}
                    >
                      목록으로
                    </Button>
                  </div>

                  <div className={cn("text-sm", textSub)}>
                    <p className="mb-1">
                      작성자:{" "}
                      {typeof selectedNotice.author === "object"
                        ? selectedNotice.author?.name
                        : selectedNotice.author}{" "}
                      / 날짜: {selectedNotice.date}
                    </p>
                    <p>조회수: {selectedNotice.views}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className={cn("text-xl font-semibold mb-2", textMain)}>
                    제목
                  </h3>

                  <div className="flex items-center gap-2">
                    {selectedNotice.isPinned && (
                      <Pin className="size-5 text-red-500" />
                    )}
                    <p className={isDark ? "text-zinc-200" : "text-gray-800"}>
                      {selectedNotice.title}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className={cn("text-xl font-semibold mb-4", textMain)}>
                    공지 내용
                  </h3>

                  <div className={cn("border rounded-lg p-6 min-h-[200px]", innerClass)}>
                    <p className={cn("whitespace-pre-wrap leading-relaxed", textSub)}>
                      {selectedNotice.content}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className={cn("text-xl font-semibold mb-4", textMain)}>
                    결재 파일
                  </h3>

                  <div className={cn("border rounded-lg p-4", innerClass)}>
                    <p className={cn("text-sm", textMuted)}>
                      첨부된 파일이 없습니다.
                    </p>
                  </div>
                </div>

                <div
                  className={cn(
                    "flex items-center justify-between pt-4 border-t",
                    isDark ? "border-[#5c5c73]" : "border-gray-200"
                  )}
                >
                  <div className={cn("flex gap-4 text-sm", textSub)}>
                    <button
                      className={
                        isDark ? "hover:text-white" : "hover:text-blue-600"
                      }
                    >
                      ▲ 작성 글
                    </button>
                    <button
                      className={
                        isDark ? "hover:text-white" : "hover:text-blue-600"
                      }
                    >
                      ▼ 인용 글
                    </button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className={buttonOutlineClass}
                  >
                    제목
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={
                        selectedCategory === category ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={
                        selectedCategory === category
                          ? buttonPrimaryClass
                          : buttonOutlineClass
                      }
                    >
                      {category}
                    </Button>
                  ))}

                  {currentUser &&
                    (currentUser.role === "최고관리자" ||
                      currentUser.role === "팀장" ||
                      isHrAdmin) && (
                      <Dialog open={showDialog} onOpenChange={setShowDialog}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            className={cn("ml-auto", buttonPrimaryClass)}
                          >
                            <Plus className="size-4 mr-2" />
                            {isHrAdmin ? "사내공지 작성" : "공지 작성"}
                          </Button>
                        </DialogTrigger>

                        <DialogContent
                          className={cn(
                            "max-w-2xl",
                            isDark
                              ? "bg-[#35353d] border-[#5c5c73] text-white"
                              : ""
                          )}
                        >
                          <DialogHeader>
                            <DialogTitle>새 공지사항 작성</DialogTitle>
                          </DialogHeader>

                          <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                              <Label htmlFor="category">카테고리</Label>
                              <Select
                                value={formCategory}
                                onValueChange={(value) =>
                                  setFormCategory(value)
                                }
                              >
                                <SelectTrigger
                                  className={
                                    isDark
                                      ? "bg-[#2f2f36] border-[#5c5c73] text-white"
                                      : ""
                                  }
                                >
                                  <SelectValue placeholder="카테고리 선택" />
                                </SelectTrigger>

                                <SelectContent
                                  className={
                                    isDark
                                      ? "bg-[#35353d] border-[#5c5c73] text-white"
                                      : ""
                                  }
                                >
                                  <SelectItem value="전체">전체</SelectItem>
                                  <SelectItem value="인사">인사</SelectItem>
                                  <SelectItem value="개발">개발</SelectItem>
                                  <SelectItem value="마케팅">마케팅</SelectItem>
                                  <SelectItem value="경영">경영</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="title">제목</Label>
                              <Input
                                id="title"
                                placeholder="공지사항 제목을 입력하세요"
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                className={inputClass}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="content">내용</Label>
                              <Textarea
                                id="content"
                                placeholder="공지사항 내용을 작성하세요"
                                rows={8}
                                value={formContent}
                                onChange={(e) => setFormContent(e.target.value)}
                                className={inputClass}
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="pinned"
                                className="size-4 rounded border-gray-300"
                                checked={formIsPinned}
                                onChange={(e) =>
                                  setFormIsPinned(e.target.checked)
                                }
                              />
                              <Label
                                htmlFor="pinned"
                                className="text-sm font-normal cursor-pointer"
                              >
                                상단 고정
                              </Label>
                            </div>

                            <div className="flex gap-3">
                              <Button
                                type="submit"
                                className={cn("flex-1", buttonPrimaryClass)}
                              >
                                등록하기
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowDialog(false)}
                                className={buttonOutlineClass}
                              >
                                취소
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}
                </div>
              </div>

              {pinnedNotices.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Pin className="size-5 text-red-500" />
                    <h3 className={cn("font-semibold", textMain)}>
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
                {regularNotices.map((notice) => (
                  <NoticeItem key={notice.id} notice={notice} />
                ))}
              </div>

              {filteredNotices.length === 0 && (
                <div className="text-center py-16">
                  <Bell
                    className={cn(
                      "size-16 mx-auto mb-4",
                      isDark ? "text-zinc-600" : "text-gray-300"
                    )}
                  />
                  <p className={textMuted}>검색 결과가 없습니다.</p>
                </div>
              )}
            </>
          )}

          <div className="mt-8 text-center">
            <p className={cn("text-sm", textMuted)}>▲ 페이지 진입화면</p>
          </div>
        </div>
      </main>
    </div>
  );
}