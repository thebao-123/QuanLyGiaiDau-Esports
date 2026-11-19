package com.esports.dto;

import lombok.Data;

@Data
public class TeamStageRecordRequestDTO
{
    private Long teamId;
    private Integer seedNumber;
    private String stageTeamStatus;
}