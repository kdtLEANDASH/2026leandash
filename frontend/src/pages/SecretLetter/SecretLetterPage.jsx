import { useEffect, useMemo, useState } from "react";
import { Heart, Send, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Textarea } from "@/components/UI/textarea";
import { Label } from "@/components/UI/label";
import { Input } from "@/components/UI/input";
import { Badge } from "@/components/UI/badge";
import { useAppContext } from "@/store/AppProvider";
import { cn } from "@/components/UI/utils";
import {
  createHeartLetterApi,
  getMyHeartLetterApi,
  getMyHeartLettersApi,
  getReceivedHeartLetterApi,
  getReceivedHeartLettersApi,
} from "@/api/heartLetterApi";

function unwrapResponse(result) {
  if (Array.isArray(result)) return result;
  return result?.data ?? result ?? null;
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toISOString().slice(0, 10);
}

function toSentLetter(item, detail) {
  return {
    id: item.heartLetterId,
    title: detail?.title ?? item.title,
    to: detail?.receiverUserName ?? "최고 관리자",
    message: detail?.content ?? "",
    date: formatDate(detail?.createdAt ?? item.createdAt),
    isAnonymous: detail?.anonymous ?? item.anonymous ?? false,
    status: detail?.status ?? item.status ?? "SENT",
  };
}

function toReceivedLetter(item, detail) {
  return {
    id: item.heartLetterId,
    title: detail?.title ?? item.title,
    from: detail?.senderUserName ?? item.senderUserName ?? "익명",
    message: detail?.content ?? "",
    date: formatDate(detail?.createdAt ?? item.createdAt),
    isAnonymous: detail?.anonymous ?? item.anonymous ?? false,
    status: detail?.status ?? item.status ?? "SENT",
  };
}

function getStatusLabel(status) {
  if (status === "READ") return "읽음";
  if (status === "SENT") return "전달됨";
  return status ?? "-";
}

