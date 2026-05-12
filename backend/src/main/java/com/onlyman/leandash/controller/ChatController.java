package com.onlyman.leandash.controller;

import com.onlyman.leandash.dto.ChatMessageDto;
import com.onlyman.leandash.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    // 1. 프론트에서 /pub/chat/message로 쏜 톡 받기
    @MessageMapping("/chat/message")
    public void sendMessage(@Payload ChatMessageDto dto) {
        // DB 저장하고 시간 받아오기
        ChatMessageDto saved = chatService.saveMessage(dto);
        // /sub/chat/room/{roomId} 톡 보내기
        messagingTemplate.convertAndSend("/sub/chat/room/" + saved.getRoomId(), saved);
    }

    // 2. 과거 내역 조회 API
    @GetMapping("/api/chat/rooms/{roomId}/messages")
    public List<ChatMessageDto> getHistory(@PathVariable Long roomId) {
        return chatService.getHistory(roomId);
    }
}