package com.akinda.weekly_report_backend.dto;

import lombok.*;

@Data @AllArgsConstructor
public class AuthResponse {
    private String token;
    private String name;
    private String email;
    private String role;
}