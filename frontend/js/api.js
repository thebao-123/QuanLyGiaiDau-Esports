const API_BASE_URL = "http://localhost:8080/api";

const SAMPLE_ACCOUNTS_MAP = {
  "admin@esports.vn": { userId: 1, fullName: "Phan Thế Bảo", role: "ADMIN" },
  "organizer@esports.vn": { userId: 2, fullName: "Lê Quốc Bảo", role: "ORGANIZER" },
  "coordinator@esports.vn": { userId: 3, fullName: "Nguyễn Đức Trung", role: "REGIONAL_COORDINATOR" },
  "referee1@esports.vn": { userId: 4, fullName: "Trần Minh Trọng", role: "REFEREE" },
  "captain.t1@esports.vn": { userId: 5, fullName: "Lee Sang-hyeok", role: "TEAM_CAPTAIN" },
  "captain.blg@esports.vn": { userId: 6, fullName: "Chen Ze-bin", role: "TEAM_CAPTAIN" },
  "captain.wbg@esports.vn": { userId: 7, fullName: "Li Yuan-hao", role: "TEAM_CAPTAIN" },
  "captain.los@esports.vn": { userId: 8, fullName: "Simon Hofverberg", role: "TEAM_CAPTAIN" },
  "captain.gam@esports.vn": { userId: 9, fullName: "Đỗ Duy Khánh", role: "TEAM_CAPTAIN" },
  "viewer@esports.vn": { userId: 10, fullName: "Trần Thảo Vy", role: "VIEWER" },
  "guest@esports.vn": { userId: 11, fullName: "Khách tham quan", role: "VIEWER" }
};

function isReadOnlyViewer() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  return currentUser && (currentUser.role || "").toUpperCase() === "VIEWER";
}

// Chặn mọi lệnh ghi dữ liệu (POST/PUT/PATCH/DELETE) ở tầng mạng nếu là tài khoản Khách
const _nativeFetch = window.fetch.bind(window);
window.fetch = async function (input, init = {}) {
  const url = typeof input === "string" ? input : (input?.url || "");
  const method = (init.method || "GET").toUpperCase();

  if (
    !["GET", "HEAD", "OPTIONS"].includes(method) &&
    !url.includes("/auth/login") &&
    isReadOnlyViewer()
  ) {
    const msg = "Tài khoản Khách (Chỉ xem) không có quyền thêm, sửa hoặc xóa dữ liệu!";
    alert(msg);
    throw new Error(msg);
  }
  return _nativeFetch(input, init);
};

async function fetchWithFallback(endpoint, fallbackData, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    if (err.message.includes("Chỉ xem")) throw err;
    console.warn(`[ApiService] Dùng dữ liệu mẫu cho ${endpoint}:`, err.message);
    return fallbackData;
  }
}

async function sendJsonRequest(endpoint, method, payload) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(errText || `HTTP ${response.status}`);
  }
  return response.json();
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
      { userId: 5, fullName: "Lee Sang-hyeok", email: "captain.t1@esports.vn", role: "TEAM_CAPTAIN", accountStatus: "ACTIVE" },
      { userId: 11, fullName: "Khách tham quan", email: "guest@esports.vn", role: "VIEWER", accountStatus: "ACTIVE" }
    ]);
  },
  createUser(payload) {
    return sendJsonRequest("/users", "POST", payload);
  },
  updateUser(userId, payload) {
    return sendJsonRequest(`/users/${userId}`, "PUT", payload);
  },
  login(email, password) {
    const key = (email || "").toLowerCase().trim();
    const matched = SAMPLE_ACCOUNTS_MAP[key] || {
      userId: 11,
      fullName: "Khách tham quan",
      role: "VIEWER"
    };
    return fetchWithFallback(
      "/auth/login",
      {
        token: "mock-jwt-token",
        email: key,
        userId: matched.userId,
        fullName: matched.fullName,
        role: matched.role
      },
      { method: "POST", body: JSON.stringify({ email: key, password }) }
    );
  },
  getMatches() {
    return fetchWithFallback("/matches", MOCK_DATA.matches);
  }
};