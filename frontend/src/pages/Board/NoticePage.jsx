import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Search as SearchIcon,
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/UI/card";
import { Input } from "@/components/UI/input";
import { Button } from "@/components/UI/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/UI/dialog";
import { Label } from "@/components/UI/label";
import { Textarea } from "@/components/UI/textarea";
import { useAppContext } from "@/store/AppProvider";
import { createNoticeApi, getNoticeApi, getNoticesApi } from "@/api/noticeApi";

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

function toNoticeItem(item) {
  return {
    id: item.noticeId,
    title: item.title,
    content: item.content ?? "",
    writerName: item.writerName ?? "-",
    createdAt: item.createdAt ?? null,
    updatedAt: item.updatedAt ?? null,
  };
}

export function NoticePage() {
  const { currentUser } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [notices, setNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin =
    localStorage.getItem("userRole") === "ADMIN" ||
    currentUser?.role === "최고관리자";

  const loadNotices = async (keyword = "") => {
    try {
      setIsLoading(true);
      const result = await getNoticesApi(keyword);
      const data = unwrapResponse(result) ?? [];
      setNotices(data.map(toNoticeItem));
    } catch (error) {
      console.error("공지 목록 조회 실패:", error);
      alert("공지사항을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadNotices(searchTerm);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredNotices = useMemo(() => notices, [notices]);

  const handleOpenNotice = async (noticeId) => {
    try {
      const result = await getNoticeApi(noticeId);
      const detail = unwrapResponse(result);
      setSelectedNotice(toNoticeItem(detail));
    } catch (error) {
      console.error("공지 상세 조회 실패:", error);
      alert("공지 상세를 불러오지 못했습니다.");
    }
  };

  const handleCreateNotice = async (event) => {
    event.preventDefault();

    if (!formTitle.trim() || !formContent.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      await createNoticeApi({
        title: formTitle.trim(),
        content: formContent.trim(),
      });

      setFormTitle("");
      setFormContent("");
      setShowCreateDialog(false);
      await loadNotices(searchTerm);
    } catch (error) {
      console.error("공지 등록 실패:", error);
      alert("공지 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <Input
              type="text"
              placeholder="공지사항 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isAdmin && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="size-4 mr-2" />
                공지 작성
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>새 공지 작성</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleCreateNotice}>
                <div className="space-y-2">
                  <Label htmlFor="notice-title">제목</Label>
                  <Input
                    id="notice-title"
                    placeholder="공지 제목을 입력하세요"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notice-content">내용</Label>
                  <Textarea
                    id="notice-content"
                    rows={8}
                    placeholder="공지 내용을 작성하세요"
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "등록 중..." : "등록하기"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    취소
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-3">
        {filteredNotices.map((notice) => (
          <Card
            key={notice.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleOpenNotice(notice.id)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-semibold text-gray-900 flex-1">
                  {notice.title}
                </h3>
                <span className="text-sm text-gray-500 shrink-0">
                  {formatDate(notice.createdAt)}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {notice.content || "상세 내용은 클릭 후 확인할 수 있습니다."}
              </p>

              <div className="text-sm text-gray-500">
                작성자 {notice.writerName}
              </div>
            </CardContent>
          </Card>
        ))}

        {!isLoading && filteredNotices.length === 0 && (
          <div className="text-center py-16">
            <Bell className="size-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">공지사항이 없습니다.</p>
          </div>
        )}
      </div>

      <Dialog
        open={!!selectedNotice}
        onOpenChange={(open) => !open && setSelectedNotice(null)}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedNotice ? (
            <>
              <DialogHeader>
                <DialogTitle>{selectedNotice.title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="text-sm text-gray-500">
                  작성자 {selectedNotice.writerName} / 등록일{" "}
                  {formatDate(selectedNotice.createdAt)}
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-800 whitespace-pre-wrap">
                  {selectedNotice.content}
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
