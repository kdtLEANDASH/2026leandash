package com.onlyman.leandash.controller;

import com.onlyman.leandash.config.UserPrincipal;
import com.onlyman.leandash.dto.ChatMessageCreateRequest;
import com.onlyman.leandash.dto.ChatMessageDto;
import com.onlyman.leandash.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/message")
    public void sendMessageBySocket(@Payload ChatMessageDto dto) {
        ChatMessageDto saved = chatService.saveMessage(dto);
        messagingTemplate.convertAndSend("/sub/chat/room/" + saved.getRoomId(), saved);
    }

    @GetMapping("/api/chat/rooms/{roomId}/messages")
    public List<ChatMessageDto> getHistory(@PathVariable Long roomId) {
        return chatService.getHistory(roomId);
    }

    @PostMapping("/api/chat/rooms/{roomId}/messages")
    public ChatMessageDto sendMessage(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long roomId,
            @Valid @RequestBody ChatMessageCreateRequest request
    ) {
        return chatService.sendRestMessage(roomId, principal.getUserId(), request.getMessage());
    }
}
