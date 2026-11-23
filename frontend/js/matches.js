// Phân hệ quản lý kết quả trận đấu. Phần Lịch thi đấu được xử lý riêng trong schedules.js.
const RESULT_LABELS = {
    DRAFT: 'Nháp',
    SUBMITTED: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận'
};

const resultEscapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
})[character]);

async function resultApi(path, method = 'GET', payload) {
    let response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: payload === undefined ? undefined : JSON.stringify(payload)
        });
    } catch {
        throw new Error('Không thể kết nối Backend. Hãy kiểm tra máy chủ tại cổng 8080.');
    }

    if (response.status === 204) return null;
    const text = await response.text();
    let data = {};
    if (text) {
        try { data = JSON.parse(text); } catch { data = {}; }
    }
    if (!response.ok) throw new Error(data.error || data.message || `HTTP ${response.status}`);
    return data;
}

function currentResultUserId() {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const userId = user?.userId ?? user?.id;
    if (userId) return Number(userId);
    const enteredId = Number(window.prompt('Nhập ID tài khoản của bạn:'));
    return Number.isInteger(enteredId) && enteredId > 0 ? enteredId : null;
}

function showResultError(message = '') {
    const element = document.getElementById('result-error');
    if (!element) return;
    element.textContent = message;
    element.style.display = message ? 'block' : 'none';
}

async function initResultsPage() {
    const tbody = document.getElementById('results-table-body');
    const filter = document.getElementById('filter-result-status');
    if (!tbody || !filter) return;

    async function load() {
        const [matches, results] = await Promise.all([
            resultApi('/matches'),
            resultApi('/results')
        ]);
        const resultsByMatch = new Map((Array.isArray(results) ? results : [])
            .map((result) => [result.match.matchId, result]));

        const rows = (Array.isArray(matches) ? matches : [])
            .filter((match) => !['SCHEDULED', 'READY'].includes(match.matchStatus)
                || resultsByMatch.has(match.matchId))
            .map((match) => ({ match, result: resultsByMatch.get(match.matchId) }))
            .filter(({ result }) => {
                if (filter.value === 'ALL') return true;
                if (filter.value === 'NONE') return !result;
                return result?.resultStatus === filter.value;
            });

        tbody.innerHTML = rows.map(({ match, result }) => {
            const status = result?.resultStatus;
            const button = (action, label) => `<button class="btn btn-outline btn-sm" type="button"
                data-result-action="${action}" data-match-id="${match.matchId}">${label}</button>`;
            const team1 = resultEscapeHtml(match.team1?.teamName || 'Đội 1');
            const team2 = resultEscapeHtml(match.team2?.teamName || 'Đội 2');
            return `
                <tr>
                    <td>${resultEscapeHtml(match.matchCode)}</td>
                    <td>${team1} vs ${team2}</td>
                    <td>BO${resultEscapeHtml(match.bestOf)}</td>
                    <td>${result ? `${resultEscapeHtml(result.team1Score)} - ${resultEscapeHtml(result.team2Score)}` : '—'}</td>
                    <td>${resultEscapeHtml(result?.winner?.teamName || '—')}</td>
                    <td>${resultEscapeHtml(status ? RESULT_LABELS[status] || status : 'Chưa có')}</td>
                    <td>${resultEscapeHtml(result?.note || '')}</td>
                    <td>
                        ${(!status || status === 'DRAFT') ? button('enter', 'Nhập kết quả') : ''}
                        ${status === 'DRAFT' ? button('submit', 'Gửi xác nhận') : ''}
                        ${status === 'SUBMITTED' ? button('confirm', 'Xác nhận') : ''}
                        ${status === 'CONFIRMED' ? button('adjust', 'Điều chỉnh') : ''}
                    </td>
                </tr>`;
        }).join('') || '<tr><td colspan="8">Chưa có trận nào cần kết quả.</td></tr>';
    }

    function askScores() {
        const input = window.prompt("Nhập tỷ số dạng 'đội1-đội2' (VD: 2-1):");
        const match = input && input.match(/^\s*(\d+)\s*-\s*(\d+)\s*$/);
        if (!match) {
            if (input !== null) showResultError('Tỷ số không đúng định dạng.');
            return null;
        }
        return { team1Score: Number(match[1]), team2Score: Number(match[2]) };
    }

    tbody.addEventListener('click', async (event) => {
        const button = event.target.closest('button[data-result-action]');
        if (!button) return;

        const matchId = button.dataset.matchId;
        const basePath = `/matches/${matchId}/result`;
        const action = button.dataset.resultAction;
        const needsUserId = ['enter', 'confirm', 'adjust'].includes(action);
        const userId = needsUserId ? currentResultUserId() : null;
        if (needsUserId && !userId) return;

        try {
            showResultError('');
            if (action === 'enter') {
                const scores = askScores();
                if (!scores) return;
                await resultApi(basePath, 'PUT', { ...scores, userId });
            } else if (action === 'submit') {
                await resultApi(`${basePath}/submit`, 'POST', {});
            } else if (action === 'confirm') {
                await resultApi(`${basePath}/confirm`, 'POST', { userId });
            } else if (action === 'adjust') {
                const scores = askScores();
                if (!scores) return;
                const note = window.prompt('Lý do điều chỉnh (bắt buộc):');
                if (!note || !note.trim()) return;
                await resultApi(`${basePath}/adjust`, 'PATCH', { ...scores, userId, note: note.trim() });
            }
            await load();
        } catch (error) {
            showResultError(error.message);
        }
    });

    filter.addEventListener('change', async () => {
        try {
            showResultError('');
            await load();
        } catch (error) {
            showResultError(error.message);
        }
    });

    try {
        showResultError('');
        await load();
    } catch (error) {
        showResultError(error.message);
        tbody.innerHTML = '<tr><td colspan="8">Không thể tải dữ liệu kết quả.</td></tr>';
    }
}

// Gắn phần kết quả vào bộ điều phối chung mà không can thiệp trang khác.
const previousPageInitializerForResults = window.initPage;
window.initPage = async function (pageName) {
    if (typeof previousPageInitializerForResults === 'function') {
        await previousPageInitializerForResults(pageName);
    }
    if (pageName === 'results') {
        await initResultsPage();
    }
};
