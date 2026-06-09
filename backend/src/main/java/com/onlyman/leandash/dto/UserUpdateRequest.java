package com.onlyman.leandash.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {

    private String userName;

    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String email;

    private String phone;
    private String address;

    // 관리자 수정용. 본인 마이페이지 수정에서는 UserService에서 막음.
    private String position;

    @Size(max = 4, message = "MBTI는 최대 4글자까지 입력할 수 있습니다.")
    private String mbti;
}