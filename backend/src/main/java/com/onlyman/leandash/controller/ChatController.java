package com.onlyman.leandash.controller;

import com.onlyman.leandash.dto.ChatMessageDto;
import com.onlyman.leandash.entity.ChatMessage;
import com.onlyman.leandash.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatController {

    // 특정 구독자(채팅방)들에게 메시지를 쏴주는 스프링의 우체부 아저씨
    private final SimpMessagingTemplate messagingTemplate;
    // DB에 메시지 저장할 바가지
    private final ChatMessageRepository chatMessageRepository;

    /**
     * 프론트에서 /pub/chat/message 로 메시지를 발행(보내기)하면 이 메서드가 낚아챔!
     * (WebSocketConfig에서 /pub을 prefix로 맞춰놨기 때문에 여기선 /chat/message만 적음)
     */
    @MessageMapping("/chat/message")
    public void sendMessage(ChatMessageDto messageDto) {

        // 1. 프론트에서 온 택배(DTO) 내용물 꺼내서 DB에 저장할 엔티티로 변환
        ChatMessage chatMessage = ChatMessage.builder()
                .roomId(messageDto.getRoomId())
                .senderId(messageDto.getSenderId())
                .message(messageDto.getMessage())
                .isRead(false) // 처음 보냈으니 당연히 안 읽음 상태
                .build();

        // 2. DB에 채팅 기록 쾅! 저장
        chatMessageRepository.save(chatMessage);

        // 3. 해당 채팅방(roomId)을 구독(/sub)하고 있는 모든 프론트엔드 화면에 메시지 쫙 뿌려줌!!
        // 구독 주소 예시: /sub/chat/room/1
        messagingTemplate.convertAndSend("/sub/chat/room/" + messageDto.getRoomId(), messageDto);
    }
}