// Phân hệ Quản lý trận đấu & kết quả (UC-15..22). Gọi API thật, không dùng dữ liệu mẫu để lỗi không bị che.
const MATCH_STATUS_LABELS = {
  SCHEDULED: "Đã lên lịch", READY: "Sẵn sàng", IN_PROGRESS: "Đang diễn ra",
  PENDING_CONFIRMATION: "Chờ xác nhận", COMPLETED: "Hoàn thành"
};
const MATCH_NEXT = { SCHEDULED: "READY", READY: "IN_PROGRESS", IN_PROGRESS: null };
const RESULT_LABELS = { DRAFT: "Nháp", SUBMITTED: "Chờ xác nhận", CONFIRMED: "Đã xác nhận" };

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

async function matchApi(path, method = "GET", body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

function currentUserId() {
  const u = JSON.parse(localStorage.getItem("currentUser") || "null");
  return u?.userId ?? u?.id ?? Number(prompt("Nhập ID tài khoản của bạn:"));
}

function showError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg || "";
  el.style.display = msg ? "block" : "none";
}

async function runAction(errId, fn, reload) {
  try { showError(errId, ""); await fn(); await reload(); }
  catch (e) { showError(errId, e.message); }
}

// ===== Lịch thi đấu =====
async function initSchedulesPage() {
  const tbody = document.getElementById("matches-table-body");
  const filter = document.getElementById("filter-match-status");
  const modal = document.getElementById("match-modal");
  let editingId = null;

  async function load() {
    const matches = await matchApi("/matches");
    const refs = await Promise.all(matches.map((m) => matchApi(`/matches/${m.matchId}/referees`)));
    const rows = matches.map((m, i) => ({ m, refs: refs[i] }))
      .filter(({ m }) => filter.value === "ALL" || m.matchStatus === filter.value);
    tbody.innerHTML = rows.map(({ m, refs }) => `
      <tr>
        <td>${esc(m.matchCode)}</td>
        <td>${esc(m.round?.roundName ?? m.round?.roundId)}</td>
        <td>${esc(m.team1?.teamName)} vs ${esc(m.team2?.teamName)}</td>
        <td>${esc((m.scheduledTime || "").replace("T", " "))}</td>
        <td>${esc(m.venue || "—")}</td>
        <td>BO${esc(m.bestOf)}</td>
        <td>${esc(MATCH_STATUS_LABELS[m.matchStatus] || m.matchStatus)}</td>
        <td>${refs.map((r) => esc(r.referee?.fullName)).join(", ") || "—"}</td>
        <td>
          ${MATCH_NEXT[m.matchStatus] ? `<button class="btn btn-outline btn-sm" data-act="next" data-id="${m.matchId}" data-to="${MATCH_NEXT[m.matchStatus]}">→ ${MATCH_STATUS_LABELS[MATCH_NEXT[m.matchStatus]]}</button>` : ""}
          ${m.matchStatus !== "COMPLETED" ? `<button class="btn btn-outline btn-sm" data-act="edit" data-id="${m.matchId}">Sửa</button>` : ""}
          <button class="btn btn-outline btn-sm" data-act="ref" data-id="${m.matchId}">+ Trọng tài</button>
          ${m.matchStatus === "SCHEDULED" ? `<button class="btn btn-outline btn-sm" data-act="del" data-id="${m.matchId}">Xóa</button>` : ""}
        </td>
      </tr>`).join("") || `<tr><td colspan="9">Chưa có trận đấu.</td></tr>`;
    tbody._matches = matches;
  }

  tbody.onclick = (e) => {
    const b = e.target.closest("button[data-act]");
    if (!b) return;
    const id = Number(b.dataset.id);
    if (b.dataset.act === "next")
      runAction("match-error", () => matchApi(`/matches/${id}/status`, "PATCH", { status: b.dataset.to }), load);
    if (b.dataset.act === "del" && confirm("Xóa trận đấu này?"))
      runAction("match-error", () => matchApi(`/matches/${id}`, "DELETE"), load);
    if (b.dataset.act === "ref") {
      const rid = Number(prompt("Nhập ID tài khoản trọng tài:"));
      if (rid) runAction("match-error", () => matchApi(`/matches/${id}/referees`, "POST", { refereeUserId: rid }), load);
    }
    if (b.dataset.act === "edit") {
      const m = tbody._matches.find((x) => x.matchId === id);
      editingId = id;
      document.getElementById("match-modal-title").textContent = "Sửa trận đấu";
      inp("code").value = m.matchCode; inp("round").value = m.round?.roundId;
      inp("team1").value = m.team1?.teamId; inp("team2").value = m.team2?.teamId;
      inp("time").value = (m.scheduledTime || "").slice(0, 16); inp("venue").value = m.venue || "";
      inp("bo").value = m.bestOf;
      modal.style.display = "flex";
    }
  };

  const inp = (n) => document.getElementById(`inp-match-${n}`);
  const closeModal = () => { modal.style.display = "none"; editingId = null; document.getElementById("form-match").reset(); };
  document.getElementById("btn-open-match-modal").onclick = () => {
    document.getElementById("match-modal-title").textContent = "Tạo trận đấu";
    modal.style.display = "flex";
  };
  document.getElementById("btn-close-match-modal").onclick = closeModal;
  filter.onchange = load;

  document.getElementById("form-match").onsubmit = (e) => {
    e.preventDefault();
    const body = {
      matchCode: inp("code").value.trim(), roundId: Number(inp("round").value),
      team1Id: Number(inp("team1").value), team2Id: Number(inp("team2").value),
      scheduledTime: inp("time").value ? inp("time").value + ":00" : null,
      venue: inp("venue").value.trim() || null, bestOf: Number(inp("bo").value)
    };
    const id = editingId;
    runAction("match-error",
      () => id ? matchApi(`/matches/${id}`, "PUT", body) : matchApi("/matches", "POST", body), load)
      .then(closeModal);
  };

  await runAction("match-error", async () => {}, load);
}

