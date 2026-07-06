package com.akinda.weekly_report_backend.service;

import com.akinda.weekly_report_backend.dto.DashboardStatsResponse;
import com.akinda.weekly_report_backend.entity.*;
import com.akinda.weekly_report_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final WeeklyReportRepository weeklyReportRepository;
    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(LocalDate weekStart) {
        // If weekStart is null, default to the start of the current week (Monday)
        if (weekStart == null) {
            LocalDate today = LocalDate.now();
            weekStart = today.minusDays(today.getDayOfWeek().getValue() - 1);
        }
        LocalDate weekEnd = weekStart.plusDays(6);

        // 1. Get all team members
        List<User> teamMembers = userRepository.findByRole(Role.TEAM_MEMBER);
        long totalMembers = teamMembers.size();

        // 2. Get reports for the selected week
        List<WeeklyReport> reportsThisWeek = weeklyReportRepository.findByWeekStartAndWeekEnd(weekStart, weekEnd);

        long submittedCount = reportsThisWeek.stream()
                .filter(r -> r.getStatus() == ReportStatus.SUBMITTED)
                .count();

        long pendingCount = totalMembers - submittedCount;
        double complianceRate = totalMembers > 0 ? ((double) submittedCount / totalMembers) * 100.0 : 0.0;

        long openBlockersCount = reportsThisWeek.stream()
                .filter(r -> r.getStatus() == ReportStatus.SUBMITTED)
                .filter(r -> r.getBlockers() != null && !r.getBlockers().trim().isEmpty())
                .count();

        // 3. Project Distribution (for the selected week)
        Map<Project, List<WeeklyReport>> reportsByProject = reportsThisWeek.stream()
                .filter(r -> r.getStatus() == ReportStatus.SUBMITTED)
                .collect(Collectors.groupingBy(WeeklyReport::getProject));

        List<DashboardStatsResponse.ProjectDistribution> projectDist = projectRepository.findAll().stream()
                .map(proj -> {
                    List<WeeklyReport> reps = reportsByProject.getOrDefault(proj, Collections.emptyList());
                    long count = reps.size();
                    double totalHours = reps.stream()
                            .mapToDouble(r -> r.getHoursWorked() != null ? r.getHoursWorked() : 0.0)
                            .sum();
                    return new DashboardStatsResponse.ProjectDistribution(proj.getName(), count, totalHours);
                })
                .collect(Collectors.toList());

        // 4. Weekly Trend (last 5 weeks including current)
        List<DashboardStatsResponse.WeeklyTrend> trends = new ArrayList<>();
        for (int i = 4; i >= 0; i--) {
            LocalDate targetStart = weekStart.minusWeeks(i);
            LocalDate targetEnd = targetStart.plusDays(6);
            List<WeeklyReport> targetReports = weeklyReportRepository.findByWeekStartAndWeekEnd(targetStart, targetEnd);

            long subCount = targetReports.stream()
                    .filter(r -> r.getStatus() == ReportStatus.SUBMITTED)
                    .count();

            double totalHours = targetReports.stream()
                    .filter(r -> r.getStatus() == ReportStatus.SUBMITTED)
                    .mapToDouble(r -> r.getHoursWorked() != null ? r.getHoursWorked() : 0.0)
                    .sum();

            trends.add(new DashboardStatsResponse.WeeklyTrend(
                    targetStart.toString(),
                    subCount,
                    totalHours
            ));
        }

        // 5. Member Submission Statuses (for the selected week)
        Map<Long, WeeklyReport> memberReportMap = reportsThisWeek.stream()
                .collect(Collectors.toMap(r -> r.getUser().getId(), r -> r, (r1, r2) -> r1));

        List<DashboardStatsResponse.MemberSubmissionStatus> memberStatuses = teamMembers.stream()
                .map(member -> {
                    WeeklyReport rep = memberReportMap.get(member.getId());
                    String status = "PENDING";
                    String submittedAtStr = "-";
                    if (rep != null) {
                        status = rep.getStatus().name();
                        if (rep.getSubmittedAt() != null) {
                            submittedAtStr = rep.getSubmittedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
                        }
                    }
                    return new DashboardStatsResponse.MemberSubmissionStatus(
                            member.getId(),
                            member.getName(),
                            status,
                            submittedAtStr
                    );
                })
                .collect(Collectors.toList());

        // 6. Recent Activities (overall submitted reports)
        List<WeeklyReport> allReports = weeklyReportRepository.findAll();
        List<DashboardStatsResponse.RecentActivity> recentActs = allReports.stream()
                .filter(r -> r.getStatus() == ReportStatus.SUBMITTED)
                .sorted((r1, r2) -> {
                    LocalDateTime t1 = r1.getSubmittedAt() != null ? r1.getSubmittedAt() : r1.getCreatedAt();
                    LocalDateTime t2 = r2.getSubmittedAt() != null ? r2.getSubmittedAt() : r2.getCreatedAt();
                    return t2.compareTo(t1);
                })
                .limit(10)
                .map(r -> {
                    String subAt = r.getSubmittedAt() != null ?
                            r.getSubmittedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) :
                            r.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
                    return new DashboardStatsResponse.RecentActivity(
                            r.getUser().getName(),
                            r.getProject().getName(),
                            r.getWeekStart().toString(),
                            r.getStatus().name(),
                            subAt
                    );
                })
                .collect(Collectors.toList());

        return DashboardStatsResponse.builder()
                .totalMembers(totalMembers)
                .submittedCount(submittedCount)
                .pendingCount(pendingCount)
                .complianceRate(complianceRate)
                .openBlockersCount(openBlockersCount)
                .projectDistribution(projectDist)
                .weeklyTrend(trends)
                .memberStatuses(memberStatuses)
                .recentActivities(recentActs)
                .build();
    }
}
