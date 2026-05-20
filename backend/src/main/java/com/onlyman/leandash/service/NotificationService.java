package com.onlyman.leandash.service;

import com.onlyman.leandash.dto.NotificationResponseDto;
import com.onlyman.leandash.entity.Notification;
import com.onlyman.leandash.entity.Vacation;
import com.onlyman.leandash.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void createVacationApprovedNotification(Vacation vacation) {
        Notification notification = new Notification();
        notification.setUserId(vacation.getUserId());
        notification.setTitle("휴가 승인");
        notification.setMessage(
                vacation.getStartDate() + " ~ " + vacation.getEndDate()
                        + " " + vacation.getVacationType()
                        + " 휴가가 승인되었습니다."
        );
        notification.setNotificationType("VACATION_APPROVED");
        notification.setIsRead(false);

        notificationRepository.save(notification);
    }

    public void createVacationRejectedNotification(Vacation vacation) {
        Notification notification = new Notification();
        notification.setUserId(vacation.getUserId());
        notification.setTitle("휴가 반려");
        notification.setMessage(
                vacation.getStartDate() + " ~ " + vacation.getEndDate()
                        + " " + vacation.getVacationType()
                        + " 휴가가 반려되었습니다. 사유: "
                        + vacation.getRejectReason()
        );
        notification.setNotificationType("VACATION_REJECTED");
        notification.setIsRead(false);

        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponseDto> getMyNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    private NotificationResponseDto toResponseDto(Notification notification) {
        return new NotificationResponseDto(
                notification.getNotificationId(),
                notification.getUserId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getNotificationType(),
                notification.getIsRead(),
                notification.getCreatedAt()
        );
    }
}