package com.esports.service;

import com.esports.dto.MatchResultRequestDTO;
import com.esports.entity.*;
import com.esports.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResultServiceTest {
    @Mock MatchResultRepository resultRepo;
    @Mock MatchRepository matchRepo;
    @Mock UserRepository userRepo;
    @Mock TeamStageRecordRepository recordRepo;
    @InjectMocks ResultService service;

    Match match;
    Team t1, t2;
    TeamStageRecord rec1, rec2;

    @BeforeEach
    void setUp() {
        t1 = team(1L);
        t2 = team(2L);
        Stage stage = new Stage();
        stage.setStageId(10L);
        Round round = new Round();
        round.setStage(stage);
        match = new Match();
        match.setMatchId(100L);
        match.setRound(round);
        match.setTeam1(t1);
        match.setTeam2(t2);
        match.setBestOf(3);
        match.setMatchStatus("IN_PROGRESS");
        rec1 = new TeamStageRecord();
        rec2 = new TeamStageRecord();
        lenient().when(matchRepo.findById(100L)).thenReturn(Optional.of(match));
        lenient().when(recordRepo.findByStage_StageIdAndTeam_TeamId(10L, 1L)).thenReturn(Optional.of(rec1));
        lenient().when(recordRepo.findByStage_StageIdAndTeam_TeamId(10L, 2L)).thenReturn(Optional.of(rec2));
        lenient().when(resultRepo.save(any(MatchResult.class))).thenAnswer(i -> i.getArgument(0));
    }

    private Team team(Long id) {
        Team t = new Team();
        t.setTeamId(id);
        return t;
    }

    private User user(Long id, String role) {
        User u = new User();
        u.setUserId(id);
        u.setRole(role);
        lenient().when(userRepo.findById(id)).thenReturn(Optional.of(u));
        return u;
    }

    private MatchResultRequestDTO req(int s1, int s2, Long userId) {
        MatchResultRequestDTO r = new MatchResultRequestDTO();
        r.setTeam1Score(s1);
        r.setTeam2Score(s2);
        r.setUserId(userId);
        return r;
    }

    private MatchResult result(String status, Team winner) {
        MatchResult r = new MatchResult();
        r.setMatch(match);
        r.setResultStatus(status);
        r.setWinner(winner);
        r.setTeam1Score(2);
        r.setTeam2Score(1);
        when(resultRepo.findByMatch_MatchId(100L)).thenReturn(Optional.of(r));
        return r;
    }

    @Test
    void enter_validScore_setsWinnerAndDraft() {
        user(4L, "REFEREE");
        when(resultRepo.findByMatch_MatchId(100L)).thenReturn(Optional.empty());
        MatchResult r = service.enter(100L, req(2, 1, 4L));
        assertEquals("DRAFT", r.getResultStatus());
        assertEquals(t1, r.getWinner());
    }

    @Test
    void enter_invalidBo3Score_rejected() {
        user(4L, "REFEREE");
        assertThrows(IllegalArgumentException.class, () -> service.enter(100L, req(3, 0, 4L)));
        assertThrows(IllegalArgumentException.class, () -> service.enter(100L, req(2, 2, 4L)));
        assertThrows(IllegalArgumentException.class, () -> service.enter(100L, req(1, 0, 4L)));
    }

    @Test
    void enter_bo1AndBo5_followBestOf() {
        user(4L, "REFEREE");
        when(resultRepo.findByMatch_MatchId(100L)).thenReturn(Optional.empty());
        match.setBestOf(1);
        assertEquals(t2, service.enter(100L, req(0, 1, 4L)).getWinner());
        match.setBestOf(5);
        assertEquals(t1, service.enter(100L, req(3, 2, 4L)).getWinner());
        assertThrows(IllegalArgumentException.class, () -> service.enter(100L, req(2, 1, 4L)));
    }

    @Test
    void enter_matchNotStarted_rejected() {
        user(4L, "REFEREE");
        match.setMatchStatus("SCHEDULED");
        assertThrows(IllegalArgumentException.class, () -> service.enter(100L, req(2, 0, 4L)));
    }

    @Test
    void enter_roleWithoutPermission_rejected() {
        user(5L, "TEAM_CAPTAIN");
        assertThrows(IllegalArgumentException.class, () -> service.enter(100L, req(2, 0, 5L)));
    }

    @Test
    void submit_movesMatchToPendingConfirmation() {
        MatchResult r = result("DRAFT", t1);
        service.submit(100L);
        assertEquals("SUBMITTED", r.getResultStatus());
        assertEquals("PENDING_CONFIRMATION", match.getMatchStatus());
    }

    @Test
    void submit_onlyFromDraft() {
        result("CONFIRMED", t1);
        assertThrows(IllegalArgumentException.class, () -> service.submit(100L));
    }

    @Test
    void confirm_completesMatchAndUpdatesRecords() {
        result("SUBMITTED", t1);
        user(2L, "ORGANIZER");
        MatchResult r = service.confirm(100L, 2L);
        assertEquals("CONFIRMED", r.getResultStatus());
        assertEquals("COMPLETED", match.getMatchStatus());
        assertNotNull(r.getConfirmedAt());
        assertEquals(1, rec1.getWins());
        assertEquals(0, rec1.getLosses());
        assertEquals(0, rec2.getWins());
        assertEquals(1, rec2.getLosses());
    }

    @Test
    void confirm_byCaptain_rejected() {
        result("SUBMITTED", t1);
        user(5L, "TEAM_CAPTAIN");
        assertThrows(IllegalArgumentException.class, () -> service.confirm(100L, 5L));
        assertEquals(0, rec1.getWins());
    }

    @Test
    void confirm_requiresSubmitted() {
        result("DRAFT", t1);
        user(2L, "ORGANIZER");
        assertThrows(IllegalArgumentException.class, () -> service.confirm(100L, 2L));
    }

    @Test
    void adjust_requiresReason() {
        result("CONFIRMED", t1);
        user(2L, "ORGANIZER");
        assertThrows(IllegalArgumentException.class, () -> service.adjust(100L, req(1, 2, 2L)));
    }

    @Test
    void adjust_flipsWinnerAndRecomputesRecords() {
        result("CONFIRMED", t1);
        user(2L, "ORGANIZER");
        rec1.setWins(1);
        rec2.setLosses(1);
        MatchResultRequestDTO r = req(1, 2, 2L);
        r.setNote("Khiếu nại");
        MatchResult out = service.adjust(100L, r);
        assertEquals(t2, out.getWinner());
        assertEquals("Khiếu nại", out.getNote());
        assertEquals(0, rec1.getWins());
        assertEquals(1, rec1.getLosses());
        assertEquals(1, rec2.getWins());
        assertEquals(0, rec2.getLosses());
    }

    @Test
    void adjust_onlyAfterConfirmed() {
        result("SUBMITTED", t1);
        user(2L, "ORGANIZER");
        MatchResultRequestDTO r = req(1, 2, 2L);
        r.setNote("x");
        assertThrows(IllegalArgumentException.class, () -> service.adjust(100L, r));
    }
}
