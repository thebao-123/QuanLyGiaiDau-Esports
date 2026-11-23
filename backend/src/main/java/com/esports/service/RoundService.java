package com.esports.service;

import com.esports.dto.RoundRequestDTO;
import com.esports.entity.Round;
import com.esports.entity.Stage;
import com.esports.repository.RoundRepository;
import com.esports.repository.StageRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Objects;

@Service
@Transactional(readOnly = true)
public class RoundService
{

    private final RoundRepository roundRepository;
    private final StageRepository stageRepository;

    public RoundService(RoundRepository roundRepository, StageRepository stageRepository) {
        this.roundRepository = roundRepository;
        this.stageRepository = stageRepository;
    }


    public List<Round> getAllRounds() {
        return roundRepository.findAll();
    }


    public Round getRoundById(Long roundId)
    {
        return roundRepository.findById(roundId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Không tìm thấy Vòng đấu có ID: " + roundId)
                );
    }


    private Stage getStage(Long stageId)
    {
        return stageRepository.findById(stageId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Không tìm thấy Giai đoạn có ID: " + stageId)
                );
    }


    public List<Round> getRoundsByStage(Long stageId)
    {
        getStage(stageId);
        return roundRepository.findByStage_StageId(stageId);
    }


    public List<Round> getRoundsByStageOrdered(Long stageId)
    {

        getStage(stageId);
        return roundRepository.findByStage_StageIdOrderByRoundNumberAsc(stageId);
    }


    public Round getRoundByStageAndNumber(Long stageId, Integer roundNumber)
    {
        getStage(stageId);
        return roundRepository.findByStage_StageIdAndRoundNumber(stageId, roundNumber)
                .orElseThrow(() ->
                        new EntityNotFoundException("Không tìm thấy Vòng đấu trong Giai đoạn có ID: " + stageId
                                + ", Thứ tự Vòng đấu: " + roundNumber
                        )
                );
    }


    public List<Round> getRoundsByStatus(String roundStatus) {
        if (roundStatus == null || roundStatus.isBlank()) {
            throw new IllegalArgumentException("Trạng thái Vòng đấu không được để trống");
        }
        return roundRepository.findByRoundStatus(roundStatus.trim().toUpperCase());
    }


    @Transactional
    public Round createRound(RoundRequestDTO request)
    {
        validateRound(request);
        Stage stage = getStage(request.getStageId());

        if (roundRepository.existsByStage_StageIdAndRoundNumber(request.getStageId(), request.getRoundNumber()))
            throw new IllegalArgumentException("Thứ tự Vòng đấu đã tồn tại trong Giai đoạn này");

        Round round = new Round();
        round.setStage(stage);
        round.setRoundNumber(request.getRoundNumber());
        round.setRoundName(request.getRoundName());
        round.setScheduledStart(request.getScheduledStart());
        round.setRoundStatus(request.getRoundStatus());

        return roundRepository.save(round);
    }


    @Transactional
    public Round updateRound(Long roundId, RoundRequestDTO request)
    {
        validateRound(request);
        Round existingRound = getRoundById(roundId);
        Stage stage = getStage(request.getStageId());

        boolean sameRound = Objects.equals(existingRound.getStage().getStageId(), request.getStageId())
                && Objects.equals(existingRound.getRoundNumber(), request.getRoundNumber());

        if (!sameRound && roundRepository.existsByStage_StageIdAndRoundNumber(request.getStageId(), request.getRoundNumber()))
            throw new IllegalArgumentException("Thứ tự Vòng đấu đã tồn tại trong Giai đoạn này");
        if (!Objects.equals(existingRound.getStage().getStageId(), request.getStageId())
                && roundRepository.countMatchesByRoundId(roundId) > 0) {
            throw new IllegalArgumentException("Không thể chuyển vòng đấu đã có trận sang giai đoạn khác.");
        }

        existingRound.setStage(stage);
        existingRound.setRoundNumber(request.getRoundNumber());
        existingRound.setRoundName(request.getRoundName());
        existingRound.setScheduledStart(request.getScheduledStart());
        existingRound.setRoundStatus(request.getRoundStatus());

        return roundRepository.save(existingRound);
    }


    @Transactional
    public void deleteRound(Long roundId)
    {
        Round round = getRoundById(roundId);
        if (roundRepository.countMatchesByRoundId(roundId) > 0) {
            throw new IllegalArgumentException("Không thể xóa vòng đấu còn trận đấu. Hãy xử lý các trận trước.");
        }
        roundRepository.delete(round);
    }


    private void validateRound(RoundRequestDTO request)
    {
        if (request == null)
            throw new IllegalArgumentException("Vòng đấu không thể là null");

        if (request.getStageId() == null)
            throw new IllegalArgumentException("ID Giai đoạn không được để trống");

        if (request.getRoundNumber() == null || request.getRoundNumber() <= 0)
            throw new IllegalArgumentException("Thứ tự Vòng đấu phải lớn hơn 0");

        if (request.getRoundName() != null) {
            request.setRoundName(request.getRoundName().trim());
            if (request.getRoundName().isEmpty()) request.setRoundName(null);
            if (request.getRoundName() != null && request.getRoundName().length() > 100)
                throw new IllegalArgumentException("Tên Vòng đấu không được vượt quá 100 ký tự");
        }

        if (request.getRoundStatus() == null || request.getRoundStatus().isBlank())
            throw new IllegalArgumentException("Trạng thái Vòng đấu không được để trống");

        request.setRoundStatus(request.getRoundStatus().trim().toUpperCase());
        if (request.getRoundStatus().length() > 20)
            throw new IllegalArgumentException("Trạng thái Vòng đấu không được vượt quá 20 ký tự");
    }
}