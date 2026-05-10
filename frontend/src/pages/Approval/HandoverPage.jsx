import { useState } from "react";
import { FileText, Download, Upload, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Badge } from "@/components/UI/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/UI/tabs";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Textarea } from "@/components/UI/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/UI/select";
export function Handover() {
    const [showForm, setShowForm] = useState(false);
    const handovers = [
        {
            id: 1,
            title: "프론트엔드 프로젝트 인수인계",
            from: "김민수",
            to: "홍길동",
            status: "진행중",
            date: "2026-04-01",
            progress: 60,
            category: "프로젝트",
        },
        {
            id: 2,
            title: "고객 관리 업무 인계",
            from: "이지은",
            to: "홍길동",
            status: "완료",
            date: "2026-03-15",
            progress: 100,
            category: "업무",
        },
        {
            id: 3,
            title: "서버 관리 인수인계",
            from: "박철수",
            to: "홍길동",
            status: "대기",
            date: "2026-04-10",
            progress: 0,
            category: "시스템",
        },
    ];
    const myHandovers = handovers.filter((h) => h.to === "홍길동");
    const givingHandovers = [
        {
            id: 4,
            title: "마케팅 캠페인 업무 인계",
            from: "홍길동",
            to: "강민지",
            status: "진행중",
            date: "2026-04-05",
            progress: 40,
            category: "업무",
        },
    ];
    const getStatusBadge = (status) => {
        const configs = {
            "진행중": { bg: "bg-blue-100", text: "text-blue-700" },
            "완료": { bg: "bg-green-100", text: "text-green-700" },
            "대기": { bg: "bg-gray-100", text: "text-gray-700" },
        };
        const config = configs[status];
        return (<Badge className={`${config.bg} ${config.text} hover:${config.bg}`}>
        {status}
      </Badge>);
    };
    const HandoverCard = ({ handover }) => (<Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{handover.title}</h3>
            <div className="text-sm text-gray-600">
              {handover.from} → {handover.to}
            </div>
          </div>
          {getStatusBadge(handover.status)}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">진행률</span>
            <span className="font-semibold text-gray-900">{handover.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${handover.progress}%` }}></div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="size-4"/>
              <span>{handover.date}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {handover.category}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" className="flex-1">
            <FileText className="size-4 mr-1"/>
            상세보기
          </Button>
          {handover.status === "진행중" && (<Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
              계속하기
            </Button>)}
        </div>
      </CardContent>
    </Card>);
    return (<div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">인수인계</h2>
          <p className="text-gray-600">업무 인수인계를 체계적으로 관리하세요</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
          <Upload className="size-5 mr-2"/>
          새 인계 시작
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (<Card className="mb-6">
          <CardHeader>
            <CardTitle>새 인수인계 문서</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">제목</Label>
                  <Input id="title" placeholder="인수인계 제목"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">카테고리</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리 선택"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="project">프로젝트</SelectItem>
                      <SelectItem value="task">업무</SelectItem>
                      <SelectItem value="system">시스템</SelectItem>
                      <SelectItem value="other">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="to">인수자</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="인수자 선택"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">김민수 (개발팀)</SelectItem>
                      <SelectItem value="2">이지은 (개발팀)</SelectItem>
                      <SelectItem value="3">박철수 (기획팀)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">목표 완료일</Label>
                  <Input id="date" type="date"/>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">인계 내용</Label>
                <Textarea id="content" placeholder="인수인계할 내용을 상세히 작성하세요..." rows={6}/>
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  시작하기
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  취소
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>)}

      {/* Tabs */}
      <Tabs defaultValue="receiving" className="space-y-6">
        <TabsList>
          <TabsTrigger value="receiving">
            내가 받는 인계 ({myHandovers.length})
          </TabsTrigger>
          <TabsTrigger value="giving">
            내가 하는 인계 ({givingHandovers.length})
          </TabsTrigger>
          <TabsTrigger value="templates">템플릿</TabsTrigger>
        </TabsList>

        {/* Receiving Handovers */}
        <TabsContent value="receiving">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myHandovers.map((handover) => (<HandoverCard key={handover.id} handover={handover}/>))}
          </div>
        </TabsContent>

        {/* Giving Handovers */}
        <TabsContent value="giving">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {givingHandovers.map((handover) => (<HandoverCard key={handover.id} handover={handover}/>))}
          </div>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
            {
                title: "프로젝트 인수인계",
                description: "프로젝트 관련 코드, 문서, 일정 등을 인계하는 템플릿",
            },
            {
                title: "업무 인수인계",
                description: "일반 업무 프로세스와 담당자 정보를 인계하는 템플릿",
            },
            {
                title: "시스템 인수인계",
                description: "서버, 데이터베이스 등 시스템 관리 권한 인계 템플릿",
            },
            {
                title: "고객 인수인계",
                description: "고객 정보와 관련 히스토리를 인계하는 템플릿",
            },
        ].map((template, index) => (<Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <FileText className="size-6 text-blue-600"/>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {template.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {template.description}
                      </p>
                      <Button variant="outline" size="sm">
                        <Download className="size-4 mr-1"/>
                        템플릿 사용
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>))}
          </div>
        </TabsContent>
      </Tabs>
    </div>);
}
