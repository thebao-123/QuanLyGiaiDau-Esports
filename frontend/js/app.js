const GAME_MAP = {
  1: "Liên Minh Huyền Thoại",
  2: "VALORANT",
  3: "Đấu Trường Chân Lý (TFT)",
  4: "Counter-Strike 2",
  5: "Dota 2"
};

const ROLE_LABELS = {
  ADMIN: "Quản trị viên",
  ORGANIZER: "Ban tổ chức",
  REGIONAL_COORDINATOR: "Điều phối khu vực",
  REFEREE: "Trọng tài",
  TEAM_CAPTAIN: "Đội trưởng",
  VIEWER: "Khán giả"
};

const DEFAULT_ROSTERS_BY_TAG = {
  T1: [
    { ign: "Zeus", fullName: "Choi Woo-je", gameAccountId: "KR_ZEUS_001", role: "MAIN" },
    { ign: "Oner", fullName: "Mun Hyeon-jun", gameAccountId: "KR_ONER_002", role: "MAIN" },
    { ign: "Faker", fullName: "Lee Sang-hyeok", gameAccountId: "KR_FAKER_003", role: "CAPTAIN" },
    { ign: "Gumayusi", fullName: "Lee Min-hyeong", gameAccountId: "KR_GUMA_004", role: "MAIN" },
    { ign: "Keria", fullName: "Ryu Min-seok", gameAccountId: "KR_KERIA_005", role: "MAIN" }
  ],
  BLG: [
    { ign: "Bin", fullName: "Chen Ze-bin", gameAccountId: "CN_BIN_006", role: "CAPTAIN" },
    { ign: "Xun", fullName: "Peng Li-xun", gameAccountId: "CN_XUN_011", role: "MAIN" },
    { ign: "Knight", fullName: "Zhuo Ding", gameAccountId: "CN_KNIGHT_007", role: "MAIN" },
    { ign: "Elk", fullName: "Zhao Jia-hao", gameAccountId: "CN_ELK_012", role: "MAIN" },
    { ign: "ON", fullName: "Luo Wen-jun", gameAccountId: "CN_ON_013", role: "MAIN" }
  ],
  WBG: [
    { ign: "Breathe", fullName: "Chen Chen", gameAccountId: "CN_BREATHE_014", role: "MAIN" },
    { ign: "Tarzan", fullName: "Lee Seung-yong", gameAccountId: "CN_TARZAN_015", role: "MAIN" },
    { ign: "Xiaohu", fullName: "Li Yuan-hao", gameAccountId: "CN_XIAOHU_008", role: "CAPTAIN" },
    { ign: "Light", fullName: "Wang Guang-yu", gameAccountId: "CN_LIGHT_016", role: "MAIN" },
    { ign: "Crisp", fullName: "Liu Qing-song", gameAccountId: "CN_CRISP_017", role: "MAIN" }
  ],
  LOS: [
    { ign: "Thebausffs", fullName: "Simon Hofverberg", gameAccountId: "EU_BAUS_009", role: "CAPTAIN" },
    { ign: "Velja", fullName: "Veljko Čamdžić", gameAccountId: "EU_VELJA_018", role: "MAIN" },
    { ign: "Nemesis", fullName: "Tim Lipovšek", gameAccountId: "EU_NEMESIS_019", role: "MAIN" },
    { ign: "Crownie", fullName: "Juš Marušič", gameAccountId: "EU_CROWNIE_020", role: "MAIN" },
    { ign: "Rekkles", fullName: "Carl Martin Erik Larsson", gameAccountId: "EU_REKKLES_021", role: "MAIN" }
  ],
  LR: [
    { ign: "Thebausffs", fullName: "Simon Hofverberg", gameAccountId: "EU_BAUS_009", role: "CAPTAIN" },
    { ign: "Velja", fullName: "Veljko Čamdžić", gameAccountId: "EU_VELJA_018", role: "MAIN" },
    { ign: "Nemesis", fullName: "Tim Lipovšek", gameAccountId: "EU_NEMESIS_019", role: "MAIN" },
    { ign: "Crownie", fullName: "Juš Marušič", gameAccountId: "EU_CROWNIE_020", role: "MAIN" },
    { ign: "Rekkles", fullName: "Carl Martin Erik Larsson", gameAccountId: "EU_REKKLES_021", role: "MAIN" }
  ],
  GAM: [
    { ign: "Kiaya", fullName: "Trần Duy Sang", gameAccountId: "VN_KIAYA_022", role: "MAIN" },
    { ign: "Levi", fullName: "Đỗ Duy Khánh", gameAccountId: "VN_LEVI_010", role: "CAPTAIN" },
    { ign: "Emo", fullName: "Nguyễn Thái Vinh", gameAccountId: "VN_EMO_023", role: "MAIN" },
    { ign: "EasyLove", fullName: "Hứa Thành An", gameAccountId: "VN_EASYLOVE_024", role: "MAIN" },
    { ign: "Elio", fullName: "Phạm Thạch Nhân Băng", gameAccountId: "VN_ELIO_025", role: "MAIN" }
  ],
  TSW: [
    { ign: "Hiro02", fullName: "Nguyễn Hoàng Sơn", gameAccountId: "VN_HIRO02_026", role: "CAPTAIN" },
    { ign: "Hizto", fullName: "Lê Văn Hậu", gameAccountId: "VN_HIZTO_027", role: "MAIN" },
    { ign: "Dire", fullName: "Trần Duy Đức", gameAccountId: "VN_DIRE_028", role: "MAIN" },
    { ign: "Eddie", fullName: "Hoàng Công Nghĩa", gameAccountId: "VN_EDDIE_029", role: "MAIN" },
    { ign: "Taki", fullName: "Đinh Anh Tài", gameAccountId: "VN_TAKI_030", role: "MAIN" }
  ]
};

