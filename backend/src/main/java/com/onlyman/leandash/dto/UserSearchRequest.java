package com.onlyman.leandash.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserSearchRequest {

    private String keyword;
    private Long departmentId;
    private String role;
    private String userStatus;
}
