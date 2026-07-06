package com.akinda.weekly_report_backend.controller;

import com.akinda.weekly_report_backend.dto.WeeklyReportRequest;
import com.akinda.weekly_report_backend.dto.WeeklyReportResponse;
import com.akinda.weekly_report_backend.service.WeeklyReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class WeeklyReportController {

    private final WeeklyReportService weeklyReportService;

    @PostMapping
    public WeeklyReportResponse saveOrSubmitReport(Principal principal, @Valid @RequestBody WeeklyReportRequest req) {
        return weeklyReportService.saveOrSubmitReport(principal.getName(), req);
    }

    @GetMapping("/my-history")
    public List<WeeklyReportResponse> getMyReports(Principal principal) {
        return weeklyReportService.getMyReports(principal.getName());
    }

    @GetMapping("/team")
    public List<WeeklyReportResponse> getTeamReports(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String status) {
        return weeklyReportService.getFilteredReports(userId, projectId, startDate, endDate, status);
    }
}
