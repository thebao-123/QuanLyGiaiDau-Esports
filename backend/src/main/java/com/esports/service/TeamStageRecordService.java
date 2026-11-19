package com.esports.service;

import com.esports.dto.TeamStageRecordRequestDTO;
import com.esports.dto.TeamStageRecordUpdateDTO;
import com.esports.dto.TeamStageRecordResponseDTO;
import com.esports.entity.Stage;
import com.esports.entity.Team;
import com.esports.entity.TeamStageRecord;
import com.esports.repository.StageRepository;
import com.esports.repository.TeamRepository;
import com.esports.repository.TeamStageRecordRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class TeamStageRecordService
{
    private final TeamStageRecordRepository teamStageRecordRepository;
    private final StageRepository stageRepository;
    private final TeamRepository teamRepository;

    public TeamStageRecordService(TeamStageRecordRepository teamStageRecordRepository, StageRepository stageRepository, TeamRepository teamRepository)
    {
        this.teamStageRecordRepository = teamStageRecordRepository;
        this.stageRepository = stageRepository;
        this.teamRepository = teamRepository;
    }


    public List<TeamStageRecordResponseDTO> getTeamsByStage(Long stageId)
    {
        getStage(stageId);
        return teamStageRecordRepository
                .findByStage_StageIdOrderBySeedNumberAsc(stageId)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public List<TeamStageRecordResponseDTO> getStandings(Long stageId)
    {
        getStage(stageId);
        return teamStageRecordRepository
                .findByStage_StageIdOrderByWinsDescLossesAscSeedNumberAsc(stageId)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }


    public TeamStageRecordResponseDTO getTeamRecord(Long stageId, Long teamId) {
        return toResponseDTO(getTeamStageRecord(stageId, teamId));
    }


    public List<TeamStageRecordResponseDTO> getRecordsByTeam(Long teamId)
    {
        getTeam(teamId);
        return teamStageRecordRepository.findByTeam_TeamId(teamId)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }


    public List<TeamStageRecordResponseDTO> getTeamsByStatus(Long stageId, String stageTeamStatus)
    {
        getStage(stageId);
        if (stageTeamStatus == null || stageTeamStatus.isBlank())
            throw new IllegalArgumentException("Trạng thái Đội trong Giai đoạn không được để trống.");

        return teamStageRecordRepository
                .findByStage_StageIdAndStageTeamStatus(stageId, stageTeamStatus)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }


    public long countTeamsByStage(Long stageId)
    {
        getStage(stageId);
        return teamStageRecordRepository.countByStage_StageId(stageId);
    }


    @Transactional
    public TeamStageRecordResponseDTO addTeamToStage(Long stageId, TeamStageRecordRequestDTO request)
    {
        validateRequest(request);
        Stage stage = getStage(stageId);
        Team team = getTeam(request.getTeamId());

        if (teamStageRecordRepository.existsByStage_StageIdAndTeam_TeamId(stageId, request.getTeamId()))
            throw new IllegalArgumentException("Đội tuyển này đã tham gia Giai đoạn thi đấu");

        validateSeedNumber(stageId, request.getSeedNumber(), null);


        TeamStageRecord record = new TeamStageRecord();
        record.setStage(stage);
        record.setTeam(team);
        record.setSeedNumber(request.getSeedNumber());
        record.setWins(0);
        record.setLosses(0);
        record.setStageTeamStatus(request.getStageTeamStatus());

        TeamStageRecord savedRecord = teamStageRecordRepository.save(record);
        return toResponseDTO(savedRecord);
    }


    @Transactional
    public TeamStageRecordResponseDTO updateTeamRecord(Long stageId, Long teamId, TeamStageRecordUpdateDTO request)
    {
        validateUpdateRequest(request);

        TeamStageRecord existingRecord = getTeamStageRecord(stageId, teamId);

        validateSeedNumber(stageId, request.getSeedNumber(), existingRecord.getTeamStageRecordId());

        existingRecord.setSeedNumber(request.getSeedNumber());

        existingRecord.setStageTeamStatus(request.getStageTeamStatus());

        TeamStageRecord updatedRecord = teamStageRecordRepository.save(existingRecord);

        return toResponseDTO(updatedRecord);
    }


    @Transactional
    public void removeTeamFromStage(Long stageId, Long teamId)
    {
        TeamStageRecord record = getTeamStageRecord(stageId, teamId);
        teamStageRecordRepository.delete(record);
    }


    private Stage getStage(Long stageId)
    {
        return stageRepository.findById(stageId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Không tìm thấy giai đoạn thi đấu với ID: " + stageId));
    }


    private Team getTeam(Long teamId)
    {

        return teamRepository.findById(teamId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Không tìm thấy đội tuyển với ID: " + teamId));
    }


    private TeamStageRecord getTeamStageRecord(Long stageId, Long teamId)
    {

        return teamStageRecordRepository.findByStage_StageIdAndTeam_TeamId(stageId, teamId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Không tìm thấy bản ghi của đội tuyển ID: " + teamId + " trong giai đoạn ID: " + stageId));
    }


    private void validateSeedNumber(Long stageId, Integer seedNumber, Long excludedRecordId)
    {

        if (seedNumber == null)
            return;

        if (seedNumber <= 0)
            throw new IllegalArgumentException("Số hạt giống phải lớn hơn 0.");

        boolean seedExists;

        if (excludedRecordId == null)
            seedExists = teamStageRecordRepository.existsByStage_StageIdAndSeedNumber(stageId, seedNumber);
        else
            seedExists = teamStageRecordRepository.existsByStage_StageIdAndSeedNumberAndTeamStageRecordIdNot(stageId, seedNumber, excludedRecordId);

        if (seedExists)
            throw new IllegalArgumentException("Số hạt giống này đã được sử dụng trong giai đoạn.");
    }


    private void validateRequest(TeamStageRecordRequestDTO request)
    {

        if (request == null)
            throw new IllegalArgumentException("Thông tin đăng ký đội tuyển không được để trống.");

        if (request.getTeamId() == null)
            throw new IllegalArgumentException("ID đội tuyển không được để trống.");

        validateFields(request.getSeedNumber(), request.getStageTeamStatus());
    }


    private void validateUpdateRequest(TeamStageRecordUpdateDTO request)
    {
        if (request == null)
            throw new IllegalArgumentException("Thông tin cập nhật không được để trống.");

        validateFields(request.getSeedNumber(), request.getStageTeamStatus());
    }


    private void validateFields(Integer seedNumber, String stageTeamStatus)
    {
        if (seedNumber != null && seedNumber <= 0)
            throw new IllegalArgumentException("Số hạt giống phải lớn hơn 0.");

        if (stageTeamStatus == null || stageTeamStatus.isBlank())
            throw new IllegalArgumentException("Trạng thái đội trong giai đoạn không được để trống.");

        if (stageTeamStatus.length() > 20)
            throw new IllegalArgumentException("Trạng thái đội trong giai đoạn không được vượt quá 20 ký tự.");
    }


    private TeamStageRecordResponseDTO toResponseDTO(TeamStageRecord record)
    {
        TeamStageRecordResponseDTO response = new TeamStageRecordResponseDTO();
        response.setTeamStageRecordId(record.getTeamStageRecordId());
        response.setStageId(record.getStage().getStageId());
        response.setTeamId(record.getTeam().getTeamId());
        response.setSeedNumber(record.getSeedNumber());
        response.setWins(record.getWins());
        response.setLosses(record.getLosses());
        response.setStageTeamStatus(record.getStageTeamStatus());
        return response;
    }
}