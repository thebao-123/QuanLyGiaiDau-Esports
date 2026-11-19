package com.esports.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "rounds")
@Data

public class Round
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "round_id")
    private Long roundId;

    @ManyToOne
    @JoinColumn(name = "stage_id", nullable = false)
    private Stage stage;

    @Column(name = "round_number", nullable = false)
    private Integer roundNumber;

    @Column(name = "round_name", length = 100)
    private String roundName;

    @Column(name = "scheduled_start")
    private LocalDateTime scheduledStart;

    @Column(name = "round_status", nullable = false, length = 20)
    private Integer roundStatus;
}