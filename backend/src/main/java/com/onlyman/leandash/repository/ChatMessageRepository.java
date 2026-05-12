package com.onlyman.leandash.repository;

import com.onlyman.leandash.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    // 특정 방의 메시지만 시간순으로 긁어오기
    List<ChatMessage> findByChatRoomIdOrderByCreatedAtAsc(Long roomId);
}