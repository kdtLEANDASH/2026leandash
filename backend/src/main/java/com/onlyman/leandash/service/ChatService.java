package com.onlyman.leandash.service;

import com.onlyman.leandash.dto.ChatMessageDto;
import com.onlyman.leandash.dto.ChatRoomResponse;
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

@Service
@RequiredArgsConstructor
@Transactional
public class ChatService {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    private final ChatMessageRepository messageRepository;
    private final ChatRoomRepository roomRepository;
    private final UserRepository userRepository;

    public ChatMessageDto saveMessage(ChatMessageDto dto) {
        ChatRoom room = roomRepository.findById(dto.getRoomId())
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다. ID: " + dto.getRoomId()));

        User sender = userRepository.findById(dto.getSenderId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다. ID: " + dto.getSenderId()));

        ChatMessage savedMessage = messageRepository.save(ChatMessage.builder()
                .chatRoom(room)
                .senderId(sender.getUserId())
                .message(dto.getMessage())
                .build());

        dto.setSenderName(sender.getUserName());
        dto.setSentAt(savedMessage.getCreatedAt().format(TIME_FORMATTER));

        return dto;
    }

    @Transactional(readOnly = true)
    public List<ChatRoomResponse> getRooms(Long currentUserId) {
        return roomRepository.findByUserId1OrUserId2OrderByUpdatedAtDesc(currentUserId, currentUserId)
                .stream()
                .map(ChatRoomResponse::from)
                .toList();
    }

    public ChatRoomResponse createOrGetDirectRoom(Long currentUserId, Long targetUserId) {
        if (currentUserId.equals(targetUserId)) {
            throw new IllegalArgumentException("자기 자신과의 채팅방은 만들 수 없습니다.");
        }

        userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("현재 사용자를 찾을 수 없습니다."));
        userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("대상 사용자를 찾을 수 없습니다."));

        ChatRoom existingRoom = roomRepository.findByUserId1AndUserId2(currentUserId, targetUserId)
                .or(() -> roomRepository.findByUserId1AndUserId2(targetUserId, currentUserId))
                .orElse(null);

        if (existingRoom != null) {
            return ChatRoomResponse.from(existingRoom);
        }

        ChatRoom createdRoom = roomRepository.save(ChatRoom.builder()
                .userId1(currentUserId)
                .userId2(targetUserId)
                .build());

        return ChatRoomResponse.from(createdRoom);
    }

    @Transactional(readOnly = true)
    public List<ChatMessageDto> getHistory(Long roomId) {
        return messageRepository.findByChatRoomIdOrderByCreatedAtAsc(roomId).stream()
                .map(message -> {
                    String senderName = userRepository.findById(message.getSenderId())
                            .map(User::getUserName)
                            .orElse("알 수 없는 사용자");

                    return ChatMessageDto.builder()
                            .roomId(roomId)
                            .senderId(message.getSenderId())
                            .senderName(senderName)
                            .message(message.getMessage())
                            .sentAt(message.getCreatedAt().format(TIME_FORMATTER))
                            .build();
                })
                .toList();
    }

    public ChatMessageDto sendRestMessage(Long roomId, Long currentUserId, String message) {
        ChatRoom room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다."));

        if (!room.getUserId1().equals(currentUserId) && !room.getUserId2().equals(currentUserId)) {
            throw new IllegalArgumentException("해당 채팅방에 접근할 수 없습니다.");
        }

        return saveMessage(ChatMessageDto.builder()
                .roomId(roomId)
                .senderId(currentUserId)
                .message(message)
                .build());
    }
}
