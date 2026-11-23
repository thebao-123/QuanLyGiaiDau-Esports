package com.esports.service;

import com.esports.dto.StageRequestDTO;
import com.esports.entity.Stage;
import com.esports.entity.Tournament;
import com.esports.repository.StageRepository;
import com.esports.repository.TournamentRepository;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class StageService
{
    private final StageRepository stageRepo;
    private final TournamentRepository tournamentRepo;

    public StageService(StageRepository stageRepository, TournamentRepository tournamentRepository)
    {
        this.stageRepo = stageRepository;
        this.tournamentRepo = tournamentRepository;
    }


    public List<Stage> getAllStages() {return stageRepo.findAll();}


    public Stage getStageById(Long stageId)
    {
        return stageRepo.findById(stageId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Không tìm thấy Giai đoạn có ID: " + stageId));
    }


    public List<Stage> getStagesByTournament(Long tournamentId)
    {

        if (!tournamentRepo.existsById(tournamentId))
            throw new EntityNotFoundException("Không tìm thấy các Giai đoạn của Giải đấu có ID: " + tournamentId);

        return stageRepo.findByTournament_TournamentIdOrderByStageOrderAsc(tournamentId);
    }


    private Tournament getTournament(Long tournamentId)
    {
        return tournamentRepo.findById(tournamentId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Không tìm thấy Giải đấu có ID: " + tournamentId));
    }


    public List<Stage> getStagesByType(String stageType) {
        return stageRepo.findByStageType(stageType);
    }


    public List<Stage> getStagesByStatus(String stageStatus) {
        return stageRepo.findByStageStatus(stageStatus);
    }


    @Transactional
    public Stage createStage(StageRequestDTO request)
    {
        validateStage(request);

        Tournament tournament = getTournament(request.getTournamentId());

        if (stageRepo.existsByTournament_TournamentIdAndStageName(request.getTournamentId(), request.getStageName()))
            throw new IllegalArgumentException("Tên Giai đoạn đã tồn tại trong Giải đấu.");

        Stage stage = new Stage();
        stage.setTournament(tournament);
        stage.setStageName(request.getStageName());
        stage.setStageType(request.getStageType());
        stage.setStageOrder(request.getStageOrder());
        stage.setStartDate(request.getStartDate());
        stage.setEndDate(request.getEndDate());
        stage.setStageStatus(request.getStageStatus());

        return stageRepo.save(stage);
    }


    @Transactional
    public Stage updateStage(Long stageId, StageRequestDTO request)
    {
        validateStage(request);

        Stage existingStage = getStageById(stageId);

        Tournament tournament = getTournament(request.getTournamentId());

        boolean sameStage = existingStage.getTournament().getTournamentId()
                .equals(request.getTournamentId())
                && existingStage.getStageName()
                .equals(request.getStageName());

        boolean nameExists = stageRepo.existsByTournament_TournamentIdAndStageName(request.getTournamentId(), request.getStageName());

        if (nameExists && !sameStage)
            throw new IllegalArgumentException("Tên Giai đoạn đã tồn tại trong Giải đấu.");

        existingStage.setTournament(tournament);
        existingStage.setStageName(request.getStageName());
        existingStage.setStageType(request.getStageType());
        existingStage.setStageOrder(request.getStageOrder());
        existingStage.setStartDate(request.getStartDate());
        existingStage.setEndDate(request.getEndDate());
        existingStage.setStageStatus(request.getStageStatus());

        return stageRepo.save(existingStage);
    }


    @Transactional
    public void deleteStage(Long stageId)
    {
        Stage stage = getStageById(stageId);

        stageRepo.delete(stage);
    }


    private void validateStage(StageRequestDTO request)
    {
        if (request == null)
            throw new IllegalArgumentException("Giai đoạn không thể là null");

        if (request.getTournamentId() == null)
            throw new IllegalArgumentException("ID Giải đấu không được để trống");

        if (request.getStageName() == null || request.getStageName().isBlank())
            throw new IllegalArgumentException("Tên Giai đoạn không được để trống");

        request.setStageName(request.getStageName().trim());
        if (request.getStageName().length() > 100)
            throw new IllegalArgumentException("Tên Giai đoạn không được vượt quá 100 ký tự");

        if (request.getStageType() == null
                || !java.util.Set.of("QUALIFIER", "PLAY_IN", "SWISS_STAGE", "GROUP_STAGE", "LEAGUE_STAGE", "PLAYOFF")
                        .contains(request.getStageType()))
            throw new IllegalArgumentException("Thể loại Giai đoạn không hợp lệ");

        if (request.getStageOrder() == null || request.getStageOrder() <= 0)
            throw new IllegalArgumentException("Thứ tự Giai đoạn phải lớn hơn 0");

        if (request.getStageStatus() == null || request.getStageStatus().isBlank())
            throw new IllegalArgumentException("Trạng thái Giai đoạn không được để trống");

        if (request.getStageStatus().length() > 20)
            throw new IllegalArgumentException("Trạng thái Giai đoạn không được vượt quá 20 ký tự");

        if (request.getStartDate() != null && request.getEndDate() != null && request.getEndDate().isBefore(request.getStartDate()))
            throw new IllegalArgumentException("Ngày kết thúc không thể xảy ra trước ngày bắt đầu");
    }
}