import { useEffect, useState } from "react";
import { Bell, Pin, Search as SearchIcon, Plus, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/UI/card";
import { Input } from "@/components/UI/input";
import { Badge } from "@/components/UI/badge";
import { Button } from "@/components/UI/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/UI/dialog";
import { Label } from "@/components/UI/label";
import { Textarea } from "@/components/UI/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/UI/select";
import { useAppContext } from "@/store/AppProvider";
import { cn } from "@/components/UI/utils";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
export function NoticePage() {
    const { notices, addNotice, incrementNoticeViews, currentUser } = useAppContext();
    const isHrAdmin = currentUser?.department === "인사팀" && currentUser?.role === "팀장";
    const navigate = useNavigate();
    const { noticeId } = useParams();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("전체");
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    // Form states
    const [formCategory, setFormCategory] = useState("전체");
    const [formTitle, setFormTitle] = useState("");
    const [formContent, setFormContent] = useState("");
    const [formIsPinned, setFormIsPinned] = useState(false);
    const categories = ["전체", "인사", "개발", "마케팅", "경영"];
    const filteredNotices = notices.filter((notice) => {
        const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notice.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "전체" || notice.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    const pinnedNotices = filteredNotices.filter((n) => n.isPinned);
    const regularNotices = filteredNotices.filter((n) => !n.isPinned);
    const getCategoryColor = (category) => {
        const colors = {
            "전체": "bg-gray-100 text-gray-700 hover:bg-gray-100",
            "인사": "bg-blue-100 text-blue-700 hover:bg-blue-100",
            "개발": "bg-green-100 text-green-700 hover:bg-green-100",
            "마케팅": "bg-purple-100 text-purple-700 hover:bg-purple-100",
            "경영": "bg-orange-100 text-orange-700 hover:bg-orange-100",
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
            author: currentUser, // 현재 로그인한 사용자
            isPinned: formIsPinned,
            isNew: true,
        });
        // Reset form
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
    const NoticeItem = ({ notice }) => (<Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleNoticeClick(notice)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1">
            {notice.isPinned && (<Pin className="size-4 text-red-500 flex-shrink-0"/>)}
            <h3 className="font-semibold text-gray-900 flex-1">
              {notice.title}
            </h3>
            {notice.isNew && (<Badge className="bg-red-500 text-white hover:bg-red-500 flex-shrink-0">
                NEW
              </Badge>)}
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {notice.content}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500">
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
    </Card>);
    return (<div className="flex h-full bg-gray-50">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 space-y-2">
          {/* 공지사항 */}
          <Link to="/notice" className={cn("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors", location.pathname === "/notice"
            ? "bg-blue-50 text-blue-600 font-medium"
            : "text-gray-700 hover:bg-gray-100")}>
            <Bell className="size-5"/>
            <span>공지사항</span>
          </Link>

          {/* 마음의 편지 */}
          <Link to="/heart-letter" className={cn("flex items-center gap-3 px-4 py-3 rounded-lg transition-colors", location.pathname === "/heart-letter"
            ? "bg-blue-50 text-blue-600 font-medium"
            : "text-gray-700 hover:bg-gray-100")}>
            <Heart className="size-5"/>
            <span>마음의 편지</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Top Bar */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400"/>
                <Input type="text" placeholder="공지사항 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10"/>
              </div>
            </div>
          </div>

          {/* Notice Detail View */}
          {selectedNotice ? (<Card className="mb-6">
              <CardContent className="p-6">
                {/* Header Section */}
                <div className="border-b border-gray-200 pb-4 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">공지사항 게시</h2>
                    <Button variant="outline" size="sm" onClick={() => setSelectedNotice(null)}>
                      목록으로
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="mb-1">작성자: {selectedNotice.author} / 날짜: {selectedNotice.date}</p>
                    <p>조회수: {selectedNotice.views}</p>
                  </div>
                </div>

                {/* Title */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">제목</h3>
                  <div className="flex items-center gap-2">
                    {selectedNotice.isPinned && (<Pin className="size-5 text-red-500"/>)}
                    <p className="text-gray-800">{selectedNotice.title}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">공지 내용</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 min-h-[200px]">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedNotice.content}
                    </p>
                  </div>
                </div>

                {/* Attachments */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">결재 파일</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500">첨부된 파일이 없습니다.</p>
                  </div>
                </div>

                {/* Footer Options */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex gap-4 text-sm text-gray-600">
                    <button className="hover:text-blue-600">▲ 작성 글</button>
                    <button className="hover:text-blue-600">▼ 인용 글</button>
                  </div>
                  <Button variant="outline" size="sm">
                    제목
                  </Button>
                </div>
              </CardContent>
            </Card>) : (<>
              {/* Category Filter */}
              <div className="mb-6">
                <div className="flex gap-2">
                  {categories.map((category) => (<Button key={category} variant={selectedCategory === category ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(category)} className={selectedCategory === category
                    ? "bg-blue-600 hover:bg-blue-700"
                    : ""}>
                      {category}
                    </Button>))}
                  {/* 최고관리자와 팀장만 공지 작성 가능 */}
                  {currentUser && (currentUser.role === "최고관리자" || currentUser.role === "팀장" || isHrAdmin) && (<Dialog open={showDialog} onOpenChange={setShowDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="ml-auto bg-blue-600 hover:bg-blue-700">
                          <Plus className="size-4 mr-2"/>
                          {isHrAdmin ? "사내공지 작성" : "공지 작성"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>새 공지사항 작성</DialogTitle>
                        </DialogHeader>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                          <div className="space-y-2">
                            <Label htmlFor="category">카테고리</Label>
                            <Select value={formCategory} onValueChange={(value) => setFormCategory(value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="카테고리 선택"/>
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
                          <div className="space-y-2">
                            <Label htmlFor="title">제목</Label>
                            <Input id="title" placeholder="공지사항 제목을 입력하세요" value={formTitle} onChange={(e) => setFormTitle(e.target.value)}/>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="content">내용</Label>
                            <Textarea id="content" placeholder="공지사항 내용을 작성하세요" rows={8} value={formContent} onChange={(e) => setFormContent(e.target.value)}/>
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" id="pinned" className="size-4 rounded border-gray-300" checked={formIsPinned} onChange={(e) => setFormIsPinned(e.target.checked)}/>
                            <Label htmlFor="pinned" className="text-sm font-normal cursor-pointer">
                              상단 고정
                            </Label>
                          </div>
                          <div className="flex gap-3">
                            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                              등록하기
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                              취소
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>)}
                </div>
              </div>

              {/* Pinned Notices */}
              {pinnedNotices.length > 0 && (<div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Pin className="size-5 text-red-500"/>
                    <h3 className="font-semibold text-gray-900">고정 공지</h3>
                  </div>
                  <div className="space-y-3">
                    {pinnedNotices.map((notice) => (<NoticeItem key={notice.id} notice={notice}/>))}
                  </div>
                </div>)}

              {/* Regular Notices */}
              <div className="space-y-3">
                {regularNotices.map((notice) => (<NoticeItem key={notice.id} notice={notice}/>))}
              </div>

              {filteredNotices.length === 0 && (<div className="text-center py-16">
                  <Bell className="size-16 text-gray-300 mx-auto mb-4"/>
                  <p className="text-gray-500">검색 결과가 없습니다.</p>
                </div>)}
            </>)}

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">▲ 페이지 진입화면</p>
          </div>
        </div>
      </main>
    </div>);
}
