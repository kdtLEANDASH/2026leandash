import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Minus } from "lucide-react";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { useAppContext } from "@/store/AppProvider";
import { cn } from "@/components/UI/utils";

export function ChatBotWidget() {
  const { customSettings } = useAppContext();

  const isDark = customSettings?.darkMode;

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");

  const [position, setPosition] = useState({
    x: window.innerWidth - 420,
    y: window.innerHeight - 660,
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const [botMessages, setBotMessages] = useState([
    {
      id: 1,
      sender: "bot",
      content: "안녕하세요. Leandash 챗봇입니다.\n무엇을 도와드릴까요?",
      timestamp: "지금",
    },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const primaryButtonClass = isDark
    ? "bg-[#5c5c73] hover:bg-[#4f4f64] text-white"
    : "bg-slate-700 hover:bg-slate-800 text-white";

  const panelClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "bg-white border-gray-200 text-gray-900";

  const headerClass = isDark
    ? "bg-[#5c5c73] border-[#5c5c73] text-white"
    : "bg-slate-700 border-slate-700 text-white";

  const inputClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white placeholder:text-zinc-400"
    : "";

  useEffect(() => {
    if (!isOpen || isMinimized) return;

    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });
  }, [isOpen, isMinimized, botMessages.length]);

  useEffect(() => {
    if (!isOpen || isMinimized) return;

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [isOpen, isMinimized]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const panelWidth = isMinimized ? 320 : 384;
      const panelHeight = isMinimized ? 56 : 520;

      const nextX = e.clientX - dragOffsetRef.current.x;
      const nextY = e.clientY - dragOffsetRef.current.y;

      const minX = -200;
        const minY = -100;
        const maxX = window.innerWidth - 80;
        const maxY = window.innerHeight - 60;

      setPosition({
        x: Math.min(Math.max(nextX, minX), maxX),
        y: Math.min(Math.max(nextY, minY), maxY),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isMinimized]);

  const handleDragStart = (e) => {
    if (e.target.closest("button")) return;

    setIsDragging(true);

    dragOffsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const getNowTime = () => {
    const now = new Date();

    return `${now.getHours() >= 12 ? "오후" : "오전"} ${String(
      now.getHours() % 12 || 12
    ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  };

  const getBotReply = (text) => {
    const keyword = text.trim();

    if (!keyword) {
      return "질문을 입력해 주세요.";
    }

    if (keyword.includes("휴가")) {
      return "휴가 신청은 상단 메뉴의 [휴가 신청]에서 할 수 있습니다. 신청 내역은 휴가 신청현황에서 확인할 수 있습니다.";
    }

    if (keyword.includes("결재")) {
      return "결재 요청은 [결재신청] 메뉴에서 작성할 수 있고, 승인/반려는 [결재] 메뉴에서 확인할 수 있습니다.";
    }

    if (keyword.includes("문서")) {
      return "문서는 [문서] 메뉴에서 확인하거나 업로드할 수 있습니다.";
    }

    if (keyword.includes("공지")) {
      return "공지사항은 [공지사항] 메뉴에서 확인할 수 있습니다.";
    }

    if (keyword.includes("커뮤니티")) {
      return "커뮤니티는 전체 게시판과 본인 부서 게시판을 이용할 수 있습니다.";
    }

    if (keyword.includes("비밀번호")) {
      return "비밀번호 변경은 [내 정보]에서 할 수 있습니다. 비밀번호를 잊어버린 경우 최고관리자에게 문의하세요.";
    }

    return "아직 연결된 답변 데이터가 없습니다. 추후 백엔드 또는 AI 응답 API와 연결하면 더 정확한 답변을 제공할 수 있습니다.";
  };

  const handleSend = () => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      content: message.trim(),
      timestamp: getNowTime(),
    };

    const botReply = {
      id: Date.now() + 1,
      sender: "bot",
      content: getBotReply(message),
      timestamp: getNowTime(),
    };

    setBotMessages((prev) => [...prev, userMessage, botReply]);
    setMessage("");

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-24 right-6 size-14 rounded-full shadow-lg z-[9999]",
          primaryButtonClass
        )}
        title="챗봇"
      >
        <Bot className="size-6" />
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "fixed rounded-lg border shadow-2xl z-[9999] flex flex-col overflow-hidden transition-[width,height]",
        isMinimized ? "w-80 h-14" : "w-96 h-[520px]",
        panelClass
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div
        onMouseDown={handleDragStart}
        className={cn(
          "flex items-center justify-between px-4 py-3 border-b shrink-0 cursor-move select-none",
          headerClass
        )}
      >
        <div className="flex items-center gap-2 font-semibold">
          <Bot className="size-5" />
          Leandash 챗봇
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized((prev) => !prev)}
            className="size-8 p-0 text-white hover:bg-white/20 cursor-pointer"
          >
            <Minus className="size-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="size-8 p-0 text-white hover:bg-white/20 cursor-pointer"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {botMessages.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex",
                  item.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                    item.sender === "user"
                      ? isDark
                        ? "bg-[#5c5c73] text-white"
                        : "bg-slate-700 text-white"
                      : isDark
                      ? "bg-[#48484f] text-zinc-100"
                      : "bg-gray-100 text-gray-800"
                  )}
                >
                  {item.sender === "bot" && (
                    <div className="mb-1 flex items-center gap-1 text-xs opacity-70">
                      <Bot className="size-3" />
                      챗봇
                    </div>
                  )}

                  <div>{item.content}</div>

                  <div
                    className={cn(
                      "mt-1 text-xs",
                      item.sender === "user"
                        ? "text-zinc-200"
                        : isDark
                        ? "text-zinc-400"
                        : "text-gray-500"
                    )}
                  >
                    {item.timestamp}
                  </div>
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className={cn(
              "border-t p-3 flex gap-2 shrink-0",
              isDark ? "border-[#5c5c73]" : "border-gray-200"
            )}
          >
            <Input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="질문을 입력하세요..."
              className={cn("h-9", inputClass)}
            />

            <Button
              type="submit"
              className={cn("h-9", primaryButtonClass)}
              disabled={!message.trim()}
            >
              <Send className="size-4" />
            </Button>
          </form>
        </>
      )}
    </div>
  );
}