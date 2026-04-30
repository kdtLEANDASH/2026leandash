package com.onlyman.leandash.dto;

import com.onlyman.leandash.entity.Notice;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class DocumentSearchResult {

    private Long noticeId;
    private String title;
    private String writerName;
    private LocalDateTime createdAt;

    public static DocumentSearchResult from(Notice notice) {
        return new DocumentSearchResult(
                notice.getNoticeId(),
                notice.getTitle(),
                notice.getWriter().getUserName(),
                notice.getCreatedAt()
        );
    }
}
