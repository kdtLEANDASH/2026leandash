import { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip, Phone, Video, MoreVertical, Plus, Search as SearchIcon, Users, User, X, } from "lucide-react";
import { Card, CardContent } from "@/components/UI/card";
import { Input } from "@/components/UI/input";
import { Button } from "@/components/UI/button";
import { ScrollArea } from "@/components/UI/scroll-area";
import { useAppContext } from "@/store/AppProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "@/components/UI/dialog";
import { Badge } from "@/components/UI/badge";
export function ChatPage() {
    const { employees, currentUser, chatRooms, chatMessages, addChatRoom, updateChatRoom, sendMessage, } = useAppContext();
    const [selectedRoom, setSelectedRoom] = useState(chatRooms[0]?.id ?? 1);
    const [message, setMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [newChatType, setNewChatType] = useState(null);
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [participantSearch, setParticipantSearch] = useState("");
    const [groupName, setGroupName] = useState("");
    const [isComposing, setIsComposing] = useState(false);
    const inputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const currentRoom = chatRooms.find((room) => room.id === selectedRoom);
    const currentMessages = chatMessages[selectedRoom] || [];
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    }, [selectedRoom, currentMessages.length]);
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!message.trim())
            return;
        const nextMessage = message.trim();
        sendMessage(selectedRoom, nextMessage);
        const now = new Date();
        const timeString = `${now.getHours() >= 12 ? "오후" : "오전"} ${String(now.getHours() % 12 || 12).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
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
    const handleCreateChat = () => {
        if (selectedParticipants.length === 0)
            return;
        const newRoomId = chatRooms.length > 0 ? Math.max(...chatRooms.map((r) => r.id)) + 1 : 1;
        if (newChatType === "individual") {
            const participant = employees.find((emp) => emp.id === selectedParticipants[0]);
            if (!participant)
                return;
            const newRoom = {
                id: newRoomId,
                name: participant.name,
                lastMessage: "대화를 시작해보세요",
                timestamp: "방금",
                unread: 0,
                avatar: participant.name[0],
                online: participant.status === "업무 중",
                isGroup: false,
            };
            addChatRoom(newRoom);
            setSelectedRoom(newRoomId);
        }
        else if (newChatType === "group") {
            const newRoom = {
                id: newRoomId,
                name: groupName || `그룹 채팅 ${newRoomId}`,
                lastMessage: "대화를 시작해보세요",
                timestamp: "방금",
                unread: 0,
                avatar: (groupName || "그룹")[0],
                online: false,
                isGroup: true,
                participants: [currentUser.id, ...selectedParticipants],
            };
            addChatRoom(newRoom);
            setSelectedRoom(newRoomId);
        }
        setShowNewChatModal(false);
        setNewChatType(null);
        setSelectedParticipants([]);
        setParticipantSearch("");
        setGroupName("");
    };
    const handleRemoveParticipant = (participantId) => {
        setSelectedParticipants((prev) => prev.filter((id) => id !== participantId));
    };
    const filteredRooms = chatRooms.filter((room) => room.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return (<div className="p-6 h-[calc(100vh-120px)]">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">채팅</h2>
        <p className="text-gray-600">실시간으로 동료들과 소통하세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-80px)]">
        <Card className="lg:col-span-1 h-full">
          <CardContent className="p-4 h-full flex flex-col">
            <div className="mb-4 flex-shrink-0">
              <div className="relative mb-3">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400"/>
                <Input type="text" placeholder="대화 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9"/>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setShowNewChatModal(true)}>
                <Plus className="size-4 mr-2"/>
                새 대화
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {filteredRooms.map((room) => (<div key={room.id} onClick={() => setSelectedRoom(room.id)} className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedRoom === room.id
                ? "bg-blue-50 border-2 border-blue-500"
                : "hover:bg-gray-100 border-2 border-transparent"}`}>
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="size-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {room.avatar}
                        </div>
                        {room.online && !room.isGroup && (<div className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-white rounded-full"/>)}
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
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate">
                            {room.lastMessage}
                          </p>
                          {room.unread > 0 && (<span className="ml-2 flex-shrink-0 size-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                              {room.unread}
                            </span>)}
                        </div>
                      </div>
                    </div>
                  </div>))}
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
                      {currentRoom?.avatar ?? "?"}
                    </div>
                    {currentRoom?.online && !currentRoom?.isGroup && (<div className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-white rounded-full"/>)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {currentRoom?.name ?? "채팅방"}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {currentRoom?.isGroup
            ? `${currentRoom.participants?.length || 0}명`
            : currentRoom?.online
                ? "온라인"
                : "오프라인"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="ghost">
                    <Phone className="size-5"/>
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Video className="size-5"/>
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MoreVertical className="size-5"/>
                  </Button>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-hidden">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    {currentMessages.map((msg) => (<div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] ${msg.isMe ? "items-end" : "items-start"} flex flex-col`}>
                          {!msg.isMe && (<span className="text-xs text-gray-600 mb-1 px-2">
                              {msg.sender}
                            </span>)}

                          <div className={`px-4 py-2 rounded-2xl ${msg.isMe
                ? "bg-blue-600 text-white rounded-br-sm"
                : "bg-gray-200 text-gray-900 rounded-bl-sm"}`}>
                            <p className="text-sm">{msg.content}</p>
                          </div>

                          <span className="text-xs text-gray-500 mt-1 px-2">
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>))}
                    <div ref={messagesEndRef}/>
                  </div>
                </ScrollArea>
              </div>

              <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="ghost">
                      <Paperclip className="size-5 text-gray-600"/>
                    </Button>
                    <Button type="button" size="sm" variant="ghost">
                      <Smile className="size-5 text-gray-600"/>
                    </Button>
                  </div>

                  <Input ref={inputRef} type="text" placeholder="메시지를 입력하세요..." value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => {
            if (isComposing)
                return;
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
            }
        }} onCompositionStart={() => setIsComposing(true)} onCompositionEnd={() => setIsComposing(false)} className="flex-1"/>

                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={!message.trim()}>
                    <Send className="size-5"/>
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
            <DialogTitle>새 대화 시작하기</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => setNewChatType("individual")} className={`${newChatType === "individual"
            ? "bg-blue-50 border-2 border-blue-500"
            : "hover:bg-gray-100 border-2 border-transparent"}`}>
                <User className="size-5"/>
                개인 대화
              </Button>

              <Button size="sm" variant="ghost" onClick={() => setNewChatType("group")} className={`${newChatType === "group"
            ? "bg-blue-50 border-2 border-blue-500"
            : "hover:bg-gray-100 border-2 border-transparent"}`}>
                <Users className="size-5"/>
                그룹 대화
              </Button>
            </div>

            {newChatType === "individual" && (<div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400"/>
                <Input type="text" placeholder="대화 상대 검색..." value={participantSearch} onChange={(e) => setParticipantSearch(e.target.value)} className="pl-9"/>

                <div className="space-y-2 mt-2 max-h-64 overflow-y-auto">
                  {employees
                .filter((employee) => employee.id !== currentUser.id &&
                employee.name
                    .toLowerCase()
                    .includes(participantSearch.toLowerCase()))
                .map((employee) => {
                const existingRoom = chatRooms.find((room) => !room.isGroup && room.name === employee.name);
                return (<div key={employee.id} className="p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-100" onClick={() => {
                        if (existingRoom) {
                            setSelectedRoom(existingRoom.id);
                            setShowNewChatModal(false);
                            setNewChatType(null);
                            setParticipantSearch("");
                            return;
                        }
                        const newRoomId = chatRooms.length > 0
                            ? Math.max(...chatRooms.map((r) => r.id)) + 1
                            : 1;
                        const newRoom = {
                            id: newRoomId,
                            name: employee.name,
                            lastMessage: "대화를 시작해보세요",
                            timestamp: "방금",
                            unread: 0,
                            avatar: employee.name[0],
                            online: employee.status === "업무 중",
                            isGroup: false,
                        };
                        addChatRoom(newRoom);
                        setSelectedRoom(newRoomId);
                        setShowNewChatModal(false);
                        setNewChatType(null);
                        setParticipantSearch("");
                    }}>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="size-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                                {employee.name[0]}
                              </div>
                              {employee.status === "업무 중" && (<div className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-white rounded-full"/>)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {employee.name}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {employee.position}
                              </p>
                            </div>

                            {existingRoom && (<span className="text-xs text-blue-600">기존 대화</span>)}
                          </div>
                        </div>);
            })}
                </div>
              </div>)}

            {newChatType === "group" && (<div className="relative">
                <Input type="text" placeholder="그룹 이름 입력..." value={groupName} onChange={(e) => setGroupName(e.target.value)} className="mb-3"/>

                <SearchIcon className="absolute left-3 top-14 -translate-y-1/2 size-4 text-gray-400"/>
                <Input type="text" placeholder="대화 상대 검색..." value={participantSearch} onChange={(e) => setParticipantSearch(e.target.value)} className="pl-9"/>

                {selectedParticipants.length > 0 && (<div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-2">
                      선택된 참가자 ({selectedParticipants.length}명)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedParticipants.map((id) => {
                    const emp = employees.find((e) => e.id === id);
                    return emp ? (<Badge key={id} variant="secondary" className="flex items-center gap-1">
                            {emp.name}
                            <X className="size-3 cursor-pointer hover:text-red-600" onClick={() => handleRemoveParticipant(id)}/>
                          </Badge>) : null;
                })}
                    </div>
                  </div>)}

                <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                  {employees
                .filter((employee) => employee.id !== currentUser.id &&
                employee.name
                    .toLowerCase()
                    .includes(participantSearch.toLowerCase()) &&
                !selectedParticipants.includes(employee.id))
                .map((employee) => (<div key={employee.id} className="p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-100" onClick={() => setSelectedParticipants((prev) => [...prev, employee.id])}>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="size-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                              {employee.name[0]}
                            </div>
                            {employee.status === "업무 중" && (<div className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-white rounded-full"/>)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {employee.name}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {employee.position}
                            </p>
                          </div>
                        </div>
                      </div>))}
                </div>
              </div>)}

            {selectedParticipants.length > 0 && (<div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" className="flex-1" onClick={() => {
                setShowNewChatModal(false);
                setNewChatType(null);
                setSelectedParticipants([]);
                setParticipantSearch("");
                setGroupName("");
            }}>
                  취소
                </Button>

                <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleCreateChat}>
                  대화 시작
                </Button>
              </div>)}
          </div>
        </DialogContent>
      </Dialog>
    </div>);
}
