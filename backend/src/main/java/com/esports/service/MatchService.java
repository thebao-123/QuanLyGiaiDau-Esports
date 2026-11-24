package com.esports.service;

import com.esports.dto.MatchRequestDTO;
import com.esports.entity.*;
import com.esports.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class MatchService {
    /** Hai trận của cùng đội / trọng tài / địa điểm cách nhau dưới số giờ này bị coi là trùng lịch. */
    private static final long CONFLICT_HOURS = 2;
    private static final Set<Integer> VALID_BEST_OF = Set.of(1, 3, 5);
    private static final List<String> STATUS_FLOW =
            List.of("SCHEDULED", "READY", "IN_PROGRESS", "PENDING_CONFIRMATION", "COMPLETED");

    private final MatchRepository matchRepo;
    private final MatchRefereeRepository refereeRepo;
    private final RoundRepository roundRepo;
    private final TeamRepository teamRepo;
    private final UserRepository userRepo;

    public MatchService(MatchRepository matchRepo, MatchRefereeRepository refereeRepo, RoundRepository roundRepo,
                        TeamRepository teamRepo, UserRepository userRepo) {
        this.matchRepo = matchRepo;
        this.refereeRepo = refereeRepo;
        this.roundRepo = roundRepo;
        this.teamRepo = teamRepo;
        this.userRepo = userRepo;
    }

    public List<Match> getAll() {
        return matchRepo.findAll();
    }

    public Match getById(Long id) {
        return matchRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy Trận đấu có ID: " + id));
    }

    public List<Match> getByRound(Long roundId) {
        return matchRepo.findByRound_RoundIdOrderByScheduledTimeAsc(roundId);
    }

    public List<Match> getByStatus(String status) {
        return matchRepo.findByMatchStatusOrderByScheduledTimeAsc(status.toUpperCase());
    }

    public List<Match> getByReferee(Long refereeId) {
        return matchRepo.findByReferee(refereeId);
    }

    public List<MatchReferee> getReferees(Long matchId) {
        getById(matchId);
        return refereeRepo.findByMatch_MatchId(matchId);
    }

    @Transactional
    public Match create(MatchRequestDTO req) {
        validate(req);
        if (matchRepo.existsByMatchCode(req.getMatchCode()))
            throw new IllegalArgumentException("Mã trận đấu đã tồn tại");
        Match m = new Match();
        apply(m, req, -1L);
        return matchRepo.save(m);
    }

    /** UC-16: điều chỉnh lịch / thông tin trận; không sửa được trận đã hoàn thành. */
    @Transactional
    public Match update(Long id, MatchRequestDTO req) {
        validate(req);
        Match m = getById(id);
        if ("COMPLETED".equals(m.getMatchStatus()))
            throw new IllegalArgumentException("Không thể sửa trận đấu đã hoàn thành");
        if (matchRepo.existsByMatchCodeAndMatchIdNot(req.getMatchCode(), id))
            throw new IllegalArgumentException("Mã trận đấu đã tồn tại");
        apply(m, req, id);
        return matchRepo.save(m);
    }

    @Transactional
    public void delete(Long id) {
        Match m = getById(id);
        if (!"SCHEDULED".equals(m.getMatchStatus()))
            throw new IllegalArgumentException("Chỉ xóa được trận đấu ở trạng thái SCHEDULED");
        matchRepo.delete(m);
    }

    /** UC-18: chuyển trạng thái trận theo đúng thứ tự; COMPLETED chỉ đặt qua xác nhận kết quả. */
    @Transactional
    public Match changeStatus(Long id, String newStatus) {
        Match m = getById(id);
        String target = newStatus == null ? "" : newStatus.toUpperCase();
        int from = STATUS_FLOW.indexOf(m.getMatchStatus());
        int to = STATUS_FLOW.indexOf(target);
        if (to < 0) throw new IllegalArgumentException("Trạng thái trận đấu không hợp lệ");
        if ("COMPLETED".equals(target))
            throw new IllegalArgumentException("Trận chỉ hoàn thành khi kết quả được xác nhận");
        if (to != from + 1)
            throw new IllegalArgumentException("Không thể chuyển từ " + m.getMatchStatus() + " sang " + target);
        m.setMatchStatus(target);
        return matchRepo.save(m);
    }

    /** Hoàn tác riêng thao tác đánh dấu sẵn sàng; không cho lùi các trạng thái khác. */
    @Transactional
    public Match undoReady(Long id) {
        Match m = getById(id);
        if (!"READY".equals(m.getMatchStatus()))
            throw new IllegalArgumentException("Chỉ có thể hoàn tác khi trận đấu đang ở trạng thái READY");
        m.setMatchStatus("SCHEDULED");
        return matchRepo.save(m);
    }

    /** UC-17: phân công trọng tài, có kiểm tra trùng giờ và vai trò. */
    @Transactional
    public MatchReferee assignReferee(Long matchId, Long refereeUserId) {
        Match m = getById(matchId);
        User u = userRepo.findById(refereeUserId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy tài khoản có ID: " + refereeUserId));
        if (!"REFEREE".equals(u.getRole()))
            throw new IllegalArgumentException("Tài khoản này không có vai trò trọng tài");
        MatchRefereeId key = new MatchRefereeId(matchId, refereeUserId);
        if (refereeRepo.existsById(key))
            throw new IllegalArgumentException("Trọng tài đã được phân công cho trận này");
        if (m.getScheduledTime() != null && !matchRepo.findRefereeConflicts(refereeUserId,
                m.getScheduledTime().minusHours(CONFLICT_HOURS), m.getScheduledTime().plusHours(CONFLICT_HOURS), matchId).isEmpty())
            throw new IllegalArgumentException("Trọng tài bị trùng lịch với trận khác");
        MatchReferee mr = new MatchReferee();
        mr.setId(key);
        mr.setMatch(m);
        mr.setReferee(u);
        return refereeRepo.save(mr);
    }

    @Transactional
    public void removeReferee(Long matchId, Long refereeUserId) {
        MatchRefereeId key = new MatchRefereeId(matchId, refereeUserId);
        if (!refereeRepo.existsById(key))
            throw new EntityNotFoundException("Trọng tài chưa được phân công cho trận này");
        refereeRepo.deleteById(key);
    }

    private void apply(Match m, MatchRequestDTO req, Long excludeId) {
        Round round = roundRepo.findById(req.getRoundId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy Vòng đấu có ID: " + req.getRoundId()));
        Team t1 = teamRepo.findById(req.getTeam1Id())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy Đội có ID: " + req.getTeam1Id()));
        Team t2 = teamRepo.findById(req.getTeam2Id())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy Đội có ID: " + req.getTeam2Id()));
        checkConflicts(req, excludeId);
        m.setRound(round);
        m.setTeam1(t1);
        m.setTeam2(t2);
        m.setMatchCode(req.getMatchCode());
        m.setScheduledTime(req.getScheduledTime());
        m.setVenue(req.getVenue());
        m.setBestOf(req.getBestOf());
    }

    private void checkConflicts(MatchRequestDTO req, Long excludeId) {
        LocalDateTime t = req.getScheduledTime();
        if (t == null) return;
        LocalDateTime from = t.minusHours(CONFLICT_HOURS), to = t.plusHours(CONFLICT_HOURS);
        for (Long teamId : List.of(req.getTeam1Id(), req.getTeam2Id())) {
            if (!matchRepo.findTeamConflicts(teamId, from, to, excludeId).isEmpty())
                throw new IllegalArgumentException("Đội có ID " + teamId + " bị trùng lịch với trận khác");
        }
        if (req.getVenue() != null && !req.getVenue().isBlank()
                && !matchRepo.findVenueConflicts(req.getVenue(), from, to, excludeId).isEmpty())
            throw new IllegalArgumentException("Địa điểm đã có trận khác trong khung giờ này");
    }

    private void validate(MatchRequestDTO req) {
        if (req == null) throw new IllegalArgumentException("Dữ liệu trận đấu không được để trống");
        if (req.getRoundId() == null) throw new IllegalArgumentException("ID Vòng đấu không được để trống");
        if (req.getTeam1Id() == null || req.getTeam2Id() == null)
            throw new IllegalArgumentException("Phải chọn đủ hai đội");
        if (req.getTeam1Id().equals(req.getTeam2Id()))
            throw new IllegalArgumentException("Hai đội phải khác nhau");
        if (req.getMatchCode() == null || req.getMatchCode().isBlank() || req.getMatchCode().length() > 30)
            throw new IllegalArgumentException("Mã trận đấu bắt buộc và tối đa 30 ký tự");
        if (req.getBestOf() == null || !VALID_BEST_OF.contains(req.getBestOf()))
            throw new IllegalArgumentException("Thể thức phải là BO1, BO3 hoặc BO5");
    }
}
