package com.onlyman.leandash.dto;

import com.onlyman.leandash.entity.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

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
    private LocalDate birthDate;
    private LocalDate hireDate;
    private String address;
    private String gender;
    private String position;
    private String mbti;
    private String userStatus;
    private String role;

    // 프론트 호환용 필드
    private Long id;
    private String name;
    private String department;
    private String status;

    public static UserResponse from(User user) {
        String departmentName = user.getDepartment() == null
                ? null
                : user.getDepartment().getDepartmentName();

        return UserResponse.builder()
                .userId(user.getUserId())
                .employeeNo(user.getEmployeeNo())
                .userName(user.getUserName())
                .departmentId(user.getDepartment() == null ? null : user.getDepartment().getDepartmentId())
                .departmentName(departmentName)
                .email(user.getEmail())
                .phone(user.getPhone())
                .birthDate(user.getBirthDate())
                .hireDate(user.getHireDate())
                .address(user.getAddress())
                .gender(user.getGender())
                .position(user.getPosition())
                .mbti(user.getMbti())
                .userStatus(user.getUserStatus())
                .role(user.getRoleEnum().name())

                // 프론트 호환용 필드
                .id(user.getUserId())
                .name(user.getUserName())
                .department(departmentName)
                .status(user.getUserStatus())
                .build();
    }
}