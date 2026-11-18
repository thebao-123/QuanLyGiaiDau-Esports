package com.esports.service;

import com.esports.dto.ApplicationReviewDTO;
import com.esports.dto.TournamentRequestDTO;
import com.esports.entity.*;
import com.esports.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TournamentService {
    private final TournamentRepository tournamentRepo;
    private final GameTitleRepository gameRepo;
    private final UserRepository userRepo;
    private final ParticipationApplicationRepository appRepo;

    public List<Tournament> getAllTournaments() {
        return tournamentRepo.findAll();
    }

    public Tournament createTournament(TournamentRequestDTO req) {
        if (req.getStartDate() != null && req.getEndDate() != null && req.getEndDate().isBefore(req.getStartDate())) {
            throw new IllegalArgumentException("Ngày kết thúc không được trước ngày bắt đầu.");
        }
        GameTitle game = gameRepo.findById(req.getGameId() != null ? req.getGameId() : 1L)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy trò chơi."));
        User organizer = userRepo.findById(req.getOrganizerId() != null ? req.getOrganizerId() : 1L)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản Ban tổ chức."));

        Tournament t = new Tournament();
        t.setGameTitle(game);
        t.setOrganizer(organizer);
        t.setTournamentName(req.getTournamentName());
        t.setStartDate(req.getStartDate());
        t.setEndDate(req.getEndDate());
        t.setMaxTeams(req.getMaxTeams() != null ? req.getMaxTeams() : 16);
        t.setTournamentStatus("DRAFT");
        return tournamentRepo.save(t);
    }

    public Tournament updateTournament(Long id, TournamentRequestDTO req) {
        Tournament t = tournamentRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy giải đấu."));
        if (req.getTournamentName() != null) t.setTournamentName(req.getTournamentName());
        if (req.getStartDate() != null) t.setStartDate(req.getStartDate());
        if (req.getEndDate() != null) t.setEndDate(req.getEndDate());
        if (req.getMaxTeams() != null) t.setMaxTeams(req.getMaxTeams());
        return tournamentRepo.save(t);
    }

    public Tournament updateStatus(Long id, String status) {
        Tournament t = tournamentRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy giải đấu."));
        t.setTournamentStatus(status.toUpperCase());
        return tournamentRepo.save(t);
    }

    public void deleteTournament(Long id) {
        tournamentRepo.deleteById(id);
    }

    public List<ParticipationApplication> getApplications(Long tournamentId) {
        return appRepo.findByTournament_TournamentId(tournamentId);
    }

    public List<?> getRegionSlotsSummary(Long tournamentId) {
        return appRepo.summarizeRegionSlotsByTournament(tournamentId).stream()
                .map(row -> Map.of(
                        "region", row[0] != null ? row[0] : "Chưa xác định",
                        "totalApplications", row[1],
                        "approvedSlots", row[2]
                ))
                .toList();
    }

    @Transactional
    public ParticipationApplication verifyApplicationCondition(Long applicationId, Long coordinatorUserId, boolean passed, String note) {
        ParticipationApplication app = appRepo.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ tham dự."));
        User coordinator = userRepo.findById(coordinatorUserId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản điều phối viên."));

        if (!Set.of("REGIONAL_COORDINATOR", "ORGANIZER", "ADMIN").contains(coordinator.getRole())) {
            throw new IllegalArgumentException("Chỉ Điều phối viên khu vực hoặc Ban tổ chức mới được kiểm tra điều kiện.");
        }
        if (app.getTeam().getCountry() == null || app.getTeam().getCountry().isBlank()) {
            throw new IllegalArgumentException("Đội tuyển chưa khai báo khu vực thi đấu (UC-04).");
        }

        app.setApplicationStatus(passed ? "CONDITION_PASSED" : "CONDITION_FAILED");
        app.setReviewedBy(coordinator);
        app.setReviewedAt(LocalDateTime.now());
        app.setNote(note != null ? note : (passed ? "Đạt điều kiện khu vực & suất tham dự" : "Không đạt điều kiện khu vực"));
        return appRepo.save(app);
    }

    @Transactional
    public ParticipationApplication reviewApplication(Long applicationId, ApplicationReviewDTO dto) {
        ParticipationApplication app = appRepo.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ đăng ký."));
        User reviewer = userRepo.findById(dto.getReviewerUserId() != null ? dto.getReviewerUserId() : 1L)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người duyệt."));

        app.setApplicationStatus(dto.getStatus().toUpperCase());
        app.setReviewedBy(reviewer);
        app.setReviewedAt(LocalDateTime.now());
        app.setNote(dto.getNote());
        return appRepo.save(app);
    }
}