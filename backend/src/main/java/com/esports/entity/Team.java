package com.esports.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "teams")
@Data
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "team_id")
    private Long teamId;

    @ManyToOne
    @JoinColumn(name = "captain_user_id", nullable = false)
    private User captain;

    @Column(name = "team_name", nullable = false, length = 100)
    private String teamName;

    @Column(name = "team_tag", length = 20)
    private String teamTag;

    @Column(length = 50)
    private String country;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}