package com.onlyman.leandash.service;

import com.onlyman.leandash.dto.NoticeCreateRequest;
import com.onlyman.leandash.dto.NoticeListResponse;
import com.onlyman.leandash.dto.NoticeResponse;
import com.onlyman.leandash.dto.NoticeUpdateRequest;
import com.onlyman.leandash.entity.Notice;
import com.onlyman.leandash.entity.User;
import com.onlyman.leandash.repository.NoticeRepository;
import com.onlyman.leandash.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final UserRepository userRepository;

    @Transactional
    public NoticeResponse createNotice(Long writerId, NoticeCreateRequest request) {
        User writer = userRepository.findById(writerId)
                .orElseThrow(() -> new IllegalArgumentException("writer not found"));

        Notice notice = Notice.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .writer(writer)
                .build();

        return NoticeResponse.from(noticeRepository.save(notice));
    }

    public List<NoticeListResponse> getNotices() {
        return noticeRepository.findAllByOrderByNoticeIdDesc().stream()
                .map(NoticeListResponse::from)
                .toList();
    }

    public NoticeResponse getNotice(Long noticeId) {
        return NoticeResponse.from(getNoticeEntity(noticeId));
    }

    @Transactional
    public NoticeResponse updateNotice(Long noticeId, NoticeUpdateRequest request) {
        Notice notice = getNoticeEntity(noticeId);
        notice.update(request.getTitle(), request.getContent());
        return NoticeResponse.from(notice);
    }

    @Transactional
    public void deleteNotice(Long noticeId) {
        noticeRepository.delete(getNoticeEntity(noticeId));
    }

    private Notice getNoticeEntity(Long noticeId) {
        return noticeRepository.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("notice not found"));
    }
}
