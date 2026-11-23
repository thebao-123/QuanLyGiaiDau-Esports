package com.esports.repository;

import com.esports.entity.MatchReferee;
import com.esports.entity.MatchRefereeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchRefereeRepository extends JpaRepository<MatchReferee, MatchRefereeId> {
    List<MatchReferee> findByMatch_MatchId(Long matchId);
}
