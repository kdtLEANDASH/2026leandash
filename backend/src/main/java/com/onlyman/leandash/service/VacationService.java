package com.onlyman.leandash.service;

import com.onlyman.leandash.dto.VacationRejectRequestDto;
import com.onlyman.leandash.dto.VacationRequestDto;
import com.onlyman.leandash.dto.VacationResponseDto;
import com.onlyman.leandash.entity.Role;
import com.onlyman.leandash.entity.Vacation;
import com.onlyman.leandash.entity.VacationStatus;
import com.onlyman.leandash.repository.UserRepository;
import com.onlyman.leandash.repository.VacationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class VacationService {

    private final VacationRepository vacationRepository;
    private final UserRepository userRepository;

    public VacationService(VacationRepository vacationRepository, UserRepository userRepository) {
        this.vacationRepository = vacationRepository;
        this.userRepository = userRepository;
    }

    public VacationResponseDto createVacation(Long currentUserId, VacationRequestDto requestDto) {
        validateVacationRequest(requestDto);
        validateVacationOverlap(currentUserId, requestDto, null);

        Vacation vacation = new Vacation();
        vacation.setUserId(currentUserId);
        vacation.setVacationType(requestDto.getVacationType());
        vacation.setStartDate(requestDto.getStartDate());
        vacation.setEndDate(requestDto.getEndDate());
        vacation.setReason(requestDto.getReason());
        vacation.setStatus(VacationStatus.PENDING);

        Vacation savedVacation = vacationRepository.save(vacation);
        return toResponseDto(savedVacation);
    }

    @Transactional(readOnly = true)
    public List<VacationResponseDto> getAllVacations() {
        return vacationRepository.findAll()
                .stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VacationResponseDto getVacationById(Long vacationId) {
        return toResponseDto(findVacation(vacationId));
    }

    @Transactional(readOnly = true)
    public List<VacationResponseDto> getVacationsByUserId(Long userId) {
        return vacationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    public VacationResponseDto updateVacation(Long currentUserId, String currentUserRole, Long vacationId,
                                              VacationRequestDto requestDto) {
        validateVacationRequest(requestDto);

        Vacation vacation = findVacation(vacationId);
        validateVacationAccess(currentUserId, currentUserRole, vacation);

        if (vacation.getStatus() != VacationStatus.PENDING) {
            throw new IllegalArgumentException("only pending vacations can be updated");
        }

        validateVacationOverlap(currentUserId, requestDto, vacationId);

        vacation.setVacationType(requestDto.getVacationType());
        vacation.setStartDate(requestDto.getStartDate());
        vacation.setEndDate(requestDto.getEndDate());
        vacation.setReason(requestDto.getReason());

        return toResponseDto(vacation);
    }

    public VacationResponseDto cancelVacation(Long currentUserId, String currentUserRole, Long vacationId) {
        Vacation vacation = findVacation(vacationId);
        validateVacationAccess(currentUserId, currentUserRole, vacation);

        if (vacation.getStatus() != VacationStatus.PENDING) {
            throw new IllegalArgumentException("only pending vacations can be canceled");
        }

        vacation.setStatus(VacationStatus.CANCELED);
        return toResponseDto(vacation);
    }

    public VacationResponseDto approveVacation(Long vacationId, Long approverId) {
        Vacation vacation = findVacation(vacationId);

        validateAdminApprover(approverId);

        if (vacation.getStatus() != VacationStatus.PENDING) {
            throw new IllegalArgumentException("only pending vacations can be approved");
        }

        vacation.setStatus(VacationStatus.APPROVED);
        vacation.setApproverId(approverId);
        vacation.setRejectReason(null);

        return toResponseDto(vacation);
    }

    public VacationResponseDto rejectVacation(Long vacationId, Long approverId, VacationRejectRequestDto requestDto) {
        Vacation vacation = findVacation(vacationId);

        validateAdminApprover(approverId);

        if (vacation.getStatus() != VacationStatus.PENDING) {
            throw new IllegalArgumentException("only pending vacations can be rejected");
        }

        if (requestDto.getRejectReason() == null || requestDto.getRejectReason().isBlank()) {
            throw new IllegalArgumentException("reject reason is required");
        }

        vacation.setStatus(VacationStatus.REJECTED);
        vacation.setApproverId(approverId);
        vacation.setRejectReason(requestDto.getRejectReason());

        return toResponseDto(vacation);
    }

    private void validateVacationRequest(VacationRequestDto requestDto) {
        if (requestDto.getVacationType() == null || requestDto.getVacationType().isBlank()) {
            throw new IllegalArgumentException("vacation type is required");
        }

        if (requestDto.getStartDate() == null || requestDto.getEndDate() == null) {
            throw new IllegalArgumentException("start date and end date are required");
        }

        if (requestDto.getStartDate().isAfter(requestDto.getEndDate())) {
            throw new IllegalArgumentException("start date cannot be after end date");
        }
    }

    private void validateVacationOverlap(Long currentUserId, VacationRequestDto requestDto, Long vacationId) {
        List<Vacation> vacations = vacationRepository.findByUserIdOrderByCreatedAtDesc(currentUserId);

        boolean hasOverlap = vacations.stream()
                .filter(vacation -> vacationId == null || !vacation.getVacationId().equals(vacationId))
                .filter(vacation -> vacation.getStatus() != VacationStatus.CANCELED
                        && vacation.getStatus() != VacationStatus.REJECTED)
                .anyMatch(vacation -> !vacation.getStartDate().isAfter(requestDto.getEndDate())
                        && !vacation.getEndDate().isBefore(requestDto.getStartDate()));

        if (hasOverlap) {
            throw new IllegalArgumentException("vacation dates overlap with an existing request");
        }
    }

    private void validateVacationAccess(Long currentUserId, String currentUserRole, Vacation vacation) {
        if (Role.ADMIN.name().equals(currentUserRole)) {
            return;
        }

        if (!vacation.getUserId().equals(currentUserId)) {
            throw new IllegalArgumentException("you cannot modify another user's vacation");
        }
    }

    private void validateAdminApprover(Long approverId) {
        if (!userRepository.existsByUserIdAndRole(approverId, Role.ADMIN.name())) {
            throw new IllegalArgumentException("only admins can approve or reject vacations");
        }
    }

    private Vacation findVacation(Long vacationId) {
        return vacationRepository.findById(vacationId)
                .orElseThrow(() -> new IllegalArgumentException("vacation not found"));
    }

    private VacationResponseDto toResponseDto(Vacation vacation) {
        return new VacationResponseDto(
                vacation.getVacationId(),
                vacation.getUserId(),
                vacation.getVacationType(),
                vacation.getStartDate(),
                vacation.getEndDate(),
                vacation.getReason(),
                vacation.getStatus().name(),
                vacation.getApproverId(),
                vacation.getRejectReason(),
                vacation.getCreatedAt(),
                vacation.getUpdatedAt()
        );
    }
}
