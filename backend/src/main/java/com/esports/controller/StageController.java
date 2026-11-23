package com.esports.controller;

import com.esports.dto.StageRequestDTO;
import com.esports.dto.StageResponseDTO;
import com.esports.entity.Stage;
import com.esports.service.StageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stages")
@RequiredArgsConstructor
public class StageController {
    private final StageService stageService;

    @GetMapping
    public ResponseEntity<List<StageResponseDTO>> getAllStages() {
        return ResponseEntity.ok(stageService.getAllStages().stream().map(StageResponseDTO::from).toList());
    }

    @GetMapping("/{stageId}")
    public ResponseEntity<StageResponseDTO> getStageById(@PathVariable Long stageId) {
        return ResponseEntity.ok(StageResponseDTO.from(stageService.getStageById(stageId)));
    }

    @GetMapping("/tournament/{tournamentId}")
    public ResponseEntity<List<StageResponseDTO>> getStagesByTournament(@PathVariable Long tournamentId) {
        return ResponseEntity.ok(stageService.getStagesByTournament(tournamentId)
                .stream().map(StageResponseDTO::from).toList());
    }

    @GetMapping("/type/{stageType}")
    public ResponseEntity<List<StageResponseDTO>> getStagesByType(@PathVariable String stageType) {
        return ResponseEntity.ok(stageService.getStagesByType(stageType)
                .stream().map(StageResponseDTO::from).toList());
    }

    @GetMapping("/status/{stageStatus}")
    public ResponseEntity<List<StageResponseDTO>> getStagesByStatus(@PathVariable String stageStatus) {
        return ResponseEntity.ok(stageService.getStagesByStatus(stageStatus)
                .stream().map(StageResponseDTO::from).toList());
    }

    @PostMapping
    public ResponseEntity<StageResponseDTO> createStage(@RequestBody StageRequestDTO request) {
        Stage createdStage = stageService.createStage(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(StageResponseDTO.from(createdStage));
    }

    @PutMapping("/{stageId}")
    public ResponseEntity<StageResponseDTO> updateStage(@PathVariable Long stageId,
                                                        @RequestBody StageRequestDTO request) {
        return ResponseEntity.ok(StageResponseDTO.from(stageService.updateStage(stageId, request)));
    }

    @DeleteMapping("/{stageId}")
    public ResponseEntity<Void> deleteStage(@PathVariable Long stageId) {
        stageService.deleteStage(stageId);
        return ResponseEntity.noContent().build();
    }
}
