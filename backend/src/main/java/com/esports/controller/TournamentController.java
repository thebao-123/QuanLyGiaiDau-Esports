package com.esports.controller;

import com.esports.dto.ApplicationReviewDTO;
import com.esports.dto.TournamentRequestDTO;
import com.esports.entity.ParticipationApplication;
import com.esports.entity.Tournament;
import com.esports.service.TeamService;
import com.esports.service.TournamentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tournaments")
@RequiredArgsConstructor
public class TournamentController {
    private final TournamentService tournamentService;
    private final TeamService teamService;

    @GetMapping
    public List<Tournament> getAll() {
        return tournamentService.getAllTournaments();
    }

    @PostMapping
    public Tournament create(@RequestBody TournamentRequestDTO dto) {
        return tournamentService.createTournament(dto);
    }

    @PutMapping("/{id}")
    public Tournament update(@PathVariable Long id, @RequestBody TournamentRequestDTO dto) {
        return tournamentService.updateTournament(id, dto);
    }

    @PatchMapping("/{id}/status")
    public Tournament updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return tournamentService.updateStatus(id, body.get("status"));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        tournamentService.deleteTournament(id);
    }

    @GetMapping("/{id}/applications")
    public List<ParticipationApplication> getApplications(@PathVariable Long id) {
        return tournamentService.getApplications(id);
    }

    @GetMapping("/{id}/regions")
    public List<?> getRegionSlots(@PathVariable Long id) {
        return tournamentService.getRegionSlotsSummary(id);
    }

    @PatchMapping("/applications/{appId}/verify")
    public ParticipationApplication verifyCondition(@PathVariable Long appId, @RequestBody Map<String, Object> body) {
        Long coordinatorId = Long.valueOf(body.get("coordinatorUserId").toString());
        boolean passed = Boolean.parseBoolean(body.get("passed").toString());
        String note = (String) body.get("note");
        return tournamentService.verifyApplicationCondition(appId, coordinatorId, passed, note);
    }

    @PatchMapping("/applications/{appId}/review")
    public ParticipationApplication reviewApplication(@PathVariable Long appId, @RequestBody ApplicationReviewDTO dto) {
        return tournamentService.reviewApplication(appId, dto);
    }

    @PatchMapping("/applications/{appId}/lock-roster")
    public ParticipationApplication lockRoster(@PathVariable Long appId, @RequestBody Map<String, Long> body) {
        return teamService.lockTeamRoster(appId, body.get("organizerUserId"));
    }
}