package com.onlyman.leandash.dto;

import com.onlyman.leandash.entity.Department;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DepartmentResponse {

    private Long departmentId;
    private String departmentName;

    public static DepartmentResponse from(Department department) {
        return new DepartmentResponse(
                department.getDepartmentId(),
                department.getDepartmentName()
        );
    }
}
