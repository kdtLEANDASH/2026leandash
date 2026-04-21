package com.onlyman.leandash.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UserRoleUpdateRequest {

    @NotBlank(message = "권한은 필수입니다.")
    private String role;
}
