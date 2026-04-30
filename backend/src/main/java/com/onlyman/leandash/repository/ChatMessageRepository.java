package com.onlyman.leandash.repository;

import com.onlyman.leandash.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // 특정 채팅방의 모든 메시지를 생성 시간 순(과거 -> 최신)으로 조회하는 메서드
    List<ChatMessage> findByRoomIdOrderByCreatedAtAsc(Long roomId);
}