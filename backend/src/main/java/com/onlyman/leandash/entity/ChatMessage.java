package com.onlyman.leandash.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private Long messageId;

    // 해당 메시지가 속한 채팅방의 식별자
    @Column(name = "room_id", nullable = false)
    private Long roomId;

    // 메시지를 발송한 사용자의 식별자
    @Column(name = "sender_id", nullable = false)
    private Long senderId;

    // 메시지 본문 내용 (긴 텍스트 처리를 위해 TEXT 타입 지정)
    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    // 메시지 읽음 여부 (기본값 false)
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    // 메시지 생성 일시 (DB 설정에 따라 자동 생성)
    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}