package com.onlyman.leandash.dto;

import com.onlyman.leandash.entity.Notice;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class NoticeListResponse {

    private Long noticeId;
    private String title;
    private Long writerId;
    private String writerName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static NoticeListResponse from(Notice notice) {
        return new NoticeListResponse(
                notice.getNoticeId(),
                notice.getTitle(),
                notice.getWriter().getUserId(),
                notice.getWriter().getUserName(),
                notice.getCreatedAt(),
                notice.getUpdatedAt()
        );
    }
}
