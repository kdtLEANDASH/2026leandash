import { useState } from "react";
import { FileText, CheckCircle, XCircle, Clock, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Badge } from "@/components/UI/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/UI/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/UI/dialog";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Textarea } from "@/components/UI/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/UI/select";
export function ApprovalPage() {
    const [showDialog, setShowDialog] = useState(false);
    const pendingApprovals = [
        {
            id: 1,
            title: "개발팀 장비 구매 요청",
            type: "구매",
            requester: "김민수",
            date: "2026-04-06",
            status: "대기",
            amount: "3,500,000원",
            description: "개발용 노트북 2대 및 모니터 4대 구매",
        },
        {
            id: 2,
            title: "휴가 신청",
            type: "휴가",
            requester: "이지은",
            date: "2026-04-05",
            status: "대기",
            description: "2026-04-15 ~ 2026-04-17 (3일간)",
        },
        {
            id: 3,
            title: "교육비 지원 신청",
            type: "교육",
            requester: "박철수",
            date: "2026-04-04",
            status: "대기",
            amount: "500,000원",
            description: "React Advanced 온라인 교육 과정",
        },
    ];
    const myRequests = [
        {
            id: 4,
            title: "워크샵 비용 청구",
            type: "청구",
            requester: "홍길동",
            date: "2026-04-03",
            status: "승인",
            amount: "2,000,000원",
            description: "개발팀 워크샵 숙박 및 식비",
        },
        {
            id: 5,
            title: "출장 신청",
            type: "출장",
            requester: "홍길동",
            date: "2026-03-28",
            status: "승인",
            description: "서울 - 부산 출장 (2026-04-20 ~ 2026-04-21)",
        },
        {
            id: 6,
            title: "재택 근무 신청",
            type: "근무",
            requester: "홍길동",
            date: "2026-03-25",
            status: "반려",
            description: "개인 사유로 인한 재택 근무",
        },
    ];
    const getStatusBadge = (status) => {
        const configs = {
            "대기": { bg: "bg-orange-100", text: "text-orange-700", icon: Clock },
            "승인": { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
            "반려": { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
        };
        const config = configs[status];
        const Icon = config.icon;
        return (<Badge className={`${config.bg} ${config.text} hover:${config.bg}`}>
        <Icon className="size-3 mr-1"/>
        {status}
      </Badge>);
    };
    const getTypeColor = (type) => {
        const colors = {
            "구매": "text-blue-600",
            "휴가": "text-purple-600",
            "교육": "text-green-600",
            "청구": "text-orange-600",
            "출장": "text-pink-600",
            "근무": "text-cyan-600",
        };
        return colors[type] || "text-gray-600";
    };
    return (<div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">전자 결재</h2>
          <p className="text-gray-600">결재 요청을 승인하고 나의 결재를 관리하세요</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="size-5 mr-2"/>
              새 결재 요청
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 결재 요청</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">결재 유형</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="유형 선택"/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="purchase">구매</SelectItem>
                    <SelectItem value="vacation">휴가</SelectItem>
                    <SelectItem value="education">교육</SelectItem>
                    <SelectItem value="expense">청구</SelectItem>
                    <SelectItem value="trip">출장</SelectItem>
                    <SelectItem value="work">근무</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input id="title" placeholder="결재 제목을 입력하세요"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">금액 (선택사항)</Label>
                <Input id="amount" placeholder="금액을 입력하세요"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">상세 내용</Label>
                <Textarea id="description" placeholder="결재 요청 내용을 작성하세요" rows={4}/>
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  요청하기
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  취소
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">대기 중</div>
                <div className="text-2xl font-semibold text-orange-600">
                  {pendingApprovals.length}
                </div>
              </div>
              <Clock className="size-8 text-orange-500"/>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">승인 완료</div>
                <div className="text-2xl font-semibold text-green-600">15</div>
              </div>
              <CheckCircle className="size-8 text-green-500"/>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">반려</div>
                <div className="text-2xl font-semibold text-red-600">2</div>
              </div>
              <XCircle className="size-8 text-red-500"/>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">전체</div>
                <div className="text-2xl font-semibold text-blue-600">20</div>
              </div>
              <FileText className="size-8 text-blue-500"/>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            결재 대기 ({pendingApprovals.length})
          </TabsTrigger>
          <TabsTrigger value="my-requests">
            내 요청 ({myRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Approvals */}
        <TabsContent value="pending">
          <div className="space-y-4">
            {pendingApprovals.map((approval) => (<Card key={approval.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {approval.title}
                        </h3>
                        {getStatusBadge(approval.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className={`font-medium ${getTypeColor(approval.type)}`}>
                          {approval.type}
                        </span>
                        <span>요청자: {approval.requester}</span>
                        <span>{approval.date}</span>
                      </div>
                    </div>
                    {approval.amount && (<div className="text-right">
                        <div className="text-sm text-gray-600">금액</div>
                        <div className="text-lg font-semibold text-blue-600">
                          {approval.amount}
                        </div>
                      </div>)}
                  </div>

                  <p className="text-sm text-gray-700 mb-4 p-3 bg-gray-50 rounded">
                    {approval.description}
                  </p>

                  <div className="flex gap-3">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="size-4 mr-2"/>
                      승인
                    </Button>
                    <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <XCircle className="size-4 mr-2"/>
                      반려
                    </Button>
                    <Button variant="outline">
                      상세보기
                    </Button>
                  </div>
                </CardContent>
              </Card>))}
          </div>
        </TabsContent>

        {/* My Requests */}
        <TabsContent value="my-requests">
          <div className="space-y-4">
            {myRequests.map((approval) => (<Card key={approval.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {approval.title}
                        </h3>
                        {getStatusBadge(approval.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className={`font-medium ${getTypeColor(approval.type)}`}>
                          {approval.type}
                        </span>
                        <span>신청일: {approval.date}</span>
                      </div>
                    </div>
                    {approval.amount && (<div className="text-right">
                        <div className="text-sm text-gray-600">금액</div>
                        <div className="text-lg font-semibold text-blue-600">
                          {approval.amount}
                        </div>
                      </div>)}
                  </div>

                  <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded">
                    {approval.description}
                  </p>
                </CardContent>
              </Card>))}
          </div>
        </TabsContent>
      </Tabs>
    </div>);
}
