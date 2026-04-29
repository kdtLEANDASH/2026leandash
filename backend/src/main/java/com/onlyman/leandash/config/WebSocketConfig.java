package com.onlyman.leandash.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker // 웹소켓 메시지 브로커 활성화
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 클라이언트가 웹소켓 서버에 연결하기 위한 엔드포인트 설정
        // ex) ws://localhost:8080/ws/chat
        registry.addEndpoint("/ws/chat")
                .setAllowedOriginPatterns("*") // 모든 CORS 요청 허용 (운영 환경에서는 도메인 제한 필요)
                .withSockJS(); // 웹소켓을 지원하지 않는 브라우저를 위한 SockJS 폴백(Fallback) 옵션 활성화
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 클라이언트가 메시지를 구독할 때 사용할 prefix 설정 (메시지 수신용)
        registry.enableSimpleBroker("/sub");

        // 클라이언트가 서버로 메시지를 발행할 때 사용할 prefix 설정 (메시지 발송용)
        registry.setApplicationDestinationPrefixes("/pub");
    }
}