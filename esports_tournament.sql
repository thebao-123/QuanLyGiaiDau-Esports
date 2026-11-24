-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: esports_tournament
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `game_titles`
--

DROP TABLE IF EXISTS `game_titles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `game_titles` (
  `game_id` bigint NOT NULL AUTO_INCREMENT,
  `game_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `publisher` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`game_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `game_titles`
--

LOCK TABLES `game_titles` WRITE;
/*!40000 ALTER TABLE `game_titles` DISABLE KEYS */;
INSERT INTO `game_titles` VALUES (1,'Liên Minh Huyền Thoại','Riot Games','2026-11-18 07:24:51');
/*!40000 ALTER TABLE `game_titles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `participation_applications`
--
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` bigint NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `participation_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `participation_applications` (
  `application_id` bigint NOT NULL AUTO_INCREMENT,
  `tournament_id` bigint NOT NULL,
  `team_id` bigint NOT NULL,
  `application_status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `reviewed_by` bigint DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`application_id`),
  KEY `fk_pa_tournament` (`tournament_id`),
  KEY `fk_pa_team` (`team_id`),
  KEY `fk_pa_reviewer` (`reviewed_by`),
  CONSTRAINT `fk_pa_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_pa_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`team_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pa_tournament` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`tournament_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `participation_applications`
--

LOCK TABLES `participation_applications` WRITE;
/*!40000 ALTER TABLE `participation_applications` DISABLE KEYS */;
/*!40000 ALTER TABLE `participation_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `players`
--

DROP TABLE IF EXISTS `players`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `players` (
  `player_id` bigint NOT NULL AUTO_INCREMENT,
  `player_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `in_game_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `game_account_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`player_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `players`
--

LOCK TABLES `players` WRITE;
/*!40000 ALTER TABLE `players` DISABLE KEYS */;
/*!40000 ALTER TABLE `players` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_members`
--

DROP TABLE IF EXISTS `team_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_members` (
  `team_id` bigint NOT NULL,
  `player_id` bigint NOT NULL,
  `member_role` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MAIN',
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`team_id`,`player_id`),
  KEY `fk_tm_player` (`player_id`),
  CONSTRAINT `fk_tm_player` FOREIGN KEY (`player_id`) REFERENCES `players` (`player_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tm_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`team_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_members`
--

LOCK TABLES `team_members` WRITE;
/*!40000 ALTER TABLE `team_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `team_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teams` (
  `team_id` bigint NOT NULL AUTO_INCREMENT,
  `captain_user_id` bigint NOT NULL,
  `team_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `team_tag` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`team_id`),
  KEY `fk_team_captain` (`captain_user_id`),
  CONSTRAINT `fk_team_captain` FOREIGN KEY (`captain_user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
INSERT INTO `teams` VALUES (1,2,'T1','T1','LCK','2026-11-18 07:24:51'),(2,2,'BLG','BLG','LPL','2026-11-18 07:24:51'),(3,2,'WBG','WBG','LPL','2026-11-18 07:24:51'),(4,2,'LOS','LOS','VCS','2026-11-18 07:24:51'),(5,2,'GAM Esports ','GAM','VCS','2026-11-18 07:35:01');
/*!40000 ALTER TABLE `teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tournaments`
--

DROP TABLE IF EXISTS `tournaments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tournaments` (
  `tournament_id` bigint NOT NULL AUTO_INCREMENT,
  `game_id` bigint NOT NULL,
  `organizer_id` bigint NOT NULL,
  `tournament_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `max_teams` int DEFAULT '16',
  `tournament_status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`tournament_id`),
  KEY `fk_tournament_game` (`game_id`),
  KEY `fk_tournament_organizer` (`organizer_id`),
  CONSTRAINT `fk_tournament_game` FOREIGN KEY (`game_id`) REFERENCES `game_titles` (`game_id`),
  CONSTRAINT `fk_tournament_organizer` FOREIGN KEY (`organizer_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tournaments`
--

LOCK TABLES `tournaments` WRITE;
/*!40000 ALTER TABLE `tournaments` DISABLE KEYS */;
INSERT INTO `tournaments` VALUES (1,1,1,'CHUNG KẾT THẾ GIỚI LMHT 2026','2026-10-01','2026-11-02',16,'ONGOING','2026-11-18 07:24:51');
/*!40000 ALTER TABLE `tournaments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--



--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Phan Thế Bảo','admin@esports.vn','$2a$10$ylm2JeMwHdWFeVLgremiruxFayKhsrhvhWMYVzkIEltbbbywSmM0G',NULL,'ADMIN','SUSPENDED','2026-11-18 07:24:51'),(2,'Lee Sang-hyeok (Faker)','faker@t1.gg','$2a$10$.SO76M1CMjpHw4533kIE8euLN4xxHtyWF1NcmJKFXPVrNCNbFBEC.',NULL,'TEAM_CAPTAIN','SUSPENDED','2026-11-18 07:24:51'),(3,'abc','abc@gmail.com','$2a$10$h3R4z7YzDkI.v7hoK/Pf8ufuuLQXKUlKhe5NfWK29rhGbGXCLD7ju',NULL,'REGIONAL_COORDINATOR','SUSPENDED','2026-11-18 07:34:15');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-22 17:01:45
USE esports_tournament;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE participation_applications;
TRUNCATE TABLE team_members;
TRUNCATE TABLE players;
TRUNCATE TABLE teams;
TRUNCATE TABLE tournaments;
TRUNCATE TABLE users;
TRUNCATE TABLE game_titles;
SET FOREIGN_KEY_CHECKS = 1;

-- =================================================================
-- 1. BẢNG GAME_TITLES (5 tựa game)
-- =================================================================
INSERT INTO game_titles (game_id, game_name, publisher) VALUES
(1, 'Liên Minh Huyền Thoại', 'Riot Games'),
(2, 'VALORANT', 'Riot Games'),
(3, 'Đấu Trường Chân Lý (TFT)', 'Riot Games'),
(4, 'Counter-Strike 2', 'Valve'),
(5, 'Dota 2', 'Valve');

-- =================================================================
-- 2. BẢNG USERS (Đầy đủ vai trò; mật khẩu mặc định của tất cả là: 123456)
-- =================================================================
INSERT INTO users (user_id, full_name, email, password_hash, phone, role, account_status) VALUES
(1,  'Phan Thế Bảo',       'admin@esports.vn',       '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0901000001', 'ADMIN',                'ACTIVE'),
(2,  'Lê Quốc Bảo',        'organizer@esports.vn',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0901000002', 'ORGANIZER',            'ACTIVE'),
(3,  'Nguyễn Đức Trung',   'coordinator@esports.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0901000003', 'REGIONAL_COORDINATOR', 'ACTIVE'),
(4,  'Trần Minh Trọng',    'referee1@esports.vn',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0901000004', 'REFEREE',              'ACTIVE'),
(5,  'Lee Sang-hyeok',     'captain.t1@esports.vn',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0901000005', 'TEAM_CAPTAIN',         'ACTIVE'),
(6,  'Chen Ze-bin',        'captain.blg@esports.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0901000006', 'TEAM_CAPTAIN',         'ACTIVE'),
(7,  'Li Yuan-hao',        'captain.wbg@esports.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0901000007', 'TEAM_CAPTAIN',         'ACTIVE'),
(8,  'Simon Hofverberg',   'captain.los@esports.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0901000008', 'TEAM_CAPTAIN',         'ACTIVE'),
(9,  'Đỗ Duy Khánh',       'captain.gam@esports.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0901000009', 'TEAM_CAPTAIN',         'ACTIVE'),
(10, 'Trần Thảo Vy',       'viewer@esports.vn',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0901000010', 'VIEWER',               'ACTIVE');

-- =================================================================
-- 3. BẢNG TOURNAMENTS (5 giải đấu mẫu)
-- =================================================================
INSERT INTO tournaments (tournament_id, game_id, organizer_id, tournament_name, start_date, end_date, max_teams, tournament_status) VALUES
(1, 1, 2, 'CHUNG KẾT THẾ GIỚI LMHT 2026', '2026-10-01', '2026-11-05', 50, 'ONGOING'),
(2, 1, 2, 'MID-SEASON INVITATIONAL 2026', '2026-05-01', '2026-05-19', 12, 'COMPLETED'),
(3, 1, 2, 'LCK MÙA HÈ 2026',              '2026-06-12', '2026-08-25', 10, 'COMPLETED'),
(4, 2, 2, 'VALORANT CHAMPIONS 2026',      '2026-08-01', '2026-08-24', 16, 'COMPLETED'),
(5, 1, 2, 'KESPA CUP MÙA ĐÔNG 2026',      '2026-12-01', '2026-12-15', 16, 'DRAFT');

-- =================================================================
-- 4. BẢNG TEAMS (5 đội tuyển: T1, BLG, WBG, LOS, GAM)
-- =================================================================
INSERT INTO teams (team_id, captain_user_id, team_name, team_tag, country) VALUES
(1, 5, 'T1',              'T1',  'LCK'),
(2, 6, 'Bilibili Gaming', 'BLG', 'LPL'),
(3, 7, 'Weibo Gaming',    'WBG', 'LPL'),
(4, 8, 'Los Ratones',     'LOS', 'LEC'),
(5, 9, 'GAM Esports',     'GAM', 'VCS');

-- =================================================================
-- 5. BẢNG PLAYERS (10 tuyển thủ: đủ đội hình T1 + đại diện 4 đội còn lại)
-- =================================================================
INSERT INTO players (player_id, player_name, in_game_name, game_account_id) VALUES
(1,  'Choi Woo-je',      'Zeus',       'KR_ZEUS_001'),
(2,  'Mun Hyeon-jun',    'Oner',       'KR_ONER_002'),
(3,  'Lee Sang-hyeok',   'Faker',      'KR_FAKER_003'),
(4,  'Lee Min-hyeong',   'Gumayusi',   'KR_GUMA_004'),
(5,  'Ryu Min-seok',     'Keria',      'KR_KERIA_005'),
(6,  'Chen Ze-bin',      'Bin',        'CN_BIN_006'),
(7,  'Zhuo Ding',        'Knight',     'CN_KNIGHT_007'),
(8,  'Li Yuan-hao',      'Xiaohu',     'CN_XIAOHU_008'),
(9,  'Simon Hofverberg', 'Thebausffs', 'EU_BAUS_009'),
(10, 'Đỗ Duy Khánh',     'Levi',       'VN_LEVI_010');

-- =================================================================
-- 6. BẢNG TEAM_MEMBERS (Liên kết đội tuyển và tuyển thủ)
-- =================================================================
INSERT INTO team_members (team_id, player_id, member_role, joined_at) VALUES
(1, 1,  'MAIN',    '2025-01-10 08:00:00'),
(1, 2,  'MAIN',    '2025-01-10 08:00:00'),
(1, 3,  'CAPTAIN', '2025-01-10 08:00:00'),
(1, 4,  'MAIN',    '2025-01-10 08:00:00'),
(1, 5,  'MAIN',    '2025-01-10 08:00:00'),
(2, 6,  'CAPTAIN', '2025-02-01 08:00:00'),
(2, 7,  'MAIN',    '2025-02-01 08:00:00'),
(3, 8,  'CAPTAIN', '2025-02-15 08:00:00'),
(4, 9,  'CAPTAIN', '2025-03-01 08:00:00'),
(5, 10, 'CAPTAIN', '2025-01-20 08:00:00');

-- =================================================================
-- 7. BẢNG PARTICIPATION_APPLICATIONS (5 đơn đăng ký tham dự giải)
-- =================================================================
INSERT INTO participation_applications (application_id, tournament_id, team_id, application_status, submitted_at, reviewed_by, reviewed_at, note) VALUES
(1, 1, 1, 'APPROVED', '2026-09-05 10:00:00', 2,    '2026-09-06 09:30:00', 'Hạt giống số 1 khu vực LCK - Đủ điều kiện thi đấu'),
(2, 1, 2, 'APPROVED', '2026-09-05 11:15:00', 2,    '2026-09-06 09:35:00', 'Hạt giống số 1 khu vực LPL - Đã xác nhận đội hình'),
(3, 1, 3, 'APPROVED', '2026-09-07 14:20:00', 2,    '2026-09-08 10:00:00', 'Đủ điều kiện tham dự Vòng Thụy Sĩ'),
(4, 1, 4, 'APPROVED', '2026-09-10 16:45:00', 2,    '2026-09-11 11:00:00', 'Vượt qua Vòng Khởi Động'),
(5, 5, 5, 'PENDING',  '2026-11-15 09:00:00', NULL, NULL,                  'Đang chờ Ban tổ chức kiểm tra danh sách tuyển thủ');
--
-- Phan he Quan ly Tran dau va Ket qua
--
CREATE TABLE IF NOT EXISTS `matches` (
  `match_id` bigint NOT NULL AUTO_INCREMENT,
  `round_id` bigint NOT NULL,
  `team1_id` bigint NOT NULL,
  `team2_id` bigint NOT NULL,
  `match_code` varchar(30) NOT NULL,
  `scheduled_time` datetime DEFAULT NULL,
  `venue` varchar(100) DEFAULT NULL,
  `best_of` int NOT NULL DEFAULT 3,
  `match_status` varchar(30) NOT NULL DEFAULT 'SCHEDULED',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`match_id`),
  UNIQUE KEY `uk_match_code` (`match_code`),
  CONSTRAINT `chk_best_of` CHECK (`best_of` IN (1,3,5)),
  CONSTRAINT `chk_diff_teams` CHECK (`team1_id` <> `team2_id`)
);

CREATE TABLE IF NOT EXISTS `match_results` (
  `result_id` bigint NOT NULL AUTO_INCREMENT,
  `match_id` bigint NOT NULL,
  `team1_score` int NOT NULL,
  `team2_score` int NOT NULL,
  `winner_team_id` bigint DEFAULT NULL,
  `result_status` varchar(20) NOT NULL DEFAULT 'DRAFT',
  `entered_by` bigint DEFAULT NULL,
  `confirmed_by` bigint DEFAULT NULL,
  `confirmed_at` datetime DEFAULT NULL,
  `note` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`result_id`),
  UNIQUE KEY `uk_result_match` (`match_id`)
);

CREATE TABLE IF NOT EXISTS `match_referees` (
  `match_id` bigint NOT NULL,
  `referee_user_id` bigint NOT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`match_id`,`referee_user_id`)
);

CREATE TABLE IF NOT EXISTS stages (
                                      stage_id BIGINT NOT NULL AUTO_INCREMENT,
                                      tournament_id BIGINT NOT NULL,
                                      stage_name VARCHAR(100) NOT NULL,
                                      stage_type VARCHAR(20) NOT NULL,
                                      stage_order INT NOT NULL,
                                      start_date DATETIME(6) NULL,
                                      end_date DATETIME(6) NULL,
                                      stage_status VARCHAR(20) NOT NULL,
                                      PRIMARY KEY (stage_id),
                                      KEY idx_stages_tournament_order (tournament_id, stage_order),
                                      CONSTRAINT fk_stages_tournament_sample
                                          FOREIGN KEY (tournament_id) REFERENCES tournaments (tournament_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rounds (
                                      round_id BIGINT NOT NULL AUTO_INCREMENT,
                                      stage_id BIGINT NOT NULL,
                                      round_number INT NOT NULL,
                                      round_name VARCHAR(100) NULL,
                                      scheduled_start DATETIME(6) NULL,
                                      round_status VARCHAR(20) NOT NULL,
                                      PRIMARY KEY (round_id),
                                      UNIQUE KEY uk_round_stage_number_sample (stage_id, round_number),
                                      CONSTRAINT fk_rounds_stage_sample
                                          FOREIGN KEY (stage_id) REFERENCES stages (stage_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS team_stage_records (
                                                  team_stage_record_id BIGINT NOT NULL AUTO_INCREMENT,
                                                  stage_id BIGINT NOT NULL,
                                                  team_id BIGINT NOT NULL,
                                                  seed_number INT NULL,
                                                  wins INT NOT NULL DEFAULT 0,
                                                  losses INT NOT NULL DEFAULT 0,
                                                  stage_team_status VARCHAR(20) NOT NULL,
                                                  PRIMARY KEY (team_stage_record_id),
                                                  UNIQUE KEY uk_team_stage_sample (stage_id, team_id),
                                                  UNIQUE KEY uk_stage_seed_sample (stage_id, seed_number),
                                                  CONSTRAINT fk_team_stage_stage_sample
                                                      FOREIGN KEY (stage_id) REFERENCES stages (stage_id),
                                                  CONSTRAINT fk_team_stage_team_sample
                                                      FOREIGN KEY (team_id) REFERENCES teams (team_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dung KeSPA Cup Mua Dong 2026 da co trong bo du lieu mau.
-- Neu database chi co dump cu, tao them giai nay tu game va organizer san co.
SET @demo_game_id := (SELECT MIN(game_id) FROM game_titles);
SET @demo_organizer_id := (
    SELECT user_id
    FROM users
    ORDER BY CASE WHEN role = 'ORGANIZER' AND account_status = 'ACTIVE' THEN 0
                  WHEN role = 'ADMIN' AND account_status = 'ACTIVE' THEN 1
                  WHEN role = 'ORGANIZER' THEN 2
                  WHEN role = 'ADMIN' THEN 3 ELSE 4 END,
             user_id
    LIMIT 1
);

INSERT INTO tournaments (
    game_id, organizer_id, tournament_name, start_date, end_date,
    max_teams, tournament_status
)
SELECT @demo_game_id, @demo_organizer_id,
       'KESPA CUP MÙA ĐÔNG 2026', '2026-12-01', '2026-12-15', 16, 'DRAFT'
FROM DUAL
WHERE @demo_game_id IS NOT NULL
  AND @demo_organizer_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM tournaments
    WHERE UPPER(tournament_name) = UPPER('KESPA CUP MÙA ĐÔNG 2026')
);

SET @demo_tournament_id := (
    SELECT tournament_id
    FROM tournaments
    WHERE UPPER(tournament_name) = UPPER('KESPA CUP MÙA ĐÔNG 2026')
    ORDER BY tournament_id
    LIMIT 1
);

-- Dua bon doi da co trong Database vao danh sach dang ky mau cua giai.
-- Don dang ky hien co (ke ca PENDING) duoc giu nguyen, khong cap nhat.
INSERT INTO participation_applications (
    tournament_id, team_id, application_status, submitted_at,
    reviewed_by, reviewed_at, note
)
SELECT @demo_tournament_id, t.team_id, 'APPROVED', '2026-11-20 09:00:00',
       @demo_organizer_id, '2026-11-20 12:00:00',
       'Du lieu mau phuc vu kiem thu chuc nang Lich thi dau.'
FROM teams t
WHERE @demo_tournament_id IS NOT NULL
  AND t.team_tag IN ('T1', 'BLG', 'WBG', 'LOS')
  AND NOT EXISTS (
    SELECT 1 FROM participation_applications pa
    WHERE pa.tournament_id = @demo_tournament_id AND pa.team_id = t.team_id
);

-- Giai doan 1: Vòng bảng.
INSERT INTO stages (
    tournament_id, stage_name, stage_type, stage_order,
    start_date, end_date, stage_status
)
SELECT @demo_tournament_id, 'Vòng bảng', 'GROUP_STAGE',
       COALESCE((SELECT MAX(stage_order) + 1 FROM stages WHERE tournament_id = @demo_tournament_id), 1),
       '2026-12-01 09:00:00', '2026-12-08 22:00:00', 'UPCOMING'
FROM DUAL
WHERE @demo_tournament_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM stages
    WHERE tournament_id = @demo_tournament_id AND stage_name = 'Vòng bảng'
);

-- Giai doan 2: Playoffs.
INSERT INTO stages (
    tournament_id, stage_name, stage_type, stage_order,
    start_date, end_date, stage_status
)
SELECT @demo_tournament_id, 'Playoffs', 'PLAYOFF',
       COALESCE((SELECT MAX(stage_order) + 1 FROM stages WHERE tournament_id = @demo_tournament_id), 1),
       '2026-12-09 09:00:00', '2026-12-15 22:00:00', 'UPCOMING'
FROM DUAL
WHERE @demo_tournament_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM stages
    WHERE tournament_id = @demo_tournament_id AND stage_name = 'Playoffs'
);

SET @group_stage_id := (
    SELECT stage_id FROM stages
    WHERE tournament_id = @demo_tournament_id AND stage_name = 'Vòng bảng'
    LIMIT 1
);
SET @playoff_stage_id := (
    SELECT stage_id FROM stages
    WHERE tournament_id = @demo_tournament_id AND stage_name = 'Playoffs'
    LIMIT 1
);

-- Dang ky doi du dieu kien vao ca hai giai doan mau.
-- Seed duoc danh theo thu tu T1, BLG, WBG, LOS.
INSERT INTO team_stage_records (
    stage_id, team_id, seed_number, wins, losses, stage_team_status
)
SELECT @group_stage_id, t.team_id,
       CASE t.team_tag WHEN 'T1' THEN 1 WHEN 'BLG' THEN 2
                       WHEN 'WBG' THEN 3 WHEN 'LOS' THEN 4 END,
       0, 0, 'ACTIVE'
FROM teams t
         JOIN participation_applications pa
              ON pa.team_id = t.team_id
                  AND pa.tournament_id = @demo_tournament_id
                  AND pa.application_status = 'APPROVED'
WHERE @group_stage_id IS NOT NULL
  AND t.team_tag IN ('T1', 'BLG', 'WBG', 'LOS')
  AND NOT EXISTS (
    SELECT 1 FROM team_stage_records r
    WHERE r.stage_id = @group_stage_id AND r.team_id = t.team_id
)
  AND NOT EXISTS (
    SELECT 1 FROM team_stage_records r
    WHERE r.stage_id = @group_stage_id
      AND r.seed_number = CASE t.team_tag WHEN 'T1' THEN 1 WHEN 'BLG' THEN 2
                                          WHEN 'WBG' THEN 3 WHEN 'LOS' THEN 4 END
);

INSERT INTO team_stage_records (
    stage_id, team_id, seed_number, wins, losses, stage_team_status
)
SELECT @playoff_stage_id, t.team_id,
       CASE t.team_tag WHEN 'T1' THEN 1 WHEN 'BLG' THEN 2
                       WHEN 'WBG' THEN 3 WHEN 'LOS' THEN 4 END,
       0, 0, 'ACTIVE'
FROM teams t
         JOIN participation_applications pa
              ON pa.team_id = t.team_id
                  AND pa.tournament_id = @demo_tournament_id
                  AND pa.application_status = 'APPROVED'
WHERE @playoff_stage_id IS NOT NULL
  AND t.team_tag IN ('T1', 'BLG', 'WBG', 'LOS')
  AND NOT EXISTS (
    SELECT 1 FROM team_stage_records r
    WHERE r.stage_id = @playoff_stage_id AND r.team_id = t.team_id
)
  AND NOT EXISTS (
    SELECT 1 FROM team_stage_records r
    WHERE r.stage_id = @playoff_stage_id
      AND r.seed_number = CASE t.team_tag WHEN 'T1' THEN 1 WHEN 'BLG' THEN 2
                                          WHEN 'WBG' THEN 3 WHEN 'LOS' THEN 4 END
);

-- Cac vong dau mau.
INSERT INTO rounds (stage_id, round_number, round_name, scheduled_start, round_status)
SELECT @group_stage_id, 1, 'Ngày thi đấu 1', '2026-12-02 09:00:00', 'UPCOMING'
FROM DUAL
WHERE @group_stage_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM rounds WHERE stage_id = @group_stage_id AND round_number = 1);

INSERT INTO rounds (stage_id, round_number, round_name, scheduled_start, round_status)
SELECT @group_stage_id, 2, 'Ngày thi đấu 2', '2026-12-03 09:00:00', 'UPCOMING'
FROM DUAL
WHERE @group_stage_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM rounds WHERE stage_id = @group_stage_id AND round_number = 2);

INSERT INTO rounds (stage_id, round_number, round_name, scheduled_start, round_status)
SELECT @playoff_stage_id, 1, 'Bán kết', '2026-12-10 09:00:00', 'UPCOMING'
FROM DUAL
WHERE @playoff_stage_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM rounds WHERE stage_id = @playoff_stage_id AND round_number = 1);

INSERT INTO rounds (stage_id, round_number, round_name, scheduled_start, round_status)
SELECT @playoff_stage_id, 2, 'Chung kết', '2026-12-14 17:00:00', 'UPCOMING'
FROM DUAL
WHERE @playoff_stage_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM rounds WHERE stage_id = @playoff_stage_id AND round_number = 2);

SET @group_round_1_id := (SELECT round_id FROM rounds WHERE stage_id = @group_stage_id AND round_number = 1 LIMIT 1);
SET @group_round_2_id := (SELECT round_id FROM rounds WHERE stage_id = @group_stage_id AND round_number = 2 LIMIT 1);
SET @semi_round_id := (SELECT round_id FROM rounds WHERE stage_id = @playoff_stage_id AND round_number = 1 LIMIT 1);
SET @final_round_id := (SELECT round_id FROM rounds WHERE stage_id = @playoff_stage_id AND round_number = 2 LIMIT 1);

SET @team_t1_id := (SELECT team_id FROM teams WHERE team_tag = 'T1' ORDER BY team_id LIMIT 1);
SET @team_blg_id := (SELECT team_id FROM teams WHERE team_tag = 'BLG' ORDER BY team_id LIMIT 1);
SET @team_wbg_id := (SELECT team_id FROM teams WHERE team_tag = 'WBG' ORDER BY team_id LIMIT 1);
SET @team_los_id := (SELECT team_id FROM teams WHERE team_tag = 'LOS' ORDER BY team_id LIMIT 1);

-- Cac tran mau; gio thi dau cach nhau de tranh xung dot lich cua cung mot doi.
INSERT INTO matches (
    round_id, team1_id, team2_id, match_code, scheduled_time,
    venue, best_of, match_status
)
SELECT @group_round_1_id, @team_t1_id, @team_blg_id,
       'KESPA26-G1-M1', '2026-12-02 10:00:00', 'Seoul Esports Arena', 3, 'SCHEDULED'
FROM DUAL
WHERE @group_round_1_id IS NOT NULL AND @team_t1_id IS NOT NULL AND @team_blg_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM matches WHERE match_code = 'KESPA26-G1-M1');

INSERT INTO matches (
    round_id, team1_id, team2_id, match_code, scheduled_time,
    venue, best_of, match_status
)
SELECT @group_round_1_id, @team_wbg_id, @team_los_id,
       'KESPA26-G1-M2', '2026-12-02 14:00:00', 'Seoul Esports Arena', 3, 'SCHEDULED'
FROM DUAL
WHERE @group_round_1_id IS NOT NULL AND @team_wbg_id IS NOT NULL AND @team_los_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM matches WHERE match_code = 'KESPA26-G1-M2');

INSERT INTO matches (
    round_id, team1_id, team2_id, match_code, scheduled_time,
    venue, best_of, match_status
)
SELECT @group_round_2_id, @team_t1_id, @team_wbg_id,
       'KESPA26-G2-M1', '2026-12-03 10:00:00', 'Seoul Esports Arena', 3, 'SCHEDULED'
FROM DUAL
WHERE @group_round_2_id IS NOT NULL AND @team_t1_id IS NOT NULL AND @team_wbg_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM matches WHERE match_code = 'KESPA26-G2-M1');

INSERT INTO matches (
    round_id, team1_id, team2_id, match_code, scheduled_time,
    venue, best_of, match_status
)
SELECT @group_round_2_id, @team_blg_id, @team_los_id,
       'KESPA26-G2-M2', '2026-12-03 14:00:00', 'Seoul Esports Arena', 3, 'SCHEDULED'
FROM DUAL
WHERE @group_round_2_id IS NOT NULL AND @team_blg_id IS NOT NULL AND @team_los_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM matches WHERE match_code = 'KESPA26-G2-M2');

INSERT INTO matches (
    round_id, team1_id, team2_id, match_code, scheduled_time,
    venue, best_of, match_status
)
SELECT @semi_round_id, @team_t1_id, @team_los_id,
       'KESPA26-SF-M1', '2026-12-10 10:00:00', 'Seoul Esports Arena', 5, 'SCHEDULED'
FROM DUAL
WHERE @semi_round_id IS NOT NULL AND @team_t1_id IS NOT NULL AND @team_los_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM matches WHERE match_code = 'KESPA26-SF-M1');

INSERT INTO matches (
    round_id, team1_id, team2_id, match_code, scheduled_time,
    venue, best_of, match_status
)
SELECT @semi_round_id, @team_blg_id, @team_wbg_id,
       'KESPA26-SF-M2', '2026-12-10 15:00:00', 'Seoul Esports Arena', 5, 'SCHEDULED'
FROM DUAL
WHERE @semi_round_id IS NOT NULL AND @team_blg_id IS NOT NULL AND @team_wbg_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM matches WHERE match_code = 'KESPA26-SF-M2');

INSERT INTO matches (
    round_id, team1_id, team2_id, match_code, scheduled_time,
    venue, best_of, match_status
)
SELECT @final_round_id, @team_t1_id, @team_blg_id,
       'KESPA26-FINAL', '2026-12-14 18:00:00', 'Seoul Esports Arena', 5, 'SCHEDULED'
FROM DUAL
WHERE @final_round_id IS NOT NULL AND @team_t1_id IS NOT NULL AND @team_blg_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM matches WHERE match_code = 'KESPA26-FINAL');

-- Kiem tra nhanh so luong ban ghi sau khi chay.
SELECT 'Stages' AS data_type, COUNT(*) AS total
FROM stages WHERE tournament_id = @demo_tournament_id
UNION ALL
SELECT 'Rounds', COUNT(*)
FROM rounds r JOIN stages s ON s.stage_id = r.stage_id
WHERE s.tournament_id = @demo_tournament_id
UNION ALL
SELECT 'Teams in stages', COUNT(*)
FROM team_stage_records tsr JOIN stages s ON s.stage_id = tsr.stage_id
WHERE s.tournament_id = @demo_tournament_id
UNION ALL
SELECT 'Matches', COUNT(*)
FROM matches m JOIN rounds r ON r.round_id = m.round_id
               JOIN stages s ON s.stage_id = r.stage_id
WHERE s.tournament_id = @demo_tournament_id;

-- =================================================================
-- DỮ LIỆU MẪU GIẢI CHUNG KẾT THẾ GIỚI LMHT 2026 (CKTG 2026)
-- =================================================================
SET @cktg_id := (
    SELECT tournament_id FROM tournaments
    WHERE UPPER(tournament_name) = UPPER('CHUNG KẾT THẾ GIỚI LMHT 2026')
    ORDER BY tournament_id LIMIT 1
);
SET @cktg_org_id := COALESCE((SELECT user_id FROM users WHERE role = 'ORGANIZER' LIMIT 1), 2);
SET @cktg_ref_id := COALESCE((SELECT user_id FROM users WHERE role = 'REFEREE' LIMIT 1), 4);

SET @t1_id  := (SELECT team_id FROM teams WHERE team_tag = 'T1'  LIMIT 1);
SET @blg_id := (SELECT team_id FROM teams WHERE team_tag = 'BLG' LIMIT 1);
SET @wbg_id := (SELECT team_id FROM teams WHERE team_tag = 'WBG' LIMIT 1);
SET @los_id := (SELECT team_id FROM teams WHERE team_tag = 'LOS' LIMIT 1);
SET @gam_id := (SELECT team_id FROM teams WHERE team_tag = 'GAM' LIMIT 1);

-- Bổ sung đơn duyệt cho GAM vào CKTG 2026 (4 đội kia đã có sẵn)
INSERT INTO participation_applications (
    tournament_id, team_id, application_status, submitted_at, reviewed_by, reviewed_at, note
)
SELECT @cktg_id, @gam_id, 'APPROVED', '2026-09-12 10:00:00', @cktg_org_id, '2026-09-12 14:00:00',
       'Đại diện khu vực VCS tham dự CKTG 2026'
FROM DUAL
WHERE @cktg_id IS NOT NULL AND @gam_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM participation_applications
      WHERE tournament_id = @cktg_id AND team_id = @gam_id
  );

-- 1. Thêm 2 Giai đoạn cho CKTG 2026
INSERT INTO stages (tournament_id, stage_name, stage_type, stage_order, start_date, end_date, stage_status)
SELECT @cktg_id, 'Vòng Thụy Sĩ (Swiss Stage)', 'SWISS', 1, '2026-10-03 19:00:00', '2026-10-13 23:00:00', 'COMPLETED'
FROM DUAL
WHERE @cktg_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM stages WHERE tournament_id = @cktg_id AND stage_name = 'Vòng Thụy Sĩ (Swiss Stage)');

INSERT INTO stages (tournament_id, stage_name, stage_type, stage_order, start_date, end_date, stage_status)
SELECT @cktg_id, 'Vòng Loại Trực Tiếp (Knockout Stage)', 'PLAYOFF', 2, '2026-10-17 19:00:00', '2026-11-02 23:00:00', 'ONGOING'
FROM DUAL
WHERE @cktg_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM stages WHERE tournament_id = @cktg_id AND stage_name = 'Vòng Loại Trực Tiếp (Knockout Stage)');

SET @cktg_swiss_id   := (SELECT stage_id FROM stages WHERE tournament_id = @cktg_id AND stage_order = 1 LIMIT 1);
SET @cktg_playoff_id := (SELECT stage_id FROM stages WHERE tournament_id = @cktg_id AND stage_order = 2 LIMIT 1);

-- 2. Ghi nhận hạt giống & thành tích các đội vào từng giai đoạn (phục vụ BXH)
INSERT INTO team_stage_records (stage_id, team_id, seed_number, wins, losses, stage_team_status)
SELECT @cktg_swiss_id, t.team_id,
       CASE t.team_tag WHEN 'T1' THEN 1 WHEN 'BLG' THEN 2 WHEN 'WBG' THEN 3 WHEN 'LOS' THEN 4 WHEN 'GAM' THEN 5 END,
       CASE t.team_tag WHEN 'T1' THEN 1 WHEN 'GAM' THEN 1 ELSE 0 END,
       CASE t.team_tag WHEN 'BLG' THEN 1 WHEN 'WBG' THEN 1 ELSE 0 END,
       'ACTIVE'
FROM teams t
WHERE @cktg_swiss_id IS NOT NULL AND t.team_tag IN ('T1', 'BLG', 'WBG', 'LOS', 'GAM')
  AND NOT EXISTS (SELECT 1 FROM team_stage_records r WHERE r.stage_id = @cktg_swiss_id AND r.team_id = t.team_id);

INSERT INTO team_stage_records (stage_id, team_id, seed_number, wins, losses, stage_team_status)
SELECT @cktg_playoff_id, t.team_id,
       CASE t.team_tag WHEN 'T1' THEN 1 WHEN 'BLG' THEN 2 WHEN 'WBG' THEN 3 WHEN 'GAM' THEN 4 END,
       CASE t.team_tag WHEN 'T1' THEN 2 WHEN 'BLG' THEN 1 ELSE 0 END,
       CASE t.team_tag WHEN 'WBG' THEN 1 WHEN 'GAM' THEN 1 ELSE 0 END,
       'ACTIVE'
FROM teams t
WHERE @cktg_playoff_id IS NOT NULL AND t.team_tag IN ('T1', 'BLG', 'WBG', 'GAM')
  AND NOT EXISTS (SELECT 1 FROM team_stage_records r WHERE r.stage_id = @cktg_playoff_id AND r.team_id = t.team_id);

-- 3. Thêm 4 Vòng đấu (Swiss Vòng 1, Tứ kết, Bán kết, Chung kết Tổng)
INSERT INTO rounds (stage_id, round_number, round_name, scheduled_start, round_status)
SELECT @cktg_swiss_id, 1, 'Vòng 1 - Swiss', '2026-10-03 19:00:00', 'COMPLETED'
FROM DUAL WHERE @cktg_swiss_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM rounds WHERE stage_id = @cktg_swiss_id AND round_number = 1);

INSERT INTO rounds (stage_id, round_number, round_name, scheduled_start, round_status)
SELECT @cktg_playoff_id, 1, 'Tứ kết', '2026-10-19 19:00:00', 'COMPLETED'
FROM DUAL WHERE @cktg_playoff_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM rounds WHERE stage_id = @cktg_playoff_id AND round_number = 1);

INSERT INTO rounds (stage_id, round_number, round_name, scheduled_start, round_status)
SELECT @cktg_playoff_id, 2, 'Bán kết', '2026-10-26 19:00:00', 'COMPLETED'
FROM DUAL WHERE @cktg_playoff_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM rounds WHERE stage_id = @cktg_playoff_id AND round_number = 2);

INSERT INTO rounds (stage_id, round_number, round_name, scheduled_start, round_status)
SELECT @cktg_playoff_id, 3, 'Chung kết Tổng', '2026-11-02 20:00:00', 'ONGOING'
FROM DUAL WHERE @cktg_playoff_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM rounds WHERE stage_id = @cktg_playoff_id AND round_number = 3);

SET @r_swiss1 := (SELECT round_id FROM rounds WHERE stage_id = @cktg_swiss_id   AND round_number = 1 LIMIT 1);
SET @r_qf     := (SELECT round_id FROM rounds WHERE stage_id = @cktg_playoff_id AND round_number = 1 LIMIT 1);
SET @r_sf     := (SELECT round_id FROM rounds WHERE stage_id = @cktg_playoff_id AND round_number = 2 LIMIT 1);
SET @r_gf     := (SELECT round_id FROM rounds WHERE stage_id = @cktg_playoff_id AND round_number = 3 LIMIT 1);

-- 4. Thêm 6 Trận đấu CKTG 2026 (5 trận đã đấu + 1 trận Chung kết Tổng chờ nhập tỷ số)
INSERT INTO matches (round_id, team1_id, team2_id, match_code, scheduled_time, venue, best_of, match_status)
SELECT @r_swiss1, @t1_id, @blg_id, 'CKTG26-SW1-M1', '2026-10-03 19:00:00', 'O2 Arena, London', 1, 'COMPLETED'
FROM DUAL WHERE @r_swiss1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM matches WHERE match_code = 'CKTG26-SW1-M1');

INSERT INTO matches (round_id, team1_id, team2_id, match_code, scheduled_time, venue, best_of, match_status)
SELECT @r_swiss1, @gam_id, @wbg_id, 'CKTG26-SW1-M2', '2026-10-03 20:30:00', 'O2 Arena, London', 1, 'COMPLETED'
FROM DUAL WHERE @r_swiss1 IS NOT NULL AND NOT EXISTS (SELECT 1 FROM matches WHERE match_code = 'CKTG26-SW1-M2');

INSERT INTO matches (round_id, team1_id, team2_id, match_code, scheduled_time, venue, best_of, match_status)
SELECT @r_qf, @t1_id, @wbg_id, 'CKTG26-QF-M1', '2026-10-19 19:00:00', 'O2 Arena, London', 5, 'COMPLETED'
FROM DUAL WHERE @r_qf IS NOT NULL AND NOT EXISTS (SELECT 1 FROM matches WHERE match_code = 'CKTG26-QF-M1');

INSERT INTO matches (round_id, team1_id, team2_id, match_code, scheduled_time, venue, best_of, match_status)
SELECT @r_sf, @t1_id, @gam_id, 'CKTG26-SF-M1', '2026-10-26 19:00:00', 'O2 Arena, London', 5, 'COMPLETED'
FROM DUAL WHERE @r_sf IS NOT NULL AND NOT EXISTS (SELECT 1 FROM matches WHERE match_code = 'CKTG26-SF-M1');

INSERT INTO matches (round_id, team1_id, team2_id, match_code, scheduled_time, venue, best_of, match_status)
SELECT @r_sf, @blg_id, @los_id, 'CKTG26-SF-M2', '2026-10-27 19:00:00', 'O2 Arena, London', 5, 'COMPLETED'
FROM DUAL WHERE @r_sf IS NOT NULL AND NOT EXISTS (SELECT 1 FROM matches WHERE match_code = 'CKTG26-SF-M2');

INSERT INTO matches (round_id, team1_id, team2_id, match_code, scheduled_time, venue, best_of, match_status)
SELECT @r_gf, @t1_id, @blg_id, 'CKTG26-FINAL', '2026-11-02 20:00:00', 'O2 Arena, London', 5, 'SCHEDULED'
FROM DUAL WHERE @r_gf IS NOT NULL AND NOT EXISTS (SELECT 1 FROM matches WHERE match_code = 'CKTG26-FINAL');

-- 5. Thêm Kết quả 5 trận đã hoàn tất (để lại CKTG26-FINAL chưa có tỷ số để Demo trực tiếp)
INSERT INTO match_results (match_id, team1_score, team2_score, winner_team_id, result_status, entered_by, confirmed_by, confirmed_at, note)
SELECT (SELECT match_id FROM matches WHERE match_code = 'CKTG26-SW1-M1' LIMIT 1), 1, 0, @t1_id,
       'CONFIRMED', @cktg_ref_id, @cktg_org_id, NOW(), 'T1 kiểm soát mục tiêu lớn vượt trội sau phút 28'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM match_results mr JOIN matches m ON mr.match_id = m.match_id WHERE m.match_code = 'CKTG26-SW1-M1');

INSERT INTO match_results (match_id, team1_score, team2_score, winner_team_id, result_status, entered_by, confirmed_by, confirmed_at, note)
SELECT (SELECT match_id FROM matches WHERE match_code = 'CKTG26-SW1-M2' LIMIT 1), 1, 0, @gam_id,
       'CONFIRMED', @cktg_ref_id, @cktg_org_id, NOW(), 'GAM tạo địa chấn ngày mở màn nhờ giao tranh tổng'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM match_results mr JOIN matches m ON mr.match_id = m.match_id WHERE m.match_code = 'CKTG26-SW1-M2');

INSERT INTO match_results (match_id, team1_score, team2_score, winner_team_id, result_status, entered_by, confirmed_by, confirmed_at, note)
SELECT (SELECT match_id FROM matches WHERE match_code = 'CKTG26-QF-M1' LIMIT 1), 3, 0, @t1_id,
       'CONFIRMED', @cktg_ref_id, @cktg_org_id, NOW(), 'T1 thắng áp đảo 3-0 tiến vào Bán kết'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM match_results mr JOIN matches m ON mr.match_id = m.match_id WHERE m.match_code = 'CKTG26-QF-M1');

INSERT INTO match_results (match_id, team1_score, team2_score, winner_team_id, result_status, entered_by, confirmed_by, confirmed_at, note)
SELECT (SELECT match_id FROM matches WHERE match_code = 'CKTG26-SF-M1' LIMIT 1), 3, 1, @t1_id,
       'CONFIRMED', @cktg_ref_id, @cktg_org_id, NOW(), 'GAM giành được 1 ván thắng trước nhà ĐKVĐ'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM match_results mr JOIN matches m ON mr.match_id = m.match_id WHERE m.match_code = 'CKTG26-SF-M1');

INSERT INTO match_results (match_id, team1_score, team2_score, winner_team_id, result_status, entered_by, confirmed_by, confirmed_at, note)
SELECT (SELECT match_id FROM matches WHERE match_code = 'CKTG26-SF-M2' LIMIT 1), 3, 2, @blg_id,
       'CONFIRMED', @cktg_ref_id, @cktg_org_id, NOW(), 'Loạt BO5 căng thẳng đến ván 5 quyết định'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM match_results mr JOIN matches m ON mr.match_id = m.match_id WHERE m.match_code = 'CKTG26-FINAL' AND mr.result_id IS NOT NULL)
  AND NOT EXISTS (SELECT 1 FROM match_results mr JOIN matches m ON mr.match_id = m.match_id WHERE m.match_code = 'CKTG26-SF-M2');