package com.onlyman.leandash.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class InquiryAnswerRequest {

    @NotBlank(message = "answer content is required")
    private String answerContent;
}
