package com.onlyman.leandash.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatRoomCreateRequest {
    @NotNull
    private Long targetUserId;
}
