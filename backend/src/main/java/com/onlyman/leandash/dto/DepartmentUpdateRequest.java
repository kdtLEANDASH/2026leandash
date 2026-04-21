package com.onlyman.leandash.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class DepartmentUpdateRequest {

    @NotBlank(message = "부서명은 필수입니다.")
    private String departmentName;
}
