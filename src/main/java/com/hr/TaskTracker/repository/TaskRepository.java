package com.hr.TaskTracker.repository;

import com.hr.TaskTracker.model.Task;
import com.hr.TaskTracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUser(User user);
}
