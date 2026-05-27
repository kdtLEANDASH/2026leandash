package com.onlyman.leandash.repository;

import com.onlyman.leandash.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, Long> {

    boolean existsByDepartmentName(String departmentName);

    boolean existsByDepartmentNameAndDepartmentIdNot(String departmentName, Long departmentId);
}
