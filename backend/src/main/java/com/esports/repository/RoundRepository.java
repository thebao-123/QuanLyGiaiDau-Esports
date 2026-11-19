package com.esports.repository;

import com.esports.entity.Round;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoundRepository extends JpaRepository<Round, Long>
{
    List<Round> findByStage_StageId(Long stageId);

    List<Round> findByStage_StageIdOrderByRoundNumberAsc(Long stageId);

    Optional<Round> findByStage_StageIdAndRoundNumber(Long stageId, Integer roundNumber);

    List<Round> findByRoundStatus(Integer roundStatus);

    boolean existsByStage_StageIdAndRoundNumber(Long stageId, Integer roundNumber);

    long countByStage_StageId(Long stageId);
}