// ===== ÁNH XẠ QUỐC GIA <-> KHU VỰC ESPORTS =====
const REGION_COUNTRY_GROUPS = [
  {
    code: "LCK",
    label: "Hàn Quốc (LCK)",
    aliases: ["han quoc", "korea", "south korea", "kr", "lck"]
  },
  {
    code: "LPL",
    label: "Trung Quốc (LPL)",
    aliases: ["trung quoc", "china", "cn", "lpl"]
  },
  {
    code: "VCS",
    label: "Việt Nam (VCS)",
    aliases: ["viet nam", "vietnam", "vn", "vcs"]
  },
  {
    code: "LEC",
    label: "Châu Âu (LEC)",
    aliases: ["chau au", "europe", "eu", "emea", "lec"]
  },
  {
    code: "LCS",
    label: "Bắc Mỹ (LCS / LTA)",
    aliases: ["bac my", "my", "usa", "us", "na", "north america", "lcs", "lta"]
  },
  {
    code: "LCP",
    label: "Châu Á - TBD (LCP / PCS)",
    aliases: ["chau a", "chau a - tbd", "dai loan", "nhat ban", "apac", "tw", "jp", "pcs", "ljl", "lcp"]
  },
  {
    code: "CBLOL",
    label: "Brazil (CBLOL)",
    aliases: ["brazil", "br", "cblol"]
  }
];

function normalizeSearchText(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();
}

function getRegionGroup(value) {
  const norm = normalizeSearchText(value);
  if (!norm) return null;
  return REGION_COUNTRY_GROUPS.find((g) => g.aliases.some((alias) => alias === norm)) || null;
}

function formatTeamRegionLabel(rawCountry) {
  const group = getRegionGroup(rawCountry);
  return group ? group.label : rawCountry || "—";
}

function matchesCountryFilter(teamCountry, filterCountry) {
  if (!filterCountry || filterCountry === "ALL") return true;
  const teamGroup = getRegionGroup(teamCountry);
  const filterGroup = getRegionGroup(filterCountry);

  if (teamGroup && filterGroup) {
    return teamGroup.code === filterGroup.code;
  }
  return normalizeSearchText(teamCountry) === normalizeSearchText(filterCountry);
}

function matchesTeamKeyword(team, keyword) {
  const q = normalizeSearchText(keyword);
  if (!q) return true;

  const name = normalizeSearchText(team.name);
  const tag = normalizeSearchText(team.tag);
  const captain = normalizeSearchText(team.captain);
  const rawCountry = normalizeSearchText(team.country);

  if (
    name.includes(q) ||
    tag.includes(q) ||
    captain.includes(q) ||
    rawCountry.includes(q)
  ) {
    return true;
  }

  // Khớp theo tên quốc gia hoặc mã khu vực đồng nghĩa (VD: gõ "han quoc" -> ra LCK)
  if (q.length >= 2) {
    const group = getRegionGroup(team.country);
    if (group && group.aliases.some((alias) => alias.includes(q) || q.includes(alias))) {
      return true;
    }
  }
  return false;
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser") || "null");
}

function getTodayLocalISO() {
  return new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD theo múi giờ máy tính
}

