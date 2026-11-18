package com.esports.dto;

import lombok.Data;

@Data
public class RosterMemberDTO {
    private String playerName;
    private String inGameName;
    private String gameAccountId;
    private String memberRole;
}