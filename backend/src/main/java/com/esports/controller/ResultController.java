package com.esports.controller;

import com.esports.dto.MatchResultRequestDTO;
import com.esports.entity.MatchResult;
import com.esports.service.ResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches/{matchId}/result")
@RequiredArgsConstructor
public class ResultController {
    private final ResultService resultService;

    @GetMapping
    public MatchResult get(@PathVariable Long matchId) {
        return resultService.getByMatch(matchId);
    }

    @PutMapping
    public MatchResult enter(@PathVariable Long matchId, @RequestBody MatchResultRequestDTO req) {
        return resultService.enter(matchId, req);
    }

    @PostMapping("/submit")
    public MatchResult submit(@PathVariable Long matchId) {
        return resultService.submit(matchId);
    }

    @PostMapping("/confirm")
    public MatchResult confirm(@PathVariable Long matchId, @RequestBody MatchResultRequestDTO req) {
        return resultService.confirm(matchId, req.getUserId());
    }

    @PatchMapping("/adjust")
    public MatchResult adjust(@PathVariable Long matchId, @RequestBody MatchResultRequestDTO req) {
        return resultService.adjust(matchId, req);
    }
}

@RestController
@RequestMapping("/api/results")
@RequiredArgsConstructor
class ResultListController {
    private final ResultService resultService;

    @GetMapping
    public List<MatchResult> list(@RequestParam(required = false) String status) {
        return resultService.getAll(status);
    }
}
