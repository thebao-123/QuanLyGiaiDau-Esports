package com.esports.service;

import com.esports.dto.RosterMemberDTO;
import com.esports.dto.TeamRequestDTO;
import com.esports.entity.*;
import com.esports.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TeamService {
    private final TeamRepository teamRepo;
    private final UserRepository userRepo;
    private final PlayerRepository playerRepo;
    private final TeamMemberRepository memberRepo;
    private final TournamentRepository tournamentRepo;
    private final ParticipationApplicationRepository appRepo;

    public List<Team> getAllTeams() {
        return teamRepo.findAll();
    }

    public Team createTeam(TeamRequestDTO req) {
        User captain = userRepo.findById(req.getCaptainUserId() != null ? req.getCaptainUserId() : 1L)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản đội trưởng."));
        Team t = new Team();
        t.setCaptain(captain);
        t.setTeamName(req.getTeamName());
        t.setTeamTag(req.getTeamTag());
        t.setCountry(req.getCountry());
        return teamRepo.save(t);
    }

    public Team updateTeam(Long id, TeamRequestDTO req) {
        Team t = teamRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đội tuyển."));
        if (req.getTeamName() != null) t.setTeamName(req.getTeamName());
        if (req.getTeamTag() != null) t.setTeamTag(req.getTeamTag());
        if (req.getCountry() != null) t.setCountry(req.getCountry());
        return teamRepo.save(t);
    }

    public void deleteTeam(Long id) {
        teamRepo.deleteById(id);
    }

    public List<TeamMember> getRoster(Long teamId) {
        return memberRepo.findByTeam_TeamId(teamId);
    }

    private void ensureRosterNotLocked(Long teamId) {
        if (appRepo.existsByTeam_TeamIdAndApplicationStatus(teamId, "ROSTER_LOCKED")) {
            throw new IllegalArgumentException("Roster của đội đã bị Ban tổ chức khóa, không thể chỉnh sửa (BR-05).");
        }
    }

    @Transactional
    public TeamMember addPlayerToRoster(Long teamId, RosterMemberDTO dto) {
        ensureRosterNotLocked(teamId);
        Team team = teamRepo.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đội tuyển."));
        if (memberRepo.countByTeam_TeamId(teamId) >= 10) {
            throw new IllegalArgumentException("Roster đã đạt giới hạn tối đa 10 thành viên.");
        }

        Player p = new Player();
        p.setPlayerName(dto.getPlayerName());
        p.setInGameName(dto.getInGameName());
        p.setGameAccountId(dto.getGameAccountId());
        p = playerRepo.save(p);

        TeamMember tm = new TeamMember();
        tm.setId(new TeamMemberId(team.getTeamId(), p.getPlayerId()));
        tm.setTeam(team);
        tm.setPlayer(p);
        tm.setMemberRole(dto.getMemberRole() != null ? dto.getMemberRole().toUpperCase() : "MAIN");
        return memberRepo.save(tm);
    }

    @Transactional
    public void removePlayerFromRoster(Long teamId, Long playerId) {
        ensureRosterNotLocked(teamId);
        memberRepo.deleteById(new TeamMemberId(teamId, playerId));
    }

    @Transactional
    public ParticipationApplication applyToTournament(Long teamId, Long tournamentId) {
        Team team = teamRepo.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đội tuyển."));
        Tournament tournament = tournamentRepo.findById(tournamentId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy giải đấu."));

        if (appRepo.existsByTournament_TournamentIdAndTeam_TeamId(tournamentId, teamId)) {
            throw new IllegalArgumentException("Đội tuyển đã nộp hồ sơ đăng ký giải đấu này.");
        }
        if (memberRepo.countByTeam_TeamId(teamId) < 5) {
            throw new IllegalArgumentException("Roster phải có tối thiểu 5 tuyển thủ mới được nộp đơn tham dự.");
        }

        ParticipationApplication app = new ParticipationApplication();
        app.setTeam(team);
        app.setTournament(tournament);
        app.setApplicationStatus("PENDING");
        return appRepo.save(app);
    }

    @Transactional
    public ParticipationApplication lockTeamRoster(Long applicationId, Long organizerUserId) {
        ParticipationApplication app = appRepo.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hồ sơ tham dự."));
        User organizer = userRepo.findById(organizerUserId != null ? organizerUserId : 1L)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản Ban tổ chức."));

        if (!Set.of("ORGANIZER", "ADMIN").contains(organizer.getRole())) {
            throw new IllegalArgumentException("Chỉ Ban tổ chức mới có quyền khóa roster (UC-11).");
        }
        if (!"APPROVED".equals(app.getApplicationStatus())) {
            throw new IllegalArgumentException("Chỉ được khóa roster đối với đội đã được duyệt tham dự.");
        }
        if (memberRepo.countByTeam_TeamId(app.getTeam().getTeamId()) < 5) {
            throw new IllegalArgumentException("Roster chưa đủ tối thiểu 5 tuyển thủ để khóa.");
        }

        app.setApplicationStatus("ROSTER_LOCKED");
        app.setReviewedBy(organizer);
        app.setReviewedAt(LocalDateTime.now());
        app.setNote("Đã khóa roster chính thức (UC-11)");
        return appRepo.save(app);
    }
}