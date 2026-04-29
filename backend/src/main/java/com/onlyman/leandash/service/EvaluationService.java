package com.onlyman.leandash.service;

import com.onlyman.leandash.dto.EvaluationCreateRequest;
import com.onlyman.leandash.dto.EvaluationResponse;
import com.onlyman.leandash.dto.EvaluationUpdateRequest;
import com.onlyman.leandash.entity.Department;
import com.onlyman.leandash.entity.Evaluation;
import com.onlyman.leandash.entity.User;
import com.onlyman.leandash.repository.DepartmentRepository;
import com.onlyman.leandash.repository.EvaluationRepository;
import com.onlyman.leandash.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    // 평가 생성
    @Transactional
    public EvaluationResponse createEvaluation(EvaluationCreateRequest request) {
        User targetUser = userRepository.findById(request.getTargetUserId())
                .orElseThrow(() -> new RuntimeException("대상 직원을 찾을 수 없습니다."));
        Department targetDepartment = departmentRepository.findById(request.getTargetDepartmentId())
                .orElseThrow(() -> new RuntimeException("부서를 찾을 수 없습니다."));
        User evaluatorUser = userRepository.findById(request.getEvaluatorUserId())
                .orElseThrow(() -> new RuntimeException("평가자를 찾을 수 없습니다."));

        Evaluation evaluation = Evaluation.builder()
                .targetUser(targetUser)
                .targetDepartment(targetDepartment)
                .evaluatorUser(evaluatorUser)
                .score(request.getScore())
                .content(request.getContent())
                .build();

        return new EvaluationResponse(evaluationRepository.save(evaluation));
    }

    // 전체 평가 목록 조회
    public List<EvaluationResponse> getAllEvaluations() {
        return evaluationRepository.findAll()
                .stream()
                .map(EvaluationResponse::new)
                .collect(Collectors.toList());
    }

    // 특정 직원 평가 목록 조회
    public List<EvaluationResponse> getEvaluationsByTargetUser(Long targetUserId) {
        return evaluationRepository.findByTargetUser_UserId(targetUserId)
                .stream()
                .map(EvaluationResponse::new)
                .collect(Collectors.toList());
    }

    // 평가 수정
    @Transactional
    public EvaluationResponse updateEvaluation(Long evaluationId, EvaluationUpdateRequest request) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new RuntimeException("평가를 찾을 수 없습니다."));

        evaluation.setScore(request.getScore());
        evaluation.setContent(request.getContent());

        return new EvaluationResponse(evaluation);
    }

    // 평가 삭제
    @Transactional
    public void deleteEvaluation(Long evaluationId) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new RuntimeException("평가를 찾을 수 없습니다."));
        evaluationRepository.delete(evaluation);
    }
}