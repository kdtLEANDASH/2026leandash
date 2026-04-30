package com.onlyman.leandash.service;

import com.onlyman.leandash.dto.DocumentSearchResult;
import com.onlyman.leandash.dto.ScheduleSearchResult;
import com.onlyman.leandash.dto.SearchResponse;
import com.onlyman.leandash.entity.Notice;
import com.onlyman.leandash.entity.Schedule;
import com.onlyman.leandash.repository.NoticeRepository;
import com.onlyman.leandash.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SearchService {

    private final NoticeRepository noticeRepository;
    private final ScheduleRepository scheduleRepository;

    public SearchResponse search(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return new SearchResponse(List.of(), List.of());
        }

        String normalizedKeyword = keyword.trim();

        List<DocumentSearchResult> documents = noticeRepository
                .findByTitleContainingIgnoreCaseOrderByNoticeIdDesc(normalizedKeyword)
                .stream()
                .limit(5)
                .map(DocumentSearchResult::from)
                .toList();

        List<ScheduleSearchResult> schedules = scheduleRepository
                .findTop5ByTitleContainingIgnoreCaseOrContentContainingIgnoreCaseOrderByScheduleIdDesc(
                        normalizedKeyword,
                        normalizedKeyword
                ).stream()
                .map(ScheduleSearchResult::from)
                .toList();

        return new SearchResponse(documents, schedules);
    }
}
