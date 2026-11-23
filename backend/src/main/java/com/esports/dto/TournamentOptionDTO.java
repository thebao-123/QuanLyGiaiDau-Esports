package com.esports.dto;

import com.esports.entity.Tournament;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TournamentOptionDTO {
    private Long tournamentId;
    private String tournamentName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String tournamentStatus;

    public static TournamentOptionDTO from(Tournament tournament) {
        TournamentOptionDTO dto = new TournamentOptionDTO();
        dto.setTournamentId(tournament.getTournamentId());
        dto.setTournamentName(tournament.getTournamentName());
        dto.setStartDate(tournament.getStartDate());
        dto.setEndDate(tournament.getEndDate());
        dto.setTournamentStatus(tournament.getTournamentStatus());
        return dto;
    }
}
