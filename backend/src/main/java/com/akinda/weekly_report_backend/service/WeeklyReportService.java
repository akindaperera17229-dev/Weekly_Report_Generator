package com.akinda.weekly_report_backend.service;

import com.akinda.weekly_report_backend.dto.WeeklyReportRequest;
import com.akinda.weekly_report_backend.dto.WeeklyReportResponse;
import com.akinda.weekly_report_backend.entity.*;
import com.akinda.weekly_report_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WeeklyReportService {

    private final WeeklyReportRepository weeklyReportRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    @Transactional
    public WeeklyReportResponse saveOrSubmitReport(String email, WeeklyReportRequest req) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = projectRepository.findById(req.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        ReportStatus status = ReportStatus.valueOf(req.getStatus());

        // Check if there is an existing report for this user, project, and week range to update it
        // Or if it's draft, we can update. To make it simple, we search if a report for this week and project exists.
        // Usually, a user submits one report per week. Let's find if a report exists for user and weekStart.
        List<WeeklyReport> existing = weeklyReportRepository.findByUserIdOrderByWeekStartDesc(user.getId());
        WeeklyReport report = existing.stream()
                .filter(r -> r.getWeekStart().equals(req.getWeekStart()) && r.getWeekEnd().equals(req.getWeekEnd()))
                .findFirst()
                .orElse(null);

        if (report == null) {
            report = new WeeklyReport();
            report.setUser(user);
        } else {
            // If already submitted, prevent editing unless needed. But assignment says "edit report (before/after submission, as per your design)".
            // Let's allow editing drafts, and let managers edit, or let users edit before/after as long as they resubmit.
            // Let's just allow updates.
        }

        report.setProject(project);
        report.setWeekStart(req.getWeekStart());
        report.setWeekEnd(req.getWeekEnd());
        report.setTasksCompleted(req.getTasksCompleted());
        report.setTasksPlanned(req.getTasksPlanned());
        report.setBlockers(req.getBlockers());
        report.setHoursWorked(req.getHoursWorked());
        report.setNotes(req.getNotes());
        report.setStatus(status);

        if (status == ReportStatus.SUBMITTED) {
            report.setSubmittedAt(LocalDateTime.now());
        }

        WeeklyReport saved = weeklyReportRepository.save(report);
        return new WeeklyReportResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<WeeklyReportResponse> getMyReports(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return weeklyReportRepository.findByUserIdOrderByWeekStartDesc(user.getId())
                .stream()
                .map(WeeklyReportResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WeeklyReportResponse> getFilteredReports(Long userId, Long projectId, LocalDate start, LocalDate end, String statusStr) {
        ReportStatus status = null;
        if (statusStr != null && !statusStr.trim().isEmpty() && !statusStr.equalsIgnoreCase("null")) {
            try {
                status = ReportStatus.valueOf(statusStr.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Ignore invalid status mapping
            }
        }
        return weeklyReportRepository.findFilteredReports(userId, projectId, start, end, status)
                .stream()
                .map(WeeklyReportResponse::new)
                .collect(Collectors.toList());
    }
}
