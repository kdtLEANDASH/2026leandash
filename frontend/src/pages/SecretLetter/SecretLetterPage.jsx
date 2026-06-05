import { useState } from "react";
import { Heart, Send, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Textarea } from "@/components/UI/textarea";
import { Label } from "@/components/UI/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { Badge } from "@/components/UI/badge";
import { useAppContext } from "@/store/AppProvider";
import { cn } from "@/components/UI/utils";

export function HeartLetterPage() {
  const { customSettings } = useAppContext() || {};
  const isDark = customSettings?.darkMode;

  const [showForm, setShowForm] = useState(false);

  const pageClass = isDark
    ? "bg-[#27272a] text-white"
    : "bg-gray-50 text-gray-900";

  const cardClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "bg-white border-gray-200";

  const cardHeaderClass = isDark
    ? "bg-[#2f2f36] border-b border-[#5c5c73]"
    : "";

  const letterCardClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] hover:bg-[#48484f] text-white"
    : "";

  const inputClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white placeholder:text-zinc-400"
    : "";

  const textMain = isDark ? "text-white" : "text-gray-900";
  const textSub = isDark ? "text-zinc-300" : "text-gray-600";
  const textMuted = isDark ? "text-zinc-400" : "text-gray-500";

  const primaryPinkButtonClass = isDark
    ? "bg-[#5c5c73] hover:bg-[#6a6a82] text-white"
    : "bg-pink-600 hover:bg-pink-700";

  const outlineButtonClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white hover:bg-[#48484f]"
    : "";

  const receivedLetters = [
    {
      id: 1,
      from: "익명",
      to: "홍길동",
      message:
        "항상 열심히 일하시는 모습이 멋있습니다. 덕분에 팀 분위기가 좋아요. 감사합니다!",
      date: "2026-04-05",
      isAnonymous: true,
    },
    {
      id: 2,
      from: "익명",
      to: "홍길동",
      message:
        "프로젝트에서 많은 도움 주셔서 감사합니다. 덕분에 잘 마무리할 수 있었어요.",
      date: "2026-04-03",
      isAnonymous: true,
    },
    {
      id: 3,
      from: "익명",
      to: "홍길동",
      message:
        "어려운 상황에서도 긍정적인 모습을 보여주셔서 힘이 됩니다. 응원합니다!",
      date: "2026-03-28",
      isAnonymous: true,
    },
  ];

  const sentLetters = [
    {
      id: 1,
      from: "홍길동",
      to: "이지은",
      message:
        "항상 꼼꼼하게 일처리 해주셔서 감사합니다. 함께 일하는 것이 즐겁습니다!",
      date: "2026-04-02",
      isAnonymous: false,
    },
    {
      id: 2,
      from: "홍길동",
      to: "박철수",
      message:
        "프로젝트 관리를 정말 잘하시는 것 같아요. 많이 배우고 있습니다.",
      date: "2026-03-25",
      isAnonymous: true,
    },
  ];

  return (
    <div className={cn("p-6 max-w-5xl mx-auto min-h-full", pageClass)}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2
            className={cn(
              "text-2xl font-semibold mb-1 flex items-center gap-2",
              textMain
            )}
          >
            <Heart
              className={cn(
                "size-7",
                isDark ? "text-[#d8d8e3]" : "text-pink-500"
              )}
            />
            마음의 편지
          </h2>
          <p className={textSub}>동료에게 감사와 응원의 메시지를 전하세요</p>
        </div>

        <Button
          onClick={() => setShowForm(!showForm)}
          className={primaryPinkButtonClass}
        >
          <Send className="size-5 mr-2" />
          편지 쓰기
        </Button>
      </div>

      {showForm && (
        <Card
          className={cn(
            "mb-6",
            isDark ? cardClass : "border-pink-200 bg-white"
          )}
        >
          <CardHeader className={isDark ? cardHeaderClass : "bg-pink-50"}>
            <CardTitle className="text-lg">새 편지 작성</CardTitle>
          </CardHeader>

          <CardContent className="pt-6">
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">받는 사람</Label>
                <Select>
                  <SelectTrigger className={inputClass}>
                    <SelectValue placeholder="동료를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent
                    className={
                      isDark
                        ? "bg-[#35353d] border-[#5c5c73] text-white"
                        : ""
                    }
                  >
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
                <Textarea
                  id="message"
                  placeholder="감사하거나 응원하고 싶은 마음을 전해보세요..."
                  rows={6}
                  className={cn("resize-none", inputClass)}
                />
                <p className={cn("text-xs", textMuted)}>
                  💡 따뜻한 마음이 담긴 메시지는 동료에게 큰 힘이 됩니다
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  className="size-4 rounded border-gray-300"
                />
                <Label
                  htmlFor="anonymous"
                  className="text-sm font-normal cursor-pointer"
                >
                  익명으로 보내기
                </Label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" className={primaryPinkButtonClass}>
                  <Send className="size-4 mr-2" />
                  전송하기
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className={outlineButtonClass}
                >
                  취소
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className={cardClass}>
          <CardHeader
            className={
              isDark
                ? cardHeaderClass
                : "bg-gradient-to-r from-pink-50 to-purple-50"
            }
          >
            <CardTitle className="flex items-center gap-2">
              <Mail className="size-5" />
              받은 편지 ({receivedLetters.length})
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="space-y-4">
              {receivedLetters.map((letter) => (
                <div
                  key={letter.id}
                  className={cn(
                    "p-4 border-2 rounded-lg transition-colors",
                    isDark
                      ? letterCardClass
                      : "border-pink-100 hover:border-pink-300 bg-gradient-to-br from-white to-pink-50"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "size-10 rounded-full flex items-center justify-center text-white font-semibold",
                          isDark
                            ? "bg-[#5c5c73]"
                            : "bg-gradient-to-br from-pink-500 to-pink-600"
                        )}
                      >
                        {letter.from.charAt(0)}
                      </div>
                      <div>
                        <div className={cn("font-semibold", textMain)}>
                          {letter.from}
                        </div>
                        <div className={cn("text-xs", textSub)}>
                          {letter.date}
                        </div>
                      </div>
                    </div>

                    {letter.isAnonymous && (
                      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                        익명
                      </Badge>
                    )}
                  </div>

                  <p className={cn("text-sm leading-relaxed", textSub)}>
                    {letter.message}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardHeader
            className={
              isDark
                ? cardHeaderClass
                : "bg-gradient-to-r from-blue-50 to-cyan-50"
            }
          >
            <CardTitle className="flex items-center gap-2">
              <Send className="size-5" />
              보낸 편지 ({sentLetters.length})
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="space-y-4">
              {sentLetters.map((letter) => (
                <div
                  key={letter.id}
                  className={cn(
                    "p-4 border-2 rounded-lg transition-colors",
                    isDark
                      ? letterCardClass
                      : "border-blue-100 hover:border-blue-300 bg-gradient-to-br from-white to-blue-50"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "size-10 rounded-full flex items-center justify-center text-white font-semibold",
                          isDark
                            ? "bg-[#5c5c73]"
                            : "bg-gradient-to-br from-blue-500 to-blue-600"
                        )}
                      >
                        {letter.to.charAt(0)}
                      </div>
                      <div>
                        <div className={cn("font-semibold", textMain)}>
                          {letter.to}
                        </div>
                        <div className={cn("text-xs", textSub)}>
                          {letter.date}
                        </div>
                      </div>
                    </div>

                    {letter.isAnonymous && (
                      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                        익명
                      </Badge>
                    )}
                  </div>

                  <p className={cn("text-sm leading-relaxed", textSub)}>
                    {letter.message}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card className={cardClass}>
          <CardContent className="p-5 text-center">
            <div
              className={cn(
                "text-3xl font-bold mb-1",
                isDark ? "text-[#d8d8e3]" : "text-pink-600"
              )}
            >
              {receivedLetters.length}
            </div>
            <div className={cn("text-sm", textSub)}>받은 편지</div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardContent className="p-5 text-center">
            <div
              className={cn(
                "text-3xl font-bold mb-1",
                isDark ? "text-[#d8d8e3]" : "text-blue-600"
              )}
            >
              {sentLetters.length}
            </div>
            <div className={cn("text-sm", textSub)}>보낸 편지</div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardContent className="p-5 text-center">
            <div
              className={cn(
                "text-3xl font-bold mb-1",
                isDark ? "text-[#d8d8e3]" : "text-purple-600"
              )}
            >
              {receivedLetters.length + sentLetters.length}
            </div>
            <div className={cn("text-sm", textSub)}>전체 편지</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}