package com.esports.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
public class StageRequestDTO
{
    private Long tournamentId;
    private String stageName;
    private String stageType;
    private Integer stageOrder;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String stageStatus;
}