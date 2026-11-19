package com.esports.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "team_stage_records")
@Data
public class TeamStageRecord
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "team_stage_record_id")
    private Long teamStageRecordId;

    @ManyToOne
    @JoinColumn(name = "stage_id", nullable = false)
    private Stage stage;

    @ManyToOne
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @Column(name = "seed_number")
    private Integer seedNumber;

    @Column(name = "wins", nullable = false)
    private Integer wins = 0;

    @Column(name = "losses", nullable = false)
    private Integer losses = 0;

    @Column(name = "stage_team_status", nullable = false, length = 20)
    private String stageTeamStatus;
}