function normalizeTournament(t) {
  const gId = t.gameId ?? t.game_id ?? t.gameTitle?.gameId ?? t.game?.gameId;
  return {
    id: t.tournamentId ?? t.tournament_id ?? t.id ?? "",
    name: t.tournamentName ?? t.tournament_name ?? t.name ?? t.title ?? "Chưa đặt tên",
    game: t.gameName ?? t.gameTitle?.gameName ?? t.game?.gameName ?? GAME_MAP[gId] ?? "Liên Minh Huyền Thoại",
    startDate: t.startDate ?? t.start_date ?? t.date ?? "",
    endDate: t.endDate ?? t.end_date ?? "",
    maxTeams: t.maxTeams ?? t.max_teams ?? t.teams ?? t.teamCount ?? 16,
    status: (t.tournamentStatus ?? t.tournament_status ?? t.status ?? "DRAFT").toUpperCase()
  };
}

function normalizeStatusCategory(tOrStatus) {
  const isObj = typeof tOrStatus === "object" && tOrStatus !== null;
  const s = (isObj ? tOrStatus.status : tOrStatus || "").toUpperCase();

  if (s === "COMPLETED" || s === "FINISHED" || s === "DONE" || s.includes("KẾT THÚC")) {
    return "COMPLETED";
  }
  if (s === "ONGOING" || s === "IN_PROGRESS" || s === "ACTIVE" || s.includes("DIỄN RA")) {
    return "ONGOING";
  }

  // Tự đối chiếu ngày bắt đầu / kết thúc với ngày hôm nay nếu đang ở trạng thái DRAFT
  if (isObj && tOrStatus.startDate) {
    const today = getTodayLocalISO();
    if (tOrStatus.endDate && today > tOrStatus.endDate) return "COMPLETED";
    if (today >= tOrStatus.startDate && (!tOrStatus.endDate || today <= tOrStatus.endDate)) {
      return "ONGOING";
    }
  }
  return "DRAFT";
}

function renderTournamentStatusBadge(tOrStatus) {
  const cat = normalizeStatusCategory(tOrStatus);
  if (cat === "ONGOING") {
    return `<span class="badge badge-live">● Đang diễn ra</span>`;
  }
  if (cat === "COMPLETED") {
    return `<span class="badge badge-done">Đã kết thúc</span>`;
  }
  return `<span class="badge badge-upcoming">Sắp diễn ra</span>`;
}

function normalizeUser(u) {
  return {
    id: u.userId ?? u.user_id ?? u.id ?? "",
    fullName: u.fullName ?? u.full_name ?? u.name ?? "Chưa cập nhật",
    email: u.email ?? "",
    phone: u.phone && u.phone !== "—" ? u.phone : "",
    role: (u.role ?? "VIEWER").toUpperCase(),
    status: (u.accountStatus ?? u.account_status ?? "ACTIVE").toUpperCase()
  };
}

function normalizeRosterMember(m) {
  return {
    ign: m.inGameName ?? m.ign ?? m.player?.inGameName ?? "Player",
    fullName: m.playerName ?? m.fullName ?? m.player?.playerName ?? "—",
    gameAccountId: m.gameAccountId ?? m.player?.gameAccountId ?? "—",
    role: (m.memberRole ?? m.role ?? "MAIN").toUpperCase()
  };
}

function buildTeamRoster(tag, rawRoster) {
  const normalizedDb = Array.isArray(rawRoster) ? rawRoster.map(normalizeRosterMember) : [];
  const defaults = DEFAULT_ROSTERS_BY_TAG[tag]
    ? DEFAULT_ROSTERS_BY_TAG[tag].map(normalizeRosterMember)
    : [];

  if (!defaults.length) return normalizedDb;

  const merged = [...normalizedDb];
  for (const member of defaults) {
    if (merged.length >= 5) break;
    const exists = merged.some(
      (p) =>
        (p.ign || "").toLowerCase() === (member.ign || "").toLowerCase() ||
        (p.gameAccountId || "").toUpperCase() === (member.gameAccountId || "").toUpperCase()
    );
    if (!exists) {
      merged.push(member);
    }
  }
  return merged;
}

