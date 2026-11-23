package com.esports.repository;

import com.esports.entity.Stage;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StageRepository extends JpaRepository<Stage, Long> {
    @Override
    @EntityGraph(attributePaths = "tournament")
    List<Stage> findAll();

    @Override
    @EntityGraph(attributePaths = "tournament")
    Optional<Stage> findById(Long stageId);

    @EntityGraph(attributePaths = "tournament")
    List<Stage> findByTournament_TournamentId(Long tournamentId);

    @EntityGraph(attributePaths = "tournament")
    List<Stage> findByStageType(String stageType);

    @EntityGraph(attributePaths = "tournament")
    List<Stage> findByStageStatus(String stageStatus);

    @EntityGraph(attributePaths = "tournament")
    List<Stage> findByTournament_TournamentIdOrderByStageOrderAsc(Long tournamentId);

    boolean existsByTournament_TournamentIdAndStageName(Long tournamentId, String stageName);
}