// ===== Kết quả trận đấu =====
async function initResultsPage() {
  const tbody = document.getElementById("results-table-body");
  const filter = document.getElementById("filter-result-status");

  async function load() {
    const [matches, results] = await Promise.all([matchApi("/matches"), matchApi("/results")]);
    const byMatch = new Map(results.map((r) => [r.match.matchId, r]));
    const rows = matches
      .filter((m) => !["SCHEDULED", "READY"].includes(m.matchStatus) || byMatch.has(m.matchId))
      .map((m) => ({ m, r: byMatch.get(m.matchId) }))
      .filter(({ r }) => filter.value === "ALL" || (filter.value === "NONE" ? !r : r?.resultStatus === filter.value));
    tbody.innerHTML = rows.map(({ m, r }) => {
      const st = r?.resultStatus;
      const btn = (act, label) => `<button class="btn btn-outline btn-sm" data-act="${act}" data-id="${m.matchId}">${label}</button>`;
      return `
      <tr>
        <td>${esc(m.matchCode)}</td>
        <td>${esc(m.team1?.teamName)} vs ${esc(m.team2?.teamName)}</td>
        <td>BO${esc(m.bestOf)}</td>
        <td>${r ? `${esc(r.team1Score)} - ${esc(r.team2Score)}` : "—"}</td>
        <td>${esc(r?.winner?.teamName || "—")}</td>
        <td>${esc(st ? RESULT_LABELS[st] : "Chưa có")}</td>
        <td>${esc(r?.note || "")}</td>
        <td>
          ${(!st || st === "DRAFT") ? btn("enter", "Nhập kết quả") : ""}
          ${st === "DRAFT" ? btn("submit", "Gửi xác nhận") : ""}
          ${st === "SUBMITTED" ? btn("confirm", "Xác nhận") : ""}
          ${st === "CONFIRMED" ? btn("adjust", "Điều chỉnh") : ""}
        </td>
      </tr>`;
    }).join("") || `<tr><td colspan="8">Chưa có trận nào cần kết quả.</td></tr>`;
  }

  function askScores() {
    const s = prompt("Nhập tỷ số dạng 'đội1-đội2' (VD: 2-1):");
    const mt = s && s.match(/^\s*(\d+)\s*-\s*(\d+)\s*$/);
    if (!mt) { if (s !== null) showError("result-error", "Tỷ số không đúng định dạng"); return null; }
    return { team1Score: Number(mt[1]), team2Score: Number(mt[2]) };
  }

  tbody.onclick = (e) => {
    const b = e.target.closest("button[data-act]");
    if (!b) return;
    const id = b.dataset.id, base = `/matches/${id}/result`;
    const uid = currentUserId();
    let fn;
    if (b.dataset.act === "enter") { const sc = askScores(); if (!sc) return; fn = () => matchApi(base, "PUT", { ...sc, userId: uid }); }
    if (b.dataset.act === "submit") fn = () => matchApi(`${base}/submit`, "POST", {});
    if (b.dataset.act === "confirm") fn = () => matchApi(`${base}/confirm`, "POST", { userId: uid });
    if (b.dataset.act === "adjust") {
      const sc = askScores(); if (!sc) return;
      const note = prompt("Lý do điều chỉnh (bắt buộc):");
      if (!note) return;
      fn = () => matchApi(`${base}/adjust`, "PATCH", { ...sc, userId: uid, note });
    }
    runAction("result-error", fn, load);
  };
  filter.onchange = load;
  await runAction("result-error", async () => {}, load);
}

const _prevInitPage = window.initPage;
window.initPage = async function (pageName) {
  await _prevInitPage(pageName);
  if (pageName === "schedules") await initSchedulesPage();
  if (pageName === "results") await initResultsPage();
};
