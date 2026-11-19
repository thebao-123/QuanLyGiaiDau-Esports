package com.esports.controller;

import com.esports.dto.StageRequestDTO;
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
public class StageController
{
    private final StageService stageService;

    // Lấy tất cả Stage
    @GetMapping
    public ResponseEntity<List<Stage>> getAllStages() {
        return ResponseEntity.ok(stageService.getAllStages());
    }


    // Lấy Stage theo ID
    @GetMapping("/{stageId}")
    public ResponseEntity<Stage> getStageById(@PathVariable Long stageId) {
        return ResponseEntity.ok(stageService.getStageById(stageId));
    }


    // Lấy danh sách Stage thuộc một Tournament
    @GetMapping("/tournament/{tournamentId}")
    public ResponseEntity<List<Stage>> getStagesByTournament(@PathVariable Long tournamentId) {
        return ResponseEntity.ok(stageService.getStagesByTournament(tournamentId));
    }


    // Lấy Stage theo loại
    @GetMapping("/type/{stageType}")
    public ResponseEntity<List<Stage>> getStagesByType(@PathVariable String stageType) {
        return ResponseEntity.ok(stageService.getStagesByType(stageType));
    }


    // Lấy Stage theo trạng thái
    @GetMapping("/status/{stageStatus}")
    public ResponseEntity<List<Stage>> getStagesByStatus(@PathVariable String stageStatus) {
        return ResponseEntity.ok(stageService.getStagesByStatus(stageStatus));
    }


    // Tạo Stage mới
    @PostMapping
    public ResponseEntity<Stage> createStage(@RequestBody StageRequestDTO request) {
        Stage createdStage = stageService.createStage(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdStage);
    }


    // Cập nhật Stage
    @PutMapping("/{stageId}")
    public ResponseEntity<Stage> updateStage(@PathVariable Long stageId, @RequestBody StageRequestDTO request) {
        Stage updatedStage = stageService.updateStage(stageId, request);
        return ResponseEntity.ok(updatedStage);
    }


    // Xóa Stage
    @DeleteMapping("/{stageId}")
    public ResponseEntity<Void> deleteStage(@PathVariable Long stageId) {
        stageService.deleteStage(stageId);
        return ResponseEntity.noContent().build();
    }
}