function normalizeTeam(team, index, dbRoster = null) {
  const tag = (team.teamTag ?? team.team_tag ?? team.tag ?? `TM${index + 1}`).toUpperCase();
  const captainObj = team.captain ?? team.captainUser;
  const sourceRoster = Array.isArray(dbRoster)
    ? dbRoster
    : Array.isArray(team.players)
    ? team.players
    : [];

  return {
    id: team.teamId ?? team.team_id ?? team.id ?? index + 1,
    tag,
    name: team.teamName ?? team.team_name ?? team.name ?? "Đội tuyển mới",
    country: team.country ?? team.region ?? "Việt Nam",
    captain: captainObj?.fullName ?? team.captainName ?? team.captain ?? `Đội trưởng ${tag}`,
    players: buildTeamRoster(tag, sourceRoster)
  };
}

// ===== 1. KHỞI TẠO TRANG TỔNG QUAN =====
async function initDashboardPage() {
  const [rawTournaments, teams, matches] = await Promise.all([
    ApiService.getTournaments(),
    ApiService.getTeams(),
    ApiService.getMatches()
  ]);

  const tournaments = rawTournaments.map(normalizeTournament);
  const ongoingCount = tournaments.filter((t) => normalizeStatusCategory(t) === "ONGOING").length;

  document.getElementById("kpi-total-tournaments").textContent = tournaments.length;
  document.getElementById("kpi-ongoing-tournaments").textContent = ongoingCount;
  document.getElementById("kpi-total-teams").textContent = teams.length;
  document.getElementById("kpi-total-matches").textContent = matches.length;

  const tbody = document.getElementById("dashboard-tournaments-body");
  tbody.innerHTML = tournaments
    .map((t) => {
      const timeText = t.endDate ? `${t.startDate} → ${t.endDate}` : (t.startDate || "Đang cập nhật");
      return `
        <tr>
          <td>#${t.id}</td>
          <td style="font-weight:600;">${t.name}</td>
          <td>${t.game}</td>
          <td>${timeText}</td>
          <td>${t.maxTeams} đội</td>
          <td>${renderTournamentStatusBadge(t)}</td>
        </tr>
      `;
    })
    .join("");
}

// ===== 2. KHỞI TẠO TRANG QUẢN LÝ GIẢI ĐẤU =====
async function initTournamentsPage() {
  const rawTournaments = await ApiService.getTournaments();
  let allTournaments = rawTournaments.map(normalizeTournament);

  const tbody = document.getElementById("tournaments-table-body");
  const searchInput = document.getElementById("search-tournament");
  const statusSelect = document.getElementById("filter-tournament-status");
  const modal = document.getElementById("tournament-modal");

  function renderTable() {
    const keyword = (searchInput.value || "").toLowerCase().trim();
    const filterSt = statusSelect.value;

    const filtered = allTournaments.filter((t) => {
      const matchName = t.name.toLowerCase().includes(keyword);
      const matchStatus = filterSt === "ALL" || normalizeStatusCategory(t) === filterSt;
      return matchName && matchStatus;
    });

    tbody.innerHTML = filtered
      .map(
        (t) => `
          <tr>
            <td>#${t.id}</td>
            <td style="font-weight:600;">${t.name}</td>
            <td>${t.game}</td>
            <td>${t.startDate || "—"}</td>
            <td>${t.endDate || "—"}</td>
            <td>${t.maxTeams}</td>
            <td>${renderTournamentStatusBadge(t)}</td>
          </tr>
        `
      )
      .join("");
  }

  renderTable();
  searchInput.addEventListener("input", renderTable);
  statusSelect.addEventListener("change", renderTable);

  const closeModal = () => (modal.style.display = "none");
  document.getElementById("btn-open-tournament-modal").onclick = () => (modal.style.display = "flex");
  document.getElementById("btn-close-tournament-modal").onclick = closeModal;
  document.getElementById("btn-cancel-tournament-modal").onclick = closeModal;

  document.getElementById("form-create-tournament").onsubmit = async (e) => {
    e.preventDefault();
    const currentUser = getCurrentUser();
    const gameId = Number(document.getElementById("inp-tournament-game").value);
    const payload = {
      gameId,
      organizerId: currentUser?.userId || 2,
      tournamentName: document.getElementById("inp-tournament-name").value.trim(),
      startDate: document.getElementById("inp-start-date").value,
      endDate: document.getElementById("inp-end-date").value,
      maxTeams: Number(document.getElementById("inp-max-teams").value) || 16
    };

    const created = await ApiService.createTournament(payload);
    allTournaments.unshift(normalizeTournament({ ...payload, ...created }));
    renderTable();
    e.target.reset();
    closeModal();
  };
}

