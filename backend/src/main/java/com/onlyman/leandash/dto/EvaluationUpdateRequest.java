package com.onlyman.leandash.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class EvaluationUpdateRequest {
    private int score;
    private String content;
}