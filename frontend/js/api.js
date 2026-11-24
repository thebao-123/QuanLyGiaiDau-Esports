const API_BASE_URL = "http://localhost:8080/api";

async function fetchWithFallback(endpoint, fallbackData, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (response.status === 204) return null;
    return await response.json();
  } catch (err) {
    console.warn(`[ApiService] Dùng dữ liệu dự phòng cho ${endpoint}:`, err.message);
    return fallbackData;
  }
}

async function sendMutation(endpoint, method, payload) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || `HTTP ${response.status}`);
    }
    if (response.status === 204) return null;
    return await response.json();
  } catch (err) {
    console.error(`[ApiService] Lỗi gọi ${method} ${endpoint}:`, err.message);
    alert(`Chưa lưu được xuống MySQL (${method} ${endpoint}): ${err.message}\nHãy kiểm tra lại CorsConfig.java và Backend cổng 8080.`);
    throw err;
  }
}

const ApiService = {
  // ===== 1. GIẢI ĐẤU & ĐƠN THAM DỰ =====
  getTournaments() {
    return fetchWithFallback("/tournaments", MOCK_DATA.tournaments);
  },
  createTournament(dto) {
    return sendMutation("/tournaments", "POST", dto);
  },
  getTournamentApplications(tournamentId) {
    return fetchWithFallback(`/tournaments/${tournamentId}/applications`, []);
  },
  reviewApplication(appId, dto) {
    return sendMutation(`/tournaments/applications/${appId}/review`, "PATCH", dto);
  },

  // ===== 2. ĐỘI TUYỂN & ĐỘI HÌNH =====
  getTeams() {
    return fetchWithFallback("/teams", MOCK_DATA.teams);
  },
  createTeam(dto) {
    return sendMutation("/teams", "POST", dto);
  },
  getTeamRoster(teamId) {
    return fetchWithFallback(`/teams/${teamId}/roster`, null);
  },
  addTeamMember(teamId, dto) {
    return sendMutation(`/teams/${teamId}/roster`, "POST", dto);
  },

  // ===== 3. TÀI KHOẢN & ĐĂNG NHẬP =====
  getUsers() {
    return fetchWithFallback("/users", [
      { userId: 1, fullName: "Phan Thế Bảo", email: "admin@esports.vn", phone: "0901000001", role: "ADMIN", accountStatus: "ACTIVE" },
      { userId: 2, fullName: "Lê Quốc Bảo", email: "organizer@esports.vn", phone: "0901000002", role: "ORGANIZER", accountStatus: "ACTIVE" },
      { userId: 3, fullName: "Nguyễn Đức Trung", email: "coordinator@esports.vn", phone: "0901000003", role: "REGIONAL_COORDINATOR", accountStatus: "ACTIVE" },
      { userId: 4, fullName: "Trần Minh Trọng", email: "referee1@esports.vn", phone: "0901000004", role: "REFEREE", accountStatus: "ACTIVE" },
      { userId: 5, fullName: "Lee Sang-hyeok", email: "captain.t1@esports.vn", phone: "0901000005", role: "TEAM_CAPTAIN", accountStatus: "ACTIVE" }
    ]);
  },
  createUser(dto) {
    return sendMutation("/users", "POST", dto);
  },
  updateUser(userId, dto) {
    return sendMutation(`/users/${userId}`, "PUT", dto);
  },
  async login(email, password) {
    const users = await this.getUsers();
    const found = users.find((u) => (u.email || "").toLowerCase() === email.toLowerCase());
    if (found) {
      return {
        userId: found.userId,
        email: found.email,
        fullName: found.fullName,
        role: found.role,
        accountStatus: found.accountStatus,
        token: "db-session-token"
      };
    }
    return { token: "mock-jwt-token", email, fullName: email.split("@")[0], role: "VIEWER" };
  },

  // ===== 4. THỐNG KÊ TRẬN ĐẤU CHO DASHBOARD =====
  getMatches() {
    return Promise.resolve(MOCK_DATA.matches || []);
  }
};