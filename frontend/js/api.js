const API_BASE_URL = "http://localhost:8080/api";

async function fetchWithFallback(endpoint, fallbackData, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn(`[ApiService] Dùng dữ liệu mẫu cho ${endpoint}:`, err.message);
    return fallbackData;
  }
}

const ApiService = {
  getTournaments() {
    return fetchWithFallback("/tournaments", MOCK_DATA.tournaments);
  },
  createTournament(payload) {
    return fetchWithFallback("/tournaments", { tournamentId: Date.now(), ...payload }, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  getTeams() {
    return fetchWithFallback("/teams", MOCK_DATA.teams);
  },
  createTeam(payload) {
    return fetchWithFallback("/teams", { teamId: Date.now(), ...payload }, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  getUsers() {
    return fetchWithFallback("/users", [
      { userId: 1, fullName: "Phan Thế Bảo", email: "admin@esports.vn", role: "ADMIN", accountStatus: "ACTIVE" },
      { userId: 2, fullName: "Lê Quốc Bảo", email: "organizer@esports.vn", role: "ORGANIZER", accountStatus: "ACTIVE" },
      { userId: 3, fullName: "Nguyễn Đức Trung", email: "coordinator@esports.vn", role: "REGIONAL_COORDINATOR", accountStatus: "ACTIVE" },
      { userId: 4, fullName: "Trần Minh Trọng", email: "referee1@esports.vn", role: "REFEREE", accountStatus: "ACTIVE" },
      { userId: 5, fullName: "Lee Sang-hyeok", email: "captain.t1@esports.vn", role: "TEAM_CAPTAIN", accountStatus: "ACTIVE" }
    ]);
  },
  login(email, password) {
    return fetchWithFallback(
      "/auth/login",
      { token: "mock-jwt-token", email, fullName: "Phan Thế Bảo", role: "ADMIN" },
      { method: "POST", body: JSON.stringify({ email, password }) }
    );
  },
  getMatches() {
    return fetchWithFallback("/matches", MOCK_DATA.matches);
  }
};