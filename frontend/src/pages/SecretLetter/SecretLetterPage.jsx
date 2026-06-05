import { useState } from "react";
import { Heart, Send, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Textarea } from "@/components/UI/textarea";
import { Label } from "@/components/UI/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/UI/select";
import { Badge } from "@/components/UI/badge";
export function HeartLetterPage() {
    const [showForm, setShowForm] = useState(false);
    const receivedLetters = [
        {
            id: 1,
            from: "익명",
            to: "홍길동",
            message: "항상 열심히 일하시는 모습이 멋있습니다. 덕분에 팀 분위기가 좋아요. 감사합니다!",
            date: "2026-04-05",
            isAnonymous: true,
        },
        {
            id: 2,
            from: "익명",
            to: "홍길동",
            message: "프로젝트에서 많은 도움 주셔서 감사합니다. 덕분에 잘 마무리할 수 있었어요.",
            date: "2026-04-03",
            isAnonymous: true,
        },
        {
            id: 3,
            from: "익명",
            to: "홍길동",
            message: "어려운 상황에서도 긍정적인 모습을 보여주셔서 힘이 됩니다. 응원합니다!",
            date: "2026-03-28",
            isAnonymous: true,
        },
    ];
    const sentLetters = [
        {
            id: 1,
            from: "홍길동",
            to: "이지은",
            message: "항상 꼼꼼하게 일처리 해주셔서 감사합니다. 함께 일하는 것이 즐겁습니다!",
            date: "2026-04-02",
            isAnonymous: false,
        },
        {
            id: 2,
            from: "홍길동",
            to: "박철수",
            message: "프로젝트 관리를 정말 잘하시는 것 같아요. 많이 배우고 있습니다.",
            date: "2026-03-25",
            isAnonymous: true,
        },
    ];
    return (<div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Heart className="size-7 text-pink-500"/>
            마음의 편지
          </h2>
          <p className="text-gray-600">동료에게 감사와 응원의 메시지를 전하세요</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-pink-600 hover:bg-pink-700">
          <Send className="size-5 mr-2"/>
          편지 쓰기
        </Button>
      </div>

      {/* Write Letter Form */}
      {showForm && (<Card className="mb-6 border-pink-200">
          <CardHeader className="bg-pink-50">
            <CardTitle className="text-lg">새 편지 작성</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">받는 사람</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="동료를 선택하세요"/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">김민수 (개발팀)</SelectItem>
                    <SelectItem value="2">이지은 (개발팀)</SelectItem>
                    <SelectItem value="3">박철수 (기획팀)</SelectItem>
                    <SelectItem value="4">정수진 (분석팀)</SelectItem>
                    <SelectItem value="5">최영호 (디자인팀)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">메시지</Label>
                <Textarea id="message" placeholder="감사하거나 응원하고 싶은 마음을 전해보세요..." rows={6} className="resize-none"/>
                <p className="text-xs text-gray-500">
                  💡 따뜻한 마음이 담긴 메시지는 동료에게 큰 힘이 됩니다
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="anonymous" className="size-4 rounded border-gray-300"/>
                <Label htmlFor="anonymous" className="text-sm font-normal cursor-pointer">
                  익명으로 보내기
                </Label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="bg-pink-600 hover:bg-pink-700">
                  <Send className="size-4 mr-2"/>
                  전송하기
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  취소
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>)}

      {/* Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Received Letters */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
            <CardTitle className="flex items-center gap-2">
              <Mail className="size-5"/>
              받은 편지 ({receivedLetters.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {receivedLetters.map((letter) => (<div key={letter.id} className="p-4 border-2 border-pink-100 rounded-lg hover:border-pink-300 transition-colors bg-gradient-to-br from-white to-pink-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="size-10 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white font-semibold">
                        {letter.from.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {letter.from}
                        </div>
                        <div className="text-xs text-gray-600">{letter.date}</div>
                      </div>
                    </div>
                    {letter.isAnonymous && (<Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                        익명
                      </Badge>)}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {letter.message}
                  </p>
                </div>))}
            </div>
          </CardContent>
        </Card>

        {/* Sent Letters */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2">
              <Send className="size-5"/>
              보낸 편지 ({sentLetters.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {sentLetters.map((letter) => (<div key={letter.id} className="p-4 border-2 border-blue-100 rounded-lg hover:border-blue-300 transition-colors bg-gradient-to-br from-white to-blue-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="size-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                        {letter.to.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {letter.to}
                        </div>
                        <div className="text-xs text-gray-600">{letter.date}</div>
                      </div>
                    </div>
                    {letter.isAnonymous && (<Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                        익명
                      </Badge>)}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {letter.message}
                  </p>
                </div>))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardContent className="p-5 text-center">
            <div className="text-3xl font-bold text-pink-600 mb-1">
              {receivedLetters.length}
            </div>
            <div className="text-sm text-gray-600">받은 편지</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {sentLetters.length}
            </div>
            <div className="text-sm text-gray-600">보낸 편지</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {receivedLetters.length + sentLetters.length}
            </div>
            <div className="text-sm text-gray-600">전체 편지</div>
          </CardContent>
        </Card>
      </div>
    </div>);
}
