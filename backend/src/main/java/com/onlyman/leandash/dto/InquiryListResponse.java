package com.onlyman.leandash.dto;

import com.onlyman.leandash.entity.Inquiry;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class InquiryListResponse {

    private Long inquiryId;
    private String title;
    private String status;
    private LocalDateTime createdAt;

    public static InquiryListResponse from(Inquiry inquiry) {
        return new InquiryListResponse(
                inquiry.getInquiryId(),
                inquiry.getTitle(),
                inquiry.getStatus().name(),
                inquiry.getCreatedAt()
        );
    }
}
