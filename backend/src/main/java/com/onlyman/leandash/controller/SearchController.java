package com.onlyman.leandash.controller;

import com.onlyman.leandash.dto.ApiResponse;
import com.onlyman.leandash.dto.SearchResponse;
import com.onlyman.leandash.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/search")
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<SearchResponse>> search(
            @RequestParam(required = false) String keyword
    ) {
        SearchResponse response = searchService.search(keyword);
        return ResponseEntity.ok(new ApiResponse<>(true, "search completed", response));
    }
}
