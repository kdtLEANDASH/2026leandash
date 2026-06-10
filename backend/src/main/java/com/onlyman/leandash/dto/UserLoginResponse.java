package com.onlyman.leandash.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class UserLoginResponse {

    private Long userId;
    private String employeeNo;
    private String userName;

    private String email;
    private String phone;
    private String address;

    private Long departmentId;
    private String departmentName;

    private String position;
    private String mbti;
    private LocalDate hireDate;

    private String userStatus;
    private String role;

    private String accessToken;
    private String tokenType;
    private String message;
}