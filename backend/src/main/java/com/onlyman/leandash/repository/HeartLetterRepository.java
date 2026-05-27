package com.onlyman.leandash.repository;

import com.onlyman.leandash.entity.HeartLetter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HeartLetterRepository extends JpaRepository<HeartLetter, Long> {

    List<HeartLetter> findBySender_UserIdOrderByCreatedAtDesc(Long senderUserId);

    List<HeartLetter> findByReceiver_UserIdOrderByCreatedAtDesc(Long receiverUserId);
}
