package com.esports.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "matches")
@Data
public class Match {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "match_id")
    private Long matchId;

    @ManyToOne
    @JoinColumn(name = "round_id", nullable = false)
    private Round round;

    @ManyToOne
    @JoinColumn(name = "team1_id", nullable = false)
    private Team team1;

    @ManyToOne
    @JoinColumn(name = "team2_id", nullable = false)
    private Team team2;

    @Column(name = "match_code", nullable = false, unique = true, length = 30)
    private String matchCode;

    @Column(name = "scheduled_time")
    private LocalDateTime scheduledTime;

    @Column(length = 100)
    private String venue;

    /** Thể thức: 1 (BO1), 3 (BO3) hoặc 5 (BO5). */
    @Column(name = "best_of", nullable = false)
    private Integer bestOf = 3;

    /** SCHEDULED, READY, IN_PROGRESS, PENDING_CONFIRMATION, COMPLETED */
    @Column(name = "match_status", nullable = false, length = 30)
    private String matchStatus = "SCHEDULED";

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
