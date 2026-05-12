package com.onlyman.leandash.controller;

import com.onlyman.leandash.entity.ChatRoom;
import com.onlyman.leandash.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat/rooms")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomRepository chatRoomRepository;

    @PostMapping
    public ChatRoom createRoom(@RequestParam Long userId1, @RequestParam Long userId2) {
        return chatRoomRepository.save(ChatRoom.builder()
//                .roomName("1:1 채팅방")
                .userId1(userId1)
                .userId2(userId2)
                .build());
    }

    @GetMapping
    public List<ChatRoom> getAllRooms() {
        return chatRoomRepository.findAll();
    }
}