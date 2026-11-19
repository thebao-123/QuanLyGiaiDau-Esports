package com.esports.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "stages")
@Data
public class Stage
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stage_id")
    private Long stageId;

    @ManyToOne
    @JoinColumn(name = "tournament_id", nullable = false)
    private Tournament tournament;

    @Column(name = "stage_name", nullable = false, length = 100)
    private String stageName;

    @Column(name = "stage_type", nullable = false, length = 20)
    private String stageType;
    /* Gồm các giá trị:
       QUALIFIER
       PLAY_IN
       GROUP_STAGE
       SWISS_STAGE
       LEAGUE_STAGE
       PLAYOFF */

    @Column(name = "stage_order", nullable = false)
    private Integer stageOrder;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "stage_status", nullable = false, length = 20)
    private String stageStatus;
}