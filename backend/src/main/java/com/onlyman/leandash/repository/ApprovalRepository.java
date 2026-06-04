package com.onlyman.leandash.repository;

import com.onlyman.leandash.entity.Approval;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApprovalRepository extends JpaRepository<Approval, Long> {

    List<Approval> findByUser_UserIdOrderByCreatedAtDesc(Long userId);

    List<Approval> findByDepartment_DepartmentIdOrderByCreatedAtDesc(Long departmentId);
}
