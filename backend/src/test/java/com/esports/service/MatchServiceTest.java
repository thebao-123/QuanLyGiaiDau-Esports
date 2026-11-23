package com.esports.service;

import com.esports.dto.MatchRequestDTO;
import com.esports.entity.*;
import com.esports.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MatchServiceTest {
    @Mock MatchRepository matchRepo;
    @Mock MatchRefereeRepository refereeRepo;
    @Mock RoundRepository roundRepo;
    @Mock TeamRepository teamRepo;
    @Mock UserRepository userRepo;
    @InjectMocks MatchService service;

    static final LocalDateTime T = LocalDateTime.of(2026, 12, 1, 14, 0);

    @BeforeEach
    void setUp() {
        lenient().when(roundRepo.findById(1L)).thenReturn(Optional.of(new Round()));
        lenient().when(teamRepo.findById(anyLong())).thenAnswer(i -> {
            Team t = new Team();
            t.setTeamId(i.getArgument(0));
            return Optional.of(t);
        });
        lenient().when(matchRepo.save(any(Match.class))).thenAnswer(i -> i.getArgument(0));
    }

    private MatchRequestDTO req() {
        MatchRequestDTO r = new MatchRequestDTO();
        r.setRoundId(1L);
        r.setTeam1Id(1L);
        r.setTeam2Id(2L);
        r.setMatchCode("M-1");
        r.setScheduledTime(T);
        r.setVenue("Seoul");
        r.setBestOf(3);
        return r;
    }

    @Test
    void create_valid() {
        Match m = service.create(req());
        assertEquals("SCHEDULED", m.getMatchStatus());
        assertEquals("M-1", m.getMatchCode());
    }

    @Test
    void create_sameTeams_rejected() {
        MatchRequestDTO r = req();
        r.setTeam2Id(1L);
        assertThrows(IllegalArgumentException.class, () -> service.create(r));
    }

    @Test
    void create_invalidBestOf_rejected() {
        MatchRequestDTO r = req();
        r.setBestOf(2);
        assertThrows(IllegalArgumentException.class, () -> service.create(r));
    }

    @Test
    void create_duplicateCode_rejected() {
        when(matchRepo.existsByMatchCode("M-1")).thenReturn(true);
        assertThrows(IllegalArgumentException.class, () -> service.create(req()));
    }

    @Test
    void create_teamConflict_rejected() {
        when(matchRepo.findTeamConflicts(eq(1L), any(), any(), anyLong())).thenReturn(List.of(new Match()));
        IllegalArgumentException e = assertThrows(IllegalArgumentException.class, () -> service.create(req()));
        assertTrue(e.getMessage().contains("trùng lịch"));
    }

    @Test
    void create_venueConflict_rejected() {
        when(matchRepo.findVenueConflicts(eq("Seoul"), any(), any(), anyLong())).thenReturn(List.of(new Match()));
        assertThrows(IllegalArgumentException.class, () -> service.create(req()));
    }

    private Match existing(String status) {
        Match m = new Match();
        m.setMatchId(5L);
        m.setMatchStatus(status);
        m.setScheduledTime(T);
        lenient().when(matchRepo.findById(5L)).thenReturn(Optional.of(m));
        return m;
    }

    @Test
    void changeStatus_followsOrder() {
        Match m = existing("SCHEDULED");
        assertEquals("READY", service.changeStatus(5L, "ready").getMatchStatus());
        assertEquals("IN_PROGRESS", service.changeStatus(5L, "IN_PROGRESS").getMatchStatus());
        assertEquals("PENDING_CONFIRMATION", service.changeStatus(5L, "PENDING_CONFIRMATION").getMatchStatus());
        assertEquals("PENDING_CONFIRMATION", m.getMatchStatus());
    }

    @Test
    void changeStatus_skipOrBackwards_rejected() {
        existing("SCHEDULED");
        assertThrows(IllegalArgumentException.class, () -> service.changeStatus(5L, "IN_PROGRESS"));
        assertThrows(IllegalArgumentException.class, () -> service.changeStatus(5L, "COMPLETED"));
        assertThrows(IllegalArgumentException.class, () -> service.changeStatus(5L, "BOGUS"));
    }

    @Test
    void update_completedMatch_rejected() {
        existing("COMPLETED");
        assertThrows(IllegalArgumentException.class, () -> service.update(5L, req()));
    }

    @Test
    void delete_onlyScheduled() {
        existing("IN_PROGRESS");
        assertThrows(IllegalArgumentException.class, () -> service.delete(5L));
        existing("SCHEDULED");
        service.delete(5L);
        verify(matchRepo).delete(any(Match.class));
    }

    private User user(String role) {
        User u = new User();
        u.setUserId(9L);
        u.setRole(role);
        when(userRepo.findById(9L)).thenReturn(Optional.of(u));
        return u;
    }

    @Test
    void assignReferee_nonReferee_rejected() {
        existing("SCHEDULED");
        user("TEAM_CAPTAIN");
        assertThrows(IllegalArgumentException.class, () -> service.assignReferee(5L, 9L));
    }

    @Test
    void assignReferee_duplicate_rejected() {
        existing("SCHEDULED");
        user("REFEREE");
        when(refereeRepo.existsById(new MatchRefereeId(5L, 9L))).thenReturn(true);
        assertThrows(IllegalArgumentException.class, () -> service.assignReferee(5L, 9L));
    }

    @Test
    void assignReferee_timeConflict_rejected() {
        existing("SCHEDULED");
        user("REFEREE");
        when(matchRepo.findRefereeConflicts(eq(9L), any(), any(), eq(5L))).thenReturn(List.of(new Match()));
        assertThrows(IllegalArgumentException.class, () -> service.assignReferee(5L, 9L));
    }

    @Test
    void assignReferee_ok() {
        existing("SCHEDULED");
        user("REFEREE");
        when(refereeRepo.save(any(MatchReferee.class))).thenAnswer(i -> i.getArgument(0));
        MatchReferee mr = service.assignReferee(5L, 9L);
        assertEquals(9L, mr.getId().getRefereeUserId());
    }
}
