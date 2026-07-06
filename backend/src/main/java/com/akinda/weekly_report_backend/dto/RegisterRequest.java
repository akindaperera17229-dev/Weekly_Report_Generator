package com.akinda.weekly_report_backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest{
    @NotBlank private String name;
    @Email @NotBlank private String email;
    @NotBlank @Size(min = 6) private String password;
    @NotBlank private String role;

}