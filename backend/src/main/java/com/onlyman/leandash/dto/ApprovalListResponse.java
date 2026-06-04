package com.onlyman.leandash.dto;

import com.onlyman.leandash.entity.Approval;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ApprovalListResponse {

    private Long approvalId;
    private String title;
    private String approvalType;
    private Long amount;
    private String requester;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;

    public static ApprovalListResponse from(Approval approval) {
        return new ApprovalListResponse(
                approval.getApprovalId(),
                approval.getTitle(),
                approval.getApprovalType().getLabel(),
                approval.getAmount(),
                approval.getUser().getUserName(),
                approval.getStatus().getLabel(),
                approval.getCreatedAt(),
                approval.getProcessedAt()
        );
    }
}
