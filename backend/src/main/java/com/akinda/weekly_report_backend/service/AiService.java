package com.akinda.weekly_report_backend.service;

import com.akinda.weekly_report_backend.entity.WeeklyReport;
import com.akinda.weekly_report_backend.repository.WeeklyReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AiService {

    private final WeeklyReportRepository weeklyReportRepository;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public String getChatResponse(String message, LocalDate weekStart) {
        // If weekStart is null, default to current week start
        if (weekStart == null) {
            LocalDate today = LocalDate.now();
            weekStart = today.minusDays(today.getDayOfWeek().getValue() - 1);
        }
        LocalDate weekEnd = weekStart.plusDays(6);

        // Fetch reports for context
        List<WeeklyReport> reports = weeklyReportRepository.findByWeekStartAndWeekEnd(weekStart, weekEnd);

        // Build context string
        StringBuilder context = new StringBuilder();
        context.append("Team Weekly Reports for the week starting ").append(weekStart).append(":\n\n");
        if (reports.isEmpty()) {
            context.append("No reports submitted for this week yet.\n");
        } else {
            for (WeeklyReport r : reports) {
                if (r.getStatus() == com.akinda.weekly_report_backend.entity.ReportStatus.SUBMITTED) {
                    context.append("Team Member: ").append(r.getUser().getName())
                            .append(" (Email: ").append(r.getUser().getEmail()).append(")\n")
                            .append("Project: ").append(r.getProject().getName()).append("\n")
                            .append("Tasks Completed: ").append(r.getTasksCompleted()).append("\n")
                            .append("Tasks Planned Next Week: ").append(r.getTasksPlanned()).append("\n")
                            .append("Blockers/Challenges: ").append(r.getBlockers() != null ? r.getBlockers() : "None").append("\n")
                            .append("Hours Worked: ").append(r.getHoursWorked() != null ? r.getHoursWorked() : "Not specified").append("\n")
                            .append("Notes: ").append(r.getNotes() != null ? r.getNotes() : "None").append("\n")
                            .append("--------------------------------------------------\n");
                }
            }
        }

        String systemPrompt = "You are a professional full-stack Team AI Manager assistant. "
                + "You have access to the weekly reports of the team for the week of " + weekStart + " to " + weekEnd + ".\n"
                + "Analyze the team activity, answer questions, generate summaries, and identify blockers or imbalances.\n"
                + "Keep your answers structured, concise, and professional using markdown. "
                + "If there is no information in the reports to answer the user's question, state that politely.\n\n"
                + "Reports Context:\n" + context.toString() + "\n\n"
                + "User Question: " + message;

        // Call Gemini API
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Construct payload manually to avoid extra libraries
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", systemPrompt);

            Map<String, Object> partsMap = new HashMap<>();
            partsMap.put("parts", List.of(textPart));

            Map<String, Object> contentsMap = new HashMap<>();
            contentsMap.put("contents", List.of(partsMap));

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(contentsMap, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map body = response.getBody();
                List candidates = (List) body.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map firstCandidate = (Map) candidates.get(0);
                    Map content = (Map) firstCandidate.get("content");
                    if (content != null) {
                        List parts = (List) content.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            Map firstPart = (Map) parts.get(0);
                            return (String) firstPart.get("text");
                        }
                    }
                }
            }
            return "Unable to parse AI response. Please check backend logs.";
        } catch (Exception e) {
            // Fallback mock response in case of API failure or offline mode
            return "### 🤖 AI assistant Analysis (Fallback Mode)\n\n"
                    + "I couldn't contact the Gemini service directly (Error: " + e.getMessage() + "), but here is a quick rule-based breakdown of the team's data:\n\n"
                    + "* **Submissions:** " + reports.stream().filter(r -> r.getStatus() == com.akinda.weekly_report_backend.entity.ReportStatus.SUBMITTED).count() + " submitted reports.\n"
                    + "* **Blockers:** " + reports.stream().filter(r -> r.getBlockers() != null && !r.getBlockers().trim().isEmpty()).count() + " reports with blockers.\n"
                    + "* **Hours Logged:** " + reports.stream().mapToDouble(r -> r.getHoursWorked() != null ? r.getHoursWorked() : 0.0).sum() + " hours total.";
        }
    }
}
