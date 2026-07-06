package com.akinda.weekly_report_backend.repository;

import com.akinda.weekly_report_backend.entity.WeeklyReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface WeeklyReportRepository extends JpaRepository<WeeklyReport, Long> {
    List<WeeklyReport> findByUserIdOrderByWeekStartDesc(Long userId);

    List<WeeklyReport> findByWeekStartAndWeekEnd(LocalDate weekStart, LocalDate weekEnd);

    List<WeeklyReport> findByUserIdAndProjectId(Long userId, Long projectId);

    List<WeeklyReport> findByWeekStartBetween(LocalDate start, LocalDate end);

}