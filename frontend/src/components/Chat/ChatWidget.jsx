import { useEffect, useMemo, useRef, useState } from "react";
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
import { getUsersApi } from "@/api/userApi";
import {
  createDirectChatRoomApi,
  getChatMessagesApi,
  getMyChatRoomsApi,
  sendChatMessageApi,
} from "@/api/chatApi";

function unwrapResponse(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.result)) return response.result;
  return [];
}

function unwrapObject(response) {
  return response?.data || response?.result || response;
}

function mapUser(user) {
  return {
    id: user.userId ?? user.id,
    name: user.userName ?? user.name ?? "",
    position: user.position ?? "",
    department: user.departmentName ?? user.department ?? "",
    status: user.userStatus ?? user.status ?? "",
  };
}

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function ChatWidget() {
  const { currentUser, customSettings } = useAppContext();
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

  const [employees, setEmployees] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [messagesByRoom, setMessagesByRoom] = useState({});
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

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

  const employeeMap = useMemo(
    () => new Map(employees.map((employee) => [employee.id, employee])),
    [employees]
  );

  const normalizedRooms = useMemo(() => {
    if (!currentUser?.id) return [];

    return rooms.map((room) => {
      const otherUserId =
        room.userId1 === currentUser.id ? room.userId2 : room.userId1;
      const otherUser = employeeMap.get(otherUserId);

      return {
        ...room,
        id: room.roomId,
        isGroup: false,
        participants: [room.userId1, room.userId2],
        targetUserId: otherUserId,
        name: otherUser?.name || `사용자 ${otherUserId}`,
        avatar: (otherUser?.name || "?").charAt(0),
        online:
          otherUser?.status === "ONLINE" || otherUser?.status === "업무 중",
        position: otherUser?.position || "",
        department: otherUser?.department || "",
        lastMessage: room.lastMessage || "대화를 시작해보세요",
        unread: room.unread || 0,
        timestamp: formatTime(room.updatedAt || room.createdAt),
      };
    });
  }, [rooms, employeeMap, currentUser]);

  const totalUnread = normalizedRooms.reduce(
    (sum, room) => sum + (room.unread || 0),
    0
  );

  const filteredRooms = normalizedRooms.filter((room) => {
    const matchesSearch = room.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const isMyPersonalRoom = !room.isGroup && room.name === currentUser?.name;

    return matchesSearch && !isMyPersonalRoom;
  });

  const selectedRoomData = normalizedRooms.find((room) => room.id === selectedRoom);
  const currentMessages = selectedRoom ? messagesByRoom[selectedRoom] || [] : [];

  const isGroupRoom = !!selectedRoomData?.isGroup;

  const roomParticipants =
    selectedRoomData?.participants
      ?.map((id) => employeeMap.get(id))
      .filter(Boolean) || [];

  useEffect(() => {
    if (!selectedRoom || !currentUser) return;

    const room = normalizedRooms.find((item) => item.id === selectedRoom);

    if (room && !room.isGroup && room.name === currentUser.name) {
      setSelectedRoom(null);
    }
  }, [selectedRoom, currentUser, normalizedRooms]);

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

  const loadEmployees = async () => {
    try {
      const response = await getUsersApi();
      setEmployees(unwrapResponse(response).map(mapUser));
    } catch (error) {
      console.error("직원 목록 조회 실패:", error);
    }
  };

  const loadRooms = async (preferredRoomId = null) => {
    if (!currentUser?.id) return;

    try {
      setIsLoadingRooms(true);
      const response = await getMyChatRoomsApi();
      const loadedRooms = unwrapResponse(response);
      setRooms(loadedRooms);

      if (preferredRoomId) {
        setSelectedRoom(preferredRoomId);
      } else if (!selectedRoom && loadedRooms.length > 0) {
        setSelectedRoom(loadedRooms[0].roomId);
      }
    } catch (error) {
      console.error("채팅방 목록 조회 실패:", error);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const loadRoomMessages = async (roomId) => {
    if (!roomId) return;

    try {
      setIsLoadingMessages(true);
      const response = await getChatMessagesApi(roomId);
      const loadedMessages = unwrapResponse(response).map((chatMessage, index) => ({
        id: `${roomId}-${index}-${chatMessage.sentAt}`,
        sender: chatMessage.senderName,
        senderId: chatMessage.senderId,
        senderName: chatMessage.senderName,
        content: chatMessage.message,
        timestamp: formatTime(chatMessage.sentAt),
        isMe: chatMessage.senderId === currentUser?.id,
      }));

      const latestMessage = loadedMessages[loadedMessages.length - 1];

      setMessagesByRoom((prev) => ({
        ...prev,
        [roomId]: loadedMessages,
      }));

      if (latestMessage) {
        setRooms((prev) =>
          prev.map((room) =>
            room.roomId === roomId
              ? {
                  ...room,
                  lastMessage: latestMessage.content,
                  updatedAt: new Date().toISOString(),
                }
              : room
          )
        );
      }
    } catch (error) {
      console.error("채팅 메시지 조회 실패:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (!currentUser?.id) return;
    loadEmployees();
    loadRooms();
  }, [currentUser?.id]);

  useEffect(() => {
    if (!selectedRoom) return;
    loadRoomMessages(selectedRoom);
  }, [selectedRoom, currentUser?.id]);

  useEffect(() => {
    const handleOpenChatRoom = async (event) => {
      const roomId = event.detail?.roomId;
      if (!roomId) return;

      setIsOpen(true);
      setIsMinimized(false);
      await loadEmployees();
      await loadRooms(roomId);
      setSelectedRoom(roomId);
    };

    window.addEventListener("open-chat-room", handleOpenChatRoom);

    return () => {
      window.removeEventListener("open-chat-room", handleOpenChatRoom);
    };
  }, [currentUser?.id]);

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

  const handleSend = async () => {
    if (!message.trim() || !selectedRoom || !currentUser) return;

    try {
      setIsSending(true);
      const nextMessage = message.trim();
      const response = await sendChatMessageApi(selectedRoom, nextMessage);
      const sentMessage = unwrapObject(response);

      setMessagesByRoom((prev) => ({
        ...prev,
        [selectedRoom]: [
          ...(prev[selectedRoom] || []),
          {
            id: `${selectedRoom}-${Date.now()}`,
            sender: sentMessage.senderName,
            senderId: sentMessage.senderId,
            senderName: sentMessage.senderName,
            content: sentMessage.message,
            timestamp: formatTime(sentMessage.sentAt) || getNowTime(),
            isMe: true,
          },
        ],
      }));

      setRooms((prev) =>
        prev.map((room) =>
          room.roomId === selectedRoom
            ? {
                ...room,
                lastMessage: nextMessage,
                updatedAt: new Date().toISOString(),
              }
            : room
        )
      );

      setMessage("");

      requestAnimationFrame(() => {
        inputRef.current?.focus();
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      });
    } catch (error) {
      console.error("채팅 메시지 전송 실패:", error);
      alert("메시지를 전송하지 못했습니다.");
    } finally {
      setIsSending(false);
    }
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
    if (!file) return;

    const fileSize = formatFileSize(file.size);
    alert(
      `채팅 첨부파일 전송은 아직 백엔드 미연동입니다.\n선택한 파일: ${file.name} (${fileSize})`
    );
    e.target.value = "";
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
    alert("그룹 채팅은 아직 백엔드 연동 전입니다.");
  };

  const handleCreateDirectChat = async (employee) => {
    try {
      const existingRoom = normalizedRooms.find(
        (room) => !room.isGroup && room.targetUserId === employee.id
      );

      if (existingRoom) {
        setSelectedRoom(existingRoom.id);
        resetNewChatModal();
        return;
      }

      const response = await createDirectChatRoomApi(employee.id);
      const room = unwrapObject(response);

      await loadRooms(room.roomId);
      setSelectedRoom(room.roomId);
      resetNewChatModal();
    } catch (error) {
      console.error("1:1 채팅방 생성 실패:", error);
      alert("채팅방을 만들지 못했습니다.");
    }
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

  if (!currentUser) return null;

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
                  {isLoadingRooms ? (
                    <div className={cn("p-3 text-sm", textMuted)}>
                      채팅방을 불러오는 중...
                    </div>
                  ) : filteredRooms.length === 0 ? (
                    <div className={cn("p-3 text-sm", textMuted)}>
                      채팅방이 없습니다.
                    </div>
                  ) : (
                    filteredRooms.map((room) => (
                      <div
                        key={room.id}
                        onClick={() => {
                          setSelectedRoom(room.id);
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
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 min-h-0 p-4">
                <div className="space-y-4">
                  {isLoadingMessages ? (
                    <div className={cn("text-sm", textMuted)}>
                      메시지를 불러오는 중...
                    </div>
                  ) : currentMessages.length === 0 ? (
                    <div className={cn("text-sm", textMuted)}>
                      첫 메시지를 보내보세요.
                    </div>
                  ) : (
                    currentMessages.map((msg) => (
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
                    ))
                  )}

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
                    disabled={isSending}
                  />

                  <Button
                    type="submit"
                    size="sm"
                    className={cn("h-9", primaryButtonClass)}
                    disabled={!message.trim() || isSending}
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
                        const existingRoom = normalizedRooms.find(
                          (room) => !room.isGroup && room.targetUserId === emp.id
                        );

                        return (
                          <div
                            key={emp.id}
                            onClick={() => handleCreateDirectChat(emp)}
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
