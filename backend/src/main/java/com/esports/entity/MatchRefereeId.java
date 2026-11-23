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
public class MatchRefereeId implements Serializable {
    @Column(name = "match_id")
    private Long matchId;

    @Column(name = "referee_user_id")
    private Long refereeUserId;
}
