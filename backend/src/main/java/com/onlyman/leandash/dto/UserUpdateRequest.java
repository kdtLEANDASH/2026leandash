package com.onlyman.leandash.dto;

import jakarta.validation.constraints.Email;
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
    private String position;
}
