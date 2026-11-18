const API = 'http://localhost:8080/api';
let currentTeamId = null;
let currentTournamentId = null;

document.addEventListener('DOMContentLoaded', () => {
  loadAllData();
});

async function loadAllData() {
  await Promise.all([loadGames(), loadTournaments(), loadTeams(), loadUsers()]);
}

function showToast(msg, isError = false) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = isError ? 'toast error' : 'toast';
  setTimeout(() => el.classList.add('hidden'), 3500);
}

async function apiFetch(url, options = {}) {
  const res = await fetch(API + url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) {
    let errMsg = 'Lỗi xử lý từ máy chủ';
    try {
      const data = await res.json();
      if (data.error) errMsg = data.error;
    } catch (_) {}
    throw new Error(errMsg);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function switchTab(tab) {
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === `tab-${tab}`));
}

function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

// ================= 1. TỰA GAME =================
async function loadGames() {
  try {
    const games = await apiFetch('/games');
    document.getElementById('tbody-games').innerHTML = games.map(g => `
      <tr>
        <td>#${g.gameId}</td>
        <td><strong>${g.gameName}</strong></td>
        <td>${g.publisher || '-'}</td>
        <td><button class="btn btn-danger btn-sm" onclick="deleteGame(${g.gameId})">Xóa</button></td>
      </tr>
    `).join('');

    const select = document.getElementById('t-game');
    if (select) {
      select.innerHTML = games.map(g => `<option value="${g.gameId}">${g.gameName}</option>`).join('');
    }
  } catch (e) { showToast(e.message, true); }
}

async function submitGame(e) {
  e.preventDefault();
  try {
    await apiFetch('/games', {
      method: 'POST',
      body: JSON.stringify({
        gameName: document.getElementById('g-name').value,
        publisher: document.getElementById('g-pub').value
      })
    });
    closeModal('modal-game');
    e.target.reset();
    showToast('Đã thêm tựa game mới');
    loadGames();
  } catch (err) { showToast(err.message, true); }
}

async function deleteGame(id) {
  if (!confirm('Xóa tựa game này?')) return;
  try {
    await apiFetch(`/games/${id}`, { method: 'DELETE' });
    showToast('Đã xóa tựa game');
    loadGames();
  } catch (err) { showToast(err.message, true); }
}

// ================= 2. GIẢI ĐẤU =================
async function loadTournaments() {
  try {
    const list = await apiFetch('/tournaments');
    document.getElementById('tournament-stats').innerHTML = `
      <div class="stat-card"><span>Tổng giải đấu</span><strong>${list.length}</strong></div>
      <div class="stat-card"><span>Đang diễn ra</span><strong>${list.filter(t => t.tournamentStatus === 'ONGOING').length}</strong></div>
      <div class="stat-card"><span>Bản nháp (Draft)</span><strong>${list.filter(t => t.tournamentStatus === 'DRAFT').length}</strong></div>
      <div class="stat-card"><span>Suất tối đa TB</span><strong>${list[0]?.maxTeams || 16} đội</strong></div>
    `;

    document.getElementById('tbody-tournaments').innerHTML = list.map(t => `
      <tr>
        <td>#${t.tournamentId}</td>
        <td><strong>${t.tournamentName}</strong></td>
        <td>${t.gameTitle?.gameName || '-'}</td>
        <td>${t.startDate || ''} → ${t.endDate || ''}</td>
        <td>${t.maxTeams} đội</td>
        <td><span class="badge badge-${t.tournamentStatus.toLowerCase()}">${t.tournamentStatus}</span></td>
        <td>
          <button class="btn btn-primary btn-sm" onclick="openApplicationsModal(${t.tournamentId}, '${t.tournamentName}')">Hồ sơ đăng ký</button>
          ${t.tournamentStatus === 'DRAFT' ? `<button class="btn btn-success btn-sm" onclick="changeTournamentStatus(${t.tournamentId}, 'ONGOING')">Công bố</button>` : ''}
          <button class="btn btn-danger btn-sm" onclick="deleteTournament(${t.tournamentId})">Xóa</button>
        </td>
      </tr>
    `).join('');

    const applySelect = document.getElementById('apply-tournament-select');
    if (applySelect) {
      applySelect.innerHTML = list.map(t => `<option value="${t.tournamentId}">${t.tournamentName}</option>`).join('');
    }
  } catch (e) { showToast(e.message, true); }
}

async function submitTournament(e) {
  e.preventDefault();
  try {
    await apiFetch('/tournaments', {
      method: 'POST',
      body: JSON.stringify({
        tournamentName: document.getElementById('t-name').value,
        gameId: Number(document.getElementById('t-game').value),
        organizerId: 1,
        maxTeams: Number(document.getElementById('t-max').value),
        startDate: document.getElementById('t-start').value,
        endDate: document.getElementById('t-end').value
      })
    });
    closeModal('modal-tournament');
    e.target.reset();
    showToast('Đã tạo giải đấu mới');
    loadTournaments();
  } catch (err) { showToast(err.message, true); }
}

