package com.esports.controller;

import com.esports.dto.MatchRequestDTO;
import com.esports.entity.Match;
import com.esports.entity.MatchReferee;
import com.esports.service.MatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {
    private final MatchService matchService;

    @GetMapping
    public List<Match> getAll(@RequestParam(required = false) String status,
                              @RequestParam(required = false) Long roundId,
                              @RequestParam(required = false) Long refereeId) {
        if (status != null) return matchService.getByStatus(status);
        if (roundId != null) return matchService.getByRound(roundId);
        if (refereeId != null) return matchService.getByReferee(refereeId);
        return matchService.getAll();
    }

    @GetMapping("/{id}")
    public Match getById(@PathVariable Long id) {
        return matchService.getById(id);
    }

    @PostMapping
    public ResponseEntity<Match> create(@RequestBody MatchRequestDTO req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(matchService.create(req));
    }

    @PutMapping("/{id}")
    public Match update(@PathVariable Long id, @RequestBody MatchRequestDTO req) {
        return matchService.update(id, req);
    }

    @PatchMapping("/{id}/status")
    public Match changeStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return matchService.changeStatus(id, body.get("status"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        matchService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/referees")
    public List<MatchReferee> referees(@PathVariable Long id) {
        return matchService.getReferees(id);
    }

    @PostMapping("/{id}/referees")
    public ResponseEntity<MatchReferee> assignReferee(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(matchService.assignReferee(id, body.get("refereeUserId")));
    }

    @DeleteMapping("/{id}/referees/{refereeUserId}")
    public ResponseEntity<Void> removeReferee(@PathVariable Long id, @PathVariable Long refereeUserId) {
        matchService.removeReferee(id, refereeUserId);
        return ResponseEntity.noContent().build();
    }
}
