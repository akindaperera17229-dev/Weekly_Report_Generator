package com.akinda.weekly_report_backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AiChatRequest {
    private String message;
    private LocalDate weekStart;
}
