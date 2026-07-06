package com.akinda.weekly_report_backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class WeeklyReportRequest {
    @NotNull
    private Long projectId;

    @NotNull
    private LocalDate weekStart;

    @NotNull
    private LocalDate weekEnd;

    private String tasksCompleted;
    private String tasksPlanned;
    private String blockers;
    private Double hoursWorked;
    private String notes;

    @NotNull
    private String status; // "DRAFT" or "SUBMITTED"
}
