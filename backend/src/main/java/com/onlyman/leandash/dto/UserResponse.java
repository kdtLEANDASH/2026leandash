package com.onlyman.leandash.dto;

import com.onlyman.leandash.entity.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserResponse {

    private Long userId;
    private String employeeNo;
    private String userName;
    private Long departmentId;
    private String departmentName;
    private String email;
    private String phone;
    private String position;
    private String userStatus;
    private String role;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .employeeNo(user.getEmployeeNo())
                .userName(user.getUserName())
                .departmentId(user.getDepartment().getDepartmentId())
                .departmentName(user.getDepartment().getDepartmentName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .position(user.getPosition())
                .userStatus(user.getUserStatus())
                .role(user.getRoleEnum().name())
                .build();
    }
}
