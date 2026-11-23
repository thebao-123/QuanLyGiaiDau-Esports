package com.esports.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "match_referees")
@Data
public class MatchReferee {
    @EmbeddedId
    private MatchRefereeId id;

    @ManyToOne
    @MapsId("matchId")
    @JoinColumn(name = "match_id")
    private Match match;

    @ManyToOne
    @MapsId("refereeUserId")
    @JoinColumn(name = "referee_user_id")
    private User referee;

    @Column(name = "assigned_at", insertable = false, updatable = false)
    private LocalDateTime assignedAt;
}
