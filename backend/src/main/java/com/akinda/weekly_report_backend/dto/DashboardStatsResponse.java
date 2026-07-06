package com.akinda.weekly_report_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class DashboardStatsResponse {
    private long totalMembers;
    private long submittedCount;
    private long pendingCount;
    private double complianceRate;
    private long openBlockersCount;
    private List<ProjectDistribution> projectDistribution;
    private List<WeeklyTrend> weeklyTrend;
    private List<MemberSubmissionStatus> memberStatuses;
    private List<RecentActivity> recentActivities;

    @Data
    @AllArgsConstructor
    public static class ProjectDistribution {
        private String projectName;
        private long reportCount;
        private double totalHours;
    }

    @Data
    @AllArgsConstructor
    public static class WeeklyTrend {
        private String weekLabel;
        private long submittedCount;
        private double totalHours;
    }

    @Data
    @AllArgsConstructor
    public static class MemberSubmissionStatus {
        private Long userId;
        private String userName;
        private String status; // "SUBMITTED", "PENDING", "DRAFT"
        private String submittedAt;
    }

    @Data
    @AllArgsConstructor
    public static class RecentActivity {
        private String userName;
        private String projectName;
        private String weekLabel;
        private String status;
        private String submittedAt;
    }
}
