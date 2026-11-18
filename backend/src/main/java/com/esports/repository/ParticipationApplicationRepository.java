package com.esports.repository;

import com.esports.entity.ParticipationApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ParticipationApplicationRepository extends JpaRepository<ParticipationApplication, Long> {
    List<ParticipationApplication> findByTournament_TournamentId(Long tournamentId);
    boolean existsByTournament_TournamentIdAndTeam_TeamId(Long tournamentId, Long teamId);
    boolean existsByTeam_TeamIdAndApplicationStatus(Long teamId, String status);

    @Query("""
        SELECT pa.team.country,
               COUNT(pa),
               SUM(CASE WHEN pa.applicationStatus IN ('APPROVED', 'ROSTER_LOCKED') THEN 1 ELSE 0 END)
        FROM ParticipationApplication pa
        WHERE pa.tournament.tournamentId = :tournamentId
        GROUP BY pa.team.country
    """)
    List<Object[]> summarizeRegionSlotsByTournament(Long tournamentId);
}