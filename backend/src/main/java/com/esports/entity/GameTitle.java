package com.esports.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "game_titles")
@Data
public class GameTitle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "game_id")
    private Long gameId;

    @Column(name = "game_name", nullable = false, length = 100)
    private String gameName;

    @Column(length = 100)
    private String publisher;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}