package com.onlyman.leandash.controller;

import com.onlyman.leandash.config.UserPrincipal;
import com.onlyman.leandash.dto.VacationApproveRequestDto;
import com.onlyman.leandash.dto.VacationRejectRequestDto;
import com.onlyman.leandash.dto.VacationRequestDto;
import com.onlyman.leandash.dto.VacationResponseDto;
import com.onlyman.leandash.service.VacationService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vacations")
public class VacationController {

    private final VacationService vacationService;

    public VacationController(VacationService vacationService) {
        this.vacationService = vacationService;
    }

    @PostMapping
    public VacationResponseDto createVacation(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody VacationRequestDto requestDto
    ) {
        return vacationService.createVacation(principal.getUserId(), requestDto);
    }

    @GetMapping
    public List<VacationResponseDto> getAllVacations() {
        return vacationService.getAllVacations();
    }

    @GetMapping("/{vacationId}")
    public VacationResponseDto getVacationById(@PathVariable Long vacationId) {
        return vacationService.getVacationById(vacationId);
    }

    @GetMapping("/user/{userId}")
    public List<VacationResponseDto> getVacationsByUserId(@PathVariable Long userId) {
        return vacationService.getVacationsByUserId(userId);
    }

    @PutMapping("/{vacationId}")
    public VacationResponseDto updateVacation(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long vacationId,
            @RequestBody VacationRequestDto requestDto
    ) {
        return vacationService.updateVacation(
                principal.getUserId(),
                principal.getRole().name(),
                vacationId,
                requestDto
        );
    }

    @PatchMapping("/{vacationId}/cancel")
    public VacationResponseDto cancelVacation(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long vacationId
    ) {
        return vacationService.cancelVacation(principal.getUserId(), principal.getRole().name(), vacationId);
    }

    @PatchMapping("/{vacationId}/approve")
    public VacationResponseDto approveVacation(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long vacationId,
            @RequestBody(required = false) VacationApproveRequestDto requestDto
    ) {
        return vacationService.approveVacation(vacationId, principal.getUserId());
    }

    @PatchMapping("/{vacationId}/reject")
    public VacationResponseDto rejectVacation(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long vacationId,
            @RequestBody VacationRejectRequestDto requestDto
    ) {
        return vacationService.rejectVacation(vacationId, principal.getUserId(), requestDto);
    }
}
