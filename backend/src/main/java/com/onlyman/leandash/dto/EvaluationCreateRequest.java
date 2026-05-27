package com.onlyman.leandash.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class EvaluationCreateRequest {
    private Long targetUserId;
    private Long targetDepartmentId;
    private Long evaluatorUserId;
    private int score;
    private String content;
}