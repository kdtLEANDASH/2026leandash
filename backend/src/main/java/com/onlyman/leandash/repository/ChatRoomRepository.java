package com.onlyman.leandash.repository;

import com.onlyman.leandash.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    // JpaRepository를 상속받으면 기본 CRUD(저장, 조회, 수정, 삭제) 기능이 자동으로 제공됩니다.
    // 필요 시 아래에 커스텀 메서드를 추가할 수 있습니다.
}