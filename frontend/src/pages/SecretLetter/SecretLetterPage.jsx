import { useEffect, useMemo, useState } from "react";
import { Heart, Send, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Textarea } from "@/components/UI/textarea";
import { Label } from "@/components/UI/label";
import { Input } from "@/components/UI/input";
import { Badge } from "@/components/UI/badge";
import { useAppContext } from "@/store/AppProvider";
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
  const { currentUser } = useAppContext();
  const isAdmin = localStorage.getItem("userRole") === "ADMIN";
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [sentLetters, setSentLetters] = useState([]);
  const [receivedLetters, setReceivedLetters] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Heart className="size-7 text-pink-500" />
            마음의 편지
          </h2>
          <p className="text-gray-600">
            최고 관리자에게 감사와 의견을 전해보세요
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-pink-600 hover:bg-pink-700"
        >
          <Send className="size-5 mr-2" />
          편지 쓰기
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6 border-pink-200">
          <CardHeader className="bg-pink-50">
            <CardTitle className="text-lg">새 편지 작성</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label>받는 사람</Label>
                <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  최고 관리자에게 자동 전달됩니다.
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="heart-title">제목</Label>
                <Input
                  id="heart-title"
                  placeholder="편지 제목을 입력하세요"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">메시지</Label>
                <Textarea
                  id="message"
                  placeholder="감사하거나 전하고 싶은 마음을 적어보세요"
                  rows={6}
                  className="resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  익명 여부와 관계없이 메시지는 최고 관리자에게 전달됩니다.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
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
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  <Send className="size-4 mr-2" />
                  {isSubmitting ? "전송 중..." : "전송하기"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  취소
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className={`grid grid-cols-1 ${isAdmin ? "lg:grid-cols-2" : ""} gap-6`}>
        {isAdmin && (
          <Card>
            <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
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
                    className="p-4 border-2 border-pink-100 rounded-lg hover:border-pink-300 transition-colors bg-gradient-to-br from-white to-pink-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="size-10 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white font-semibold">
                          {letter.from.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {letter.from}
                          </div>
                          <div className="text-xs text-gray-600">
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
                    <div className="font-medium text-gray-900 mb-2">
                      {letter.title}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {letter.message}
                    </p>
                  </div>
                ))}

                {!isLoading && receivedLetters.length === 0 && (
                  <div className="text-center py-10 text-gray-500">
                    받은 편지가 없습니다.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
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
                  className="p-4 border-2 border-blue-100 rounded-lg hover:border-blue-300 transition-colors bg-gradient-to-br from-white to-blue-50"
                >
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
                  <div className="font-medium text-gray-900 mb-2">
                    {letter.title}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {letter.message}
                  </p>
                </div>
              ))}

              {!isLoading && sentLetters.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  보낸 편지가 없습니다.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {isAdmin && (
          <Card>
            <CardContent className="p-5 text-center">
              <div className="text-3xl font-bold text-pink-600 mb-1">
                {receivedLetters.length}
              </div>
              <div className="text-sm text-gray-600">받은 편지</div>
            </CardContent>
          </Card>
        )}
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
              {totalCount}
            </div>
            <div className="text-sm text-gray-600">전체 편지</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
