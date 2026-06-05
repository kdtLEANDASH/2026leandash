package com.onlyman.leandash.controller;

import com.onlyman.leandash.dto.ChatRequest;
import com.onlyman.leandash.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor // 이거 쓰면 Service 알아서 주입됨 쌉꿀
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping
    public ResponseEntity<String> chat(@RequestBody ChatRequest request) {
        System.out.println("프론트에서 온 질문: " + request.getPrompt());

        // 짭미나이 해고하고 찐미나이한테 질문 넘기기
        String aiResponse = chatbotService.callGemini(request.getPrompt());

        return ResponseEntity.ok(aiResponse);
    }
}