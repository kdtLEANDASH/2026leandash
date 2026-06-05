package com.onlyman.leandash.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ChatbotService {

    private final RestTemplate restTemplate;

    @Value("${gemini.api.url}")
    private String apiUrl;

    @Value("${gemini.api.key}")
    private String apiKey;

    public ChatbotService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String callGemini(String prompt) {
        // 제미나이가 밥 달라고 징징대는 JSON 규격 맞추기
        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(content));

        // API 쏠 때 헤더에 JSON이라고 딱 박아주기
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        // 구글아 나 API 키 있다, 문 열어라! (URL 뒤에 키 붙이기)
        String urlWithKey = apiUrl + "?key=" + apiKey;

        try {
            // 제미나이한테 질문 투척하고 답변 기다리기
            String response = restTemplate.postForObject(urlWithKey, requestEntity, String.class);
            return response;
        } catch (Exception e) {
            System.out.println("제미나이 뻗음: " + e.getMessage());
            return "챗봇 파업 중... 관리자(형)를 호출하세요.";
        }
    }
}