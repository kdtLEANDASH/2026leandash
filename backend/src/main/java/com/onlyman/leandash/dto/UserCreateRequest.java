package com.onlyman.leandash.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UserCreateRequest {

    @NotBlank(message = "사번은 필수입니다.")
    private String employeeNo;

    @NotBlank(message = "이름은 필수입니다.")
    private String userName;

    @NotBlank(message = "비밀번호는 필수입니다.")
    private String password;

    @NotNull(message = "부서 ID는 필수입니다.")
    private Long departmentId;

    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String email;

    private String phone;
    private LocalDate birthDate;
    private String address;
    private String gender;
    private String position;
}
