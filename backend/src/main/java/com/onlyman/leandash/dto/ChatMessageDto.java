package com.onlyman.leandash.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageDto {

    private Long roomId;     // 몇 번 채팅방인지
    private Long senderId;   // 누가 보냈는지
    private String message;  // 채팅 내용

    // 필요에 따라 보낸 시간이나 유저 닉네임 같은 걸 추가할 수 있음!
}