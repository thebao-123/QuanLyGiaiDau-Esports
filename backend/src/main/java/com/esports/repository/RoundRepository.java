package com.esports.repository;

import com.esports.entity.Round;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoundRepository extends JpaRepository<Round, Long> {
    @Override
    @EntityGraph(attributePaths = "stage.tournament")
    List<Round> findAll();

    @Override
    @EntityGraph(attributePaths = "stage.tournament")
    Optional<Round> findById(Long roundId);

    @EntityGraph(attributePaths = "stage.tournament")
    List<Round> findByStage_StageId(Long stageId);

    @EntityGraph(attributePaths = "stage.tournament")
    List<Round> findByStage_StageIdOrderByRoundNumberAsc(Long stageId);

    @EntityGraph(attributePaths = "stage.tournament")
    Optional<Round> findByStage_StageIdAndRoundNumber(Long stageId, Integer roundNumber);

    @EntityGraph(attributePaths = "stage.tournament")
    List<Round> findByRoundStatus(String roundStatus);

    boolean existsByStage_StageIdAndRoundNumber(Long stageId, Integer roundNumber);

    long countByStage_StageId(Long stageId);

    // Kiểm tra dữ liệu trận thuộc vòng mà không thay đổi MatchRepository.
    @Query("select count(m) from Match m where m.round.roundId = :roundId")
    long countMatchesByRoundId(@Param("roundId") Long roundId);
}
