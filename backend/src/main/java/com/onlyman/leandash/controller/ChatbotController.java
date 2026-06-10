package com.onlyman.leandash.controller;

import com.onlyman.leandash.service.ChatbotService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @PostMapping
    public String chat(@RequestBody Map<String, String> request) {
        String prompt = request.get("prompt");
        return chatbotService.getGeminiResponse(prompt);
    }
}