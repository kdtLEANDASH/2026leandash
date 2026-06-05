package com.onlyman.leandash.repository;

import com.onlyman.leandash.entity.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {

    List<Inquiry> findAllByOrderByCreatedAtDesc();

    List<Inquiry> findByUser_UserIdOrderByCreatedAtDesc(Long userId);

    List<Inquiry> findByDepartment_DepartmentIdOrderByCreatedAtDesc(Long departmentId);
}
