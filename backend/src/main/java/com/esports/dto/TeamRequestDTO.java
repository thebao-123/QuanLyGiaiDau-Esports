package com.esports.dto;

import lombok.Data;

@Data
public class TeamRequestDTO {
    private Long captainUserId;
    private String teamName;
    private String teamTag;
    private String country;
}