package com.onlyman.leandash.dto;

import com.onlyman.leandash.entity.Evaluation;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class EvaluationResponse {
    private Long evaluationId;
    private Long targetUserId;
    private Long targetDepartmentId;
    private Long evaluatorUserId;
    private int score;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public EvaluationResponse(Evaluation evaluation) {
        this.evaluationId = evaluation.getEvaluationId();
        this.targetUserId = evaluation.getTargetUser().getUserId();
        this.targetDepartmentId = evaluation.getTargetDepartment().getDepartmentId();
        this.evaluatorUserId = evaluation.getEvaluatorUser().getUserId();
        this.score = evaluation.getScore();
        this.content = evaluation.getContent();
        this.createdAt = evaluation.getCreatedAt();
        this.updatedAt = evaluation.getUpdatedAt();
    }
}