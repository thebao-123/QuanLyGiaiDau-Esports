package com.esports.dto;

import com.esports.entity.Round;
import lombok.Data;

import java.time.LocalDateTime;

/** Dữ liệu trả về của Vòng đấu, chỉ chứa các trường cần cho giao diện Lịch thi đấu. */
@Data
public class RoundResponseDTO {
    private Long roundId;
    private Long stageId;
    private String stageName;
    private Long tournamentId;
    private String tournamentName;
    private Integer roundNumber;
    private String roundName;
    private LocalDateTime scheduledStart;
    private String roundStatus;

    public static RoundResponseDTO from(Round round) {
        RoundResponseDTO dto = new RoundResponseDTO();
        dto.setRoundId(round.getRoundId());
        dto.setStageId(round.getStage().getStageId());
        dto.setStageName(round.getStage().getStageName());
        dto.setTournamentId(round.getStage().getTournament().getTournamentId());
        dto.setTournamentName(round.getStage().getTournament().getTournamentName());
        dto.setRoundNumber(round.getRoundNumber());
        dto.setRoundName(round.getRoundName());
        dto.setScheduledStart(round.getScheduledStart());
        dto.setRoundStatus(round.getRoundStatus());
        return dto;
    }
}
