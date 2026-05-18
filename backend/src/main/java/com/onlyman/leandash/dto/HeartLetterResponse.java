package com.onlyman.leandash.dto;

import com.onlyman.leandash.entity.HeartLetter;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class HeartLetterResponse {

    private Long heartLetterId;
    private String title;
    private String content;
    private boolean anonymous;
    private String status;
    private Long senderUserId;
    private String senderUserName;
    private Long receiverUserId;
    private String receiverUserName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static HeartLetterResponse from(HeartLetter heartLetter, boolean revealSender) {
        return new HeartLetterResponse(
                heartLetter.getHeartLetterId(),
                heartLetter.getTitle(),
                heartLetter.getContent(),
                heartLetter.isAnonymous(),
                heartLetter.getStatus().name(),
                revealSender ? heartLetter.getSender().getUserId() : null,
                revealSender ? heartLetter.getSender().getUserName() : "익명",
                heartLetter.getReceiver().getUserId(),
                heartLetter.getReceiver().getUserName(),
                heartLetter.getCreatedAt(),
                heartLetter.getUpdatedAt()
        );
    }
}
