import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  MessageSquare,
  Flame,
  CalendarDays,
  User,
  Pencil,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Badge } from "@/components/UI/badge";
import { Textarea } from "@/components/UI/textarea";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { useAppContext } from "@/store/AppProvider";

const STORAGE_KEY = "community_posts";
const COMMENT_KEY = "community_comments";

export function CommunityDetailPage() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const { currentUser } = useAppContext();

  const canWriteNotice =
  currentUser?.role === "최고관리자" || currentUser?.role === "팀장";

  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [comments, setComments] = useState(() => {
    const saved = localStorage.getItem(COMMENT_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  const [commentText, setCommentText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editCategory, setEditCategory] = useState("잡담");
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  const post = useMemo(
    () => posts.find((item) => item.id === Number(postId)),
    [posts, postId]
  );

  const postComments = comments[postId] || [];

  const isPostAuthor = !!currentUser && post && currentUser.name === post.author;
  const isAdmin = currentUser?.role === "최고관리자";

  const canEditPost = isPostAuthor;
  const canDeletePost = isPostAuthor || isAdmin;

  useEffect(() => {
    localStorage.setItem(COMMENT_KEY, JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    if (!postId) return;

    const id = Number(postId);
    const updated = posts.map((item) =>
      item.id === id ? { ...item, views: (item.views || 0) + 1 } : item
    );

    setPosts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (post) {
      setEditCategory(post.category);
      setEditTitle(post.title);
      setEditContent(post.content);
    }
  }, [post]);

  const getTypeBadge = (type) => {
    if (type === "공지") {
      return (
        <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
          공지
        </Badge>
      );
    }

    if (type === "인기") {
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
          인기
        </Badge>
      );
    }

    return (
      <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">
        일반
      </Badge>
    );
  };

  const handleCommentSubmit = () => {
    if (!commentText.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    const newComment = {
      id: Date.now(),
      author: currentUser?.name || "익명",
      content: commentText,
      date: new Date().toLocaleString("ko-KR"),
    };

    const updatedComments = {
      ...comments,
      [postId]: [...postComments, newComment],
    };

    setComments(updatedComments);
    setCommentText("");

    const updatedPosts = posts.map((item) =>
      item.id === Number(postId)
        ? { ...item, comments: (item.comments || 0) + 1 }
        : item
    );

    setPosts(updatedPosts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
  };

  const handleEditSave = () => {
    if (editCategory === "공지" && !canWriteNotice) {
      alert("일반직원은 공지글로 수정할 수 없습니다.");
      return;
    }

    const updatedPosts = posts.map((item) =>
      item.id === Number(postId)
        ? {
            ...item,
            category: editCategory,
            type:
              editCategory === "공지"
                ? "공지"
                : item.type === "공지"
                ? "일반"
                : item.type,
            title: editTitle,
            content: editContent,
          }
        : item
    );

    setPosts(updatedPosts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
    setIsEditing(false);
    alert("게시글이 수정되었습니다.");
  };

  const handleDeletePost = () => {
    const ok = window.confirm("이 게시글을 삭제할까요?");
    if (!ok) return;

    const updatedPosts = posts.filter((item) => item.id !== Number(postId));
    setPosts(updatedPosts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));

    const updatedComments = { ...comments };
    delete updatedComments[postId];
    setComments(updatedComments);
    localStorage.setItem(COMMENT_KEY, JSON.stringify(updatedComments));

    alert("게시글이 삭제되었습니다.");
    navigate("/community");
  };

  const startEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.content);
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  const saveEditComment = (commentId) => {
    if (!editingCommentText.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    const updatedCommentList = postComments.map((comment) =>
      comment.id === commentId
        ? {
            ...comment,
            content: editingCommentText,
            date: `${comment.date} (수정됨)`,
          }
        : comment
    );

    const updatedComments = {
      ...comments,
      [postId]: updatedCommentList,
    };

    setComments(updatedComments);
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  const deleteComment = (commentId) => {
    const ok = window.confirm("이 댓글을 삭제할까요?");
    if (!ok) return;

    const updatedCommentList = postComments.filter(
      (comment) => comment.id !== commentId
    );

    const updatedComments = {
      ...comments,
      [postId]: updatedCommentList,
    };

    setComments(updatedComments);

    const updatedPosts = posts.map((item) =>
      item.id === Number(postId)
        ? {
            ...item,
            comments: Math.max((item.comments || 1) - 1, 0),
          }
        : item
    );

    setPosts(updatedPosts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
  };

  if (!post) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-gray-500 mb-4">존재하지 않는 게시글입니다.</p>
            <Button variant="outline" onClick={() => navigate("/community")}>
              목록으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-gray-900">게시글 상세</h2>
        <div className="flex gap-2">
          {!isEditing && (
            <>
              {canEditPost && (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Pencil className="size-4 mr-2" />
                  수정
                </Button>
              )}

              {canDeletePost && (
                <Button variant="outline" onClick={handleDeletePost}>
                  <Trash2 className="size-4 mr-2" />
                  삭제
                </Button>
              )}
            </>
          )}
          <Button variant="outline" onClick={() => navigate("/community")}>
            <ArrowLeft className="size-4 mr-2" />
            목록으로
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          {!isEditing ? (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                {getTypeBadge(post.type)}
                <Badge className="bg-red-50 text-red-600 hover:bg-red-50">
                  {post.category}
                </Badge>
              </div>

              <CardTitle className="text-2xl break-words">{post.title}</CardTitle>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <User className="size-4" />
                  {post.author}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="size-4" />
                  {post.date}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="size-4" />
                  {post.views}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="size-4" />
                  {post.comments}
                </span>
                {typeof post.likes === "number" && (
                  <span className="flex items-center gap-1">
                    <Flame className="size-4" />
                    {post.likes}
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>카테고리</Label>
                <Select value={editCategory} onValueChange={setEditCategory}>
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
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <Label>내용</Label>
                <Textarea
                  rows={10}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="내용을 입력하세요"
                />
              </div>

              <div className="flex gap-2">
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleEditSave}>
                  저장
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  취소
                </Button>
              </div>
            </div>
          )}
        </CardHeader>

        {!isEditing && (
          <CardContent>
            <div className="min-h-[260px] rounded-lg border border-gray-200 bg-white p-5 whitespace-pre-line leading-7 text-gray-800">
              {post.content}
            </div>
          </CardContent>
        )}
      </Card>

      {!isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">댓글</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {postComments.length === 0 ? (
                <div className="text-gray-500 py-6 text-center">
                  아직 댓글이 없습니다.
                </div>
              ) : (
                postComments.map((comment) => {
                  const canEditComment =
                    !!currentUser &&
                    (currentUser.name === comment.author ||
                      currentUser.role === "최고관리자");

                  return (
                    <div
                      key={comment.id}
                      className="rounded-lg border border-gray-200 bg-white p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-medium text-gray-900">
                            {comment.author}
                          </span>
                          <span className="text-sm text-gray-500 ml-3">
                            {comment.date}
                          </span>
                        </div>

                        {canEditComment && editingCommentId !== comment.id && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditComment(comment)}
                            >
                              수정
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteComment(comment.id)}
                            >
                              삭제
                            </Button>
                          </div>
                        )}
                      </div>

                      {editingCommentId === comment.id ? (
                        <div className="space-y-3">
                          <Textarea
                            rows={4}
                            value={editingCommentText}
                            onChange={(e) => setEditingCommentText(e.target.value)}
                          />
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => saveEditComment(comment.id)}
                            >
                              저장
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={cancelEditComment}
                            >
                              취소
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="space-y-3">
              <Textarea
                rows={4}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="댓글을 입력하세요"
              />
              <div className="flex justify-end">
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleCommentSubmit}
                >
                  댓글 등록
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}