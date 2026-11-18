package com.esports.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamMemberId implements Serializable {
    @Column(name = "team_id")
    private Long teamId;

    @Column(name = "player_id")
    private Long playerId;
}