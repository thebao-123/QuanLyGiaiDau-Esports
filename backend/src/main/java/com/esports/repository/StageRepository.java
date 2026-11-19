package com.esports.repository;

import com.esports.entity.Stage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StageRepository extends JpaRepository<Stage, Long>
{
    List<Stage> findByTournament_TournamentId(Long tournamentId);

    List<Stage> findByStageType(String stageType);

    List<Stage> findByStageStatus(String stageStatus);

    List<Stage> findByTournament_TournamentIdOrderByStageOrderAsc(Long tournamentId);

    boolean existsByTournament_TournamentIdAndStageName(Long tournamentId, String stageName);
}