// ===== 3. KHỞI TẠO TRANG QUẢN LÝ TÀI KHOẢN =====
async function initAccountsPage() {
  const rawUsers = await ApiService.getUsers();
  let allUsers = rawUsers.map(normalizeUser);

  const tbody = document.getElementById("accounts-table-body");
  const searchInput = document.getElementById("search-user");
  const roleSelect = document.getElementById("filter-user-role");
  const modal = document.getElementById("user-modal");

  function updateUserKpis() {
    const activeCount = allUsers.filter((u) => u.status === "ACTIVE").length;
    const suspendedCount = allUsers.filter((u) => u.status === "SUSPENDED").length;
    const staffCount = allUsers.filter((u) =>
      ["ADMIN", "ORGANIZER", "REGIONAL_COORDINATOR", "REFEREE"].includes(u.role)
    ).length;

    document.getElementById("kpi-total-users").textContent = allUsers.length;
    document.getElementById("kpi-active-users").textContent = activeCount;
    document.getElementById("kpi-staff-users").textContent = staffCount;
    document.getElementById("kpi-suspended-users").textContent = suspendedCount;
  }

  function renderUsersTable() {
    updateUserKpis();
    const keyword = (searchInput.value || "").toLowerCase().trim();
    const filterRole = roleSelect.value;

    const filtered = allUsers.filter((u) => {
      const matchText =
        u.fullName.toLowerCase().includes(keyword) || u.email.toLowerCase().includes(keyword);
      const matchRole = filterRole === "ALL" || u.role === filterRole;
      return matchText && matchRole;
    });

    tbody.innerHTML = filtered
      .map((u) => {
        const isActive = u.status === "ACTIVE";
        const statusBadge = isActive
          ? `<span class="badge badge-live">● Hoạt động</span>`
          : `<span class="badge badge-danger">Đã khóa</span>`;

        return `
          <tr>
            <td>#${u.id}</td>
            <td style="font-weight:600;">${u.fullName}</td>
            <td>${u.email}</td>
            <td>${u.phone || "—"}</td>
            <td>
              <select class="form-select" style="padding:5px 8px; font-size:12px; width:165px;" onchange="changeUserRole(${u.id}, this.value, this)">
                ${Object.entries(ROLE_LABELS)
                  .map(
                    ([key, label]) =>
                      `<option value="${key}" ${u.role === key ? "selected" : ""}>${label}</option>`
                  )
                  .join("")}
              </select>
            </td>
            <td>${statusBadge}</td>
            <td>
              <button class="btn btn-outline btn-sm" onclick="toggleUserStatus(${u.id})">
                ${isActive ? "Khóa" : "Mở khóa"}
              </button>
            </td>
          </tr>
        `;
      })
      .join("");
  }

  window.changeUserRole = async function (userId, newRole, selectEl) {
    const target = allUsers.find((u) => Number(u.id) === Number(userId));
    if (!target) return;

    const oldRole = target.role;
    if (oldRole === newRole) return;

    if (selectEl) selectEl.disabled = true;
    try {
      await ApiService.updateUser(userId, {
        fullName: target.fullName,
        email: target.email,
        phone: target.phone || null,
        role: newRole,
        accountStatus: target.status
      });

      target.role = newRole;
      updateUserKpis();

      // Đồng bộ ngay nếu đang đổi vai trò của chính tài khoản đang đăng nhập
      const currentUser = getCurrentUser();
      if (currentUser && Number(currentUser.userId) === Number(userId)) {
        currentUser.role = newRole;
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
      }
    } catch (err) {
      if (selectEl) selectEl.value = oldRole;
    } finally {
      if (selectEl) selectEl.disabled = false;
    }
  };

  window.toggleUserStatus = async function (userId) {
    const target = allUsers.find((u) => Number(u.id) === Number(userId));
    if (!target) return;

    const nextStatus = target.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    await ApiService.updateUser(userId, {
      fullName: target.fullName,
      email: target.email,
      phone: target.phone || null,
      role: target.role,
      accountStatus: nextStatus
    });

    target.status = nextStatus;
    renderUsersTable();
  };

  renderUsersTable();
  searchInput.addEventListener("input", renderUsersTable);
  roleSelect.addEventListener("change", renderUsersTable);

  const closeModal = () => (modal.style.display = "none");
  document.getElementById("btn-open-user-modal").onclick = () => (modal.style.display = "flex");
  document.getElementById("btn-close-user-modal").onclick = closeModal;
  document.getElementById("btn-cancel-user-modal").onclick = closeModal;

  document.getElementById("form-create-user").onsubmit = async (e) => {
    e.preventDefault();
    const dto = {
      fullName: document.getElementById("inp-user-name").value.trim(),
      email: document.getElementById("inp-user-email").value.trim(),
      password: "123456",
      phone: document.getElementById("inp-user-phone").value.trim() || null,
      role: document.getElementById("inp-user-role").value,
      accountStatus: "ACTIVE"
    };

    const created =
      typeof ApiService.createUser === "function"
        ? await ApiService.createUser(dto)
        : { userId: allUsers.length + 1, ...dto };

    allUsers.unshift(normalizeUser({ ...dto, ...created }));
    renderUsersTable();
    e.target.reset();
    closeModal();
  };
}

