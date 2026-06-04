package com.onlyman.leandash.dto;

import com.onlyman.leandash.entity.Approval;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class ApprovalResponse {

    private Long approvalId;
    private Long userId;
    private String userName;
    private Long departmentId;
    private String departmentName;
    private String title;
    private String approvalType;
    private String content;
    private Long amount;
    private String status;
    private Long approverId;
    private String approverName;
    private String rejectReason;
    private String signatureUrl;
    private LocalDateTime processedAt;
    private List<FileAttachmentResponse> attachments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ApprovalResponse from(Approval approval, List<FileAttachmentResponse> attachments) {
        return new ApprovalResponse(
                approval.getApprovalId(),
                approval.getUser().getUserId(),
                approval.getUser().getUserName(),
                approval.getDepartment().getDepartmentId(),
                approval.getDepartment().getDepartmentName(),
                approval.getTitle(),
                approval.getApprovalType().getLabel(),
                approval.getContent(),
                approval.getAmount(),
                approval.getStatus().getLabel(),
                approval.getApprover() != null ? approval.getApprover().getUserId() : null,
                approval.getApprover() != null ? approval.getApprover().getUserName() : null,
                approval.getRejectReason(),
                approval.getSignatureUrl(),
                approval.getProcessedAt(),
                attachments,
                approval.getCreatedAt(),
                approval.getUpdatedAt()
        );
    }
}
