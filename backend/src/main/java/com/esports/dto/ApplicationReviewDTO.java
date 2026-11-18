package com.esports.dto;

import lombok.Data;

@Data
public class ApplicationReviewDTO {
    private Long reviewerUserId;
    private String status;
    private String note;
}