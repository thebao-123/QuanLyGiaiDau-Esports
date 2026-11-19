package com.esports.controller;

import com.esports.dto.TeamStageRecordRequestDTO;
import com.esports.dto.TeamStageRecordUpdateDTO;
import com.esports.dto.TeamStageRecordResponseDTO;
import com.esports.service.TeamStageRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/stages/{stageId}/teams")
@RequiredArgsConstructor
public class TeamStageRecordController
{
    private final TeamStageRecordService teamStageRecordService;

    // Lấy danh sách đội thuộc một Stage
    @GetMapping
    public ResponseEntity<List<TeamStageRecordResponseDTO>> getTeamsByStage(@PathVariable Long stageId) {
        return ResponseEntity.ok(teamStageRecordService.getTeamsByStage(stageId));
    }


    // Lấy bảng xếp hạng của Stage
    @GetMapping("/standings")
    public ResponseEntity<List<TeamStageRecordResponseDTO>> getStandings(@PathVariable Long stageId) {
        return ResponseEntity.ok(teamStageRecordService.getStandings(stageId));
    }


    // Lấy thông tin một đội trong Stage
    @GetMapping("/{teamId}")
    public ResponseEntity<TeamStageRecordResponseDTO> getTeamRecord(@PathVariable Long stageId, @PathVariable Long teamId) {
        return ResponseEntity.ok(teamStageRecordService.getTeamRecord(stageId, teamId));
    }


    // Lấy danh sách đội theo trạng thái
    @GetMapping("/status/{stageTeamStatus}")
    public ResponseEntity<List<TeamStageRecordResponseDTO>> getTeamsByStatus(@PathVariable Long stageId, @PathVariable String stageTeamStatus) {
        return ResponseEntity.ok(teamStageRecordService.getTeamsByStatus(stageId, stageTeamStatus));
    }


    // Đếm số đội tham gia Stage
    @GetMapping("/count")
    public ResponseEntity<Long> countTeamsByStage(@PathVariable Long stageId) {
        return ResponseEntity.ok(teamStageRecordService.countTeamsByStage(stageId));
    }


    // Thêm Team vào Stage
    @PostMapping
    public ResponseEntity<TeamStageRecordResponseDTO> addTeamToStage(@PathVariable Long stageId, @RequestBody TeamStageRecordRequestDTO request) {
        TeamStageRecordResponseDTO response = teamStageRecordService.addTeamToStage(stageId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }


    // Cập nhật thông tin Team trong Stage
    @PutMapping("/{teamId}")
    public ResponseEntity<TeamStageRecordResponseDTO> updateTeamRecord(@PathVariable Long stageId, @PathVariable Long teamId, @RequestBody TeamStageRecordUpdateDTO request) {
        return ResponseEntity.ok(teamStageRecordService.updateTeamRecord(stageId, teamId, request));
    }


    // Xóa Team khỏi Stage
    @DeleteMapping("/{teamId}")
    public ResponseEntity<Void> removeTeamFromStage(@PathVariable Long stageId, @PathVariable Long teamId) {
        teamStageRecordService.removeTeamFromStage(stageId, teamId);
        return ResponseEntity.noContent().build();
    }
}