import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Send,
  Plus,
  Search as SearchIcon,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/UI/card";
import { Input } from "@/components/UI/input";
import { Button } from "@/components/UI/button";
import { ScrollArea } from "@/components/UI/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";
import { useAppContext } from "@/store/AppProvider";
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

export function ChatPage() {
  const location = useLocation();
  const { currentUser } = useAppContext();

  const [employees, setEmployees] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [participantSearch, setParticipantSearch] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

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
        targetUserId: otherUserId,
        name: otherUser?.name || `사용자 ${otherUserId}`,
        avatar: (otherUser?.name || "?").charAt(0),
        position: otherUser?.position || "",
        online: otherUser?.status === "ONLINE" || otherUser?.status === "업무 중",
        timestamp: formatTime(room.updatedAt || room.createdAt),
      };
    });
  }, [rooms, employeeMap, currentUser]);

  const filteredRooms = useMemo(() => {
    return normalizedRooms.filter((room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [normalizedRooms, searchTerm]);

  const selectedRoom = normalizedRooms.find((room) => room.id === selectedRoomId);

  const availableEmployees = useMemo(() => {
    return employees.filter((employee) => employee.id !== currentUser?.id);
  }, [employees, currentUser]);

  const filteredEmployees = useMemo(() => {
    return availableEmployees.filter((employee) =>
      employee.name.toLowerCase().includes(participantSearch.toLowerCase())
    );
  }, [availableEmployees, participantSearch]);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        setIsLoadingRooms(true);
        const [usersResponse, roomsResponse] = await Promise.all([
          getUsersApi(),
          getMyChatRoomsApi(),
        ]);

        if (cancelled) return;

        const loadedEmployees = unwrapResponse(usersResponse).map(mapUser);
        const loadedRooms = unwrapResponse(roomsResponse);

        setEmployees(loadedEmployees);
        setRooms(loadedRooms);

        const locationRoomId = location.state?.roomId;

        if (locationRoomId) {
          setSelectedRoomId(locationRoomId);
        } else if (loadedRooms.length > 0) {
          setSelectedRoomId(loadedRooms[0].roomId);
        }
      } catch (error) {
        console.error("채팅 초기 데이터 조회 실패:", error);
        alert("채팅 목록을 불러오지 못했습니다.");
      } finally {
        if (!cancelled) {
          setIsLoadingRooms(false);
        }
      }
    }

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedRoomId) {
      setMessages([]);
      return;
    }

    let cancelled = false;

    async function loadMessages(showLoading = false) {
      try {
        if (showLoading) {
          setIsLoadingMessages(true);
        }

        const response = await getChatMessagesApi(selectedRoomId);
        if (cancelled) return;

        const loadedMessages = unwrapResponse(response).map((chatMessage, index) => ({
          id: `${selectedRoomId}-${index}-${chatMessage.sentAt}`,
          senderId: chatMessage.senderId,
          senderName: chatMessage.senderName,
          content: chatMessage.message,
          timestamp: chatMessage.sentAt,
          isMe: chatMessage.senderId === currentUser?.id,
        }));

        setMessages(loadedMessages);
      } catch (error) {
        console.error("채팅 메시지 조회 실패:", error);
      } finally {
        if (!cancelled && showLoading) {
          setIsLoadingMessages(false);
        }
      }
    }

    loadMessages(true);

    const intervalId = setInterval(() => {
      loadMessages(false);
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [selectedRoomId, currentUser?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    if (selectedRoomId) {
      inputRef.current?.focus();
    }
  }, [selectedRoomId]);

  useEffect(() => {
    const targetUserId = location.state?.targetUserId;
    const roomId = location.state?.roomId;

    if (!targetUserId || roomId || !currentUser?.id) return;

    async function openDirectRoom() {
      try {
        const response = await createDirectChatRoomApi(targetUserId);
        const room = unwrapObject(response);
        setSelectedRoomId(room.roomId);

        setRooms((prev) => {
          const exists = prev.some((item) => item.roomId === room.roomId);
          return exists ? prev : [room, ...prev];
        });
      } catch (error) {
        console.error("직원 상세에서 채팅방 생성 실패:", error);
      }
    }

    openDirectRoom();
  }, [location.state, currentUser]);

  const refreshRooms = async (preferredRoomId = selectedRoomId) => {
    const response = await getMyChatRoomsApi();
    const loadedRooms = unwrapResponse(response);
    setRooms(loadedRooms);
    if (preferredRoomId) {
      setSelectedRoomId(preferredRoomId);
    }
  };

  const handleCreateDirectChat = async (employee) => {
    try {
      const response = await createDirectChatRoomApi(employee.id);
      const room = unwrapObject(response);
      setShowNewChatModal(false);
      setParticipantSearch("");
      await refreshRooms(room.roomId);
    } catch (error) {
      console.error("1:1 채팅방 생성 실패:", error);
      alert("채팅방을 만들지 못했습니다.");
    }
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (!selectedRoomId || !message.trim() || isSending) return;

    try {
      setIsSending(true);
      const nextMessage = message.trim();
      const response = await sendChatMessageApi(selectedRoomId, nextMessage);
      const sentMessage = unwrapObject(response);

      setMessages((prev) => [
        ...prev,
        {
          id: `${selectedRoomId}-${Date.now()}`,
          senderId: sentMessage.senderId,
          senderName: sentMessage.senderName,
          content: sentMessage.message,
          timestamp: sentMessage.sentAt,
          isMe: true,
        },
      ]);
      setMessage("");
      await refreshRooms(selectedRoomId);
    } catch (error) {
      console.error("채팅 메시지 전송 실패:", error);
      alert("메시지를 전송하지 못했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-120px)]">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">채팅</h2>
        <p className="text-gray-600">직원과 1:1 채팅을 진행할 수 있습니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-80px)]">
        <Card className="lg:col-span-1 h-full">
          <CardContent className="p-4 h-full flex flex-col">
            <div className="mb-4 flex-shrink-0">
              <div className="relative mb-3">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="채팅방 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowNewChatModal(true)}
              >
                <Plus className="size-4 mr-2" />
                새 채팅
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {isLoadingRooms ? (
                  <div className="text-sm text-gray-500 p-3">채팅방을 불러오는 중...</div>
                ) : filteredRooms.length === 0 ? (
                  <div className="text-sm text-gray-500 p-3">채팅방이 없습니다.</div>
                ) : (
                  filteredRooms.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedRoomId === room.id
                          ? "bg-blue-50 border-2 border-blue-500"
                          : "hover:bg-gray-100 border-2 border-transparent"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <div className="size-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {room.avatar}
                          </div>
                          {room.online && (
                            <div className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-white rounded-full" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {room.name}
                            </h4>
                            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                              {room.timestamp}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 truncate">
                            {room.position || "직원"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 flex flex-col h-full relative">
          <Card className="absolute inset-0 flex flex-col">
            <CardContent className="p-0 flex flex-col h-full">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="size-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                      {selectedRoom?.avatar ?? "?"}
                    </div>
                    {selectedRoom?.online && (
                      <div className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedRoom?.name ?? "채팅방"}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {selectedRoom?.position || "직원"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-hidden">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    {!selectedRoomId ? (
                      <div className="text-sm text-gray-500">채팅방을 선택해주세요.</div>
                    ) : isLoadingMessages ? (
                      <div className="text-sm text-gray-500">메시지를 불러오는 중...</div>
                    ) : messages.length === 0 ? (
                      <div className="text-sm text-gray-500">첫 메시지를 보내보세요.</div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] ${msg.isMe ? "items-end" : "items-start"} flex flex-col`}
                          >
                            {!msg.isMe && (
                              <span className="text-xs text-gray-600 mb-1 px-2">
                                {msg.senderName}
                              </span>
                            )}

                            <div
                              className={`px-4 py-2 rounded-2xl ${
                                msg.isMe
                                  ? "bg-blue-600 text-white rounded-br-sm"
                                  : "bg-gray-200 text-gray-900 rounded-bl-sm"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {msg.content}
                              </p>
                            </div>

                            <span className="text-xs text-gray-500 mt-1 px-2">
                              {msg.timestamp}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </div>

              <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="메시지를 입력하세요..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1"
                    disabled={!selectedRoomId || isSending}
                  />

                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={!selectedRoomId || !message.trim() || isSending}
                  >
                    <Send className="size-5" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showNewChatModal} onOpenChange={setShowNewChatModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>1:1 채팅 시작하기</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                type="text"
                placeholder="직원 검색..."
                value={participantSearch}
                onChange={(e) => setParticipantSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-100"
                  onClick={() => handleCreateDirectChat(employee)}
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                      {employee.name.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {employee.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {employee.department} · {employee.position || "직원"}
                      </p>
                    </div>

                    <User className="size-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
