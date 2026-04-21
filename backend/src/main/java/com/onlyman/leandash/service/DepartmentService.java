package com.onlyman.leandash.service;

import com.onlyman.leandash.dto.DepartmentCreateRequest;
import com.onlyman.leandash.dto.DepartmentResponse;
import com.onlyman.leandash.dto.DepartmentUpdateRequest;
import com.onlyman.leandash.dto.UserResponse;
import com.onlyman.leandash.entity.Department;
import com.onlyman.leandash.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final UserService userService;

    @Transactional
    public DepartmentResponse createDepartment(DepartmentCreateRequest request) {
        validateDepartmentNameDuplicate(request.getDepartmentName());

        Department department = Department.builder()
                .departmentName(request.getDepartmentName())
                .build();
        Department savedDepartment = departmentRepository.save(department);
        return DepartmentResponse.from(savedDepartment);
    }

    public List<DepartmentResponse> getDepartments() {
        return departmentRepository.findAll().stream()
                .map(DepartmentResponse::from)
                .toList();
    }

    @Transactional
    public DepartmentResponse updateDepartment(Long departmentId, DepartmentUpdateRequest request) {
        Department department = getDepartment(departmentId);

        validateDepartmentNameDuplicate(request.getDepartmentName(), departmentId);
        department.setDepartmentName(request.getDepartmentName());

        return DepartmentResponse.from(department);
    }

    public List<UserResponse> getUsersByDepartment(Long departmentId) {
        getDepartment(departmentId);
        return userService.getUsersByDepartment(departmentId);
    }

    @Transactional
    public void deleteDepartment(Long departmentId) {
        Department department = getDepartment(departmentId);

        if (userService.hasUsersInDepartment(departmentId)) {
            throw new IllegalArgumentException("department with users cannot be deleted");
        }

        departmentRepository.delete(department);
    }

    private Department getDepartment(Long departmentId) {
        return departmentRepository.findById(departmentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 부서입니다."));
    }

    private void validateDepartmentNameDuplicate(String departmentName) {
        if (departmentRepository.existsByDepartmentName(departmentName)) {
            throw new IllegalArgumentException("이미 존재하는 부서명입니다.");
        }
    }

    private void validateDepartmentNameDuplicate(String departmentName, Long departmentId) {
        if (departmentRepository.existsByDepartmentNameAndDepartmentIdNot(departmentName, departmentId)) {
            throw new IllegalArgumentException("이미 존재하는 부서명입니다.");
        }
    }
}
