import { useState } from "react";
import { Search as SearchIcon, FileText, Calendar, Users, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/UI/card";
import { Input } from "@/components/UI/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/UI/tabs";
import { Badge } from "@/components/UI/badge";
export function SearchPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const allResults = [
        {
            id: 1,
            type: "문서",
            title: "2026 Q1 마케팅 전략 보고서",
            description: "1분기 마케팅 활동 결과 및 2분기 계획",
            date: "2026-03-28",
            category: "마케팅",
        },
        {
            id: 2,
            type: "문서",
            title: "개발팀 프로젝트 일정표",
            description: "상반기 개발 프로젝트 타임라인 및 마일스톤",
            date: "2026-03-25",
            category: "개발",
        },
        {
            id: 3,
            type: "일정",
            title: "전체 회의",
            description: "2026년 1분기 실적 발표 및 2분기 목표 설정",
            date: "2026-04-10",
            category: "회의",
        },
        {
            id: 4,
            type: "문서",
            title: "인사 평가 가이드라인",
            description: "2026년 상반기 인사 평가 기준 및 절차",
            date: "2026-03-20",
            category: "인사",
        },
        {
            id: 5,
            type: "일정",
            title: "팀 워크샵",
            description: "개발팀 팀빌딩 워크샵 - 강릉",
            date: "2026-04-15",
            category: "행사",
        },
        {
            id: 6,
            type: "직원",
            title: "김민수",
            description: "개발팀 프론트엔드 개발자",
            category: "개발팀",
        },
        {
            id: 7,
            type: "문서",
            title: "재무 보고서 - 2026 Q1",
            description: "1분기 재무제표 및 예산 집행 현황",
            date: "2026-03-30",
            category: "재무",
        },
        {
            id: 8,
            type: "일정",
            title: "신규 프로젝트 킥오프",
            description: "모바일 앱 리뉴얼 프로젝트 시작",
            date: "2026-04-08",
            category: "회의",
        },
    ];
    const filteredResults = allResults.filter((result) => {
        const matchesSearch = result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            result.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (result.category?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
        const matchesTab = activeTab === "all" ||
            (activeTab === "documents" && result.type === "문서") ||
            (activeTab === "events" && result.type === "일정") ||
            (activeTab === "people" && result.type === "직원");
        return matchesSearch && matchesTab;
    });
    const getTypeIcon = (type) => {
        switch (type) {
            case "문서":
                return <FileText className="size-5 text-blue-600"/>;
            case "일정":
                return <Calendar className="size-5 text-green-600"/>;
            case "직원":
                return <Users className="size-5 text-purple-600"/>;
        }
    };
    const getTypeBadge = (type) => {
        const configs = {
            "문서": { bg: "bg-blue-100", text: "text-blue-700" },
            "일정": { bg: "bg-green-100", text: "text-green-700" },
            "직원": { bg: "bg-purple-100", text: "text-purple-700" },
        };
        const config = configs[type];
        return (<Badge className={`${config.bg} ${config.text} hover:${config.bg}`}>
        {type}
      </Badge>);
    };
    const counts = {
        all: allResults.length,
        documents: allResults.filter((r) => r.type === "문서").length,
        events: allResults.filter((r) => r.type === "일정").length,
        people: allResults.filter((r) => r.type === "직원").length,
    };
    return (<div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">업무 검색</h2>
        <p className="text-gray-600">문서, 일정, 직원 정보를 검색하세요</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400"/>
          <Input type="text" placeholder="검색어를 입력하세요..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-12 h-14 text-base"/>
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Filter className="size-5 text-gray-400"/>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">
            전체 ({counts.all})
          </TabsTrigger>
          <TabsTrigger value="documents">
            문서 ({counts.documents})
          </TabsTrigger>
          <TabsTrigger value="events">
            일정 ({counts.events})
          </TabsTrigger>
          <TabsTrigger value="people">
            직원 ({counts.people})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search Results */}
      {searchTerm === "" ? (<div className="text-center py-16">
          <SearchIcon className="size-16 text-gray-300 mx-auto mb-4"/>
          <p className="text-gray-500 text-lg mb-2">검색어를 입력하세요</p>
          <p className="text-gray-400 text-sm">
            문서, 일정, 직원 정보를 빠르게 찾을 수 있습니다
          </p>
        </div>) : filteredResults.length === 0 ? (<div className="text-center py-16">
          <p className="text-gray-500">검색 결과가 없습니다.</p>
        </div>) : (<div className="space-y-3">
          {filteredResults.map((result) => (<Card key={result.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getTypeIcon(result.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {result.title}
                      </h3>
                      {getTypeBadge(result.type)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{result.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {result.category && (<span className="flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-gray-400"></span>
                          {result.category}
                        </span>)}
                      {result.date && (<span className="flex items-center gap-1">
                          <Calendar className="size-3"/>
                          {result.date}
                        </span>)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>))}
        </div>)}
    </div>);
}
