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

function normalizeTournament(t) {
  return {
    id: t.tournamentId ?? t.tournament_id ?? t.id ?? "",
    name: t.tournamentName ?? t.tournament_name ?? t.name ?? t.title ?? "Chưa đặt tên",
    game: t.gameName ?? t.game ?? GAME_MAP[t.gameId ?? t.game_id] ?? "Liên Minh Huyền Thoại",
    startDate: t.startDate ?? t.start_date ?? t.date ?? "",
    endDate: t.endDate ?? t.end_date ?? "",
    maxTeams: t.maxTeams ?? t.max_teams ?? t.teams ?? t.teamCount ?? 16,
    status: (t.tournamentStatus ?? t.tournament_status ?? t.status ?? "DRAFT").toUpperCase()
  };
}

function normalizeStatusCategory(status) {
  const s = (status || "").toUpperCase();
  if (s === "ONGOING" || s === "IN_PROGRESS" || s === "ACTIVE" || s.includes("DIỄN RA")) {
    return "ONGOING";
  }
  if (s === "COMPLETED" || s === "FINISHED" || s === "DONE" || s.includes("KẾT THÚC")) {
    return "COMPLETED";
  }
  return "DRAFT";
}

function renderTournamentStatusBadge(status) {
  const cat = normalizeStatusCategory(status);
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
    phone: u.phone ?? "—",
    role: (u.role ?? "VIEWER").toUpperCase(),
    status: (u.accountStatus ?? u.account_status ?? "ACTIVE").toUpperCase()
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
    const gameId = Number(document.getElementById("inp-tournament-game").value);
    const payload = {
      gameId,
      gameName: GAME_MAP[gameId],
      organizerId: 2,
      tournamentName: document.getElementById("inp-tournament-name").value.trim(),
      startDate: document.getElementById("inp-start-date").value,
      endDate: document.getElementById("inp-end-date").value,
      maxTeams: Number(document.getElementById("inp-max-teams").value) || 16,
      tournamentStatus: "DRAFT"
    };

    const created = await ApiService.createTournament(payload);
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
            <td>${u.phone}</td>
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

  window.changeUserRole = function (userId, newRole) {
    const target = allUsers.find((u) => u.id === userId);
    if (target) {
      target.role = newRole;
      updateUserKpis();
    }
  };

  window.toggleUserStatus = function (userId) {
    const target = allUsers.find((u) => u.id === userId);
    if (target) {
      target.status = target.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
      renderUsersTable();
    }
  };

  renderUsersTable();
  searchInput.addEventListener("input", renderUsersTable);
  roleSelect.addEventListener("change", renderUsersTable);

  const closeModal = () => (modal.style.display = "none");
  document.getElementById("btn-open-user-modal").onclick = () => (modal.style.display = "flex");
  document.getElementById("btn-close-user-modal").onclick = closeModal;
  document.getElementById("btn-cancel-user-modal").onclick = closeModal;

  document.getElementById("form-create-user").onsubmit = (e) => {
    e.preventDefault();
    const newUser = {
      id: allUsers.length + 1,
      fullName: document.getElementById("inp-user-name").value.trim(),
      email: document.getElementById("inp-user-email").value.trim(),
      phone: document.getElementById("inp-user-phone").value.trim() || "—",
      role: document.getElementById("inp-user-role").value,
      status: "ACTIVE"
    };
    allUsers.unshift(newUser);
    renderUsersTable();
    e.target.reset();
    closeModal();
  };
}

// Bộ điều phối gọi hàm khởi tạo theo từng trang
window.initPage = async function (pageName) {
  if (pageName === "dashboard") await initDashboardPage();
  if (pageName === "tournaments") await initTournamentsPage();
  if (pageName === "accounts") await initAccountsPage();
};