package com.onlyman.leandash.controller;

import com.onlyman.leandash.dto.ApiResponse;
import com.onlyman.leandash.dto.DepartmentCreateRequest;
import com.onlyman.leandash.dto.DepartmentResponse;
import com.onlyman.leandash.dto.DepartmentUpdateRequest;
import com.onlyman.leandash.dto.UserResponse;
import com.onlyman.leandash.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentResponse>> createDepartment(
            @Valid @RequestBody DepartmentCreateRequest request
    ) {
        DepartmentResponse response = departmentService.createDepartment(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "부서 생성 성공", response));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<DepartmentResponse>>> getDepartments() {
        List<DepartmentResponse> response = departmentService.getDepartments();
        return ResponseEntity.ok(new ApiResponse<>(true, "부서 목록 조회 성공", response));
    }

    @PutMapping("/{departmentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentResponse>> updateDepartment(
            @PathVariable Long departmentId,
            @Valid @RequestBody DepartmentUpdateRequest request
    ) {
        DepartmentResponse response = departmentService.updateDepartment(departmentId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "부서 수정 성공", response));
    }

    @GetMapping("/{departmentId}/users")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUsersByDepartment(@PathVariable Long departmentId) {
        List<UserResponse> response = departmentService.getUsersByDepartment(departmentId);
        return ResponseEntity.ok(new ApiResponse<>(true, "부서별 유저 조회 성공", response));
    }
    @DeleteMapping("/{departmentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(@PathVariable Long departmentId) {
        departmentService.deleteDepartment(departmentId);
        return ResponseEntity.ok(new ApiResponse<>(true, "department deleted successfully", null));
    }
}
