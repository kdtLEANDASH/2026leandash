package com.onlyman.leandash.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chat_rooms")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ChatRoom extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chatroom_id")
    private Long id;




    @Column(name = "user_id1", nullable = false)
    private Long userId1; // 참여자 1

    @Column(name = "user_id2", nullable = false)
    private Long userId2; // 참여자 2

    @Builder.Default
    // 채팅방 삭제시 대화내용 삭제
    @OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChatMessage> messages = new ArrayList<>();
}