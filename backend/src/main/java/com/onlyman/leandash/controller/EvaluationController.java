package com.onlyman.leandash.controller;

import com.onlyman.leandash.dto.EvaluationCreateRequest;
import com.onlyman.leandash.dto.EvaluationResponse;
import com.onlyman.leandash.dto.EvaluationUpdateRequest;
import com.onlyman.leandash.service.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evaluations")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;

    // 평가 생성
    @PostMapping
    public ResponseEntity<EvaluationResponse> createEvaluation(
            @RequestBody EvaluationCreateRequest request) {
        return ResponseEntity.ok(evaluationService.createEvaluation(request));
    }

    // 전체 평가 목록 조회
    @GetMapping
    public ResponseEntity<List<EvaluationResponse>> getAllEvaluations() {
        return ResponseEntity.ok(evaluationService.getAllEvaluations());
    }

    // 특정 직원 평가 목록 조회
    @GetMapping("/user/{targetUserId}")
    public ResponseEntity<List<EvaluationResponse>> getEvaluationsByUser(
            @PathVariable Long targetUserId) {
        return ResponseEntity.ok(evaluationService.getEvaluationsByTargetUser(targetUserId));
    }

    // 평가 수정
    @PutMapping("/{evaluationId}")
    public ResponseEntity<EvaluationResponse> updateEvaluation(
            @PathVariable Long evaluationId,
            @RequestBody EvaluationUpdateRequest request) {
        return ResponseEntity.ok(evaluationService.updateEvaluation(evaluationId, request));
    }

    // 평가 삭제
    @DeleteMapping("/{evaluationId}")
    public ResponseEntity<Void> deleteEvaluation(
            @PathVariable Long evaluationId) {
        evaluationService.deleteEvaluation(evaluationId);
        return ResponseEntity.noContent().build();
    }
}
