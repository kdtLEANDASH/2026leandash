package com.onlyman.leandash.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UserStatusUpdateRequest {

    @NotBlank(message = "user status is required")
    private String userStatus;
}
