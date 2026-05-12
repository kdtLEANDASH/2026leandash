package com.onlyman.leandash.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // REST API 서버이므로 CSRF 보호 비활성화
                .csrf(AbstractHttpConfigurer::disable)
                // JWT를 사용하므로 세션 생성 정책을 STATELESS로 설정
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 인증 불필요 API (회원가입, 로그인 등)
                        .requestMatchers("/api/users/**", "/error").permitAll()
                        // 웹소켓 연결 및 실시간 채팅 관련 API 접근 허용
                        .requestMatchers("/api/chat/**", "/ws/chat/**").permitAll()
                        // 프론트엔드 테스트용 정적 리소스 접근 허용
                        .requestMatchers("/*.html", "/static/**").permitAll()
                        // 그 외 나머지 모든 요청은 인증 필요
                        .anyRequest().authenticated()
                );
        return http.build();
    }

    /**
     * 사용자 비밀번호 단방향 암호화를 위한 BCryptPasswordEncoder 빈 등록
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}