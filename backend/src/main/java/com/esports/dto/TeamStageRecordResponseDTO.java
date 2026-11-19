package com.esports.dto;

import lombok.Data;

@Data
public class TeamStageRecordResponseDTO
{
    private Long teamStageRecordId;
    private Long stageId;
    private Long teamId;
    private Integer seedNumber;
    private Integer wins;
    private Integer losses;
    private String stageTeamStatus;
}