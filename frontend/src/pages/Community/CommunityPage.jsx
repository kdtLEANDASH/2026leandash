import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Flame,
  Eye,
  MessageSquare,
  Search,
  PencilLine,
} from "lucide-react";
import { Card, CardContent } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Badge } from "@/components/UI/badge";
import { cn } from "@/components/UI/utils";
import { useAppContext } from "@/store/AppProvider";

export const STORAGE_KEY = "community_posts";

export const boardList = [
  "전체",
  "개발팀",
  "마케팅팀",
  "인사팀",
  "경영지원팀",
  "디자인팀",
  "영업팀",
];

export const defaultPosts = [
  {
    id: 1,
    board: "전체",
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
    board: "개발팀",
    type: "일반",
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
    board: "개발팀",
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
  {
    id: 4,
    board: "인사팀",
    type: "일반",
    category: "정보",
    title: "인사팀 게시판 테스트 글",
    author: "박철수",
    date: "04.17",
    views: 10,
    comments: 0,
    likes: 0,
    content: "이 글은 인사팀 게시판에서만 보입니다.",
  },
];

export function CommunityPage() {
  const navigate = useNavigate();
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

  const [selectedBoard, setSelectedBoard] = useState("전체");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const postsPerPage = 2;

  const categories = ["전체", "잡담", "사진/영상", "정보", "이벤트", "공지"];

  const [posts, setPosts] = useState(() => {
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
  });

  useEffect(() => {
    if (!accessibleBoards.includes(selectedBoard)) {
      setSelectedBoard("전체");
    }
  }, [accessibleBoards, selectedBoard]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      setPosts(defaultPosts);
      return;
    }

    try {
      setPosts(JSON.parse(saved));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setPosts(defaultPosts);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBoard, selectedCategory, searchKeyword]);

  const canAccessPost = (post) => {
    const postBoard = post.board || "전체";

    if (postBoard === "전체") return true;
    if (isAdmin) return true;

    return postBoard === userDepartment;
  };

  const getPostAuthorLabel = (post) => {
    if (post.author === currentUser?.name) {
      return "내가 쓴 글";
    }

    return "익명";
  };

  const communityCardClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "bg-white border-gray-200";

  const communityHeaderClass = isDark
    ? "border-[#5c5c73] bg-[#35353d]"
    : "border-gray-200 bg-white";

  const normalPostClass = isDark
    ? "bg-[#35353d] hover:bg-[#3f3f48] border-[#5c5c73]"
    : "bg-white hover:bg-gray-50 border-gray-100";

  const noticePostClass = isDark
    ? "bg-[#41414a] hover:bg-[#484852] border-[#5c5c73]"
    : "bg-gray-50 hover:bg-gray-100 border-gray-100";

  const popularPostClass = isDark
    ? "bg-[#4a4a52] hover:bg-[#52525b] border-[#5c5c73]"
    : "bg-blue-50/40 hover:bg-blue-50 border-gray-100";

  const primaryButtonClass = isDark
    ? "bg-[#5c5c73] hover:bg-[#6a6a82] text-white"
    : "bg-blue-600 hover:bg-blue-700 text-white";

  const inputClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white placeholder:text-zinc-400"
    : "";

  const outlineButtonClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white hover:bg-[#48484f]"
    : "";

  const filteredPosts = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return posts.filter((post) => {
      if (!canAccessPost(post)) return false;

      const postBoard = post.board || "전체";

      const matchesBoard = postBoard === selectedBoard;

      const matchesCategory =
        selectedCategory === "전체" ? true : post.category === selectedCategory;

      const matchesKeyword =
        keyword === ""
          ? true
          : post.title.toLowerCase().includes(keyword) ||
            postBoard.toLowerCase().includes(keyword) ||
            post.category.toLowerCase().includes(keyword) ||
            (post.content || "").toLowerCase().includes(keyword);

      return matchesBoard && matchesCategory && matchesKeyword;
    });
  }, [
    posts,
    selectedBoard,
    selectedCategory,
    searchKeyword,
    isAdmin,
    userDepartment,
  ]);

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

  const renderPostItem = (post, postClassName = "") => {
    const isMyPost = post.author === currentUser?.name;

    return (
      <li
        key={post.id}
        className={cn(
          "px-5 py-4 border-b cursor-pointer transition-colors",
          postClassName
        )}
        onClick={() => navigate(`/community/${post.id}`)}
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0 pt-0.5">{getTypeBadge(post)}</div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className={cn(
                  "text-lg font-medium break-words",
                  isDark ? "text-white" : "text-gray-900"
                )}
              >
                {post.title}
              </h3>

              {post.comments > 0 && (
                <span className="text-blue-600 font-medium">
                  [{post.comments}]
                </span>
              )}
            </div>

            <div
              className={cn(
                "mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm",
                isDark ? "text-zinc-300" : "text-gray-500"
              )}
            >
              <span>{post.date}</span>

              <span
                className={cn(
                  "font-medium",
                  isDark ? "text-zinc-200" : "text-gray-700"
                )}
              >
                {post.board || "전체"} 게시판
              </span>

              <span className={getCategoryColor(post.category)}>
                {post.category}
              </span>

              <span
                className={cn(
                  isMyPost
                    ? isDark
                      ? "text-zinc-100 font-medium"
                      : "text-gray-800 font-medium"
                    : isDark
                    ? "text-zinc-400"
                    : "text-gray-500"
                )}
              >
                {getPostAuthorLabel(post)}
              </span>

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
  };

  const hasAnyPosts =
    pinnedNoticePosts.length > 0 ||
    popularPosts.length > 0 ||
    regularPosts.length > 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2
            className={cn(
              "text-2xl font-semibold",
              isDark ? "text-white" : "text-gray-900"
            )}
          >
            커뮤니티
          </h2>

          <p className={cn("mt-1", isDark ? "text-zinc-300" : "text-gray-600")}>
            전체 게시판과 내 부서 게시판을 이용할 수 있습니다
          </p>
        </div>

        <Button
          className={cn(primaryButtonClass)}
          onClick={() => navigate(`/community/write?board=${selectedBoard}`)}
        >
          <PencilLine className="size-4 mr-2" />
          글쓰기
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {accessibleBoards.map((board) => (
          <button
            key={board}
            type="button"
            onClick={() => setSelectedBoard(board)}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium border transition-colors",
              selectedBoard === board
                ? isDark
                  ? "bg-[#6b6b78] text-white border-[#8b8b96]"
                  : "bg-gray-900 text-white border-gray-900"
                : isDark
                ? "bg-[#35353d] text-zinc-100 border-[#5c5c73] hover:bg-[#3f3f48]"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            )}
          >
            {board === "전체" ? "전체 게시판" : `${board} 게시판`}
          </button>
        ))}
      </div>

      <Card className={cn(communityCardClass)}>
        <CardContent className="p-0">
          <div className={cn("border-b px-4 py-4", communityHeaderClass)}>
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />

                <Input
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder={`${selectedBoard} 게시판 검색`}
                  className={cn("pl-9", inputClass)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm border transition-colors",
                      selectedCategory === category
                        ? isDark
                          ? "bg-[#5c5c73] text-white border-[#5c5c73]"
                          : "bg-blue-600 text-white border-blue-600"
                        : isDark
                        ? "bg-[#35353d] text-zinc-100 border-[#5c5c73] hover:bg-[#3f3f48]"
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
              <div
                className={cn(
                  "py-16 text-center",
                  isDark ? "text-zinc-400" : "text-gray-500"
                )}
              >
                {selectedBoard} 게시판에 조건에 맞는 게시글이 없습니다.
              </div>
            ) : (
              <>
                <ul>
                  {pinnedNoticePosts.map((post) =>
                    renderPostItem(post, noticePostClass)
                  )}

                  {popularPosts.map((post) =>
                    renderPostItem(post, popularPostClass)
                  )}

                  {paginatedRegularPosts.map((post) =>
                    renderPostItem(post, normalPostClass)
                  )}
                </ul>

                {regularPosts.length > 0 && totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 px-5 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className={outlineButtonClass}
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
                          className={cn(
                            "min-w-9",
                            currentPage === page
                              ? primaryButtonClass
                              : outlineButtonClass
                          )}
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
                      className={outlineButtonClass}
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