import { useState, useRef, useEffect } from "react";
import {
  Send,
  X,
  Minus,
  MessageSquare,
  Search as SearchIcon,
  Smile,
  Paperclip,
  Download,
  Plus,
  User,
  Users,
} from "lucide-react";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { ScrollArea } from "@/components/UI/scroll-area";
import { useAppContext } from "@/store/AppProvider";
import { cn } from "@/components/UI/utils";
import { Badge } from "@/components/UI/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";

export function ChatWidget() {
  const {
    employees,
    currentUser,
    chatRooms,
    chatMessages,
    addChatRoom,
    updateChatRoom,
    sendMessage: sendChatMessage,
    customSettings,
  } = useAppContext();

  const isDark = customSettings?.darkMode;

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatType, setNewChatType] = useState(null);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [participantSearch, setParticipantSearch] = useState("");
  const [groupName, setGroupName] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [chatPosition, setChatPosition] = useState({
    x: window.innerWidth - 420,
    y: window.innerHeight - 700,
  });

  const [isChatDragging, setIsChatDragging] = useState(false);
  const chatDragOffsetRef = useRef({ x: 0, y: 0 });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const emojiList = [
    "😀",
    "😂",
    "😍",
    "👍",
    "👏",
    "🔥",
    "🎉",
    "🙏",
    "😎",
    "😭",
    "😅",
    "❤️",
    "😊",
    "😆",
    "🥲",
    "😡",
    "🤔",
    "🙌",
    "💪",
    "✨",
    "✅",
    "💯",
    "🍀",
    "☕",
  ];

  const primaryButtonClass = isDark
    ? "bg-[#5c5c73] hover:bg-[#6a6a82] text-white"
    : "bg-blue-600 hover:bg-blue-700 text-white";

  const outlineButtonClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white hover:bg-[#48484f]"
    : "";

  const inputClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white placeholder:text-zinc-400"
    : "";

  const modalClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "";

  const innerBoxClass = isDark
    ? "bg-[#2f2f36] border border-[#5c5c73] text-zinc-100"
    : "bg-gray-50 text-gray-700";

  const textMain = isDark ? "text-white" : "text-gray-900";
  const textSub = isDark ? "text-zinc-300" : "text-gray-600";
  const textMuted = isDark ? "text-zinc-400" : "text-gray-500";

  const totalUnread = chatRooms.reduce((sum, room) => sum + room.unread, 0);

  const filteredRooms = chatRooms.filter((room) => {
    const matchesSearch = room.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const isMyPersonalRoom = !room.isGroup && room.name === currentUser?.name;

    return matchesSearch && !isMyPersonalRoom;
  });

  const selectedRoomData = chatRooms.find((room) => room.id === selectedRoom);
  const currentMessages = selectedRoom ? chatMessages[selectedRoom] || [] : [];

  const isGroupRoom = !!selectedRoomData?.isGroup;

  const roomParticipants =
    selectedRoomData?.participants
      ?.map((id) => employees.find((emp) => emp.id === id))
      .filter(Boolean) || [];

  useEffect(() => {
    if (!selectedRoom || !currentUser) return;

    const room = chatRooms.find((item) => item.id === selectedRoom);

    if (room && !room.isGroup && room.name === currentUser.name) {
      setSelectedRoom(null);
    }
  }, [selectedRoom, currentUser, chatRooms]);

  useEffect(() => {
    setShowParticipants(false);
    setShowEmojiPicker(false);
  }, [selectedRoom]);

  useEffect(() => {
    if (!isOpen || !selectedRoom) return;

    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });
  }, [isOpen, selectedRoom, currentMessages.length]);

  useEffect(() => {
    if (!isOpen || !selectedRoom) return;

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [isOpen, selectedRoom]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isChatDragging) return;

      const panelWidth = isMinimized ? 320 : 384;
      const panelHeight = isMinimized ? 56 : 640;

      const nextX = e.clientX - chatDragOffsetRef.current.x;
      const nextY = e.clientY - chatDragOffsetRef.current.y;

      const minX = 8;
      const minY = 8;
      const maxX = window.innerWidth - panelWidth - 8;
      const maxY = window.innerHeight - panelHeight - 8;

      setChatPosition({
        x: Math.min(Math.max(nextX, minX), maxX),
        y: Math.min(Math.max(nextY, minY), maxY),
      });
    };

    const handleMouseUp = () => {
      setIsChatDragging(false);
    };

    if (isChatDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isChatDragging, isMinimized]);

  const handleChatDragStart = (e) => {
    if (e.target.closest("button")) return;

    setIsChatDragging(true);

    chatDragOffsetRef.current = {
      x: e.clientX - chatPosition.x,
      y: e.clientY - chatPosition.y,
    };
  };

  const getNowTime = () => {
    const now = new Date();

    return `${now.getHours() >= 12 ? "오후" : "오전"} ${String(
      now.getHours() % 12 || 12
    ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  };

  const formatFileSize = (size) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSend = () => {
    if (!message.trim() || !selectedRoom || !currentUser) return;

    const nextMessage = message.trim();
    const timeString = getNowTime();

    sendChatMessage(selectedRoom, nextMessage);

    updateChatRoom(selectedRoom, {
      lastMessage: nextMessage,
      timestamp: timeString,
    });

    setMessage("");

    requestAnimationFrame(() => {
      inputRef.current?.focus();
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });
  };

  const handleEmojiClick = (emoji) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file || !selectedRoom || !currentUser) return;

    const fileUrl = URL.createObjectURL(file);
    const fileSize = formatFileSize(file.size);
    const fileMessage = `📎 ${file.name} (${fileSize})`;
    const timeString = getNowTime();

    sendChatMessage(selectedRoom, {
      type: "file",
      content: fileMessage,
      fileName: file.name,
      fileSize,
      fileUrl,
    });

    updateChatRoom(selectedRoom, {
      lastMessage: fileMessage,
      timestamp: timeString,
    });

    e.target.value = "";

    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  const handleKeyDown = (e) => {
    if (isComposing) return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetNewChatModal = () => {
    setShowNewChatModal(false);
    setNewChatType(null);
    setSelectedParticipants([]);
    setParticipantSearch("");
    setGroupName("");
  };

  const createGroupChat = () => {
    if (!currentUser || selectedParticipants.length === 0) return;

    const groupMembers = Array.from(
      new Set([currentUser.id, ...selectedParticipants])
    );

    const displayName =
      groupName.trim() ||
      selectedParticipants
        .map((id) => employees.find((emp) => emp.id === id)?.name)
        .filter(Boolean)
        .slice(0, 3)
        .join(", ") ||
      "그룹 채팅방";

    const newRoomId = addChatRoom({
      name: displayName,
      lastMessage: "그룹 채팅방이 생성되었습니다.",
      timestamp: "방금",
      unread: 0,
      avatar: displayName.charAt(0),
      online: false,
      isGroup: true,
      participants: groupMembers,
    });

    setSelectedRoom(newRoomId);
    resetNewChatModal();
  };

  const renderMessageContent = (msg) => {
    if (msg.type === "file" && msg.fileUrl) {
      return (
        <a
          href={msg.fileUrl}
          download={msg.fileName}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
            msg.isMe
              ? "border-white/30 bg-white/10 text-white hover:bg-white/20"
              : isDark
              ? "border-[#5c5c73] bg-[#2f2f36] text-white hover:bg-[#3f3f48]"
              : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
          )}
        >
          <Paperclip className="size-4 shrink-0" />

          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">{msg.fileName}</div>
            <div className="text-xs opacity-70">{msg.fileSize}</div>
          </div>

          <Download className="size-4 shrink-0" />
        </a>
      );
    }

    return (
      <div className="text-sm break-words whitespace-pre-wrap">
        {msg.content}
      </div>
    );
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 size-14 rounded-full shadow-lg text-white z-[9999]",
          isDark
            ? "bg-[#5c5c73] hover:bg-[#6a6a82]"
            : "bg-blue-600 hover:bg-blue-700"
        )}
      >
        <MessageSquare className="size-6" />

        {totalUnread > 0 && (
          <Badge className="absolute -top-1 -right-1 size-6 flex items-center justify-center p-0 bg-red-500 text-white border-2 border-white">
            {totalUnread > 9 ? "9+" : totalUnread}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "fixed rounded-lg shadow-2xl border z-[9999] flex flex-col overflow-hidden transition-[width,height]",
        isMinimized ? "w-80 h-14" : "w-96 h-[640px] max-h-[calc(100vh-48px)]",
        isDark
          ? "bg-[#35353d] border-[#5c5c73] text-white"
          : "bg-white border-gray-200"
      )}
      style={{
        left: `${chatPosition.x}px`,
        top: `${chatPosition.y}px`,
      }}
    >
      <div
        onMouseDown={handleChatDragStart}
        className={cn(
          "flex items-center justify-between p-4 border-b text-white rounded-t-lg shrink-0 cursor-move select-none",
          isDark
            ? "border-[#5c5c73] bg-[#5c5c73]"
            : "border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700"
        )}
      >
        <div className="relative flex items-center gap-2 min-w-0">
          <MessageSquare className="size-5 shrink-0" />

          <span className="font-semibold truncate">
            {selectedRoom ? selectedRoomData?.name : "채팅"}
          </span>

          {isGroupRoom && (
            <button
              type="button"
              onClick={() => setShowParticipants((prev) => !prev)}
              className="shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-xs text-white hover:bg-white/30 cursor-pointer"
            >
              {roomParticipants.length}명
            </button>
          )}

          {totalUnread > 0 && !selectedRoom && (
            <Badge className="bg-red-500 text-white">{totalUnread}</Badge>
          )}

          {isGroupRoom && showParticipants && (
            <div
              className={cn(
                "absolute left-0 top-9 z-[10000] w-64 rounded-lg border p-2 shadow-xl",
                isDark
                  ? "border-[#5c5c73] bg-[#35353d] text-white"
                  : "border-gray-200 bg-white text-gray-900"
              )}
            >
              <div
                className={cn(
                  "mb-2 px-2 text-xs font-semibold",
                  isDark ? "text-zinc-300" : "text-gray-500"
                )}
              >
                참여 중인 인원 {roomParticipants.length}명
              </div>

              <div className="max-h-64 overflow-y-auto">
                {roomParticipants.map((member) => (
                  <div
                    key={member.id}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-2",
                      isDark ? "hover:bg-[#48484f]" : "hover:bg-gray-50"
                    )}
                  >
                    <div className="flex size-8 items-center justify-center rounded-full bg-[#5c5c73] text-xs font-semibold text-white">
                      {member.name.charAt(0)}
                    </div>

                    <div className="min-w-0">
                      <div className={cn("truncate text-sm font-medium", textMain)}>
                        {member.name}
                        {member.id === currentUser?.id && (
                          <span className={cn("ml-1 text-xs", textSub)}>나</span>
                        )}
                      </div>

                      <div className={cn("truncate text-xs", textSub)}>
                        {member.department} · {member.position}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!selectedRoom && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNewChatModal(true)}
              className={cn(
                "size-8 p-0 text-white hover:cursor-pointer",
                isDark ? "hover:bg-[#6a6a82]" : "hover:bg-blue-600"
              )}
              title="새 대화"
            >
              <Plus className="size-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className={cn(
              "size-8 p-0 text-white hover:cursor-pointer",
              isDark ? "hover:bg-[#6a6a82]" : "hover:bg-blue-600"
            )}
          >
            <Minus className="size-4" />
          </Button>

          {selectedRoom && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedRoom(null)}
              className={cn(
                "size-8 p-0 text-white hover:cursor-pointer",
                isDark ? "hover:bg-[#6a6a82]" : "hover:bg-blue-600"
              )}
            >
              ←
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className={cn(
              "size-8 p-0 text-white hover:cursor-pointer",
              isDark ? "hover:bg-[#6a6a82]" : "hover:bg-blue-600"
            )}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {!selectedRoom ? (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div
                className={cn(
                  "p-3 border-b shrink-0",
                  isDark ? "border-[#5c5c73]" : "border-gray-200"
                )}
              >
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />

                  <Input
                    placeholder="채팅방 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={cn("pl-9 h-9", inputClass)}
                  />
                </div>
              </div>

              <ScrollArea className="flex-1 min-h-0">
                <div className="p-2 space-y-1">
                  {filteredRooms.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => {
                        setSelectedRoom(room.id);
                        updateChatRoom(room.id, { unread: 0 });
                      }}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                        isDark ? "hover:bg-[#48484f]" : "hover:bg-gray-50"
                      )}
                    >
                      <div className="relative">
                        <div
                          className={cn(
                            "size-12 rounded-full flex items-center justify-center text-2xl text-white",
                            isDark
                              ? "bg-[#5c5c73]"
                              : "bg-gradient-to-br from-blue-400 to-blue-600"
                          )}
                        >
                          {room.avatar}
                        </div>

                        {room.online && (
                          <div className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <span className={cn("font-medium truncate", textMain)}>
                            {room.name}
                          </span>

                          <span className={cn("text-xs flex-shrink-0", textMuted)}>
                            {room.timestamp}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <p className={cn("text-sm truncate", textSub)}>
                            {room.lastMessage}
                          </p>

                          {room.unread > 0 && (
                            <Badge className="ml-2 bg-red-500 text-white flex-shrink-0">
                              {room.unread}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 min-h-0 p-4">
                <div className="space-y-4">
                  {currentMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.isMe ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg px-4 py-2",
                          msg.isMe
                            ? isDark
                              ? "bg-[#5c5c73] text-white"
                              : "bg-blue-600 text-white"
                            : isDark
                            ? "bg-[#48484f] text-white"
                            : "bg-gray-100 text-gray-900"
                        )}
                      >
                        {!msg.isMe && (
                          <div className="text-xs font-medium mb-1 opacity-70">
                            {msg.sender}
                          </div>
                        )}

                        {renderMessageContent(msg)}

                        <div
                          className={cn(
                            "text-xs mt-1",
                            msg.isMe
                              ? "text-zinc-200"
                              : isDark
                              ? "text-zinc-300"
                              : "text-gray-500"
                          )}
                        >
                          {msg.timestamp}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <form
                onSubmit={handleSubmit}
                className={cn(
                  "p-3 border-t shrink-0",
                  isDark
                    ? "border-[#5c5c73] bg-[#35353d]"
                    : "border-gray-200 bg-gray-50"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "size-8 p-0",
                        isDark
                          ? "text-zinc-300 hover:text-white hover:bg-[#48484f]"
                          : "text-gray-500 hover:text-gray-700"
                      )}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip className="size-4" />
                    </Button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>

                  <div className="relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "size-8 p-0",
                        isDark
                          ? "text-zinc-300 hover:text-white hover:bg-[#48484f]"
                          : "text-gray-500 hover:text-gray-700"
                      )}
                      onClick={() => setShowEmojiPicker((prev) => !prev)}
                    >
                      <Smile className="size-4" />
                    </Button>

                    {showEmojiPicker && (
                      <div
                        className={cn(
                          "absolute bottom-full left-0 mb-2 z-[10000] w-64 rounded-xl border p-3 shadow-xl",
                          isDark
                            ? "border-[#5c5c73] bg-[#35353d]"
                            : "border-gray-200 bg-white"
                        )}
                      >
                        <div className="grid grid-cols-6 gap-2">
                          {emojiList.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleEmojiClick(emoji)}
                              className={cn(
                                "flex h-9 w-9 items-center justify-center rounded-lg text-xl leading-none transition-colors",
                                isDark
                                  ? "hover:bg-[#48484f]"
                                  : "hover:bg-gray-100"
                              )}
                            >
                              <span className="block leading-none">{emoji}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Input
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onCompositionStart={() => setIsComposing(true)}
                    onCompositionEnd={() => setIsComposing(false)}
                    placeholder="메시지를 입력하세요..."
                    className={cn("flex-1 h-9", inputClass)}
                  />

                  <Button
                    type="submit"
                    size="sm"
                    className={cn("h-9", primaryButtonClass)}
                    disabled={!message.trim()}
                  >
                    <Send className="size-4" />
                  </Button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      <Dialog open={showNewChatModal} onOpenChange={setShowNewChatModal}>
        <DialogContent className={cn("sm:max-w-[400px]", modalClass)}>
          <DialogHeader>
            <DialogTitle>새 대화 시작</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={newChatType === "individual" ? "default" : "outline"}
                onClick={() => {
                  setNewChatType("individual");
                  setSelectedParticipants([]);
                }}
                className={cn(
                  "flex-1",
                  newChatType === "individual"
                    ? primaryButtonClass
                    : outlineButtonClass
                )}
              >
                <User className="size-4 mr-2" />
                개인 대화
              </Button>

              <Button
                size="sm"
                variant={newChatType === "group" ? "default" : "outline"}
                onClick={() => {
                  setNewChatType("group");
                  setSelectedParticipants([]);
                }}
                className={cn(
                  "flex-1",
                  newChatType === "group"
                    ? primaryButtonClass
                    : outlineButtonClass
                )}
              >
                <Users className="size-4 mr-2" />
                그룹 대화
              </Button>
            </div>

            {newChatType === "individual" && (
              <div>
                <div className="relative mb-3">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />

                  <Input
                    placeholder="대화 상대 검색..."
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    className={cn("pl-9", inputClass)}
                  />
                </div>

                <ScrollArea className="h-60">
                  <div className="space-y-2">
                    {employees
                      .filter(
                        (emp) =>
                          emp.id !== currentUser.id &&
                          emp.name
                            .toLowerCase()
                            .includes(participantSearch.toLowerCase())
                      )
                      .map((emp) => {
                        const existingRoom = chatRooms.find(
                          (room) => !room.isGroup && room.name === emp.name
                        );

                        return (
                          <div
                            key={emp.id}
                            onClick={() => {
                              if (existingRoom) {
                                setSelectedRoom(existingRoom.id);
                              } else {
                                const newRoomId = addChatRoom({
                                  name: emp.name,
                                  lastMessage: "대화를 시작해보세요",
                                  timestamp: "방금",
                                  unread: 0,
                                  avatar: emp.name[0],
                                  online: emp.status === "업무 중",
                                  isGroup: false,
                                  targetUserId: emp.id,
                                });

                                setSelectedRoom(newRoomId);
                              }

                              resetNewChatModal();
                            }}
                            className={cn(
                              "flex items-center gap-3 p-2 rounded-lg cursor-pointer",
                              isDark ? "hover:bg-[#48484f]" : "hover:bg-gray-100"
                            )}
                          >
                            <div
                              className={cn(
                                "size-10 rounded-full flex items-center justify-center text-white font-semibold",
                                isDark ? "bg-[#5c5c73]" : "bg-blue-600"
                              )}
                            >
                              {emp.name[0]}
                            </div>

                            <div className="flex-1">
                              <p className={cn("font-medium text-sm", textMain)}>
                                {emp.name}
                              </p>
                              <p className={cn("text-xs", textMuted)}>
                                {emp.position}
                              </p>
                            </div>

                            {existingRoom && (
                              <span
                                className={cn(
                                  "text-xs",
                                  isDark ? "text-blue-300" : "text-blue-600"
                                )}
                              >
                                기존 대화
                              </span>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </ScrollArea>
              </div>
            )}

            {newChatType === "group" && (
              <div>
                <Input
                  placeholder="그룹 이름 입력..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className={cn("mb-3", inputClass)}
                />

                <div className="relative mb-3">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />

                  <Input
                    placeholder="참가자 검색..."
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    className={cn("pl-9", inputClass)}
                  />
                </div>

                {selectedParticipants.length > 0 && (
                  <div className={cn("mb-3 p-3 rounded-lg", innerBoxClass)}>
                    <p className={cn("text-xs mb-2", textMuted)}>
                      선택됨 ({selectedParticipants.length}명)
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {selectedParticipants.map((id) => {
                        const emp = employees.find((e) => e.id === id);

                        return emp ? (
                          <Badge
                            key={id}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {emp.name}

                            <X
                              className="size-3 cursor-pointer hover:text-red-600"
                              onClick={() =>
                                setSelectedParticipants(
                                  selectedParticipants.filter((p) => p !== id)
                                )
                              }
                            />
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {employees
                      .filter(
                        (emp) =>
                          emp.id !== currentUser.id &&
                          !selectedParticipants.includes(emp.id) &&
                          emp.name
                            .toLowerCase()
                            .includes(participantSearch.toLowerCase())
                      )
                      .map((emp) => (
                        <div
                          key={emp.id}
                          onClick={() =>
                            setSelectedParticipants([
                              ...selectedParticipants,
                              emp.id,
                            ])
                          }
                          className={cn(
                            "flex items-center gap-3 p-2 rounded-lg cursor-pointer",
                            isDark ? "hover:bg-[#48484f]" : "hover:bg-gray-100"
                          )}
                        >
                          <div
                            className={cn(
                              "size-10 rounded-full flex items-center justify-center text-white font-semibold",
                              isDark ? "bg-[#5c5c73]" : "bg-blue-600"
                            )}
                          >
                            {emp.name[0]}
                          </div>

                          <div className="flex-1">
                            <p className={cn("font-medium text-sm", textMain)}>
                              {emp.name}
                            </p>
                            <p className={cn("text-xs", textMuted)}>
                              {emp.position}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>

                {selectedParticipants.length > 0 && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      className={cn("flex-1", outlineButtonClass)}
                      onClick={resetNewChatModal}
                    >
                      취소
                    </Button>

                    <Button
                      className={cn("flex-1", primaryButtonClass)}
                      onClick={createGroupChat}
                    >
                      생성
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ChatWidget;