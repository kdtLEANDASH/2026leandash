package com.onlyman.leandash.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatRequest {
    private String prompt; // "휴가 규정 알려줘" 같은 질문 내용
}