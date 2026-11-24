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
    { inGameName: "Zeus", playerName: "Choi Woo-je", gameAccountId: "KR_ZEUS_001", memberRole: "MAIN" },
    { inGameName: "Oner", playerName: "Mun Hyeon-jun", gameAccountId: "KR_ONER_002", memberRole: "MAIN" },
    { inGameName: "Faker", playerName: "Lee Sang-hyeok", gameAccountId: "KR_FAKER_003", memberRole: "MAIN" },
    { inGameName: "Gumayusi", playerName: "Lee Min-hyeong", gameAccountId: "KR_GUMA_004", memberRole: "MAIN" },
    { inGameName: "Keria", playerName: "Ryu Min-seok", gameAccountId: "KR_KERIA_005", memberRole: "MAIN" }
  ]
};

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser") || "null");
}

function normalizeTournament(t) {
  const gId = t.gameId ?? t.game_id ?? t.gameTitle?.gameId ?? t.game?.gameId;
  return {
    id: t.tournamentId ?? t.tournament_id ?? t.id ?? "",
    name: t.tournamentName ?? t.tournament_name ?? t.name ?? "Chưa đặt tên",
    game: t.gameName ?? t.gameTitle?.gameName ?? t.game?.gameName ?? GAME_MAP[gId] ?? "Liên Minh Huyền Thoại",
    startDate: t.startDate ?? t.start_date ?? "",
    endDate: t.endDate ?? t.end_date ?? "",
    maxTeams: t.maxTeams ?? t.max_teams ?? 16,
    status: (t.tournamentStatus ?? t.tournament_status ?? t.status ?? "DRAFT").toUpperCase()
  };
}

function normalizeStatusCategory(status) {
  const s = (status || "").toUpperCase();
  if (s === "ONGOING" || s === "IN_PROGRESS" || s === "ACTIVE") return "ONGOING";
  if (s === "COMPLETED" || s === "FINISHED" || s === "DONE") return "COMPLETED";
  return "DRAFT";
}

function renderTournamentStatusBadge(status) {
  const cat = normalizeStatusCategory(status);
  if (cat === "ONGOING") return `<span class="badge badge-live">● Đang diễn ra</span>`;
  if (cat === "COMPLETED") return `<span class="badge badge-done">Đã kết thúc</span>`;
  return `<span class="badge badge-upcoming">Sắp diễn ra</span>`;
}

function normalizeUser(u) {
  return {
    id: u.userId ?? u.user_id ?? u.id ?? "",
    fullName: u.fullName ?? u.full_name ?? "Chưa cập nhật",
    email: u.email ?? "",
    phone: u.phone ?? "",
    role: (u.role ?? "VIEWER").toUpperCase(),
    status: (u.accountStatus ?? u.account_status ?? "ACTIVE").toUpperCase()
  };
}

function normalizeRosterMember(m) {
  return {
    inGameName: m.inGameName ?? m.ign ?? m.player?.inGameName ?? "Player",
    playerName: m.playerName ?? m.fullName ?? m.player?.playerName ?? "—",
    gameAccountId: m.gameAccountId ?? m.player?.gameAccountId ?? "—",
    memberRole: (m.memberRole ?? m.role ?? "MAIN").toUpperCase()
  };
}

