package com.onlyman.leandash.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class VacationResponseDto {

    private Long vacationId;
    private Long userId;
    private String vacationType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private String status;
    private Long approverId;
    private String rejectReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public VacationResponseDto() {
    }

    public VacationResponseDto(Long vacationId, Long userId, String vacationType,
                               LocalDate startDate, LocalDate endDate, String reason,
                               String status, Long approverId, String rejectReason,
                               LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.vacationId = vacationId;
        this.userId = userId;
        this.vacationType = vacationType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.reason = reason;
        this.status = status;
        this.approverId = approverId;
        this.rejectReason = rejectReason;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getVacationId() {
        return vacationId;
    }

    public Long getUserId() {
        return userId;
    }

    public String getVacationType() {
        return vacationType;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public String getReason() {
        return reason;
    }

    public String getStatus() {
        return status;
    }

    public Long getApproverId() {
        return approverId;
    }

    public String getRejectReason() {
        return rejectReason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
