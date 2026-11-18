package com.esports.controller;

import com.esports.dto.RosterMemberDTO;
import com.esports.dto.TeamRequestDTO;
import com.esports.entity.ParticipationApplication;
import com.esports.entity.Team;
import com.esports.entity.TeamMember;
import com.esports.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {
    private final TeamService teamService;

    @GetMapping
    public List<Team> getAll() {
        return teamRepoOrService();
    }

    private List<Team> teamRepoOrService() {
        return teamService.getAllTeams();
    }

    @PostMapping
    public Team create(@RequestBody TeamRequestDTO dto) {
        return teamService.createTeam(dto);
    }

    @PutMapping("/{id}")
    public Team update(@PathVariable Long id, @RequestBody TeamRequestDTO dto) {
        return teamService.updateTeam(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        teamService.deleteTeam(id);
    }

    @GetMapping("/{id}/roster")
    public List<TeamMember> getRoster(@PathVariable Long id) {
        return teamService.getRoster(id);
    }

    @PostMapping("/{id}/roster")
    public TeamMember addMember(@PathVariable Long id, @RequestBody RosterMemberDTO dto) {
        return teamService.addPlayerToRoster(id, dto);
    }

    @DeleteMapping("/{id}/roster/{playerId}")
    public void removeMember(@PathVariable Long id, @PathVariable Long playerId) {
        teamService.removePlayerFromRoster(id, playerId);
    }

    @PostMapping("/{id}/apply")
    public ParticipationApplication apply(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        return teamService.applyToTournament(id, body.get("tournamentId"));
    }
}