// ===== 4. KHỞI TẠO TRANG QUẢN LÝ ĐỘI TUYỂN =====
async function initTeamsPage() {
  const [rawTeams, rawTournaments, rawUsers] = await Promise.all([
    ApiService.getTeams(),
    ApiService.getTournaments(),
    ApiService.getUsers()
  ]);

  const allUsers = rawUsers.map(normalizeUser);
  const tournaments = rawTournaments.map(normalizeTournament);

  const rostersList =
    typeof ApiService.getTeamRoster === "function"
      ? await Promise.all(rawTeams.map((t) => ApiService.getTeamRoster(t.teamId ?? t.id)))
      : [];

  let allTeams = rawTeams.map((t, idx) => normalizeTeam(t, idx, rostersList[idx]));
  let selectedTeamId = null;

  let applications = [];
  if (typeof ApiService.getTournamentApplications === "function") {
    const appsByTournament = await Promise.all(
      tournaments.map(async (tour) => {
        const list = await ApiService.getTournamentApplications(tour.id);
        return (list || []).map((a) => ({
          appId: a.applicationId ?? a.id,
          teamTag: a.team?.teamTag ?? a.teamTag ?? "TEAM",
          teamName: a.team?.teamName ?? a.teamName ?? "Đội tuyển",
          tournamentName: a.tournament?.tournamentName ?? tour.name,
          appliedAt: (a.submittedAt ?? a.appliedAt ?? "").toString().slice(0, 10) || "2026-11-24",
          status: (a.applicationStatus ?? a.status ?? "PENDING").toUpperCase()
        }));
      })
    );
    applications = appsByTournament.flat();
  }

  const tbody = document.getElementById("teams-table-body");
  const appBody = document.getElementById("applications-table-body");
  const searchInput = document.getElementById("search-team");
  const countrySelect = document.getElementById("filter-team-country");
  const teamModal = document.getElementById("team-modal");
  const rosterModal = document.getElementById("roster-modal");

  function updateTeamKpis() {
    const totalPlayers = allTeams.reduce((sum, t) => sum + t.players.length, 0);
    const pendingApps = applications.filter((a) => a.status === "PENDING").length;
    const countries = new Set(
      allTeams.map((t) => getRegionGroup(t.country)?.code || normalizeSearchText(t.country))
    ).size;

    document.getElementById("kpi-total-teams").textContent = allTeams.length;
    document.getElementById("kpi-total-players").textContent = totalPlayers;
    document.getElementById("kpi-pending-apps").textContent = pendingApps;
    document.getElementById("kpi-total-countries").textContent = countries;
  }

  function renderTeamsTable() {
    updateTeamKpis();
    const keyword = searchInput.value || "";
    const filterCountry = countrySelect.value;

    const filtered = allTeams.filter((t) => {
      const matchText = matchesTeamKeyword(t, keyword);
      const matchCountry = matchesCountryFilter(t.country, filterCountry);
      return matchText && matchCountry;
    });

    tbody.innerHTML = filtered
      .map(
        (t) => `
          <tr>
            <td>#${t.id}</td>
            <td><span class="badge badge-upcoming">[${t.tag}]</span></td>
            <td style="font-weight:600;">${t.name}</td>
            <td>${formatTeamRegionLabel(t.country)}</td>
            <td>${t.captain}</td>
            <td>${t.players.length} tuyển thủ</td>
            <td>
              <button class="btn btn-outline btn-sm" onclick="openTeamRoster(${t.id})">Đội hình</button>
            </td>
          </tr>
        `
      )
      .join("");
  }

  function renderApplicationsTable() {
    updateTeamKpis();
    if (!applications.length) {
      appBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#64748b;">Chưa có hồ sơ đăng ký tham dự giải nào trong CSDL.</td></tr>`;
      return;
    }

    appBody.innerHTML = applications
      .map((app) => {
        let badgeHtml = `<span class="badge badge-upcoming">Chờ duyệt</span>`;
        if (app.status === "APPROVED") badgeHtml = `<span class="badge badge-live">● Đã duyệt</span>`;
        if (app.status === "REJECTED") badgeHtml = `<span class="badge badge-danger">Từ chối</span>`;

        const isDone = app.status === "APPROVED" || app.status === "REJECTED";
        const actionsHtml = !isDone
          ? `
              <button class="btn btn-primary btn-sm" onclick="reviewApplication(${app.appId}, 'APPROVED')">Duyệt</button>
              <button class="btn btn-outline btn-sm" onclick="reviewApplication(${app.appId}, 'REJECTED')">Từ chối</button>
            `
          : `<span style="font-size:12px; color:#64748b;">Đã xử lý</span>`;

        return `
          <tr>
            <td>#${app.appId}</td>
            <td style="font-weight:600;">[${app.teamTag}] ${app.teamName}</td>
            <td>${app.tournamentName}</td>
            <td>${app.appliedAt}</td>
            <td>${badgeHtml}</td>
            <td style="display:flex; gap:6px;">${actionsHtml}</td>
          </tr>
        `;
      })
      .join("");
  }

  function renderRosterModalBody(team) {
    document.getElementById("roster-modal-title").textContent = `Đội hình [${team.tag}] ${team.name}`;
    const rosterBody = document.getElementById("roster-table-body");
    if (!team.players.length) {
      rosterBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#64748b;">Chưa có tuyển thủ nào trong đội.</td></tr>`;
      return;
    }
    rosterBody.innerHTML = team.players
      .map((p) => {
        const isMain = p.role === "MAIN" || p.role === "CAPTAIN";
        const roleText = p.role === "CAPTAIN" ? "Đội trưởng" : isMain ? "Chính thức" : "Dự bị";
        return `
          <tr>
            <td style="font-weight:700;">${p.ign}</td>
            <td>${p.fullName}</td>
            <td><code>${p.gameAccountId}</code></td>
            <td><span class="badge ${isMain ? "badge-live" : "badge-done"}">${roleText}</span></td>
          </tr>
        `;
      })
      .join("");
  }

  window.openTeamRoster = async function (teamId) {
    const team = allTeams.find((t) => t.id === teamId);
    if (!team) return;
    selectedTeamId = teamId;

    if (typeof ApiService.getTeamRoster === "function") {
      const latestRoster = await ApiService.getTeamRoster(teamId);
      if (Array.isArray(latestRoster)) {
        team.players = buildTeamRoster(team.tag, latestRoster);
      }
    }
    renderRosterModalBody(team);
    rosterModal.style.display = "flex";
  };

  window.reviewApplication = async function (appId, newStatus) {
    const currentUser = getCurrentUser();
    if (typeof ApiService.reviewApplication === "function") {
      await ApiService.reviewApplication(appId, {
        reviewerUserId: currentUser?.userId || 2,
        status: newStatus,
        note: newStatus === "APPROVED" ? "Đã phê duyệt hồ sơ" : "Từ chối hồ sơ"
      });
    }
    const app = applications.find((a) => a.appId === appId);
    if (app) {
      app.status = newStatus;
      renderApplicationsTable();
    }
  };

  renderTeamsTable();
  renderApplicationsTable();
  searchInput.addEventListener("input", renderTeamsTable);
  countrySelect.addEventListener("change", renderTeamsTable);

  const closeTeamModal = () => (teamModal.style.display = "none");
  document.getElementById("btn-open-team-modal").onclick = () => (teamModal.style.display = "flex");
  document.getElementById("btn-close-team-modal").onclick = closeTeamModal;
  document.getElementById("btn-cancel-team-modal").onclick = closeTeamModal;

  document.getElementById("form-create-team").onsubmit = async (e) => {
    e.preventDefault();
    const captainInput = document.getElementById("inp-team-captain").value.trim().toLowerCase();
    const matchedUser =
      allUsers.find(
        (u) =>
          u.fullName.toLowerCase().includes(captainInput) ||
          u.email.toLowerCase().includes(captainInput)
      ) ||
      allUsers.find((u) => u.role === "TEAM_CAPTAIN") ||
      allUsers[0];

    const dto = {
      captainUserId: matchedUser ? matchedUser.id : 5,
      teamName: document.getElementById("inp-team-name").value.trim(),
      teamTag: document.getElementById("inp-team-tag").value.trim().toUpperCase(),
      country: document.getElementById("inp-team-country").value
    };

    const created = await ApiService.createTeam(dto);
    allTeams.unshift(
      normalizeTeam(
        { ...dto, ...created, captainName: matchedUser ? matchedUser.fullName : captainInput },
        allTeams.length,
        []
      )
    );
    renderTeamsTable();
    e.target.reset();
    closeTeamModal();
  };

  document.getElementById("btn-close-roster-modal").onclick = () => (rosterModal.style.display = "none");
  document.getElementById("form-add-player").onsubmit = async (e) => {
    e.preventDefault();
    const team = allTeams.find((t) => t.id === selectedTeamId);
    if (!team) return;

    const dto = {
      inGameName: document.getElementById("inp-player-ign").value.trim(),
      playerName: document.getElementById("inp-player-name").value.trim(),
      gameAccountId: document.getElementById("inp-player-gameid").value.trim().toUpperCase(),
      memberRole: document.getElementById("inp-player-role").value
    };

    const savedMember =
      typeof ApiService.addTeamMember === "function"
        ? await ApiService.addTeamMember(selectedTeamId, dto)
        : dto;

    team.players.push(normalizeRosterMember(savedMember || dto));
    renderRosterModalBody(team);
    renderTeamsTable();
    e.target.reset();
  };
}

