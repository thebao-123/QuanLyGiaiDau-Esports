package com.esports.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "match_results")
@Data
public class MatchResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "result_id")
    private Long resultId;

    @OneToOne
    @JoinColumn(name = "match_id", nullable = false, unique = true)
    private Match match;

    @Column(name = "team1_score", nullable = false)
    private Integer team1Score;

    @Column(name = "team2_score", nullable = false)
    private Integer team2Score;

    @ManyToOne
    @JoinColumn(name = "winner_team_id")
    private Team winner;

    /** DRAFT, SUBMITTED, CONFIRMED */
    @Column(name = "result_status", nullable = false, length = 20)
    private String resultStatus = "DRAFT";

    @ManyToOne
    @JoinColumn(name = "entered_by")
    private User enteredBy;

    @ManyToOne
    @JoinColumn(name = "confirmed_by")
    private User confirmedBy;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(length = 500)
    private String note;
}