export function HeartLetterPage() {
  const { customSettings } = useAppContext();

  const isDark = customSettings?.darkMode;
  const isAdmin = localStorage.getItem("userRole") === "ADMIN";

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [sentLetters, setSentLetters] = useState([]);
  const [receivedLetters, setReceivedLetters] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const pageClass = isDark
    ? "bg-[#27272a] text-white min-h-full"
    : "bg-gray-50 text-gray-900 min-h-full";

  const cardClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "bg-white border-gray-200";

  const formHeaderClass = isDark
    ? "bg-[#35353d] border-b border-[#5c5c73]"
    : "bg-pink-50";

  const receivedHeaderClass = isDark
    ? "bg-[#35353d] border-b border-[#5c5c73]"
    : "bg-gradient-to-r from-pink-50 to-purple-50";

  const sentHeaderClass = isDark
    ? "bg-[#35353d] border-b border-[#5c5c73]"
    : "bg-gradient-to-r from-blue-50 to-cyan-50";

  const inputClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white placeholder:text-zinc-400"
    : "";

  const infoBoxClass = isDark
    ? "rounded-md border border-[#5c5c73] bg-[#2f2f36] px-3 py-2 text-sm text-zinc-200"
    : "rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700";

  const receivedLetterClass = isDark
    ? "p-4 border-2 border-[#5c5c73] rounded-lg bg-[#2f2f36] hover:bg-[#3f3f48] transition-colors"
    : "p-4 border-2 border-pink-100 rounded-lg hover:border-pink-300 transition-colors bg-gradient-to-br from-white to-pink-50";

  const sentLetterClass = isDark
    ? "p-4 border-2 border-[#5c5c73] rounded-lg bg-[#2f2f36] hover:bg-[#3f3f48] transition-colors"
    : "p-4 border-2 border-blue-100 rounded-lg hover:border-blue-300 transition-colors bg-gradient-to-br from-white to-blue-50";

  const primaryButtonClass = isDark
    ? "bg-[#5c5c73] hover:bg-[#6a6a82] text-white"
    : "bg-pink-600 hover:bg-pink-700 text-white";

  const outlineButtonClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white hover:bg-[#48484f]"
    : "";

  const textMain = isDark ? "text-white" : "text-gray-900";
  const textSub = isDark ? "text-zinc-300" : "text-gray-600";
  const textMuted = isDark ? "text-zinc-400" : "text-gray-500";

  const avatarPinkClass = isDark
    ? "bg-[#5c5c73]"
    : "bg-gradient-to-br from-pink-500 to-pink-600";

  const avatarBlueClass = isDark
    ? "bg-[#5c5c73]"
    : "bg-gradient-to-br from-blue-500 to-blue-600";

  const statTextPink = isDark ? "text-[#d8d8e3]" : "text-pink-600";
  const statTextBlue = isDark ? "text-[#d8d8e3]" : "text-blue-600";
  const statTextPurple = isDark ? "text-[#d8d8e3]" : "text-purple-600";

  const loadHeartLetters = async () => {
    try {
      setIsLoading(true);

      const sentResult = await getMyHeartLettersApi();
      const sentList = unwrapResponse(sentResult) ?? [];

      const sentDetails = await Promise.all(
        sentList.map((item) => getMyHeartLetterApi(item.heartLetterId))
      );

      setSentLetters(
        sentList.map((item, index) =>
          toSentLetter(item, unwrapResponse(sentDetails[index]))
        )
      );

      if (isAdmin) {
        const receivedResult = await getReceivedHeartLettersApi();
        const receivedList = unwrapResponse(receivedResult) ?? [];

        const receivedDetails = await Promise.all(
          receivedList.map((item) =>
            getReceivedHeartLetterApi(item.heartLetterId)
          )
        );

        setReceivedLetters(
          receivedList.map((item, index) =>
            toReceivedLetter(item, unwrapResponse(receivedDetails[index]))
          )
        );
      } else {
        setReceivedLetters([]);
      }
    } catch (error) {
      console.error("마음의 편지 조회 실패:", error);
      alert("마음의 편지를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHeartLetters();
  }, [isAdmin]);

  const totalCount = useMemo(
    () => sentLetters.length + receivedLetters.length,
    [sentLetters.length, receivedLetters.length]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedTitle = title.trim();
    const normalizedMessage = message.trim();

    if (!normalizedMessage) {
      alert("메시지를 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);

      await createHeartLetterApi({
        title: normalizedTitle || normalizedMessage.slice(0, 20),
        content: normalizedMessage,
        anonymous,
      });

      setTitle("");
      setMessage("");
      setAnonymous(false);
      setShowForm(false);

      await loadHeartLetters();
    } catch (error) {
      console.error("마음의 편지 등록 실패:", error);
      alert("마음의 편지 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("p-6 max-w-5xl mx-auto", pageClass)}>
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

          <p className={textSub}>최고 관리자에게 감사와 의견을 전해보세요</p>
        </div>

        <Button
          onClick={() => setShowForm(!showForm)}
          className={primaryButtonClass}
        >
          <Send className="size-5 mr-2" />
          편지 쓰기
        </Button>
      </div>

      {showForm && (
        <Card className={cn("mb-6", cardClass)}>
          <CardHeader
            className={cn(
              "h-16 px-6 py-0 flex flex-row items-center",
              formHeaderClass
            )}
          >
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              새 편지 작성
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label>받는 사람</Label>
                <div className={infoBoxClass}>
                  최고 관리자에게 자동 전달됩니다.
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="heart-title">제목</Label>
                <Input
                  id="heart-title"
                  placeholder="편지 제목을 입력하세요"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">메시지</Label>
                <Textarea
                  id="message"
                  placeholder="감사하거나 전하고 싶은 마음을 적어보세요"
                  rows={6}
                  className={cn("resize-none", inputClass)}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />

                <p className={cn("text-xs", textMuted)}>
                  익명 여부와 관계없이 메시지는 최고 관리자에게 전달됩니다.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={anonymous}
                  onChange={(event) => setAnonymous(event.target.checked)}
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
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={primaryButtonClass}
                >
                  <Send className="size-4 mr-2" />
                  {isSubmitting ? "전송 중..." : "전송하기"}
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

      <div
        className={cn(
          "grid grid-cols-1 gap-6",
          isAdmin ? "lg:grid-cols-2" : "max-w-4xl mx-auto"
        )}
      >
        {isAdmin && (
          <Card className={cardClass}>
            <CardHeader
              className={cn(
                "h-16 px-6 py-0 flex flex-row items-center",
                receivedHeaderClass
              )}
            >
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Mail className="size-5 shrink-0" />
                <span>받은 편지 ({receivedLetters.length})</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="space-y-4">
                {receivedLetters.map((letter) => (
                  <div key={letter.id} className={receivedLetterClass}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "size-10 rounded-full flex items-center justify-center text-white font-semibold",
                            avatarPinkClass
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

                      <div className="flex items-center gap-2">
                        {letter.isAnonymous && (
                          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                            익명
                          </Badge>
                        )}

                        <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                          {getStatusLabel(letter.status)}
                        </Badge>
                      </div>
                    </div>

                    <div className={cn("font-medium mb-2", textMain)}>
                      {letter.title}
                    </div>

                    <p
                      className={cn(
                        "text-sm leading-relaxed whitespace-pre-wrap",
                        textSub
                      )}
                    >
                      {letter.message}
                    </p>
                  </div>
                ))}

                {!isLoading && receivedLetters.length === 0 && (
                  <div className={cn("text-center py-10", textMuted)}>
                    받은 편지가 없습니다.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className={cardClass}>
          <CardHeader
            className={cn(
              "h-16 px-6 py-0 flex flex-row items-center",
              sentHeaderClass
            )}
          >
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Send className="size-5 shrink-0" />
              <span>보낸 편지 ({sentLetters.length})</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="space-y-4">
              {sentLetters.map((letter) => (
                <div key={letter.id} className={sentLetterClass}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "size-10 rounded-full flex items-center justify-center text-white font-semibold",
                          avatarBlueClass
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

                    <div className="flex items-center gap-2">
                      {letter.isAnonymous && (
                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                          익명
                        </Badge>
                      )}

                      <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
                        {getStatusLabel(letter.status)}
                      </Badge>
                    </div>
                  </div>

                  <div className={cn("font-medium mb-2", textMain)}>
                    {letter.title}
                  </div>

                  <p
                    className={cn(
                      "text-sm leading-relaxed whitespace-pre-wrap",
                      textSub
                    )}
                  >
                    {letter.message}
                  </p>
                </div>
              ))}

              {!isLoading && sentLetters.length === 0 && (
                <div className={cn("text-center py-10", textMuted)}>
                  보낸 편지가 없습니다.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div
        className={cn(
          "grid grid-cols-1 gap-4 mt-6",
          isAdmin ? "md:grid-cols-3" : "md:grid-cols-2 max-w-4xl mx-auto"
        )}
      >
        {isAdmin && (
          <Card className={cardClass}>
            <CardContent className="p-5 text-center">
              <div className={cn("text-3xl font-bold mb-1", statTextPink)}>
                {receivedLetters.length}
              </div>

              <div className={cn("text-sm", textSub)}>받은 편지</div>
            </CardContent>
          </Card>
        )}

        <Card className={cardClass}>
          <CardContent className="p-5 text-center">
            <div className={cn("text-3xl font-bold mb-1", statTextBlue)}>
              {sentLetters.length}
            </div>

            <div className={cn("text-sm", textSub)}>보낸 편지</div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardContent className="p-5 text-center">
            <div className={cn("text-3xl font-bold mb-1", statTextPurple)}>
              {totalCount}
            </div>

            <div className={cn("text-sm", textSub)}>전체 편지</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default HeartLetterPage;