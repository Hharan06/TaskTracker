package com.hr.TaskTracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.hr.TaskTracker.model.Task;
import com.hr.TaskTracker.model.User;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUser(User user);


}

