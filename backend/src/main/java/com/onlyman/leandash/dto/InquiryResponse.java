package com.onlyman.leandash.dto;

import com.onlyman.leandash.entity.Inquiry;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class InquiryResponse {

    private Long inquiryId;
    private Long userId;
    private String userName;
    private Long departmentId;
    private String departmentName;
    private String title;
    private String content;
    private String status;
    private String answerContent;
    private Long answeredBy;
    private String answeredByName;
    private LocalDateTime answeredAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static InquiryResponse from(Inquiry inquiry) {
        return new InquiryResponse(
                inquiry.getInquiryId(),
                inquiry.getUser().getUserId(),
                inquiry.getUser().getUserName(),
                inquiry.getDepartment().getDepartmentId(),
                inquiry.getDepartment().getDepartmentName(),
                inquiry.getTitle(),
                inquiry.getContent(),
                inquiry.getStatus().name(),
                inquiry.getAnswerContent(),
                inquiry.getAnsweredBy() != null ? inquiry.getAnsweredBy().getUserId() : null,
                inquiry.getAnsweredBy() != null ? inquiry.getAnsweredBy().getUserName() : null,
                inquiry.getAnsweredAt(),
                inquiry.getCreatedAt(),
                inquiry.getUpdatedAt()
        );
    }
}
