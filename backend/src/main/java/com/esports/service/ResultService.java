package com.esports.service;

import com.esports.dto.MatchResultRequestDTO;
import com.esports.entity.*;
import com.esports.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ResultService {
    private final MatchResultRepository resultRepo;
    private final MatchRepository matchRepo;
    private final UserRepository userRepo;
    private final TeamStageRecordRepository recordRepo;

    public ResultService(MatchResultRepository resultRepo, MatchRepository matchRepo, UserRepository userRepo,
                         TeamStageRecordRepository recordRepo) {
        this.resultRepo = resultRepo;
        this.matchRepo = matchRepo;
        this.userRepo = userRepo;
        this.recordRepo = recordRepo;
    }

    public List<MatchResult> getAll(String status) {
        return status == null ? resultRepo.findAll() : resultRepo.findByResultStatus(status.toUpperCase());
    }

    public MatchResult getByMatch(Long matchId) {
        return resultRepo.findByMatch_MatchId(matchId)
                .orElseThrow(() -> new EntityNotFoundException("Trận đấu ID " + matchId + " chưa có kết quả"));
    }

    /** UC-19: trọng tài nhập (hoặc sửa bản nháp) kết quả. */
    @Transactional
    public MatchResult enter(Long matchId, MatchResultRequestDTO req) {
        Match m = matchRepo.findById(matchId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy Trận đấu có ID: " + matchId));
        User user = requireUser(req.getUserId());
        if (!List.of("REFEREE", "ORGANIZER", "ADMIN").contains(user.getRole()))
            throw new IllegalArgumentException("Không có quyền nhập kết quả");
        if (List.of("SCHEDULED", "READY").contains(m.getMatchStatus()))
            throw new IllegalArgumentException("Trận đấu chưa bắt đầu, chưa thể nhập kết quả");
        MatchResult r = resultRepo.findByMatch_MatchId(matchId).orElseGet(MatchResult::new);
        if ("SUBMITTED".equals(r.getResultStatus()) || "CONFIRMED".equals(r.getResultStatus()))
            throw new IllegalArgumentException("Kết quả đã gửi/xác nhận, không thể nhập lại");
        Team winner = computeWinner(m, req.getTeam1Score(), req.getTeam2Score());
        r.setMatch(m);
        r.setTeam1Score(req.getTeam1Score());
        r.setTeam2Score(req.getTeam2Score());
        r.setWinner(winner);
        r.setEnteredBy(user);
        r.setResultStatus("DRAFT");
        return resultRepo.save(r);
    }

    /** UC-20: gửi kết quả chờ Ban tổ chức xác nhận. */
    @Transactional
    public MatchResult submit(Long matchId) {
        MatchResult r = getByMatch(matchId);
        if (!"DRAFT".equals(r.getResultStatus()))
            throw new IllegalArgumentException("Chỉ gửi được kết quả ở trạng thái DRAFT");
        r.setResultStatus("SUBMITTED");
        r.getMatch().setMatchStatus("PENDING_CONFIRMATION");
        matchRepo.save(r.getMatch());
        return resultRepo.save(r);
    }

    /** UC-21 + FR-23: xác nhận kết quả, cập nhật trạng thái trận và thắng/thua của đội trong giai đoạn. */
    @Transactional
    public MatchResult confirm(Long matchId, Long userId) {
        MatchResult r = getByMatch(matchId);
        User approver = requireApprover(userId);
        if (!"SUBMITTED".equals(r.getResultStatus()))
            throw new IllegalArgumentException("Chỉ xác nhận được kết quả đã gửi (SUBMITTED)");
        r.setResultStatus("CONFIRMED");
        r.setConfirmedBy(approver);
        r.setConfirmedAt(LocalDateTime.now());
        Match m = r.getMatch();
        m.setMatchStatus("COMPLETED");
        matchRepo.save(m);
        applyRecord(m, r.getWinner(), +1);
        return resultRepo.save(r);
    }

    /** UC-22 + FR-23: điều chỉnh kết quả đã xác nhận, bắt buộc có lý do; tính lại thắng/thua. */
    @Transactional
    public MatchResult adjust(Long matchId, MatchResultRequestDTO req) {
        MatchResult r = getByMatch(matchId);
        User approver = requireApprover(req.getUserId());
        if (!"CONFIRMED".equals(r.getResultStatus()))
            throw new IllegalArgumentException("Chỉ điều chỉnh được kết quả đã xác nhận");
        if (req.getNote() == null || req.getNote().isBlank())
            throw new IllegalArgumentException("Phải nhập lý do khi điều chỉnh kết quả");
        Match m = r.getMatch();
        Team newWinner = computeWinner(m, req.getTeam1Score(), req.getTeam2Score());
        applyRecord(m, r.getWinner(), -1);
        applyRecord(m, newWinner, +1);
        r.setTeam1Score(req.getTeam1Score());
        r.setTeam2Score(req.getTeam2Score());
        r.setWinner(newWinner);
        r.setConfirmedBy(approver);
        r.setConfirmedAt(LocalDateTime.now());
        r.setNote(req.getNote());
        return resultRepo.save(r);
    }

    /** BO n: đội thắng phải đạt (n/2 + 1) game, đội thua thấp hơn mức đó. */
    private Team computeWinner(Match m, Integer s1, Integer s2) {
        if (s1 == null || s2 == null || s1 < 0 || s2 < 0)
            throw new IllegalArgumentException("Tỷ số không hợp lệ");
        int need = m.getBestOf() / 2 + 1;
        if (Math.max(s1, s2) != need || Math.min(s1, s2) >= need)
            throw new IllegalArgumentException("BO" + m.getBestOf() + " cần đội thắng đúng " + need + " game");
        return s1 > s2 ? m.getTeam1() : m.getTeam2();
    }

    /** delta=+1: cộng thắng cho winner, thua cho đội còn lại; delta=-1: hoàn tác. */
    private void applyRecord(Match m, Team winner, int delta) {
        Long stageId = m.getRound().getStage().getStageId();
        Team loser = winner.getTeamId().equals(m.getTeam1().getTeamId()) ? m.getTeam2() : m.getTeam1();
        recordRepo.findByStage_StageIdAndTeam_TeamId(stageId, winner.getTeamId()).ifPresent(rec -> {
            rec.setWins(Math.max(0, rec.getWins() + delta));
            recordRepo.save(rec);
        });
        recordRepo.findByStage_StageIdAndTeam_TeamId(stageId, loser.getTeamId()).ifPresent(rec -> {
            rec.setLosses(Math.max(0, rec.getLosses() + delta));
            recordRepo.save(rec);
        });
    }

    private User requireUser(Long userId) {
        if (userId == null) throw new IllegalArgumentException("Thiếu userId của người thực hiện");
        return userRepo.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy tài khoản có ID: " + userId));
    }

    private User requireApprover(Long userId) {
        User u = requireUser(userId);
        if (!List.of("ORGANIZER", "ADMIN").contains(u.getRole()))
            throw new IllegalArgumentException("Chỉ Ban tổ chức hoặc Quản trị viên mới được xác nhận/điều chỉnh");
        return u;
    }
}
