package com.onlyman.leandash.repository;

import com.onlyman.leandash.entity.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {

    // 특정 직원의 평가 목록 조회
    List<Evaluation> findByTargetUser_UserId(Long targetUserId);

    // 특정 부서의 평가 목록 조회
    List<Evaluation> findByTargetDepartment_DepartmentId(Long departmentId);

    // 내가 한 평가 목록 조회
    List<Evaluation> findByEvaluatorUser_UserId(Long evaluatorUserId);
}