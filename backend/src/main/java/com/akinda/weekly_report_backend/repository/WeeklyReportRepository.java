package com.akinda.weekly_report_backend.repository;

import com.akinda.weekly_report_backend.entity.WeeklyReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.akinda.weekly_report_backend.entity.ReportStatus;
import java.time.LocalDate;
import java.util.List;

public interface WeeklyReportRepository extends JpaRepository<WeeklyReport, Long> {
    List<WeeklyReport> findByUserIdOrderByWeekStartDesc(Long userId);

    List<WeeklyReport> findByWeekStartAndWeekEnd(LocalDate weekStart, LocalDate weekEnd);

    List<WeeklyReport> findByUserIdAndProjectId(Long userId, Long projectId);

    List<WeeklyReport> findByWeekStartBetween(LocalDate start, LocalDate end);

    @Query("SELECT r FROM WeeklyReport r JOIN FETCH r.user JOIN FETCH r.project " +
           "WHERE (:userId IS NULL OR r.user.id = :userId) " +
           "AND (:projectId IS NULL OR r.project.id = :projectId) " +
           "AND (:startDate IS NULL OR r.weekStart >= :startDate) " +
           "AND (:endDate IS NULL OR r.weekEnd <= :endDate) " +
           "AND (:status IS NULL OR r.status = :status) " +
           "ORDER BY r.weekStart DESC")
    List<WeeklyReport> findFilteredReports(
            @Param("userId") Long userId,
            @Param("projectId") Long projectId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("status") ReportStatus status);
}