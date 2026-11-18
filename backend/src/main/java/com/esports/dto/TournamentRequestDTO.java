package com.esports.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class TournamentRequestDTO {
    private Long gameId;
    private Long organizerId;
    private String tournamentName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer maxTeams;
}