package com.onlyman.leandash.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ApprovalCreateRequest {

    @NotBlank(message = "title is required")
    @Size(max = 100, message = "title must be 100 characters or less")
    private String title;

    @NotBlank(message = "approval type is required")
    private String approvalType;

    @NotBlank(message = "content is required")
    private String content;

    private Long amount;
}
