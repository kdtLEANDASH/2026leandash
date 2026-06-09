import apiRequest from "./client";

export function getMyChatRoomsApi() {
  return apiRequest("/api/chat/rooms/me", {
    method: "GET",
  });
}

export function createDirectChatRoomApi(targetUserId) {
  return apiRequest("/api/chat/rooms/direct", {
    method: "POST",
    body: JSON.stringify({ targetUserId }),
  });
}

export function getChatMessagesApi(roomId) {
  return apiRequest(`/api/chat/rooms/${roomId}/messages`, {
    method: "GET",
  });
}

export function sendChatMessageApi(roomId, message) {
  return apiRequest(`/api/chat/rooms/${roomId}/messages`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}
