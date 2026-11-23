package com.esports.controller;

import com.esports.dto.RoundRequestDTO;
import com.esports.dto.RoundResponseDTO;
import com.esports.entity.Round;
import com.esports.service.RoundService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rounds")
@RequiredArgsConstructor
public class RoundController {
    private final RoundService roundService;

    @GetMapping
    public ResponseEntity<List<RoundResponseDTO>> getAllRounds() {
        return ResponseEntity.ok(roundService.getAllRounds().stream().map(RoundResponseDTO::from).toList());
    }

    @GetMapping("/{roundId}")
    public ResponseEntity<RoundResponseDTO> getRoundById(@PathVariable Long roundId) {
        return ResponseEntity.ok(RoundResponseDTO.from(roundService.getRoundById(roundId)));
    }

    @GetMapping("/stage/{stageId}")
    public ResponseEntity<List<RoundResponseDTO>> getRoundsByStage(@PathVariable Long stageId) {
        return ResponseEntity.ok(roundService.getRoundsByStage(stageId)
                .stream().map(RoundResponseDTO::from).toList());
    }

    @GetMapping("/stage/{stageId}/ordered")
    public ResponseEntity<List<RoundResponseDTO>> getRoundsByStageOrdered(@PathVariable Long stageId) {
        return ResponseEntity.ok(roundService.getRoundsByStageOrdered(stageId)
                .stream().map(RoundResponseDTO::from).toList());
    }

    @GetMapping("/stage/{stageId}/number/{roundNumber}")
    public ResponseEntity<RoundResponseDTO> getRoundByStageAndNumber(@PathVariable Long stageId,
                                                                     @PathVariable Integer roundNumber) {
        return ResponseEntity.ok(RoundResponseDTO.from(
                roundService.getRoundByStageAndNumber(stageId, roundNumber)));
    }

    @GetMapping("/status/{roundStatus}")
    public ResponseEntity<List<RoundResponseDTO>> getRoundsByStatus(@PathVariable String roundStatus) {
        return ResponseEntity.ok(roundService.getRoundsByStatus(roundStatus)
                .stream().map(RoundResponseDTO::from).toList());
    }

    @PostMapping
    public ResponseEntity<RoundResponseDTO> createRound(@RequestBody RoundRequestDTO request) {
        Round createdRound = roundService.createRound(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(RoundResponseDTO.from(createdRound));
    }

    @PutMapping("/{roundId}")
    public ResponseEntity<RoundResponseDTO> updateRound(@PathVariable Long roundId,
                                                        @RequestBody RoundRequestDTO request) {
        return ResponseEntity.ok(RoundResponseDTO.from(roundService.updateRound(roundId, request)));
    }

    @DeleteMapping("/{roundId}")
    public ResponseEntity<Void> deleteRound(@PathVariable Long roundId) {
        roundService.deleteRound(roundId);
        return ResponseEntity.noContent().build();
    }
}
