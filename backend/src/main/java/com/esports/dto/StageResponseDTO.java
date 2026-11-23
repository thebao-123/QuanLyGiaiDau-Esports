package com.esports.dto;

import com.esports.entity.Stage;
import lombok.Data;

import java.time.LocalDateTime;

/** Dữ liệu trả về của Giai đoạn, không để lộ thông tin tài khoản người tổ chức. */
@Data
public class StageResponseDTO {
    private Long stageId;
    private Long tournamentId;
    private String tournamentName;
    private String stageName;
    private String stageType;
    private Integer stageOrder;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String stageStatus;

    public static StageResponseDTO from(Stage stage) {
        StageResponseDTO dto = new StageResponseDTO();
        dto.setStageId(stage.getStageId());
        dto.setTournamentId(stage.getTournament().getTournamentId());
        dto.setTournamentName(stage.getTournament().getTournamentName());
        dto.setStageName(stage.getStageName());
        dto.setStageType(stage.getStageType());
        dto.setStageOrder(stage.getStageOrder());
        dto.setStartDate(stage.getStartDate());
        dto.setEndDate(stage.getEndDate());
        dto.setStageStatus(stage.getStageStatus());
        return dto;
    }
}
