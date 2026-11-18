package com.esports.dto;

import lombok.Data;

@Data
public class UserRequestDTO {
    private String fullName;
    private String email;
    private String password;
    private String phone;
    private String role;
    private String accountStatus;
}