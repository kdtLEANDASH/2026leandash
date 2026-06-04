package com.onlyman.leandash.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "approvals")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Approval extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "approval_id")
    private Long approvalId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(nullable = false, length = 100)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_type", nullable = false, length = 20)
    private ApprovalType approvalType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column
    private Long amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ApprovalStatus status = ApprovalStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id")
    private User approver;

    @Column(name = "reject_reason", columnDefinition = "TEXT")
    private String rejectReason;

    @Column(name = "signature_url", length = 500)
    private String signatureUrl;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    public void approve(User approver, String signatureUrl) {
        this.approver = approver;
        this.signatureUrl = signatureUrl;
        this.rejectReason = null;
        this.status = ApprovalStatus.APPROVED;
        this.processedAt = LocalDateTime.now();
    }

    public void reject(User approver, String rejectReason) {
        this.approver = approver;
        this.rejectReason = rejectReason;
        this.signatureUrl = null;
        this.status = ApprovalStatus.REJECTED;
        this.processedAt = LocalDateTime.now();
    }
}
