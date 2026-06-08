package com.onlyman.leandash.entity;

public enum ApprovalStatus {
    PENDING("대기중"),
    APPROVED("승인"),
    REJECTED("반려");

    private final String label;

    ApprovalStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
