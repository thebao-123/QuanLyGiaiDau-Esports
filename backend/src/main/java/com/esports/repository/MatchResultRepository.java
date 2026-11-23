package com.esports.repository;

import com.esports.entity.MatchResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchResultRepository extends JpaRepository<MatchResult, Long> {
    Optional<MatchResult> findByMatch_MatchId(Long matchId);

    List<MatchResult> findByResultStatus(String resultStatus);
}
