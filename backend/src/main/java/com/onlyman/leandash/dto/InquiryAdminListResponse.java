package com.onlyman.leandash.dto;

import com.onlyman.leandash.entity.Inquiry;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class InquiryAdminListResponse {

    private Long inquiryId;
    private String title;
    private String userName;
    private String departmentName;
    private String status;
    private LocalDateTime createdAt;

    public static InquiryAdminListResponse from(Inquiry inquiry) {
        return new InquiryAdminListResponse(
                inquiry.getInquiryId(),
                inquiry.getTitle(),
                inquiry.getUser().getUserName(),
                inquiry.getDepartment().getDepartmentName(),
                inquiry.getStatus().name(),
                inquiry.getCreatedAt()
        );
    }
}