async function changeTournamentStatus(id, status) {
  try {
    await apiFetch(`/tournaments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    showToast(`Đã chuyển trạng thái sang ${status}`);
    loadTournaments();
  } catch (err) { showToast(err.message, true); }
}

async function deleteTournament(id) {
  if (!confirm('Xóa giải đấu này?')) return;
  try {
    await apiFetch(`/tournaments/${id}`, { method: 'DELETE' });
    showToast('Đã xóa giải đấu');
    loadTournaments();
  } catch (err) { showToast(err.message, true); }
}

async function openApplicationsModal(tournamentId, name) {
  currentTournamentId = tournamentId;
  document.getElementById('app-modal-title').textContent = `Hồ sơ đăng ký: ${name}`;
  openModal('modal-applications');
  await refreshApplications();
}

async function refreshApplications() {
  try {
    const [apps, regions] = await Promise.all([
      apiFetch(`/tournaments/${currentTournamentId}/applications`),
      apiFetch(`/tournaments/${currentTournamentId}/regions`)
    ]);

    document.getElementById('region-summary').innerHTML = regions.length
      ? regions.map(r => `<span class="region-chip">${r.region}: ${r.approvedSlots}/${r.totalApplications} suất duyệt</span>`).join('')
      : '<span class="region-chip">Chưa có đội nào nộp hồ sơ</span>';

    document.getElementById('tbody-applications').innerHTML = apps.length ? apps.map(a => `
      <tr>
        <td>#${a.applicationId}</td>
        <td><strong>${a.team.teamName}</strong> (${a.team.teamTag || ''})</td>
        <td>${a.team.country || '-'}</td>
        <td><span class="badge badge-${a.applicationStatus.toLowerCase()}">${a.applicationStatus}</span></td>
        <td>${a.note || '-'}</td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="verifyApp(${a.applicationId}, true)">Đạt ĐK (UC-09)</button>
          <button class="btn btn-success btn-sm" onclick="reviewApp(${a.applicationId}, 'APPROVED')">Duyệt (UC-10)</button>
          <button class="btn btn-primary btn-sm" onclick="lockRoster(${a.applicationId})">Khóa Roster (UC-11)</button>
          <button class="btn btn-danger btn-sm" onclick="reviewApp(${a.applicationId}, 'REJECTED')">Từ chối</button>
        </td>
      </tr>
    `).join('') : '<tr><td colspan="6" style="text-align:center;">Chưa có hồ sơ đăng ký nào.</td></tr>';
  } catch (err) { showToast(err.message, true); }
}

async function verifyApp(appId, passed) {
  try {
    await apiFetch(`/tournaments/applications/${appId}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ coordinatorUserId: 1, passed, note: 'Đạt điều kiện khu vực' })
    });
    showToast('Đã xác nhận điều kiện khu vực (UC-09)');
    refreshApplications();
  } catch (err) { showToast(err.message, true); }
}

