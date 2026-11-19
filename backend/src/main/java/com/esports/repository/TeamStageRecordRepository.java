package com.esports.repository;

import com.esports.entity.TeamStageRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamStageRecordRepository
        extends JpaRepository<TeamStageRecord, Long>
{
    List<TeamStageRecord> findByStage_StageIdOrderBySeedNumberAsc(Long stageId);

    List<TeamStageRecord> findByStage_StageIdOrderByWinsDescLossesAscSeedNumberAsc(Long stageId);

    Optional<TeamStageRecord> findByStage_StageIdAndTeam_TeamId(Long stageId, Long teamId);

    List<TeamStageRecord> findByTeam_TeamId(Long teamId);

    boolean existsByStage_StageIdAndTeam_TeamId(Long stageId, Long teamId);

    boolean existsByStage_StageIdAndSeedNumber(Long stageId, Integer seedNumber);

    boolean existsByStage_StageIdAndSeedNumberAndTeamStageRecordIdNot(Long stageId, Integer seedNumber, Long teamStageRecordId);

    List<TeamStageRecord> findByStage_StageIdAndStageTeamStatus(Long stageId, String stageTeamStatus);

    long countByStage_StageId(Long stageId);
}