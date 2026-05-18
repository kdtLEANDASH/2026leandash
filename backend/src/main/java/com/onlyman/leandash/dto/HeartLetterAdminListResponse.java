package com.onlyman.leandash.dto;

import com.onlyman.leandash.entity.HeartLetter;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class HeartLetterAdminListResponse {

    private Long heartLetterId;
    private String title;
    private String senderUserName;
    private boolean anonymous;
    private String status;
    private LocalDateTime createdAt;

    public static HeartLetterAdminListResponse from(HeartLetter heartLetter) {
        return new HeartLetterAdminListResponse(
                heartLetter.getHeartLetterId(),
                heartLetter.getTitle(),
                heartLetter.isAnonymous() ? "익명" : heartLetter.getSender().getUserName(),
                heartLetter.isAnonymous(),
                heartLetter.getStatus().name(),
                heartLetter.getCreatedAt()
        );
    }
}
