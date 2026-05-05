import { useState } from "react";
import { Users, Plus, Heart, MessageCircle, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Badge } from "@/components/UI/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/UI/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/UI/dialog";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Textarea } from "@/components/UI/textarea";
export function CommunityPage() {
    const [showDialog, setShowDialog] = useState(false);
    const [selectedTab, setSelectedTab] = useState("all");
    const communities = [
        {
            id: 1,
            name: "축구 동호회",
            description: "매주 주말 축구를 즐기는 모임입니다",
            category: "동호회",
            members: 18,
            leader: "김민수",
            createdDate: "2025-03-01",
            nextEvent: "2026-04-12 토요일 14:00",
        },
        {
            id: 2,
            name: "독서 클럽",
            description: "한 달에 한 권씩 책을 읽고 토론합니다",
            category: "동호회",
            members: 12,
            leader: "이지은",
            createdDate: "2025-02-15",
            nextEvent: "2026-04-18 목요일 19:00",
        },
        {
            id: 3,
            name: "React 스터디",
            description: "최신 React 기술을 함께 공부합니다",
            category: "스터디",
            members: 8,
            leader: "박철수",
            createdDate: "2026-01-10",
            nextEvent: "2026-04-09 화요일 18:30",
        },
        {
            id: 4,
            name: "등산 모임",
            description: "주말마다 함께 산을 오르는 모임",
            category: "동호회",
            members: 15,
            leader: "정수진",
            createdDate: "2025-06-01",
            nextEvent: "2026-04-13 일요일 07:00",
        },
        {
            id: 5,
            name: "사진 동호회",
            description: "사진 촬영과 편집을 함께 배우는 모임",
            category: "동호회",
            members: 10,
            leader: "최영호",
            createdDate: "2025-09-20",
        },
        {
            id: 6,
            name: "환경 보호 활동",
            description: "회사 주변 정화 활동 및 환경 캠페인",
            category: "사내활동",
            members: 25,
            leader: "강민지",
            createdDate: "2025-04-22",
            nextEvent: "2026-04-22 지구의 날",
        },
    ];
    const posts = [
        {
            id: 1,
            communityId: 1,
            author: "김민수",
            title: "이번 주 축구 일정 공지",
            content: "이번 주 토요일 오후 2시에 월드컵공원에서 모입니다. 참석 가능하신 분들은 댓글 남겨주세요!",
            date: "2026-04-06",
            likes: 12,
            comments: 8,
        },
        {
            id: 2,
            communityId: 2,
            author: "이지은",
            title: "4월 추천 도서 투표",
            content: "다음 달 읽을 책을 투표로 정하려고 합니다. 후보는 다음과 같습니다...",
            date: "2026-04-05",
            likes: 8,
            comments: 15,
        },
        {
            id: 3,
            communityId: 3,
            author: "박철수",
            title: "React 19 새로운 기능 정리",
            content: "React 19에서 추가된 주요 기능들을 정리해봤습니다. 다음 스터디 때 함께 공부해요!",
            date: "2026-04-04",
            likes: 15,
            comments: 6,
        },
    ];
    const filteredCommunities = communities.filter((community) => {
        if (selectedTab === "all")
            return true;
        if (selectedTab === "club")
            return community.category === "동호회";
        if (selectedTab === "study")
            return community.category === "스터디";
        if (selectedTab === "activity")
            return community.category === "사내활동";
        return true;
    });
    const getCategoryColor = (category) => {
        switch (category) {
            case "동호회":
                return "bg-blue-100 text-blue-700 hover:bg-blue-100";
            case "스터디":
                return "bg-green-100 text-green-700 hover:bg-green-100";
            case "사내활동":
                return "bg-purple-100 text-purple-700 hover:bg-purple-100";
        }
    };
    return (<div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">커뮤니티</h2>
          <p className="text-gray-600">동호회와 스터디 모임에 참여하세요</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="size-5 mr-2"/>
              새 모임 만들기
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 커뮤니티 만들기</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">모임 이름</Label>
                <Input id="name" placeholder="모임 이름을 입력하세요"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea id="description" placeholder="모임에 대한 설명을 작성하세요" rows={3}/>
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  만들기
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  취소
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="club">동호회</TabsTrigger>
          <TabsTrigger value="study">스터디</TabsTrigger>
          <TabsTrigger value="activity">사내활동</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Communities List */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCommunities.map((community) => (<Card key={community.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {community.name}
                    </h3>
                    <Badge className={getCategoryColor(community.category)}>
                      {community.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {community.description}
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="size-4"/>
                      <span>{community.members}명 참여 중</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">리더:</span> {community.leader}
                    </div>
                    {community.nextEvent && (<div className="flex items-center gap-2 text-sm text-blue-600">
                        <Calendar className="size-4"/>
                        <span>{community.nextEvent}</span>
                      </div>)}
                  </div>
                  <Button variant="outline" className="w-full">
                    참여하기
                  </Button>
                </CardContent>
              </Card>))}
          </div>
        </div>

        {/* Recent Posts */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">최근 게시물</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {posts.map((post) => (<div key={post.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <h4 className="font-semibold text-gray-900 text-sm mb-2">
                      {post.title}
                    </h4>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{post.author}</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Heart className="size-3"/>
                          {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="size-3"/>
                          {post.comments}
                        </span>
                      </div>
                    </div>
                  </div>))}
              </div>
            </CardContent>
          </Card>

          {/* My Communities */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">내가 참여 중인 모임</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 border border-gray-200 rounded">
                  <span className="text-sm font-medium">축구 동호회</span>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs">
                    동호회
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-2 border border-gray-200 rounded">
                  <span className="text-sm font-medium">React 스터디</span>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                    스터디
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>);
}
