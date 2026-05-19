package com.onlyman.leandash.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class NotificationResponseDto {

    private Long notificationId;
    private Long userId;
    private String title;
    private String message;
    private String notificationType;
    private Boolean isRead;
    private LocalDateTime createdAt;
}