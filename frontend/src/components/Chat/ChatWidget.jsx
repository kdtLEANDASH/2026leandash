import { useState, useRef, useEffect } from "react";
import { Send, X, Minus, MessageSquare, Search as SearchIcon, Smile, Paperclip, Plus, User, Users } from "lucide-react";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { ScrollArea } from "@/components/UI/scroll-area";
import { useAppContext } from "@/store/AppProvider";
import { cn } from "@/components/UI/utils";
import { Badge } from "@/components/UI/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/UI/dialog";
export function ChatWidget() {
    const { employees, currentUser, chatRooms, chatMessages, addChatRoom, updateChatRoom, sendMessage: sendChatMessage } = useAppContext();
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
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const totalUnread = chatRooms.reduce((sum, room) => sum + room.unread, 0);
    const filteredRooms = chatRooms.filter((room) => room.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const selectedRoomData = chatRooms.find((room) => room.id === selectedRoom);
    const currentMessages = selectedRoom ? (chatMessages[selectedRoom] || []) : [];
    useEffect(() => {
        if (!isOpen || !selectedRoom)
            return;
        requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        });
    }, [isOpen, selectedRoom, currentMessages.length]);
    useEffect(() => {
        if (!isOpen || !selectedRoom)
            return;
        requestAnimationFrame(() => {
            inputRef.current?.focus();
        });
    }, [isOpen, selectedRoom]);
    const handleSend = () => {
        if (!message.trim() || !selectedRoom || !currentUser)
            return;
        const nextMessage = message.trim();
        const now = new Date();
        const timeString = `${now.getHours() >= 12 ? "오후" : "오전"} ${String(now.getHours() % 12 || 12).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        sendChatMessage(selectedRoom, nextMessage);
        updateChatRoom(selectedRoom, {
            lastMessage: nextMessage,
            timestamp: timeString,
        });
        setMessage("");
        requestAnimationFrame(() => {
            inputRef.current?.focus();
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        });
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        handleSend();
    };
    const handleKeyDown = (e) => {
        if (isComposing)
            return;
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    if (!isOpen) {
        return (<Button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 size-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 z-50">
        <MessageSquare className="size-6"/>
        {totalUnread > 0 && (<Badge className="absolute -top-1 -right-1 size-6 flex items-center justify-center p-0 bg-red-500 text-white border-2 border-white">
            {totalUnread > 9 ? "9+" : totalUnread}
          </Badge>)}
      </Button>);
    }
    return (<div className={cn("fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden transition-all", isMinimized ? "w-80 h-14" : "w-96 h-[640px] max-h-[calc(100vh-48px)]")}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <MessageSquare className="size-5 shrink-0"/>
          <span className="font-semibold truncate">
            {selectedRoom ? selectedRoomData?.name : "채팅"}
          </span>
          {totalUnread > 0 && !selectedRoom && (<Badge className="bg-red-500 text-white">{totalUnread}</Badge>)}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!selectedRoom && (<Button variant="ghost" size="sm" onClick={() => setShowNewChatModal(true)} className="size-8 p-0 hover:bg-blue-600 text-white" title="새 대화">
              <Plus className="size-4"/>
            </Button>)}
          <Button variant="ghost" size="sm" onClick={() => setIsMinimized(!isMinimized)} className="size-8 p-0 hover:bg-blue-600 text-white">
            <Minus className="size-4"/>
          </Button>
          {selectedRoom && (<Button variant="ghost" size="sm" onClick={() => setSelectedRoom(null)} className="size-8 p-0 hover:bg-blue-600 text-white">
              ←
            </Button>)}
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="size-8 p-0 hover:bg-blue-600 text-white">
            <X className="size-4"/>
          </Button>
        </div>
      </div>

      {!isMinimized && (<>
          {!selectedRoom ? (<div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="p-3 border-b border-gray-200 shrink-0">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400"/>
                  <Input placeholder="채팅방 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-9"/>
                </div>
              </div>

              <ScrollArea className="flex-1 min-h-0">
                <div className="p-2 space-y-1">
                  {filteredRooms.map((room) => (<div key={room.id} onClick={() => {
                        setSelectedRoom(room.id);
                        updateChatRoom(room.id, { unread: 0 });
                    }} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="relative">
                        <div className="size-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-2xl">
                          {room.avatar}
                        </div>
                        {room.online && (<div className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-white"></div>)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <span className="font-medium text-gray-900 truncate">{room.name}</span>
                          <span className="text-xs text-gray-500 flex-shrink-0">{room.timestamp}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm text-gray-600 truncate">{room.lastMessage}</p>
                          {room.unread > 0 && (<Badge className="ml-2 bg-red-500 text-white flex-shrink-0">{room.unread}</Badge>)}
                        </div>
                      </div>
                    </div>))}
                </div>
              </ScrollArea>
            </div>) : (<div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 min-h-0 p-4">
                <div className="space-y-4">
                  {currentMessages.map((msg) => (<div key={msg.id} className={cn("flex", msg.isMe ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[80%] rounded-lg px-4 py-2", msg.isMe ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900")}>
                        {!msg.isMe && (<div className="text-xs font-medium mb-1 opacity-70">{msg.sender}</div>)}
                        <div className="text-sm break-words whitespace-pre-wrap">{msg.content}</div>
                        <div className={cn("text-xs mt-1", msg.isMe ? "text-blue-100" : "text-gray-500")}>
                          {msg.timestamp}
                        </div>
                      </div>
                    </div>))}
                  <div ref={messagesEndRef}/>
                </div>
              </ScrollArea>

              <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 bg-gray-50 shrink-0">
                <div className="flex items-center gap-2">
                  <Button type="button" variant="ghost" size="sm" className="size-8 p-0 text-gray-500 hover:text-gray-700">
                    <Paperclip className="size-4"/>
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="size-8 p-0 text-gray-500 hover:text-gray-700">
                    <Smile className="size-4"/>
                  </Button>
                  <Input ref={inputRef} value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyDown} onCompositionStart={() => setIsComposing(true)} onCompositionEnd={() => setIsComposing(false)} placeholder="메시지를 입력하세요..." className="flex-1 h-9"/>
                  <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 h-9" disabled={!message.trim()}>
                    <Send className="size-4"/>
                  </Button>
                </div>
              </form>
            </div>)}
        </>)}

      <Dialog open={showNewChatModal} onOpenChange={setShowNewChatModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>새 대화 시작</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button size="sm" variant={newChatType === "individual" ? "default" : "outline"} onClick={() => {
            setNewChatType("individual");
            setSelectedParticipants([]);
        }} className="flex-1">
                <User className="size-4 mr-2"/>
                개인 대화
              </Button>
              <Button size="sm" variant={newChatType === "group" ? "default" : "outline"} onClick={() => {
            setNewChatType("group");
            setSelectedParticipants([]);
        }} className="flex-1">
                <Users className="size-4 mr-2"/>
                그룹 대화
              </Button>
            </div>

            {newChatType === "individual" && (<div>
                <div className="relative mb-3">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400"/>
                  <Input placeholder="대화 상대 검색..." value={participantSearch} onChange={(e) => setParticipantSearch(e.target.value)} className="pl-9"/>
                </div>
                <ScrollArea className="h-60">
                  <div className="space-y-2">
                    {employees
                .filter((emp) => emp.id !== currentUser.id && emp.name.toLowerCase().includes(participantSearch.toLowerCase()))
                .map((emp) => {
                const existingRoom = chatRooms.find((room) => !room.isGroup && room.name === emp.name);
                return (<div key={emp.id} onClick={() => {
                        if (existingRoom) {
                            setSelectedRoom(existingRoom.id);
                        }
                        else {
                            const newRoomId = addChatRoom({
                                name: emp.name,
                                lastMessage: "대화를 시작해보세요",
                                timestamp: "방금",
                                unread: 0,
                                avatar: emp.name[0],
                                online: emp.status === "업무 중",
                                isGroup: false,
                            });
                            setSelectedRoom(newRoomId);
                        }
                        setShowNewChatModal(false);
                        setNewChatType(null);
                        setParticipantSearch("");
                    }} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                            <div className="size-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                              {emp.name[0]}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{emp.name}</p>
                              <p className="text-xs text-gray-500">{emp.position}</p>
                            </div>
                            {existingRoom && <span className="text-xs text-blue-600">기존 대화</span>}
                          </div>);
            })}
                  </div>
                </ScrollArea>
              </div>)}

            {newChatType === "group" && (<div>
                <Input placeholder="그룹 이름 입력..." value={groupName} onChange={(e) => setGroupName(e.target.value)} className="mb-3"/>
                <div className="relative mb-3">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400"/>
                  <Input placeholder="참가자 검색..." value={participantSearch} onChange={(e) => setParticipantSearch(e.target.value)} className="pl-9"/>
                </div>
                {selectedParticipants.length > 0 && (<div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-2">선택됨 ({selectedParticipants.length}명)</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedParticipants.map((id) => {
                    const emp = employees.find((e) => e.id === id);
                    return emp ? (<Badge key={id} variant="secondary" className="flex items-center gap-1">
                            {emp.name}
                            <X className="size-3 cursor-pointer hover:text-red-600" onClick={() => setSelectedParticipants(selectedParticipants.filter((p) => p !== id))}/>
                          </Badge>) : null;
                })}
                    </div>
                  </div>)}
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {employees
                .filter((emp) => emp.id !== currentUser.id && !selectedParticipants.includes(emp.id) && emp.name.toLowerCase().includes(participantSearch.toLowerCase()))
                .map((emp) => (<div key={emp.id} onClick={() => setSelectedParticipants([...selectedParticipants, emp.id])} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                          <div className="size-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                            {emp.name[0]}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{emp.name}</p>
                            <p className="text-xs text-gray-500">{emp.position}</p>
                          </div>
                        </div>))}
                  </div>
                </ScrollArea>
                {selectedParticipants.length > 0 && (<div className="flex gap-2 mt-4">
                    <Button variant="outline" className="flex-1" onClick={() => {
                    setShowNewChatModal(false);
                    setNewChatType(null);
                    setSelectedParticipants([]);
                    setParticipantSearch("");
                    setGroupName("");
                }}>
                      취소
                    </Button>
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => {
                    const newRoomId = addChatRoom({
                        name: groupName || `그룹 채팅`,
                        lastMessage: "대화를 시작해보세요",
                        timestamp: "방금",
                        unread: 0,
                        avatar: (groupName || "그룹")[0],
                        online: false,
                        isGroup: true,
                        participants: [currentUser.id, ...selectedParticipants],
                    });
                    setSelectedRoom(newRoomId);
                    setShowNewChatModal(false);
                    setNewChatType(null);
                    setSelectedParticipants([]);
                    setParticipantSearch("");
                    setGroupName("");
                }}>
                      생성
                    </Button>
                  </div>)}
              </div>)}
          </div>
        </DialogContent>
      </Dialog>
    </div>);
}
