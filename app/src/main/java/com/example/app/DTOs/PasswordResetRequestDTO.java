package com.example.app.DTOs;

import lombok.Data;

@Data
public class PasswordResetRequestDTO {
    private String emailOrPhone; // Can be email or phone number
    private boolean requestAdmin; // True if user wants to contact admin

    public PasswordResetRequestDTO() {
    }

    public String getEmailOrPhone() {
        return emailOrPhone;
    }

    public void setEmailOrPhone(String emailOrPhone) {
        this.emailOrPhone = emailOrPhone;
    }

    public boolean isRequestAdmin() {
        return requestAdmin;
    }

    public void setRequestAdmin(boolean requestAdmin) {
        this.requestAdmin = requestAdmin;
    }

    public PasswordResetRequestDTO(String emailOrPhone, boolean requestAdmin) {
        this.emailOrPhone = emailOrPhone;
        this.requestAdmin = requestAdmin;
    }
}
