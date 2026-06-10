package com.onlyman.leandash.repository;

import com.onlyman.leandash.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    Optional<ChatRoom> findByUserId1AndUserId2(Long userId1, Long userId2);

    List<ChatRoom> findByUserId1OrUserId2OrderByUpdatedAtDesc(Long userId1, Long userId2);
}
