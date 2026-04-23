package com.onlyman.leandash.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class NoticeCreateRequest {

    @NotBlank(message = "title is required")
    @Size(max = 100, message = "title must be 100 characters or less")
    private String title;

    @NotBlank(message = "content is required")
    private String content;
}
