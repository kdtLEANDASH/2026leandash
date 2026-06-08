package com.onlyman.leandash.dto;

import com.onlyman.leandash.entity.Approval;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ApprovalAdminListResponse {

    private Long approvalId;
    private Long userId;
    private String userName;
    private Long departmentId;
    private String departmentName;
    private String title;
    private String approvalType;
    private Long amount;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;

    public static ApprovalAdminListResponse from(Approval approval) {
        return new ApprovalAdminListResponse(
                approval.getApprovalId(),
                approval.getUser().getUserId(),
                approval.getUser().getUserName(),
                approval.getDepartment().getDepartmentId(),
                approval.getDepartment().getDepartmentName(),
                approval.getTitle(),
                approval.getApprovalType().getLabel(),
                approval.getAmount(),
                approval.getStatus().getLabel(),
                approval.getCreatedAt(),
                approval.getProcessedAt()
        );
    }
}