// Bộ điều phối gọi hàm khởi tạo theo từng trang
window.initPage = async function (pageName) {
  if (pageName === "dashboard") await initDashboardPage();
  if (pageName === "tournaments") await initTournamentsPage();
  if (pageName === "teams") await initTeamsPage();
  if (pageName === "accounts") await initAccountsPage();
};

// ===== KIỂM SOÁT CHẾ ĐỘ CHỈ XEM CHO TÀI KHOẢN KHÁCH (VIEWER) =====
function isViewerAccount() {
  const user = getCurrentUser();
  return user && (user.role || "").toUpperCase() === "VIEWER";
}

function applyViewerReadOnlyMode() {
  if (!isViewerAccount()) return;

  // 1. Hiển thị thanh thông báo chế độ Khách ở đầu vùng nội dung
  const mainContainer = document.querySelector(".main-content") || document.body;
  if (mainContainer && !document.getElementById("viewer-readonly-banner")) {
    const banner = document.createElement("div");
    banner.id = "viewer-readonly-banner";
    banner.style.cssText =
      "background:#eff6ff; border-bottom:1px solid #bfdbfe; color:#1e40af; padding:10px 24px; font-size:13px; font-weight:500; display:flex; align-items:center; justify-content:space-between;";
    banner.innerHTML = `
      <span>👀 <strong>Chế độ Khách (Chỉ xem):</strong> Bạn đang đăng nhập với quyền Khán giả. Mọi thao tác thêm, sửa, xóa và duyệt dữ liệu đều bị khóa.</span>
      <a href="login.html" style="color:#1d4ed8; font-weight:600; text-decoration:underline;">Đổi tài khoản</a>
    `;
    mainContainer.insertBefore(banner, mainContainer.firstChild);
  }

  // 2. Ẩn toàn bộ nút thêm/sửa/xóa/duyệt/khóa/nhập kết quả (giữ lại nút Làm mới, Đội hình)
  const MUTATION_KEYWORDS = [
    "+ thêm", "+ tạo", "+ cấp", "+ đăng ký", "thêm giai đoạn", "tạo lịch",
    "duyệt", "từ chối", "khóa", "mở khóa", "nhập tỷ số", "nhập kết quả",
    "xác nhận", "cập nhật", "lưu", "xóa", "sửa"
  ];

  document.querySelectorAll("button").forEach((btn) => {
    const text = (btn.textContent || "").toLowerCase().trim();
    const id = (btn.id || "").toLowerCase();
    const isOpenModalBtn = id.startsWith("btn-open-");
    const isMutationText = MUTATION_KEYWORDS.some((kw) => text.includes(kw));

    if (isOpenModalBtn || isMutationText) {
      btn.style.display = "none";
    }
  });

  // 3. Khóa các ô chọn vai trò trong bảng Tài khoản
  document.querySelectorAll("table select").forEach((sel) => {
    sel.disabled = true;
  });

  // 4. Ẩn form thêm tuyển thủ trong modal Đội hình (vẫn cho xem danh sách)
  const addPlayerForm = document.getElementById("form-add-player");
  if (addPlayerForm) {
    addPlayerForm.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  applyViewerReadOnlyMode();
  const observer = new MutationObserver(() => applyViewerReadOnlyMode());
  observer.observe(document.body, { childList: true, subtree: true });
});