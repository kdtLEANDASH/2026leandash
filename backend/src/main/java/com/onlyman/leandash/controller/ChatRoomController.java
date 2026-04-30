package com.onlyman.leandash.controller;

import com.onlyman.leandash.entity.ChatMessage;
import com.onlyman.leandash.entity.ChatRoom;
import com.onlyman.leandash.repository.ChatMessageRepository;
import com.onlyman.leandash.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // 프론트한테 데이터(JSON)만 던져줄 거니까 @RestController!
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;

    /**
     * 1. 새로운 1:1 채팅방 만들기
     * 프론트에서 userId1, userId2 던져주면 DB에 방 파고 결과 돌려줌.
     */
    @PostMapping("/rooms")
    public ResponseEntity<ChatRoom> createRoom(@RequestParam Long userId1, @RequestParam Long userId2) {
        ChatRoom newRoom = ChatRoom.builder()
                .userId1(userId1)
                .userId2(userId2)
                .build();

        ChatRoom savedRoom = chatRoomRepository.save(newRoom);
        return ResponseEntity.ok(savedRoom);
    }

    /**
     * 2. 특정 채팅방의 과거 대화 기록(History) 쫙 불러오기
     * 채팅방 입장할 때 프론트가 이거 호출해서 화면에 예전 톡들 뿌려줌.
     */
    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<List<ChatMessage>> getChatHistory(@PathVariable Long roomId) {
        // (오름차순 정렬)
        List<ChatMessage> history = chatMessageRepository.findByRoomIdOrderByCreatedAtAsc(roomId);
        return ResponseEntity.ok(history);
    }
}