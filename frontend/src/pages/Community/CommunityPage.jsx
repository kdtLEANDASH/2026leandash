import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Flame,
  Eye,
  MessageSquare,
  Search,
  PencilLine,
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Badge } from "@/components/UI/badge";
import { cn } from "@/components/UI/utils";
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

const STORAGE_KEY = "community_posts";

const defaultPosts = [
  {
    id: 1,
    type: "공지",
    category: "공지",
    title: "사내 커뮤니티 이용 안내",
    author: "관리자",
    date: "04.16",
    views: 312,
    comments: 4,
    likes: 0,
    content:
      "사내 커뮤니티는 자유로운 소통을 위한 공간입니다.\n서로 예의를 지켜주세요.",
  },
  {
    id: 2,
    type: "인기",
    category: "사진/영상",
    title: "점심시간 풍경 사진 올려봐요",
    author: "김민수",
    date: "04.16",
    views: 727,
    comments: 9,
    likes: 45,
    content: "오늘 점심시간 풍경 사진 공유합니다.",
  },
  {
    id: 3,
    type: "일반",
    category: "잡담",
    title: "일하기 싫다",
    author: "백도빈",
    date: "1분 전",
    views: 0,
    comments: 0,
    likes: 0,
    content: "다들 오늘 컨디션 어떤가요?",
  },
];

export function CommunityPage() {
  const navigate = useNavigate();
  const { currentUser } = useAppContext();

  const canWriteNotice = currentUser?.role === "최고관리자" || currentUser?.role === "팀장";
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 8;

  const [showWriteDialog, setShowWriteDialog] = useState(false);
  const [formCategory, setFormCategory] = useState("잡담");
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");

  const categories = ["전체", "잡담", "사진/영상", "정보", "이벤트", "공지"];

  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultPosts;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchKeyword]);

  const filteredPosts = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesCategory =
        selectedCategory === "전체" ? true : post.category === selectedCategory;

      const matchesKeyword =
        keyword === ""
          ? true
          : post.title.toLowerCase().includes(keyword) ||
            post.author.toLowerCase().includes(keyword) ||
            (post.content || "").toLowerCase().includes(keyword);

      return matchesCategory && matchesKeyword;
    });
  }, [posts, selectedCategory, searchKeyword]);

  const pinnedNoticePosts = filteredPosts.filter((post) => post.type === "공지");
  const popularPosts = filteredPosts.filter(
    (post) => post.type !== "공지" && (post.comments || 0) >= 10
  );
  const regularPosts = filteredPosts.filter(
    (post) => post.type !== "공지" && (post.comments || 0) < 10
  );

  const totalPages = Math.max(1, Math.ceil(regularPosts.length / postsPerPage));
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedRegularPosts = regularPosts.slice(
    startIndex,
    startIndex + postsPerPage
  );

  const getTypeBadge = (post) => {
    if (post.type === "공지") {
      return (
        <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
          공지
        </Badge>
      );
    }

    if (post.type !== "공지" && (post.comments || 0) >= 10) {
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
          인기
        </Badge>
      );
    }

    return null;
  };

  const getCategoryColor = (category) => {
    const map = {
      잡담: "text-blue-600",
      "사진/영상": "text-teal-600",
      정보: "text-red-600",
      이벤트: "text-orange-500",
      공지: "text-red-500",
    };

    return map[category] || "text-gray-600";
  };

  const handleWriteSubmit = (e) => {
    e.preventDefault();

    if (!formTitle.trim() || !formContent.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    if (formCategory === "공지" && !canWriteNotice) {
      alert("일반직원은 공지글을 작성할 수 없습니다.");
      return;
    }

    const newPost = {
      id: Math.max(0, ...posts.map((p) => p.id)) + 1,
      type: formCategory === "공지" ? "공지" : "일반",
      category: formCategory,
      title: formTitle,
      author: currentUser?.name || "익명",
      date: "방금 전",
      views: 0,
      comments: 0,
      likes: 0,
      content: formContent,
    };

    setPosts([newPost, ...posts]);
    setFormCategory("잡담");
    setFormTitle("");
    setFormContent("");
    setShowWriteDialog(false);
    setSelectedCategory("전체");
    setCurrentPage(1);
  };

  const renderPostItem = (post, extraClass = "") => (
    <li
      key={post.id}
      className={cn(
        "px-5 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors",
        extraClass
      )}
      onClick={() => navigate(`/community/${post.id}`)}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 pt-0.5">{getTypeBadge(post)}</div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-medium text-gray-900 break-words">
              {post.title}
            </h3>
            {post.comments > 0 && (
              <span className="text-blue-600 font-medium">
                [{post.comments}]
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            <span>{post.date}</span>
            <span className={getCategoryColor(post.category)}>
              {post.category}
            </span>
            <span>{post.author}</span>
            <span className="flex items-center gap-1">
              <Eye className="size-3.5" />
              {post.views}
            </span>
            {typeof post.likes === "number" && (
              <span className="flex items-center gap-1">
                <Flame className="size-3.5" />
                {post.likes}
              </span>
            )}
            <span className="flex items-center gap-1">
              <MessageSquare className="size-3.5" />
              {post.comments}
            </span>
          </div>
        </div>
      </div>
    </li>
  );

  const hasAnyPosts =
    pinnedNoticePosts.length > 0 ||
    popularPosts.length > 0 ||
    regularPosts.length > 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">커뮤니티</h2>
          <p className="text-gray-600 mt-1">
            사내 자유 게시판과 인기글을 확인하세요
          </p>
        </div>

        <Dialog open={showWriteDialog} onOpenChange={setShowWriteDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <PencilLine className="size-4 mr-2" />
              글쓰기
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>커뮤니티 글쓰기</DialogTitle>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleWriteSubmit}>
              <div className="space-y-2">
                <Label>카테고리</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="잡담">잡담</SelectItem>
                    <SelectItem value="사진/영상">사진/영상</SelectItem>
                    <SelectItem value="정보">정보</SelectItem>
                    <SelectItem value="이벤트">이벤트</SelectItem>
                    {canWriteNotice && <SelectItem value="공지">공지</SelectItem>}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>제목</Label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <Label>내용</Label>
                <Textarea
                  rows={8}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="내용을 입력하세요"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="size-4 mr-2" />
                  등록하기
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowWriteDialog(false)}
                >
                  취소
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="border-b border-gray-200 px-4 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="게시글 검색"
                  className="pl-9"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm border transition-colors",
                      selectedCategory === category
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            {!hasAnyPosts ? (
              <div className="py-16 text-center text-gray-500">
                조건에 맞는 게시글이 없습니다.
              </div>
            ) : (
              <>
                <ul>
                  {pinnedNoticePosts.map((post) => renderPostItem(post, "bg-gray-50"))}
                  {popularPosts.map((post) =>
                    renderPostItem(post, "bg-blue-50/40")
                  )}
                  {paginatedRegularPosts.map((post) => renderPostItem(post))}
                </ul>

                {regularPosts.length > 0 && totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 px-5 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      이전
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          size="sm"
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => setCurrentPage(page)}
                          className="min-w-9"
                        >
                          {page}
                        </Button>
                      )
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      다음
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}