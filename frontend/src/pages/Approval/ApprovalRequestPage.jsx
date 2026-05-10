import { useState } from "react";
import { FileCheck, Plus, Search as SearchIcon, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/UI/card";
import { Input } from "@/components/UI/input";
import { Button } from "@/components/UI/button";
import { Badge } from "@/components/UI/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/UI/dialog";
import { Label } from "@/components/UI/label";
import { Textarea } from "@/components/UI/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/UI/select";
import { useAppContext } from "@/store/AppProvider";
export function ApprovalRequestPage() {
    const { currentUser } = useAppContext();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState("전체");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    // Form states
    const [formType, setFormType] = useState("지출결재");
    const [formTitle, setFormTitle] = useState("");
    const [formContent, setFormContent] = useState("");
    const [formAmount, setFormAmount] = useState("");
    // Mock data
    const [requests, setRequests] = useState([
        {
            id: 1,
            title: "사무용품 구매",
            content: "프린터 용지 및 문구류 구매 결재 요청",
            type: "지출결재",
            requester: "김철수",
            date: "2024-04-08",
            status: "승인",
            amount: 150000
        },
        {
            id: 2,
            title: "여름 휴가 신청",
            content: "8월 1일 ~ 8월 5일 휴가 결재 요청",
            type: "휴가결재",
            requester: "이영희",
            date: "2024-04-09",
            status: "대기중"
        },
        {
            id: 3,
            title: "신규 프로젝트 진행",
            content: "A사 웹사이트 리뉴얼 프로젝트 착수 결재",
            type: "업무결재",
            requester: "박민수",
            date: "2024-04-10",
            status: "대기중"
        },
    ]);
    const types = ["전체", "지출결재", "휴가결재", "업무결재", "기타"];
    const filteredRequests = requests.filter((request) => {
        const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === "전체" || request.type === selectedType;
        return matchesSearch && matchesType;
    });
    const getTypeColor = (type) => {
        const colors = {
            "지출결재": "bg-purple-100 text-purple-700",
            "휴가결재": "bg-blue-100 text-blue-700",
            "업무결재": "bg-green-100 text-green-700",
            "기타": "bg-gray-100 text-gray-700",
        };
        return colors[type] || "bg-gray-100 text-gray-700";
    };
    const getStatusColor = (status) => {
        const colors = {
            "대기중": "bg-yellow-100 text-yellow-700",
            "승인": "bg-green-100 text-green-700",
            "반려": "bg-red-100 text-red-700",
        };
        return colors[status] || "bg-gray-100 text-gray-700";
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formTitle.trim() || !formContent.trim()) {
            alert("제목과 내용을 모두 입력해주세요.");
            return;
        }
        const newRequest = {
            id: requests.length + 1,
            title: formTitle,
            content: formContent,
            type: formType,
            requester: currentUser?.name || "익명",
            date: new Date().toISOString().split("T")[0],
            status: "대기중",
            amount: formAmount ? parseInt(formAmount) : undefined,
        };
        setRequests([...requests, newRequest]);
        // Reset form
        setFormTitle("");
        setFormContent("");
        setFormType("지출결재");
        setFormAmount("");
        setShowDialog(false);
    };
    return (<div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <FileCheck className="size-7 text-blue-600"/>
            결재신청
          </h2>
          <p className="text-gray-600">결재가 필요한 사항을 신청하세요</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="size-5 mr-2"/>
              결재 신청
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>새 결재 신청</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="type">결재 유형</Label>
                <Select value={formType} onValueChange={(value) => setFormType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="유형 선택"/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="지출결재">지출결재</SelectItem>
                    <SelectItem value="휴가결재">휴가결재</SelectItem>
                    <SelectItem value="업무결재">업무결재</SelectItem>
                    <SelectItem value="기타">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input id="title" placeholder="결재 제목을 입력하세요" value={formTitle} onChange={(e) => setFormTitle(e.target.value)}/>
              </div>
              {formType === "지출결재" && (<div className="space-y-2">
                  <Label htmlFor="amount">금액</Label>
                  <Input id="amount" type="number" placeholder="금액을 입력하세요" value={formAmount} onChange={(e) => setFormAmount(e.target.value)}/>
                </div>)}
              <div className="space-y-2">
                <Label htmlFor="content">내용</Label>
                <Textarea id="content" placeholder="결재 내용을 작성하세요" rows={8} value={formContent} onChange={(e) => setFormContent(e.target.value)}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">첨부파일</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <Upload className="size-8 text-gray-400 mx-auto mb-2"/>
                  <p className="text-sm text-gray-500">파일을 드래그하거나 클릭하여 업로드</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  신청하기
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  취소
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400"/>
          <Input type="text" placeholder="결재 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10"/>
        </div>
        <div className="flex gap-2">
          {types.map((type) => (<Button key={type} variant={selectedType === type ? "default" : "outline"} size="sm" onClick={() => setSelectedType(type)} className={selectedType === type
                ? "bg-blue-600 hover:bg-blue-700"
                : ""}>
              {type}
            </Button>))}
        </div>
      </div>

      {/* Request List */}
      <div className="space-y-3">
        {filteredRequests.map((request) => (<Card key={request.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedRequest(request)}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-1">
                  <h3 className="font-semibold text-gray-900 flex-1">
                    {request.title}
                  </h3>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {request.content}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-3">
                  <Badge className={getTypeColor(request.type)}>
                    {request.type}
                  </Badge>
                  <span>{request.requester}</span>
                  {request.amount && (<span className="font-semibold text-gray-700">
                      {request.amount.toLocaleString()}원
                    </span>)}
                </div>
                <span>{request.date}</span>
              </div>
            </CardContent>
          </Card>))}
      </div>

      {filteredRequests.length === 0 && (<div className="text-center py-16">
          <FileCheck className="size-16 text-gray-300 mx-auto mb-4"/>
          <p className="text-gray-500">검색 결과가 없습니다.</p>
        </div>)}

      {/* Request Detail Modal */}
      {selectedRequest && (<Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <DialogTitle className="text-2xl mb-2">
                    {selectedRequest.title}
                  </DialogTitle>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Badge className={getTypeColor(selectedRequest.type)}>
                      {selectedRequest.type}
                    </Badge>
                    <Badge className={getStatusColor(selectedRequest.status)}>
                      {selectedRequest.status}
                    </Badge>
                    <span>{selectedRequest.requester}</span>
                    <span>{selectedRequest.date}</span>
                  </div>
                </div>
              </div>
            </DialogHeader>
            <div className="mt-6 space-y-6">
              {selectedRequest.amount && (<div>
                  <h4 className="font-semibold text-gray-900 mb-2">신청 금액</h4>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-blue-700">
                      {selectedRequest.amount.toLocaleString()}원
                    </p>
                  </div>
                </div>)}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">신청 내용</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedRequest.content}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">첨부파일</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">첨부된 파일이 없습니다.</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>)}
    </div>);
}
