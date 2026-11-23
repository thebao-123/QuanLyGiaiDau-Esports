package com.esports.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class RoundRequestDTO
{
    private Long stageId;
    private Integer roundNumber;
    private String roundName;
    private LocalDateTime scheduledStart;
    private String roundStatus;
}