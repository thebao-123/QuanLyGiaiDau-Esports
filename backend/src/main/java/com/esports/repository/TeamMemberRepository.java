package com.esports.repository;

import com.esports.entity.TeamMember;
import com.esports.entity.TeamMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TeamMemberRepository extends JpaRepository<TeamMember, TeamMemberId> {
    List<TeamMember> findByTeam_TeamId(Long teamId);
    long countByTeam_TeamId(Long teamId);
}