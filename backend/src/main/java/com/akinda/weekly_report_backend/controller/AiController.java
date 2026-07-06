package com.akinda.weekly_report_backend.controller;

import com.akinda.weekly_report_backend.dto.AiChatRequest;
import com.akinda.weekly_report_backend.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/chat")
    public String getChatResponse(@RequestBody AiChatRequest req) {
        return aiService.getChatResponse(req.getMessage(), req.getWeekStart());
    }
}
