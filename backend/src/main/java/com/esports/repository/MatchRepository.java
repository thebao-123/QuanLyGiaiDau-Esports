package com.esports.repository;

import com.esports.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {
    List<Match> findByRound_RoundIdOrderByScheduledTimeAsc(Long roundId);

    List<Match> findByMatchStatusOrderByScheduledTimeAsc(String matchStatus);

    boolean existsByMatchCode(String matchCode);

    boolean existsByMatchCodeAndMatchIdNot(String matchCode, Long matchId);

    /** Trận của một đội trong khoảng thời gian (dùng kiểm tra trùng lịch). */
    @Query("select m from Match m where (m.team1.teamId = :teamId or m.team2.teamId = :teamId) "
            + "and m.scheduledTime between :from and :to and m.matchId <> :excludeId")
    List<Match> findTeamConflicts(@Param("teamId") Long teamId, @Param("from") LocalDateTime from,
                                  @Param("to") LocalDateTime to, @Param("excludeId") Long excludeId);

    @Query("select m from Match m where m.venue = :venue "
            + "and m.scheduledTime between :from and :to and m.matchId <> :excludeId")
    List<Match> findVenueConflicts(@Param("venue") String venue, @Param("from") LocalDateTime from,
                                   @Param("to") LocalDateTime to, @Param("excludeId") Long excludeId);

    @Query("select mr.match from MatchReferee mr where mr.referee.userId = :refereeId "
            + "and mr.match.scheduledTime between :from and :to and mr.match.matchId <> :excludeId")
    List<Match> findRefereeConflicts(@Param("refereeId") Long refereeId, @Param("from") LocalDateTime from,
                                     @Param("to") LocalDateTime to, @Param("excludeId") Long excludeId);

    @Query("select mr.match from MatchReferee mr where mr.referee.userId = :refereeId order by mr.match.scheduledTime")
    List<Match> findByReferee(@Param("refereeId") Long refereeId);
}
