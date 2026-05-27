package com.onlyman.leandash.dto;

import com.onlyman.leandash.entity.Notice;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class NoticeResponse {

    private Long noticeId;
    private String title;
    private String content;
    private Long writerId;
    private String writerName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static NoticeResponse from(Notice notice) {
        return new NoticeResponse(
                notice.getNoticeId(),
                notice.getTitle(),
                notice.getContent(),
                notice.getWriter().getUserId(),
                notice.getWriter().getUserName(),
                notice.getCreatedAt(),
                notice.getUpdatedAt()
        );
    }
}
