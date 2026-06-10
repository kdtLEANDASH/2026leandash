package com.onlyman.leandash.controller;

import com.onlyman.leandash.config.UserPrincipal;
import com.onlyman.leandash.dto.ChatRoomCreateRequest;
import com.onlyman.leandash.dto.ChatRoomResponse;
import com.onlyman.leandash.entity.ChatRoom;
import com.onlyman.leandash.repository.ChatRoomRepository;
import com.onlyman.leandash.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat/rooms")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatService chatService;

    @PostMapping
    public ChatRoom createRoom(@RequestParam Long userId1, @RequestParam Long userId2) {
        return chatRoomRepository.save(ChatRoom.builder()
                .userId1(userId1)
                .userId2(userId2)
                .build());
    }

    @GetMapping
    public List<ChatRoom> getAllRooms() {
        return chatRoomRepository.findAll();
    }

    @GetMapping("/me")
    public List<ChatRoomResponse> getMyRooms(@AuthenticationPrincipal UserPrincipal principal) {
        return chatService.getRooms(principal.getUserId());
    }

    @PostMapping("/direct")
    public ChatRoomResponse createDirectRoom(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChatRoomCreateRequest request
    ) {
        return chatService.createOrGetDirectRoom(principal.getUserId(), request.getTargetUserId());
    }
}
