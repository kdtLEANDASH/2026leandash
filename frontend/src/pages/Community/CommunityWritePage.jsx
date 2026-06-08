import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Upload } from "lucide-react";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Textarea } from "@/components/UI/textarea";
import { Label } from "@/components/UI/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/UI/card";
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
  STORAGE_KEY,
  defaultPosts,
  boardList,
} from "@/pages/Community/CommunityPage";

export function CommunityWritePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { currentUser, customSettings } = useAppContext();

  const isDark = customSettings?.darkMode;

  const isAdmin = currentUser?.role === "최고관리자";
  const userDepartment = currentUser?.department;

  const accessibleBoards = useMemo(() => {
    if (isAdmin) {
      return boardList;
    }

    return boardList.filter(
      (board) => board === "전체" || board === userDepartment
    );
  }, [isAdmin, userDepartment]);

  const queryBoard = searchParams.get("board");

  const initialBoard = accessibleBoards.includes(queryBoard)
    ? queryBoard
    : "전체";

  const canWriteNotice =
    currentUser?.role === "최고관리자" || currentUser?.role === "팀장";

  const [board, setBoard] = useState(initialBoard);
  const [category, setCategory] = useState("잡담");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const cardClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "bg-white border-gray-200";

  const primaryButtonClass = isDark
    ? "bg-[#5c5c73] hover:bg-[#6a6a82] text-white"
    : "bg-blue-600 hover:bg-blue-700 text-white";

  const inputClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white placeholder:text-zinc-400"
    : "";

  const selectContentClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "";

  const outlineButtonClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white hover:bg-[#48484f]"
    : "";

  const ghostButtonClass = isDark
    ? "text-zinc-200 hover:bg-[#48484f] hover:text-white"
    : "";

  const textMainClass = isDark ? "text-white" : "text-gray-900";
  const textSubClass = isDark ? "text-zinc-300" : "text-gray-600";
  const textMutedClass = isDark ? "text-zinc-400" : "text-gray-500";

  const getSavedPosts = () => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return defaultPosts;
    }

    try {
      return JSON.parse(saved);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return defaultPosts;
    }
  };

  const getToday = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${month}.${day}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!accessibleBoards.includes(board)) {
      alert("이 게시판에는 글을 작성할 수 없습니다.");
      return;
    }

    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    if (category === "공지" && !canWriteNotice) {
      alert("일반직원은 공지글을 작성할 수 없습니다.");
      return;
    }

    const posts = getSavedPosts();

    const newPost = {
      id: Math.max(0, ...posts.map((post) => post.id)) + 1,
      board,
      type: category === "공지" ? "공지" : "일반",
      category,
      title,
      author: currentUser?.name || "익명",
      date: getToday(),
      views: 0,
      comments: 0,
      likes: 0,
      content,
      commentList: [],
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify([newPost, ...posts]));

    alert("게시글이 등록되었습니다.");
    navigate("/community");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/community")}
          className={ghostButtonClass}
        >
          <ArrowLeft className="size-4 mr-2" />
          목록으로
        </Button>

        <div>
          <h2 className={cn("text-2xl font-semibold", textMainClass)}>
            커뮤니티 글쓰기
          </h2>

          <p className={textSubClass}>
            전체 게시판 또는 내 부서 게시판에 글을 작성할 수 있습니다
          </p>
        </div>
      </div>

      <Card className={cn("rounded-xl border", cardClass)}>
        <CardHeader
          className={isDark ? "border-b border-[#5c5c73]" : ""}
        >
          <CardTitle className={textMainClass}>게시글 작성</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>게시판</Label>

              <Select value={board} onValueChange={setBoard}>
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder="게시판 선택" />
                </SelectTrigger>

                <SelectContent className={selectContentClass}>
                  {accessibleBoards.map((boardName) => (
                    <SelectItem key={boardName} value={boardName}>
                      {boardName === "전체"
                        ? "전체 게시판"
                        : `${boardName} 게시판`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {!isAdmin && (
                <p className={cn("text-xs", textMutedClass)}>
                  다른 부서 게시판에는 접근하거나 글을 작성할 수 없습니다.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>카테고리</Label>

              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>

                <SelectContent className={selectContentClass}>
                  <SelectItem value="잡담">잡담</SelectItem>
                  <SelectItem value="사진/영상">사진/영상</SelectItem>
                  <SelectItem value="정보">정보</SelectItem>
                  <SelectItem value="이벤트">이벤트</SelectItem>
                  {canWriteNotice && <SelectItem value="공지">공지</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>

              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="게시글 제목을 입력하세요"
                className={cn("h-11", inputClass)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">내용</Label>

              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 입력하세요"
                className={cn("min-h-[320px] resize-none", inputClass)}
              />
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
                onClick={() => navigate("/community")}
                className={outlineButtonClass}
              >
                취소
              </Button>

              <Button type="submit" className={primaryButtonClass}>
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