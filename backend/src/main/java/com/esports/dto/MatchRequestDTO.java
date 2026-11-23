package com.esports.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MatchRequestDTO {
    private Long roundId;
    private Long team1Id;
    private Long team2Id;
    private String matchCode;
    private LocalDateTime scheduledTime;
    private String venue;
    private Integer bestOf;
}
