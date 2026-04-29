package com.onlyman.leandash.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chatroom_id")
    private Long chatroomId;

    // 객체 지향적인 연관관계 매핑(@ManyToOne) 대신, 데이터베이스 구조에 맞추어 외래키(ID)를 직접 참조하도록 설계했습니다.
    @Column(name = "user_id1", nullable = false)
    private Long userId1;

    @Column(name = "user_id2", nullable = false)
    private Long userId2;

    // 생성 일시 (DB의 DEFAULT CURRENT_TIMESTAMP 활용)
    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    // 수정 일시 (DB의 ON UPDATE CURRENT_TIMESTAMP 활용)
    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}