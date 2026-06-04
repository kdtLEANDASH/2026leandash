package com.onlyman.leandash.entity;

public enum ApprovalType {
    EXPENSE("지출결재"),
    VACATION("휴가결재"),
    WORK("업무결재"),
    ETC("기타"),
    ATTENDANCE("업무결재"),
    DOCUMENT("업무결재");

    private final String label;

    ApprovalType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static ApprovalType from(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("approval type is required");
        }

        String normalized = value.trim();

        return switch (normalized.toUpperCase()) {
            case "EXPENSE", "지출결재" -> EXPENSE;
            case "VACATION", "휴가결재" -> VACATION;
            case "WORK", "업무결재" -> WORK;
            case "ATTENDANCE", "근태정정" -> ATTENDANCE;
            case "DOCUMENT", "문서결재" -> DOCUMENT;
            case "ETC", "기타" -> ETC;
            default -> throw new IllegalArgumentException("unsupported approval type: " + value);
        };
    }
}
