package com.onlyman.leandash.dto;

import com.onlyman.leandash.entity.HeartLetter;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class HeartLetterListResponse {

    private Long heartLetterId;
    private String title;
    private boolean anonymous;
    private String status;
    private LocalDateTime createdAt;

    public static HeartLetterListResponse from(HeartLetter heartLetter) {
        return new HeartLetterListResponse(
                heartLetter.getHeartLetterId(),
                heartLetter.getTitle(),
                heartLetter.isAnonymous(),
                heartLetter.getStatus().name(),
                heartLetter.getCreatedAt()
        );
    }
}
