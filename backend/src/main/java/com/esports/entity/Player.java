package com.esports.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "players")
@Data
public class Player {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "player_id")
    private Long playerId;

    @Column(name = "player_name", nullable = false, length = 100)
    private String playerName;

    @Column(name = "in_game_name", nullable = false, length = 100)
    private String inGameName;

    @Column(name = "game_account_id", nullable = false, length = 100)
    private String gameAccountId;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}