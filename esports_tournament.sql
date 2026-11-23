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