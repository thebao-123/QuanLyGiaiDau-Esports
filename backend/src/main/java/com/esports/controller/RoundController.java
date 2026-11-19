package com.esports.controller;

import com.esports.dto.RoundRequestDTO;
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

    // Lấy tất cả Round
    @GetMapping
    public ResponseEntity<List<Round>> getAllRounds() {
        return ResponseEntity.ok(roundService.getAllRounds());
    }


    // Lấy Round theo ID
    @GetMapping("/{roundId}")
    public ResponseEntity<Round> getRoundById(@PathVariable Long roundId) {
        return ResponseEntity.ok(roundService.getRoundById(roundId));
    }


    // Lấy Round thuộc một Stage
    @GetMapping("/stage/{stageId}")
    public ResponseEntity<List<Round>> getRoundsByStage(@PathVariable Long stageId) {
        return ResponseEntity.ok(roundService.getRoundsByStage(stageId));
    }


    // Lấy Round thuộc một Stage theo thứ tự
    @GetMapping("/stage/{stageId}/ordered")
    public ResponseEntity<List<Round>> getRoundsByStageOrdered(@PathVariable Long stageId) {
        return ResponseEntity.ok(roundService.getRoundsByStageOrdered(stageId));
    }


    // Tìm Round theo Stage ID và Round Number
    @GetMapping("/stage/{stageId}/number/{roundNumber}")
    public ResponseEntity<Round> getRoundByStageAndNumber(@PathVariable Long stageId, @PathVariable Integer roundNumber) {
        return ResponseEntity.ok(roundService.getRoundByStageAndNumber(stageId, roundNumber));
    }


    // Lấy Round theo trạng thái
    @GetMapping("/status/{roundStatus}")
    public ResponseEntity<List<Round>> getRoundsByStatus(@PathVariable Integer roundStatus) {
        return ResponseEntity.ok(roundService.getRoundsByStatus(roundStatus));
    }


    // Tạo Round mới
    @PostMapping
    public ResponseEntity<Round> createRound(@RequestBody RoundRequestDTO request) {
        Round createdRound = roundService.createRound(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRound);
    }


    // Cập nhật Round
    @PutMapping("/{roundId}")
    public ResponseEntity<Round> updateRound(@PathVariable Long roundId, @RequestBody RoundRequestDTO request) {
        Round updatedRound = roundService.updateRound(roundId, request);
        return ResponseEntity.ok(updatedRound);
    }


    // Xóa Round
    @DeleteMapping("/{roundId}")
    public ResponseEntity<Void> deleteRound(@PathVariable Long roundId) {
        roundService.deleteRound(roundId);
        return ResponseEntity.noContent().build();
    }
}