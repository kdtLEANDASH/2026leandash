package com.onlyman.leandash.dto;

import com.onlyman.leandash.entity.ChatRoom;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ChatRoomResponse {
    private Long roomId;
    private Long userId1;
    private Long userId2;
    private String createdAt;
    private String updatedAt;

    public static ChatRoomResponse from(ChatRoom room) {
        return ChatRoomResponse.builder()
                .roomId(room.getId())
                .userId1(room.getUserId1())
                .userId2(room.getUserId2())
                .createdAt(room.getCreatedAt() == null ? null : room.getCreatedAt().toString())
                .updatedAt(room.getUpdatedAt() == null ? null : room.getUpdatedAt().toString())
                .build();
    }
}
