package com.onlyman.leandash.service;

import com.onlyman.leandash.dto.InquiryCreateRequest;
import com.onlyman.leandash.dto.InquiryListResponse;
import com.onlyman.leandash.dto.InquiryResponse;
import com.onlyman.leandash.entity.Inquiry;
import com.onlyman.leandash.entity.InquiryStatus;
import com.onlyman.leandash.entity.User;
import com.onlyman.leandash.repository.InquiryRepository;
import com.onlyman.leandash.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final UserRepository userRepository;

    @Transactional
    public InquiryResponse createInquiry(Long currentUserId, InquiryCreateRequest request) {
        User user = getUserEntity(currentUserId);

        Inquiry inquiry = Inquiry.builder()
                .user(user)
                .department(user.getDepartment())
                .title(request.getTitle())
                .content(request.getContent())
                .status(InquiryStatus.PENDING)
                .build();

        return InquiryResponse.from(inquiryRepository.save(inquiry));
    }

    public List<InquiryListResponse> getMyInquiries(Long currentUserId) {
        return inquiryRepository.findByUser_UserIdOrderByCreatedAtDesc(currentUserId).stream()
                .map(InquiryListResponse::from)
                .toList();
    }

    public InquiryResponse getInquiry(Long currentUserId, Long inquiryId) {
        Inquiry inquiry = getInquiryEntity(inquiryId);

        if (!inquiry.getUser().getUserId().equals(currentUserId)) {
            throw new IllegalArgumentException("you cannot view another user's inquiry");
        }

        return InquiryResponse.from(inquiry);
    }

    private Inquiry getInquiryEntity(Long inquiryId) {
        return inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new IllegalArgumentException("inquiry not found"));
    }

    private User getUserEntity(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("user not found"));
    }
}
