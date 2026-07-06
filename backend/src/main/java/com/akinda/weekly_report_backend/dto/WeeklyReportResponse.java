package com.akinda.weekly_report_backend.dto;

import com.akinda.weekly_report_backend.entity.WeeklyReport;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class WeeklyReportResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long projectId;
    private String projectName;
    private LocalDate weekStart;
    private LocalDate weekEnd;
    private String tasksCompleted;
    private String tasksPlanned;
    private String blockers;
    private Double hoursWorked;
    private String notes;
    private String status;
    private LocalDateTime submittedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public WeeklyReportResponse(WeeklyReport report) {
        this.id = report.getId();
        this.userId = report.getUser().getId();
        this.userName = report.getUser().getName();
        this.userEmail = report.getUser().getEmail();
        this.projectId = report.getProject().getId();
        this.projectName = report.getProject().getName();
        this.weekStart = report.getWeekStart();
        this.weekEnd = report.getWeekEnd();
        this.tasksCompleted = report.getTasksCompleted();
        this.tasksPlanned = report.getTasksPlanned();
        this.blockers = report.getBlockers();
        this.hoursWorked = report.getHoursWorked();
        this.notes = report.getNotes();
        this.status = report.getStatus().name();
        this.submittedAt = report.getSubmittedAt();
        this.createdAt = report.getCreatedAt();
        this.updatedAt = report.getUpdatedAt();
    }
}
