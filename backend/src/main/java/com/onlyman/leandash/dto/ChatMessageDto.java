package com.onlyman.leandash.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatMessageDto {
    private Long roomId;
    private Long senderId;
    private String senderName;
    private String message;
    private String sentAt;
}