async function reviewApp(appId, status) {
  try {
    await apiFetch(`/tournaments/applications/${appId}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ reviewerUserId: 1, status, note: status === 'APPROVED' ? 'Hồ sơ hợp lệ' : 'Từ chối hồ sơ' })
    });
    showToast(`Đã cập nhật trạng thái: ${status}`);
    refreshApplications();
  } catch (err) { showToast(err.message, true); }
}

async function lockRoster(appId) {
  try {
    await apiFetch(`/tournaments/applications/${appId}/lock-roster`, {
      method: 'PATCH',
      body: JSON.stringify({ organizerUserId: 1 })
    });
    showToast('Đã khóa Roster chính thức (UC-11)');
    refreshApplications();
  } catch (err) { showToast(err.message, true); }
}

// ================= 3. ĐỘI TUYỂN & ROSTER =================
async function loadTeams() {
  try {
    const teams = await apiFetch('/teams');
    document.getElementById('tbody-teams').innerHTML = teams.map(t => `
      <tr>
        <td>#${t.teamId}</td>
        <td><strong>${t.teamName}</strong></td>
        <td><span class="badge badge-draft">${t.teamTag || '-'}</span></td>
        <td>${t.country || '-'}</td>
        <td>${t.captain?.fullName || '-'}</td>
        <td>
          <button class="btn btn-primary btn-sm" onclick="openRosterModal(${t.teamId}, '${t.teamName}')">Roster & Nộp đơn</button>
          <button class="btn btn-danger btn-sm" onclick="deleteTeam(${t.teamId})">Xóa</button>
        </td>
      </tr>
    `).join('');
  } catch (e) { showToast(e.message, true); }
}

async function submitTeam(e) {
  e.preventDefault();
  try {
    await apiFetch('/teams', {
      method: 'POST',
      body: JSON.stringify({
        captainUserId: 2,
        teamName: document.getElementById('team-name').value,
        teamTag: document.getElementById('team-tag').value,
        country: document.getElementById('team-country').value
      })
    });
    closeModal('modal-team');
    e.target.reset();
    showToast('Đã đăng ký đội tuyển mới');
    loadTeams();
  } catch (err) { showToast(err.message, true); }
}

async function deleteTeam(id) {
  if (!confirm('Xóa đội tuyển này?')) return;
  try {
    await apiFetch(`/teams/${id}`, { method: 'DELETE' });
    showToast('Đã xóa đội tuyển');
    loadTeams();
  } catch (err) { showToast(err.message, true); }
}

async function openRosterModal(teamId, teamName) {
  currentTeamId = teamId;
  document.getElementById('roster-modal-title').textContent = `Roster đội tuyển: ${teamName}`;
  openModal('modal-roster');
  await refreshRoster();
}

async function refreshRoster() {
  try {
    const members = await apiFetch(`/teams/${currentTeamId}/roster`);
    document.getElementById('tbody-roster').innerHTML = members.length ? members.map(m => `
      <tr>
        <td>#${m.player.playerId}</td>
        <td>${m.player.playerName}</td>
        <td><strong>${m.player.inGameName}</strong></td>
        <td>${m.player.gameAccountId}</td>
        <td><span class="badge badge-ongoing">${m.memberRole}</span></td>
        <td><button class="btn btn-danger btn-sm" onclick="removeMember(${m.player.playerId})">Gỡ</button></td>
      </tr>
    `).join('') : '<tr><td colspan="6" style="text-align:center;">Chưa có tuyển thủ trong danh sách.</td></tr>';
  } catch (err) { showToast(err.message, true); }
}

async function submitRosterMember(e) {
  e.preventDefault();
  try {
    await apiFetch(`/teams/${currentTeamId}/roster`, {
      method: 'POST',
      body: JSON.stringify({
        playerName: document.getElementById('p-name').value,
        inGameName: document.getElementById('p-ign').value,
        gameAccountId: document.getElementById('p-acc').value,
        memberRole: document.getElementById('p-role').value
      })
    });
    e.target.reset();
    showToast('Đã thêm tuyển thủ vào Roster');
    refreshRoster();
  } catch (err) { showToast(err.message, true); }
}

async function removeMember(playerId) {
  try {
    await apiFetch(`/teams/${currentTeamId}/roster/${playerId}`, { method: 'DELETE' });
    showToast('Đã gỡ tuyển thủ khỏi Roster');
    refreshRoster();
  } catch (err) { showToast(err.message, true); }
}

async function submitApplyTournament() {
  const tournamentId = Number(document.getElementById('apply-tournament-select').value);
  try {
    await apiFetch(`/teams/${currentTeamId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ tournamentId })
    });
    showToast('Nộp hồ sơ tham dự giải đấu thành công!');
    closeModal('modal-roster');
  } catch (err) { showToast(err.message, true); }
}

// ================= 4. TÀI KHOẢN =================
async function loadUsers() {
  try {
    const users = await apiFetch('/users');
    document.getElementById('tbody-users').innerHTML = users.map(u => `
      <tr>
        <td>#${u.userId}</td>
        <td><strong>${u.fullName}</strong></td>
        <td>${u.email}</td>
        <td><span class="badge badge-locked">${u.role}</span></td>
        <td><span class="badge badge-${u.accountStatus.toLowerCase()}">${u.accountStatus}</span></td>
        <td>
          <button class="btn btn-warning btn-sm" onclick="toggleUserStatus(${u.userId}, '${u.accountStatus}')">
            ${u.accountStatus === 'ACTIVE' ? 'Khóa TK' : 'Mở khóa'}
          </button>
        </td>
      </tr>
    `).join('');
  } catch (e) { showToast(e.message, true); }
}

async function submitUser(e) {
  e.preventDefault();
  try {
    await apiFetch('/users', {
      method: 'POST',
      body: JSON.stringify({
        fullName: document.getElementById('u-name').value,
        email: document.getElementById('u-email').value,
        password: document.getElementById('u-pass').value,
        role: document.getElementById('u-role').value
      })
    });
    closeModal('modal-user');
    e.target.reset();
    showToast('Đã tạo tài khoản mới');
    loadUsers();
  } catch (err) { showToast(err.message, true); }
}

async function toggleUserStatus(id, currentStatus) {
  const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
  try {
    await apiFetch(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ accountStatus: nextStatus })
    });
    showToast(`Đã đổi trạng thái tài khoản sang ${nextStatus}`);
    loadUsers();
  } catch (err) { showToast(err.message, true); }
}