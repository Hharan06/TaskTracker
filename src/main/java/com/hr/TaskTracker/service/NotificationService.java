package com.hr.TaskTracker.service;

import com.hr.TaskTracker.model.Notification;
import com.hr.TaskTracker.model.Task;
import com.hr.TaskTracker.model.User;
import com.hr.TaskTracker.repository.NotificationRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@Slf4j
public class NotificationService {

    private static final String NOTIFICATION_QUEUE = "notification:delayed:queue";

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private NotificationRepository notificationRepository;

    public void scheduleNotification(Task task) {
        if (task.getStartDateTime() == null || task.getUser() == null) {
            log.warn("Task or User is null, cannot schedule notification.");
            return;
        }

        long notificationTime = task.getStartDateTime()
                .minusMinutes(30)
                .atZone(java.time.ZoneId.systemDefault())
                .toInstant()
                .toEpochMilli();

        NotificationPayload payload = new NotificationPayload(
                task.getUser().getId(),
                task.getTask_id(),
                task.getTitle()
        );

        boolean added = redisTemplate.opsForZSet().add(NOTIFICATION_QUEUE, payload, notificationTime);
        log.info("Scheduling notification: {} | Added to Redis: {}", payload, added);
    }

    @Scheduled(fixedRate = 60000)
    public void processDueNotifications() {
        long now = System.currentTimeMillis();
        ZSetOperations<String, Object> zSetOps = redisTemplate.opsForZSet();
        Set<Object> dueNotifications = zSetOps.rangeByScore(NOTIFICATION_QUEUE, 0, now);

        if (dueNotifications != null && !dueNotifications.isEmpty()) {
            for (Object obj : dueNotifications) {
                NotificationPayload payload = convertToPayload(obj);

                if (payload == null) {
                    log.warn("Failed to convert object from Redis to NotificationPayload: {}", obj);
                    continue;
                }

                Notification notification = Notification.builder()
                        .user(User.builder().id(payload.getUserId()).build())
                        .task(Task.builder().task_id(payload.getTaskId()).build())
                        .title("Upcoming Task")
                        .message("You have an upcoming task: " + payload.getTaskTitle())
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build();

                notificationRepository.save(notification);

                zSetOps.remove(NOTIFICATION_QUEUE, obj);
                log.info("Processed and removed notification: {}", payload);
            }
        } else {
            log.info("No due notifications at {}", LocalDateTime.now());
        }
    }

    // Helper to safely cast or convert to NotificationPayload
    private NotificationPayload convertToPayload(Object obj) {
        if (obj instanceof NotificationPayload) {
            return (NotificationPayload) obj;
        }
        try {
            // If using JSON, Jackson should handle this, but fallback just in case
            // You can use ObjectMapper here if needed
            return null;
        } catch (Exception e) {
            log.error("Error converting object from Redis: {}", e.getMessage());
            return null;
        }
    }

    public List<Notification> getUserNotifications(User user) {
        return notificationRepository.findByUserAndIsReadFalse(user);
    }

    public void markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class NotificationPayload implements Serializable {
        private Long userId;
        private Long taskId;
        private String taskTitle;

        @Override
        public String toString() {
            return "NotificationPayload{" +
                    "userId=" + userId +
                    ", taskId=" + taskId +
                    ", taskTitle='" + taskTitle + '\'' +
                    '}';
        }
    }
}
