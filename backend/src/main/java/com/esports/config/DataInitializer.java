package com.esports.config;

import com.esports.entity.*;
import com.esports.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepo;
    private final GameTitleRepository gameRepo;
    private final TournamentRepository tournamentRepo;
    private final TeamRepository teamRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepo.count() > 0) return;

        User admin = new User();
        admin.setFullName("Phan Thế Bảo");
        admin.setEmail("admin@esports.vn");
        admin.setPasswordHash(passwordEncoder.encode("123456"));
        admin.setRole("ADMIN");
        admin.setAccountStatus("ACTIVE");
        admin = userRepo.save(admin);

        User captain = new User();
        captain.setFullName("Lee Sang-hyeok (Faker)");
        captain.setEmail("faker@t1.gg");
        captain.setPasswordHash(passwordEncoder.encode("123456"));
        captain.setRole("TEAM_CAPTAIN");
        captain.setAccountStatus("ACTIVE");
        captain = userRepo.save(captain);

        GameTitle lol = gameRepo.findAll().stream().findFirst().orElseGet(() -> {
            GameTitle g = new GameTitle();
            g.setGameName("Liên Minh Huyền Thoại");
            g.setPublisher("Riot Games");
            return gameRepo.save(g);
        });

        Tournament worlds = new Tournament();
        worlds.setGameTitle(lol);
        worlds.setOrganizer(admin);
        worlds.setTournamentName("CHUNG KẾT THẾ GIỚI LMHT 2026");
        worlds.setStartDate(LocalDate.of(2026, 10, 1));
        worlds.setEndDate(LocalDate.of(2026, 11, 2));
        worlds.setMaxTeams(16);
        worlds.setTournamentStatus("ONGOING");
        tournamentRepo.save(worlds);

        createSampleTeam(captain, "T1", "T1", "LCK");
        createSampleTeam(captain, "BLG", "BLG", "LPL");
        createSampleTeam(captain, "WBG", "WBG", "LPL");
        createSampleTeam(captain, "LOS", "LOS", "VCS");
    }

    private void createSampleTeam(User captain, String name, String tag, String country) {
        Team t = new Team();
        t.setCaptain(captain);
        t.setTeamName(name);
        t.setTeamTag(tag);
        t.setCountry(country);
        teamRepo.save(t);
    }
}