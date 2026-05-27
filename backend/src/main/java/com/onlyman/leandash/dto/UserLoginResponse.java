package com.onlyman.leandash.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserLoginResponse {

    private Long userId;
    private String employeeNo;
    private String userName;
    private String email;
    private String userStatus;
    private String role;
    private String accessToken;
    private String tokenType;
    private String message;
}
