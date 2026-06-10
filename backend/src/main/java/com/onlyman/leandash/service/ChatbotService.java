package com.onlyman.leandash.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.onlyman.leandash.entity.CompanyPolicy;
import com.onlyman.leandash.repository.CompanyPolicyRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class ChatbotService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final CompanyPolicyRepository policyRepository; // 사냥개 투입!

    // 비밀 문서(application-secret.yml)에서 알아서 가져옴
    @Value("${gemini.api.url}")
    private String apiUrl;

    @Value("${gemini.api.key}")
    private String apiKey;

    public ChatbotService(RestTemplate restTemplate, ObjectMapper objectMapper, CompanyPolicyRepository policyRepository) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.policyRepository = policyRepository;
    }

    public String getGeminiResponse(String prompt) {
        // 1. 프론트 질문에서 대충 첫 단어만 키워드로 뽑기 (가성비 검색 팁)
        // ex) "연차 며칠이야?" -> "연차" 추출
        String keyword = prompt.split(" ")[0];

        // 2. 사냥개 풀어서 DB 긁어오기
        List<CompanyPolicy> policies = policyRepository.findByContentContainingOrTitleContaining(keyword, keyword);

        // 3. 컨닝 페이퍼(Context) 조립하기
        StringBuilder contextBuilder = new StringBuilder();
        if (policies.isEmpty()) {
            contextBuilder.append("관련된 사내 규정을 찾을 수 없습니다. 일반적인 내용으로 대답하거나 매니저에게 문의하라고 친절하게 안내해주세요.");
        } else {
            for (CompanyPolicy policy : policies) {
                contextBuilder.append("- [").append(policy.getTitle()).append("]: ").append(policy.getContent()).append("\n");
            }
        }

        // 4. 제미나이 가스라이팅용 '찐 프롬프트' 조립하기 💥
        String systemPrompt = "너는 Leandash 사내 인트라넷의 친절하고 유머러스한 AI 챗봇이야. " +
                "사용자의 질문에 대답할 때, 반드시 아래 제공된 [사내 규정 데이터]를 바탕으로 대답해. " +
                "데이터에 없는 내용은 절대 지어내지 말고 모른다고 해.\n\n" +
                "[사내 규정 데이터]\n" + contextBuilder.toString() + "\n\n" +
                "[사용자 질문]: " + prompt;

        // JSON 문자열 깨짐 방지용 특수문자 처리 (이거 안 하면 JSON 껍질 깨짐)
        String safePrompt = systemPrompt.replace("\"", "\\\"").replace("\n", "\\n");
        String requestJson = "{ \"contents\": [ { \"parts\": [ { \"text\": \"" + safePrompt + "\" } ] } ] }";

        // 5. 구글신한테 API 쏘기
        String urlWithKey = apiUrl + "?key=" + apiKey;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> requestEntity = new HttpEntity<>(requestJson, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(urlWithKey, requestEntity, String.class);

            // 6. 예쁘게 껍질 까서 진짜 텍스트 알맹이만 리턴!
            JsonNode rootNode = objectMapper.readTree(response.getBody());
            return rootNode.path("candidates").get(0)
                    .path("content")
                    .path("parts").get(0)
                    .path("text").asText();

        } catch (Exception e) {
            e.printStackTrace();
            return "아앗 형... DB 뒤져서 제미나이한테 주려다가 에러 났어: " + e.getMessage();
        }
    }
}