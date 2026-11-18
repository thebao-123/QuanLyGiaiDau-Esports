package com.esports.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "team_members")
@Data
public class TeamMember {
    @EmbeddedId
    private TeamMemberId id;

    @ManyToOne
    @MapsId("teamId")
    @JoinColumn(name = "team_id")
    private Team team;

    @ManyToOne
    @MapsId("playerId")
    @JoinColumn(name = "player_id")
    private Player player;

    @Column(name = "member_role", nullable = false, length = 30)
    private String memberRole = "MAIN";

    @Column(name = "joined_at", insertable = false, updatable = false)
    private LocalDateTime joinedAt;
}