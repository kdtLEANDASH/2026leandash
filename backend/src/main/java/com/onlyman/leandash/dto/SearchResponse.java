package com.onlyman.leandash.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class SearchResponse {

    private List<DocumentSearchResult> documents;
    private List<ScheduleSearchResult> schedules;
}
