package com.onlyman.leandash.service;

import com.onlyman.leandash.dto.ChatMessageDto;
import com.onlyman.leandash.entity.ChatMessage;
import com.onlyman.leandash.entity.ChatRoom;
import com.onlyman.leandash.entity.User;
import com.onlyman.leandash.repository.ChatMessageRepository;
import com.onlyman.leandash.repository.ChatRoomRepository;
import com.onlyman.leandash.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatService {

    private final ChatMessageRepository messageRepository;
    private final ChatRoomRepository roomRepository;
    private final UserRepository userRepository;

    /**
     * [저장] 프론트에서 온 톡을 DB에 저장 시간 찍어서 돌려줌
     */
    public ChatMessageDto saveMessage(ChatMessageDto dto) {
        // 1. 방 찾기
        ChatRoom room = roomRepository.findById(dto.getRoomId())
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을수 없습니다 ID: " + dto.getRoomId()));

        // 2. 유저 찾기
        User sender = userRepository.findById(dto.getSenderId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다 ID: " + dto.getSenderId()));

        // 3. 엔티티 변환 (이름 빼고 순수하게 ID랑 방 정보만 저장)
        ChatMessage msg = messageRepository.save(ChatMessage.builder()
                .chatRoom(room)
                .senderId(sender.getUserId()) // User 엔티티 PK 이름에 맞게 교체해야함 (getId() 일수도 있음)
                .message(dto.getMessage())
                .build());

        // 4. 저장 후 프론트로 보낼 dto에 맞게 세팅
        dto.setSenderName(sender.getUserName()); //user 엔티티에 맞게 죠체 필요
        dto.setSentAt(msg.getCreatedAt().format(DateTimeFormatter.ofPattern("HH:mm")));

        return dto;
    }

    /**
     * [조회] 과거 대화 내역 가져오기
     */
    @Transactional(readOnly = true)
    public List<ChatMessageDto> getHistory(Long roomId) {
        return messageRepository.findByChatRoomIdOrderByCreatedAtAsc(roomId).stream()
                .map(m -> {
                    // 메시지 보낸 사람 ID로 DB 뒤져서 이름 가져오기
                    String realName = userRepository.findById(m.getSenderId())
                            .map(User::getUserName) // getUserName() 확인
                            .orElse("알 수 없는 유조"); // 탈퇴 유저

                    return ChatMessageDto.builder()
                            .roomId(roomId)
                            .senderId(m.getSenderId())
                            .senderName(realName)
                            .message(m.getMessage())
                            .sentAt(m.getCreatedAt().format(DateTimeFormatter.ofPattern("HH:mm")))
                            .build();
                })
                .collect(Collectors.toList());
    }
}