function normalizeTeam(team, index, dbRoster = null) {
  const tag = (team.teamTag ?? team.team_tag ?? team.tag ?? `TM${index + 1}`).toUpperCase();
  const captainObj = team.captain ?? team.captainUser;
  const roster = Array.isArray(dbRoster)
    ? dbRoster.map(normalizeRosterMember)
    : (DEFAULT_ROSTERS_BY_TAG[tag] ? [...DEFAULT_ROSTERS_BY_TAG[tag]] : []);

  return {
    id: team.teamId ?? team.team_id ?? team.id ?? index + 1,
    tag,
    name: team.teamName ?? team.team_name ?? team.name ?? "Đội tuyển mới",
    country: team.country ?? "Việt Nam",
    captain: captainObj?.fullName ?? team.captainName ?? `Đội trưởng ${tag}`,
    players: roster
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
  const ongoingCount = tournaments.filter((t) => normalizeStatusCategory(t.status) === "ONGOING").length;

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
          <td>${renderTournamentStatusBadge(t.status)}</td>
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
      const matchStatus = filterSt === "ALL" || normalizeStatusCategory(t.status) === filterSt;
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
            <td>${renderTournamentStatusBadge(t.status)}</td>
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
    const dto = {
      gameId: Number(document.getElementById("inp-tournament-game").value),
      organizerId: currentUser?.userId || 2,
      tournamentName: document.getElementById("inp-tournament-name").value.trim(),
      startDate: document.getElementById("inp-start-date").value,
      endDate: document.getElementById("inp-end-date").value,
      maxTeams: Number(document.getElementById("inp-max-teams").value) || 16
    };

    const created = await ApiService.createTournament(dto);
    allTournaments.unshift(normalizeTournament(created));
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
              <select class="form-select" style="padding:5px 8px; font-size:12px; width:165px;" onchange="changeUserRole(${u.id}, this.value)">
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

  window.changeUserRole = async function (userId, newRole) {
    const target = allUsers.find((u) => u.id === userId);
    if (!target) return;
    await ApiService.updateUser(userId, {
      fullName: target.fullName,
      email: target.email,
      phone: target.phone || null,
      role: newRole,
      accountStatus: target.status
    });
    target.role = newRole;
    updateUserKpis();
  };

  window.toggleUserStatus = async function (userId) {
    const target = allUsers.find((u) => u.id === userId);
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

    const created = await ApiService.createUser(dto);
    allUsers.unshift(normalizeUser(created));
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

  // Tải đội hình thật từ MySQL cho từng đội
  const rostersList = await Promise.all(
    rawTeams.map((t) => ApiService.getTeamRoster(t.teamId ?? t.id))
  );
  let allTeams = rawTeams.map((t, idx) => normalizeTeam(t, idx, rostersList[idx]));
  let selectedTeamId = null;

  // Tải đơn đăng ký tham dự thật từ MySQL theo từng giải đấu
  const appsByTournament = await Promise.all(
    tournaments.map(async (tour) => {
      const list = await ApiService.getTournamentApplications(tour.id);
      return (list || []).map((a) => ({
        appId: a.applicationId ?? a.id,
        teamTag: a.team?.teamTag ?? a.teamTag ?? "TEAM",
        teamName: a.team?.teamName ?? a.teamName ?? "Đội tuyển",
        tournamentName: a.tournament?.tournamentName ?? tour.name,
        appliedAt: (a.appliedAt ?? a.createdAt ?? "").toString().slice(0, 10) || "2026-11-24",
        status: (a.applicationStatus ?? a.status ?? "PENDING").toUpperCase()
      }));
    })
  );
  let applications = appsByTournament.flat();

  const tbody = document.getElementById("teams-table-body");
  const appBody = document.getElementById("applications-table-body");
  const searchInput = document.getElementById("search-team");
  const countrySelect = document.getElementById("filter-team-country");
  const teamModal = document.getElementById("team-modal");
  const rosterModal = document.getElementById("roster-modal");

  function updateTeamKpis() {
    const totalPlayers = allTeams.reduce((sum, t) => sum + t.players.length, 0);
    const pendingApps = applications.filter((a) => a.status === "PENDING").length;
    const countries = new Set(allTeams.map((t) => t.country)).size;

    document.getElementById("kpi-total-teams").textContent = allTeams.length;
    document.getElementById("kpi-total-players").textContent = totalPlayers;
    document.getElementById("kpi-pending-apps").textContent = pendingApps;
    document.getElementById("kpi-total-countries").textContent = countries;
  }

  function renderTeamsTable() {
    updateTeamKpis();
    const keyword = (searchInput.value || "").toLowerCase().trim();
    const filterCountry = countrySelect.value;

    const filtered = allTeams.filter((t) => {
      const matchText = t.name.toLowerCase().includes(keyword) || t.tag.toLowerCase().includes(keyword);
      const matchCountry = filterCountry === "ALL" || t.country === filterCountry;
      return matchText && matchCountry;
    });

    tbody.innerHTML = filtered
      .map(
        (t) => `
          <tr>
            <td>#${t.id}</td>
            <td><span class="badge badge-upcoming">[${t.tag}]</span></td>
            <td style="font-weight:600;">${t.name}</td>
            <td>${t.country}</td>
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
      .map(
        (p) => `
          <tr>
            <td style="font-weight:700;">${p.inGameName}</td>
            <td>${p.playerName}</td>
            <td><code>${p.gameAccountId}</code></td>
            <td><span class="badge ${p.memberRole === "MAIN" ? "badge-live" : "badge-done"}">${p.memberRole === "MAIN" ? "Chính thức" : "Dự bị"}</span></td>
          </tr>
        `
      )
      .join("");
  }

  window.openTeamRoster = async function (teamId) {
    const team = allTeams.find((t) => t.id === teamId);
    if (!team) return;
    selectedTeamId = teamId;
    const latestRoster = await ApiService.getTeamRoster(teamId);
    if (Array.isArray(latestRoster)) {
      team.players = latestRoster.map(normalizeRosterMember);
    }
    renderRosterModalBody(team);
    rosterModal.style.display = "flex";
  };

  window.reviewApplication = async function (appId, newStatus) {
    const currentUser = getCurrentUser();
    await ApiService.reviewApplication(appId, {
      reviewerUserId: currentUser?.userId || 2,
      status: newStatus,
      note: newStatus === "APPROVED" ? "Đã phê duyệt hồ sơ" : "Từ chối hồ sơ"
    });
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
        { ...created, captainName: matchedUser ? matchedUser.fullName : captainInput },
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

    const savedMember = await ApiService.addTeamMember(selectedTeamId, dto);
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