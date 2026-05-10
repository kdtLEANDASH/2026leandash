import { useState } from "react";
import { HelpCircle, Plus, Search as SearchIcon, MessageSquareReply } from "lucide-react";
import { Card, CardContent } from "@/components/UI/card";
import { Input } from "@/components/UI/input";
import { Button } from "@/components/UI/button";
import { Badge } from "@/components/UI/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/UI/dialog";
import { Label } from "@/components/UI/label";
import { Textarea } from "@/components/UI/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/UI/select";
import { useAppContext } from "@/store/AppProvider";
export function InquiryPage() {
    const { currentUser } = useAppContext();
    const isHrAdmin = currentUser?.department === "인사팀" && currentUser?.role === "팀장";
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("전체");
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const [answerText, setAnswerText] = useState("");
    const [formCategory, setFormCategory] = useState("일반");
    const [formTitle, setFormTitle] = useState("");
    const [formContent, setFormContent] = useState("");
    const [inquiries, setInquiries] = useState([
        {
            id: 1,
            title: "휴가 신청 방법이 궁금합니다",
            content: "휴가를 어떻게 신청하나요?",
            category: "인사",
            author: "김철수",
            date: "2026-04-08",
            status: "완료",
            answer: "휴가 신청 메뉴에서 날짜를 선택한 뒤 신청하시면 됩니다.",
        },
        {
            id: 2,
            title: "로그인이 안됩니다",
            content: "비밀번호를 잊어버렸어요",
            category: "시스템",
            author: "이영희",
            date: "2026-04-09",
            status: "대기중",
        },
        {
            id: 3,
            title: "연차 반영 시점 문의",
            content: "이번 달 승인된 연차가 잔여 휴가에 언제 반영되나요?",
            category: "인사",
            author: "최유진",
            date: "2026-04-10",
            status: "대기중",
        },
    ]);
    const categories = ["전체", "일반", "시스템", "인사", "기타"];
    const filteredInquiries = inquiries.filter((inquiry) => {
        const matchesSearch = inquiry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inquiry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (inquiry.answer || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "전체" || inquiry.category === selectedCategory;
        const matchesRole = isHrAdmin ? true : inquiry.author === currentUser?.name;
        return matchesSearch && matchesCategory && matchesRole;
    });
    const getCategoryColor = (category) => ({
        일반: "bg-blue-100 text-blue-700",
        시스템: "bg-red-100 text-red-700",
        인사: "bg-green-100 text-green-700",
        기타: "bg-gray-100 text-gray-700",
    }[category] || "bg-gray-100 text-gray-700");
    const getStatusColor = (status) => ({
        대기중: "bg-yellow-100 text-yellow-700",
        완료: "bg-green-100 text-green-700",
    }[status] || "bg-gray-100 text-gray-700");
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formTitle.trim() || !formContent.trim()) {
            return alert("제목과 내용을 모두 입력해주세요.");
        }
        setInquiries((prev) => [
            {
                id: prev.length + 1,
                title: formTitle,
                content: formContent,
                category: formCategory,
                author: currentUser?.name || "익명",
                date: new Date().toISOString().split("T")[0],
                status: "대기중",
            },
            ...prev,
        ]);
        setFormTitle("");
        setFormContent("");
        setFormCategory("일반");
        setShowDialog(false);
    };
    const handleAnswer = () => {
        if (!selectedInquiry || !answerText.trim()) {
            return alert("답변 내용을 입력해주세요.");
        }
        setInquiries((prev) => prev.map((item) => item.id === selectedInquiry.id
            ? { ...item, answer: answerText, status: "완료" }
            : item));
        setSelectedInquiry({
            ...selectedInquiry,
            answer: answerText,
            status: "완료",
        });
        setAnswerText("");
        alert("답변이 등록되었습니다.");
    };
    return (<div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <HelpCircle className="size-7 text-blue-600"/>
            {isHrAdmin ? "문의 관리" : "문의"}
          </h2>
          <p className="text-gray-600">
            {isHrAdmin ? "직원 문의를 확인하고 답변을 작성하세요" : "궁금한 사항을 문의하세요"}
          </p>
        </div>

        {!isHrAdmin && (<Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="size-5 mr-2"/>
                문의 작성
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>새 문의 작성</DialogTitle>
              </DialogHeader>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="category">카테고리</Label>
                  <Select value={formCategory} onValueChange={(value) => setFormCategory(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리 선택"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="일반">일반</SelectItem>
                      <SelectItem value="시스템">시스템</SelectItem>
                      <SelectItem value="인사">인사</SelectItem>
                      <SelectItem value="기타">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">제목</Label>
                  <Input id="title" placeholder="문의 제목을 입력하세요" value={formTitle} onChange={(e) => setFormTitle(e.target.value)}/>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">내용</Label>
                  <Textarea id="content" placeholder="문의 내용을 작성하세요" rows={8} value={formContent} onChange={(e) => setFormContent(e.target.value)}/>
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

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400"/>
          <Input type="text" placeholder={isHrAdmin ? "직원 문의 검색..." : "문의 검색..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10"/>
        </div>

        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (<Button key={category} variant={selectedCategory === category ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(category)} className={selectedCategory === category ? "bg-blue-600 hover:bg-blue-700" : ""}>
              {category}
            </Button>))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredInquiries.map((inquiry) => (<Card key={inquiry.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedInquiry(inquiry)}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-1">
                  <h3 className="font-semibold text-gray-900 flex-1">{inquiry.title}</h3>
                  <Badge className={getStatusColor(inquiry.status)}>{inquiry.status}</Badge>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{inquiry.content}</p>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-3">
                  <Badge className={getCategoryColor(inquiry.category)}>{inquiry.category}</Badge>
                  <span>{inquiry.author}</span>
                </div>
                <span>{inquiry.date}</span>
              </div>
            </CardContent>
          </Card>))}

        {filteredInquiries.length === 0 && (<div className="text-center py-16 text-gray-500">표시할 문의가 없습니다.</div>)}
      </div>

      <Dialog open={!!selectedInquiry} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
        <DialogContent className="max-w-3xl">
          {selectedInquiry && (<>
              <DialogHeader>
                <DialogTitle>{selectedInquiry.title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className={getCategoryColor(selectedInquiry.category)}>
                    {selectedInquiry.category}
                  </Badge>
                  <Badge className={getStatusColor(selectedInquiry.status)}>
                    {selectedInquiry.status}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    작성자 {selectedInquiry.author} · {selectedInquiry.date}
                  </span>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-800">
                  {selectedInquiry.content}
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="font-medium text-gray-900 mb-2">답변</div>
                  {selectedInquiry.answer ? (<div className="text-sm leading-6 text-gray-700">
                      {selectedInquiry.answer}
                    </div>) : (<div className="text-sm text-gray-500">아직 등록된 답변이 없습니다.</div>)}
                </div>

                {isHrAdmin && (<div className="space-y-2">
                    <Label htmlFor="answer">답변 작성</Label>
                    <Textarea id="answer" rows={5} placeholder="문의에 대한 답변을 입력하세요" value={answerText} onChange={(e) => setAnswerText(e.target.value)}/>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAnswer}>
                      <MessageSquareReply className="size-4 mr-2"/>
                      답변 등록
                    </Button>
                  </div>)}
              </div>
            </>)}
        </DialogContent>
      </Dialog>
    </div>);
}
