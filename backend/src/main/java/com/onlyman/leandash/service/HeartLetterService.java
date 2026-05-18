package com.onlyman.leandash.service;

import com.onlyman.leandash.dto.HeartLetterAdminListResponse;
import com.onlyman.leandash.dto.HeartLetterCreateRequest;
import com.onlyman.leandash.dto.HeartLetterListResponse;
import com.onlyman.leandash.dto.HeartLetterResponse;
import com.onlyman.leandash.entity.HeartLetter;
import com.onlyman.leandash.entity.HeartLetterStatus;
import com.onlyman.leandash.entity.Role;
import com.onlyman.leandash.entity.User;
import com.onlyman.leandash.repository.HeartLetterRepository;
import com.onlyman.leandash.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HeartLetterService {

    private final HeartLetterRepository heartLetterRepository;
    private final UserRepository userRepository;

    @Transactional
    public HeartLetterResponse createHeartLetter(Long currentUserId, HeartLetterCreateRequest request) {
        User sender = getUserEntity(currentUserId);
        User receiver = getTopAdminUser();

        HeartLetter heartLetter = HeartLetter.builder()
                .sender(sender)
                .receiver(receiver)
                .anonymous(request.isAnonymous())
                .title(request.getTitle())
                .content(request.getContent())
                .status(HeartLetterStatus.SENT)
                .build();

        HeartLetter saved = heartLetterRepository.save(heartLetter);
        return HeartLetterResponse.from(saved, true);
    }

    public List<HeartLetterListResponse> getMyHeartLetters(Long currentUserId) {
        return heartLetterRepository.findBySender_UserIdOrderByCreatedAtDesc(currentUserId).stream()
                .map(HeartLetterListResponse::from)
                .toList();
    }

    @Transactional
    public HeartLetterResponse getMyHeartLetter(Long currentUserId, Long heartLetterId) {
        HeartLetter heartLetter = getHeartLetterEntity(heartLetterId);

        if (!heartLetter.getSender().getUserId().equals(currentUserId)) {
            throw new IllegalArgumentException("you cannot view another user's heart letter");
        }

        return HeartLetterResponse.from(heartLetter, true);
    }

    public List<HeartLetterAdminListResponse> getReceivedHeartLetters(Long currentUserId) {
        User admin = getAdminUserEntity(currentUserId);

        return heartLetterRepository.findByReceiver_UserIdOrderByCreatedAtDesc(admin.getUserId()).stream()
                .map(HeartLetterAdminListResponse::from)
                .toList();
    }

    @Transactional
    public HeartLetterResponse getReceivedHeartLetter(Long currentUserId, Long heartLetterId) {
        User admin = getAdminUserEntity(currentUserId);
        HeartLetter heartLetter = getHeartLetterEntity(heartLetterId);

        if (!heartLetter.getReceiver().getUserId().equals(admin.getUserId())) {
            throw new IllegalArgumentException("you cannot view another admin's heart letter");
        }

        heartLetter.markAsRead();
        return HeartLetterResponse.from(heartLetter, !heartLetter.isAnonymous());
    }

    private HeartLetter getHeartLetterEntity(Long heartLetterId) {
        return heartLetterRepository.findById(heartLetterId)
                .orElseThrow(() -> new IllegalArgumentException("heart letter not found"));
    }

    private User getUserEntity(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("user not found"));
    }

    private User getAdminUserEntity(Long userId) {
        User user = getUserEntity(userId);

        if (user.getRoleEnum() != Role.ADMIN) {
            throw new IllegalArgumentException("only admins can access this heart letter operation");
        }

        return user;
    }

    private User getTopAdminUser() {
        return userRepository.findFirstByRoleOrderByUserIdAsc(Role.ADMIN.name())
                .orElseThrow(() -> new IllegalArgumentException("top admin user not found"));
    }
}
