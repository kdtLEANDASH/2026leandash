package com.onlyman.leandash.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ApprovalRejectRequest {

    @NotBlank(message = "reject reason is required")
    private String rejectReason;
}
