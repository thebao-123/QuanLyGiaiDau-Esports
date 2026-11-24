/* ================================================================
   QUẢN LÝ LỊCH THI ĐẤU
   - Quản lý cấu trúc giải: Giai đoạn và Vòng đấu.
   - Quản lý trận: thời gian, địa điểm, thể thức, trạng thái.
   - Quản lý phân công trọng tài.
   Tất cả dữ liệu được đọc/ghi trực tiếp qua API, không dùng dữ liệu mẫu.
   ================================================================ */

async function initSchedulesPage() {
    const root = document.querySelector('#pageBody .schedule-page');
    if (!root) return;

    const state = {
        tournaments: [],
        stages: [],
        rounds: [],
        teams: [],
        matches: [],
        referees: [],
        stageTeams: {},
        approvedTeamsByTournament: {},
        activeTeamStageId: null,
        loading: false,
        lastLoadError: '',
        toastTimer: null,
        pendingUndo: null,
        pendingReadyMatchId: null,
        processingReadyChange: false,
        monthPickerYear: new Date().getFullYear(),
        activeRefereeMatchId: null,
        viewMode: 'list',
        selectedDate: new Date(),
        weekStart: null
    };

    function dateOnly(value) {
        return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }

    function addDays(value, amount) {
        const next = dateOnly(value);
        next.setDate(next.getDate() + amount);
        return next;
    }

    function getWeekStart(value) {
        const day = dateOnly(value);
        // Lịch tuần theo mẫu Figma: Thứ Bảy đến Thứ Sáu.
        day.setDate(day.getDate() - ((day.getDay() + 1) % 7));
        return day;
    }

    function dateKey(value) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function parseDateKey(value) {
        const [year, month, day] = String(value).split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    state.weekStart = getWeekStart(state.selectedDate);

    const elements = {
        statTournaments: root.querySelector('#scheduleStatTournaments'),
        statStages: root.querySelector('#scheduleStatStages'),
        statRounds: root.querySelector('#scheduleStatRounds'),
        statMatches: root.querySelector('#scheduleStatMatches'),
        tournamentFilter: root.querySelector('#scheduleTournament'),
        roundFilter: root.querySelector('#scheduleRoundFilter'),
        monthInput: root.querySelector('#scheduleMonth'),
        monthPicker: root.querySelector('#scheduleMonthPicker'),
        monthTrigger: root.querySelector('#scheduleMonthTrigger'),
        monthLabel: root.querySelector('#scheduleMonthLabel'),
        monthPopover: root.querySelector('#scheduleMonthPopover'),
        monthYear: root.querySelector('#scheduleMonthYear'),
        monthGrid: root.querySelector('#scheduleMonthGrid'),
        monthPrevYear: root.querySelector('#scheduleMonthPrevYear'),
        monthNextYear: root.querySelector('#scheduleMonthNextYear'),
        viewList: root.querySelector('#scheduleViewList'),
        viewWeek: root.querySelector('#scheduleViewWeek'),
        weekControls: root.querySelector('#scheduleWeekControls'),
        weekStrip: root.querySelector('#scheduleWeekStrip'),
        weekPrev: root.querySelector('#schedulePrevWeek'),
        weekNext: root.querySelector('#scheduleNextWeek'),
        weekLabel: root.querySelector('#scheduleWeekLabel'),
        advancedToggle: root.querySelector('#scheduleAdvancedToggle'),
        advancedFilters: root.querySelector('#scheduleAdvancedFilters'),
        resultHeading: root.querySelector('#scheduleResultHeading'),
        resultSubheading: root.querySelector('#scheduleResultSubheading'),
        timezoneLabel: root.querySelector('#scheduleTimezoneLabel'),
        stageFilter: root.querySelector('#scheduleStageFilter'),
        matchStatusFilter: root.querySelector('#scheduleMatchStatus'),
        dateFilter: root.querySelector('#scheduleDate'),
        search: root.querySelector('#scheduleSearch'),
        refresh: root.querySelector('#scheduleRefresh'),
        resetFilters: root.querySelector('#scheduleResetFilters'),
        addMatch: root.querySelector('#scheduleAddMatch'),
        addStage: root.querySelector('#scheduleAddStage'),
        matchTableBody: root.querySelector('#scheduleMatchTableBody'),
        matchResultCount: root.querySelector('#scheduleMatchResultCount'),
        visibleMatchCount: root.querySelector('#scheduleVisibleMatchCount'),
        stageList: root.querySelector('#scheduleStageList'),
        stageResultCount: root.querySelector('#scheduleStageResultCount'),
        notice: root.querySelector('#scheduleNotice'),
        toast: root.querySelector('#scheduleToast'),
        toastMessage: root.querySelector('#scheduleToastMessage'),
        toastUndo: root.querySelector('#scheduleToastUndo'),
        readyModal: root.querySelector('#scheduleReadyModal'),
        readyMatchTitle: root.querySelector('#scheduleReadyMatchTitle'),
        readyMatchMeta: root.querySelector('#scheduleReadyMatchMeta'),
        readyConfirm: root.querySelector('#scheduleReadyConfirm'),
        stageModal: root.querySelector('#scheduleStageModal'),
        roundModal: root.querySelector('#scheduleRoundModal'),
        matchModal: root.querySelector('#scheduleMatchModal'),
        refereeModal: root.querySelector('#scheduleRefereeModal'),
        stageTeamsModal: root.querySelector('#scheduleStageTeamsModal'),
        stageTeamsList: root.querySelector('#scheduleStageTeamsList'),
        stageTeamForm: root.querySelector('#scheduleStageTeamForm'),
        stageTeamSelect: root.querySelector('#scheduleStageTeamSelect'),
        stageTeamSeed: root.querySelector('#scheduleStageTeamSeed'),
        stageTeamStatus: root.querySelector('#scheduleStageTeamStatus'),
        stageForm: root.querySelector('#scheduleStageForm'),
        roundForm: root.querySelector('#scheduleRoundForm'),
        matchForm: root.querySelector('#scheduleMatchForm'),
        refereeForm: root.querySelector('#scheduleRefereeForm')
    };

    const requiredElements = [
        ['scheduleAddMatch', elements.addMatch],
        ['scheduleAddStage', elements.addStage],
        ['scheduleMatchForm', elements.matchForm],
        ['scheduleMatchModal', elements.matchModal],
        ['scheduleMatchTableBody', elements.matchTableBody],
        ['scheduleStageList', elements.stageList],
        ['scheduleMonthTrigger', elements.monthTrigger],
        ['scheduleReadyModal', elements.readyModal],
        ['scheduleReadyConfirm', elements.readyConfirm],
        ['scheduleToastUndo', elements.toastUndo]
    ];
    const missingElements = requiredElements.filter(([, element]) => !element).map(([id]) => id);
    if (missingElements.length) {
        console.error('Trang Lịch thi đấu thiếu thành phần HTML:', missingElements);
        root.innerHTML = `
            <section class="card schedule-initialization-error">
                <strong>Không thể khởi tạo trang Lịch thi đấu</strong>
                <p>HTML đang được tải không đồng bộ với JavaScript. Hãy thay đúng file frontend/pages/schedules.html trong gói cập nhật.</p>
                <small>Thành phần còn thiếu: ${missingElements.join(', ')}</small>
            </section>`;
        return;
    }

    const STAGE_TYPE_LABELS = {
        QUALIFIER: 'Vòng loại',
        PLAY_IN: 'Vòng khởi động',
        GROUP_STAGE: 'Vòng bảng',
        SWISS_STAGE: 'Vòng Thụy Sĩ',
        LEAGUE_STAGE: 'Vòng League',
        PLAYOFF: 'Vòng Playoffs'
    };

    const STAGE_STATUS_LABELS = {
        UPCOMING: 'Sắp diễn ra',
        ONGOING: 'Đang diễn ra',
        COMPLETED: 'Đã kết thúc'
    };

    const MATCH_STATUS_LABELS = {
        SCHEDULED: 'Đã lên lịch',
        READY: 'Sẵn sàng',
        IN_PROGRESS: 'Đang diễn ra',
        PENDING_CONFIRMATION: 'Chờ xác nhận',
        COMPLETED: 'Hoàn thành'
    };

    const MATCH_NEXT_STATUS = {
        SCHEDULED: 'READY',
        READY: 'IN_PROGRESS'
    };

    // Gọi API trực tiếp để lỗi kết nối không bị dữ liệu mẫu che khuất.
    async function apiRequest(path, method = 'GET', payload) {
        const options = {
            method,
            headers: { Accept: 'application/json' }
        };
        if (payload !== undefined) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(payload);
        }

        const requestUrl = `${API_BASE_URL}${path}`;
        let response;
        try {
            response = await fetch(requestUrl, options);
        } catch (error) {
            const origin = window.location.origin;
            const accessHint = window.location.protocol === 'file:'
                ? 'Bạn đang mở Frontend bằng file://. Hãy chạy qua máy chủ HTTP như IntelliJ hoặc Live Server.'
                : 'Hãy kiểm tra BackendApplication đã khởi động ở cổng 8080 và cấu hình CORS cho địa chỉ Frontend.';
            throw new Error(`Không thể kết nối ${requestUrl} từ ${origin}. ${accessHint} Chi tiết: ${error.message || 'Lỗi mạng/CORS'}`);
        }

        if (response.status === 204) return null;

        const responseText = await response.text();
        let data = null;
        if (responseText) {
            try {
                data = JSON.parse(responseText);
            } catch {
                data = null;
            }
        }

        if (!response.ok) {
            const reason = data?.error || data?.message || `HTTP ${response.status}`;
            throw new Error(`${method} ${path}: ${reason}`);
        }
        return data;
    }

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, (character) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[character]);
    }

    function normalize(value) {
        return String(value ?? '').trim().toUpperCase();
    }

    function formatDateTime(value) {
        if (!value) return 'Chưa xếp lịch';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value).replace('T', ' ');
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    function formatStageDateRange(startValue, endValue) {
        if (!startValue && !endValue) return 'Chưa thiết lập thời gian';
        if (startValue && endValue) return `${formatDateTime(startValue)} – ${formatDateTime(endValue)}`;
        return startValue ? `Từ ${formatDateTime(startValue)}` : `Đến ${formatDateTime(endValue)}`;
    }

    // API trả LocalDateTime không kèm múi giờ, vì vậy giữ nguyên phần ngày/giờ.
    function toDateTimeInput(value) {
        return value ? String(value).slice(0, 16) : '';
    }

    function toApiDateTime(value) {
        return value ? `${value}:00` : null;
    }

    function stageTypeLabel(type) {
        return STAGE_TYPE_LABELS[normalize(type)] || type || 'Chưa phân loại';
    }

    function stageStatusLabel(status) {
        return STAGE_STATUS_LABELS[normalize(status)] || status || 'Chưa cập nhật';
    }

    function stageStatusClass(status) {
        const value = normalize(status);
        if (value === 'UPCOMING') return 'schedule-status-upcoming';
        if (value === 'ONGOING') return 'schedule-status-ongoing';
        if (value === 'COMPLETED') return 'schedule-status-completed';
        return 'schedule-status-other';
    }

    function matchStatusClass(status) {
        const value = normalize(status);
        if (value === 'SCHEDULED') return 'schedule-match-status-scheduled';
        if (value === 'READY') return 'schedule-match-status-ready';
        if (value === 'IN_PROGRESS') return 'schedule-match-status-live';
        if (value === 'PENDING_CONFIRMATION') return 'schedule-match-status-pending';
        if (value === 'COMPLETED') return 'schedule-match-status-completed';
        return 'schedule-match-status-other';
    }

    function clearToastTimer() {
        if (state.toastTimer) window.clearTimeout(state.toastTimer);
        state.toastTimer = null;
    }

    function hideUndoAction() {
        state.pendingUndo = null;
        elements.toastUndo.hidden = true;
        elements.toastUndo.disabled = false;
    }

    function showToast(message, isError = false) {
        clearToastTimer();
        hideUndoAction();
        elements.toastMessage.textContent = message;
        elements.toast.classList.toggle('error', isError);
        elements.toast.classList.add('show');
        state.toastTimer = window.setTimeout(() => {
            elements.toast.classList.remove('show');
            state.toastTimer = null;
        }, 3400);
    }

    function showUndoToast(message, matchId) {
        clearToastTimer();
        state.pendingUndo = { matchId: String(matchId) };
        elements.toastMessage.textContent = message;
        elements.toast.classList.remove('error');
        elements.toastUndo.hidden = false;
        elements.toastUndo.disabled = false;
        elements.toast.classList.add('show');
        state.toastTimer = window.setTimeout(() => {
            hideUndoAction();
            elements.toast.classList.remove('show');
            state.toastTimer = null;
        }, 8000);
    }

    function showNotice(message = '', type = 'info') {
        elements.notice.hidden = !message;
        elements.notice.textContent = message;
        elements.notice.classList.toggle('schedule-notice-error', type === 'error');
        elements.notice.classList.toggle('schedule-notice-success', type === 'success');
    }

    function renderMonthPicker() {
        // Ô tháng để trống nghĩa là không áp dụng bộ lọc thời gian.
        const selectedValue = elements.monthInput.value;
        const [selectedYear, selectedMonth] = selectedValue ? selectedValue.split('-') : ['', ''];
        elements.monthLabel.textContent = selectedValue ? `${selectedMonth}/${selectedYear}` : 'Chọn tháng';
        elements.monthTrigger.classList.toggle('is-empty', !selectedValue);
        elements.monthYear.textContent = String(state.monthPickerYear);

        elements.monthGrid.querySelectorAll('[data-month]').forEach((button) => {
            const isSelected = Boolean(selectedValue)
                && Number(selectedYear) === state.monthPickerYear
                && button.dataset.month === selectedMonth;
            button.classList.toggle('active', isSelected);
            button.setAttribute('aria-pressed', String(isSelected));
            button.setAttribute('aria-label', `Tháng ${button.dataset.month} năm ${state.monthPickerYear}`);
        });
    }

    function openMonthPicker() {
        // Nếu chưa chọn tháng, mở lịch tại năm hiện tại nhưng không tự chọn tháng nào.
        state.monthPickerYear = elements.monthInput.value
            ? Number(elements.monthInput.value.slice(0, 4))
            : new Date().getFullYear();
        renderMonthPicker();
        elements.monthPopover.hidden = false;
        elements.monthTrigger.setAttribute('aria-expanded', 'true');
    }

    function closeMonthPicker(returnFocus = false) {
        elements.monthPopover.hidden = true;
        elements.monthTrigger.setAttribute('aria-expanded', 'false');
        if (returnFocus) elements.monthTrigger.focus();
    }

    function chooseScheduleMonth(month) {
        elements.monthInput.value = `${state.monthPickerYear}-${String(month).padStart(2, '0')}`;
        elements.monthInput.dispatchEvent(new Event('change', { bubbles: true }));
        closeMonthPicker(true);
    }

    function openReadyConfirmation(match) {
        state.pendingReadyMatchId = String(match.matchId);
        const team1 = match.team1Tag || match.team1Name || 'Đội 1';
        const team2 = match.team2Tag || match.team2Name || 'Đội 2';
        const matchCode = match.matchCode ? `Mã trận ${match.matchCode}` : `Trận đấu #${match.matchId}`;
        const scheduledTime = match.scheduledTime ? formatDateTime(match.scheduledTime) : 'Chưa xếp lịch';
        elements.readyMatchTitle.textContent = `${team1} vs ${team2}`;
        elements.readyMatchMeta.textContent = `${matchCode} · ${scheduledTime}`;
        elements.readyConfirm.disabled = false;
        openModal(elements.readyModal);
        elements.readyConfirm.focus();
    }

    async function confirmReadyChange() {
        const matchId = state.pendingReadyMatchId;
        if (!matchId || state.processingReadyChange) return;

        state.processingReadyChange = true;
        elements.readyConfirm.disabled = true;
        try {
            await apiRequest(`/matches/${matchId}/status`, 'PATCH', { status: 'READY' });
            state.pendingReadyMatchId = null;
            closeModal(elements.readyModal, true);
            await loadScheduleData(false);
            showUndoToast('Trận đấu đã được đánh dấu Sẵn sàng.', matchId);
        } catch (error) {
            showToast(error.message || 'Không thể cập nhật trạng thái trận đấu.', true);
        } finally {
            state.processingReadyChange = false;
            elements.readyConfirm.disabled = false;
        }
    }

    async function undoReadyChange() {
        const pendingUndo = state.pendingUndo;
        if (!pendingUndo || elements.toastUndo.disabled) return;

        clearToastTimer();
        state.pendingUndo = null;
        elements.toastUndo.disabled = true;
        elements.toastUndo.hidden = true;
        try {
            await apiRequest(`/matches/${pendingUndo.matchId}/undo-ready`, 'PATCH');
            await loadScheduleData(false);
            showToast('Đã hoàn tác. Trận đấu trở về trạng thái Đã lên lịch.');
        } catch (error) {
            showToast(error.message || 'Không thể hoàn tác trạng thái trận đấu.', true);
        }
    }

    function openModal(modal) {
        if (!modal) return;
        modal.hidden = false;
        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal, force = false) {
        if (!modal) return;
        if (modal === elements.readyModal && state.processingReadyChange && !force) return;
        if (modal === elements.readyModal) state.pendingReadyMatchId = null;
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        modal.hidden = true;
        if (!root.querySelector('.schedule-modal-backdrop.open')) {
            document.body.style.overflow = '';
        }
    }

    function closeAllModals() {
        [elements.stageModal, elements.roundModal, elements.matchModal, elements.refereeModal, elements.stageTeamsModal, elements.readyModal]
            .forEach((modal) => closeModal(modal));
    }

    function setOptions(select, firstLabel, items, valueOf, labelOf) {
        const currentValue = select.value;
        select.innerHTML = `<option value="">${escapeHtml(firstLabel)}</option>` + items.map((item) =>
            `<option value="${escapeHtml(valueOf(item))}">${escapeHtml(labelOf(item))}</option>`
        ).join('');
        if (items.some((item) => String(valueOf(item)) === currentValue)) {
            select.value = currentValue;
        }
    }

    function populateTournamentOptions() {
        const selectedTournament = elements.tournamentFilter.value || 'ALL';
        const tournamentOptions = state.tournaments.map((tournament) =>
            `<option value="${escapeHtml(tournament.tournamentId)}">${escapeHtml(tournament.tournamentName)}</option>`
        ).join('');
        elements.tournamentFilter.innerHTML = '<option value="ALL">Tất cả giải đấu</option>' + tournamentOptions;
        elements.tournamentFilter.value = state.tournaments.some((item) => String(item.tournamentId) === selectedTournament)
            ? selectedTournament : 'ALL';

        const stageSelectValue = elements.stageFilter.value || 'ALL';
        populateStageFilterOptions(stageSelectValue);
        populateRoundFilterOptions();

        const stageTournamentSelect = root.querySelector('#scheduleStageTournamentId');
        stageTournamentSelect.innerHTML = '<option value="">Chọn giải đấu</option>' + tournamentOptions;

        const roundStageSelect = root.querySelector('#scheduleRoundStageId');
        setOptions(roundStageSelect, 'Chọn giai đoạn', state.stages,
            (item) => item.stageId,
            (item) => `${item.tournamentName || 'Giải đấu'} • ${item.stageName}`);
    }

    function populateRoundFilterOptions(selectedValue = 'ALL') {
        const tournamentId = elements.tournamentFilter.value;
        const availableRounds = state.rounds.filter((round) =>
            tournamentId === 'ALL' || String(round.tournamentId) === tournamentId);
        const selected = selectedValue || elements.roundFilter.value || 'ALL';
        elements.roundFilter.innerHTML = '<option value="ALL">Tất cả vòng đấu</option>' + availableRounds
            .slice()
            .sort((a, b) => {
                const stageOrder = String(a.stageName || '').localeCompare(String(b.stageName || ''), 'vi');
                return stageOrder || Number(a.roundNumber || 0) - Number(b.roundNumber || 0);
            })
            .map((round) => `<option value="${escapeHtml(round.roundId)}">${escapeHtml(round.roundName || `Vòng ${round.roundNumber}`)}${round.stageName ? ` · ${escapeHtml(round.stageName)}` : ''}</option>`)
            .join('');
        elements.roundFilter.value = availableRounds.some((round) => String(round.roundId) === selected)
            ? selected : 'ALL';
    }

    function populateStageFilterOptions(selectedValue = 'ALL') {
        const tournamentId = elements.tournamentFilter.value;
        const availableStages = state.stages.filter((stage) =>
            tournamentId === 'ALL' || String(stage.tournamentId) === tournamentId);
        elements.stageFilter.innerHTML = '<option value="ALL">Tất cả giai đoạn</option>' + availableStages.map((stage) =>
            `<option value="${escapeHtml(stage.stageId)}">${escapeHtml(stage.stageName)} — ${escapeHtml(stage.tournamentName || '')}</option>`
        ).join('');
        elements.stageFilter.value = availableStages.some((stage) => String(stage.stageId) === selectedValue)
            ? selectedValue : 'ALL';
    }

    function populateMatchFormOptions() {
        const roundSelect = root.querySelector('#scheduleMatchRoundId');
        const groups = new Map();
        state.rounds.forEach((round) => {
            const groupName = `${round.tournamentName || 'Giải đấu'} • ${round.stageName || 'Giai đoạn'}`;
            if (!groups.has(groupName)) groups.set(groupName, []);
            groups.get(groupName).push(round);
        });

        roundSelect.innerHTML = '<option value="">Chọn vòng đấu</option>' + Array.from(groups.entries()).map(([groupName, rounds]) => `
            <optgroup label="${escapeHtml(groupName)}">
                ${rounds.sort((a, b) => Number(a.roundNumber) - Number(b.roundNumber)).map((round) => `
                    <option value="${escapeHtml(round.roundId)}">Vòng ${escapeHtml(round.roundNumber)}${round.roundName ? ` — ${escapeHtml(round.roundName)}` : ''}</option>
                `).join('')}
            </optgroup>
        `).join('');

        clearMatchTeamOptions();
    }

    function clearMatchTeamOptions(message = 'Chọn vòng đấu trước') {
        ['#scheduleMatchTeam1Id', '#scheduleMatchTeam2Id'].forEach((selector) => {
            const select = root.querySelector(selector);
            select.innerHTML = `<option value="">${message}</option>`;
            select.disabled = true;
        });
    }

    async function populateTeamsForRound(roundId, selectedTeam1 = '', selectedTeam2 = '') {
        const round = state.rounds.find((item) => String(item.roundId) === String(roundId));
        const team1Select = root.querySelector('#scheduleMatchTeam1Id');
        const team2Select = root.querySelector('#scheduleMatchTeam2Id');
        const helpText = root.querySelector('#scheduleMatchHelp');
        const prerequisites = root.querySelector('#scheduleMatchPrerequisites');

        if (!round) {
            clearMatchTeamOptions();
            helpText.textContent = 'Chọn vòng đấu để tải danh sách đội tham gia giai đoạn tương ứng.';
            return;
        }

        const stageId = String(round.stageId);
        if (!Object.prototype.hasOwnProperty.call(state.stageTeams, stageId)) {
            try {
                const records = await apiRequest(`/stages/${stageId}/teams`);
                state.stageTeams[stageId] = Array.isArray(records) ? records : [];
            } catch (error) {
                state.stageTeams[stageId] = [];
                showToast(`Không thể tải đội tham gia giai đoạn: ${error.message}`, true);
            }
        }

        const records = state.stageTeams[stageId] || [];
        const availableTeams = records
            .filter((record) => ['ACTIVE', 'QUALIFIED'].includes(normalize(record.stageTeamStatus)))
            .map((record) => state.teams.find((team) => String(team.teamId) === String(record.teamId)))
            .filter(Boolean)
            .sort((a, b) => String(a.teamName).localeCompare(String(b.teamName), 'vi'));

        const options = availableTeams.map((team) =>
            `<option value="${escapeHtml(team.teamId)}">${escapeHtml(team.teamTag ? `${team.teamTag} — ${team.teamName}` : team.teamName)}</option>`
        ).join('');
        team1Select.innerHTML = '<option value="">Chọn đội 1</option>' + options;
        team2Select.innerHTML = '<option value="">Chọn đội 2</option>' + options;
        team1Select.disabled = availableTeams.length < 2;
        team2Select.disabled = availableTeams.length < 2;
        if (availableTeams.length >= 2) {
            team1Select.value = String(selectedTeam1 || '');
            team2Select.value = String(selectedTeam2 || '');
            helpText.textContent = `Đã tải ${availableTeams.length} đội tham gia giai đoạn "${round.stageName}". Chỉ các đội này mới được xếp lịch trong vòng đấu.`;
            prerequisites.hidden = true;
            prerequisites.innerHTML = '';
        } else {
            clearMatchTeamOptions(availableTeams.length ? 'Cần ít nhất 2 đội tham gia' : 'Chưa có đội tham gia giai đoạn');
            helpText.textContent = 'Cần thêm ít nhất hai đội vào giai đoạn trước khi tạo lịch trận.';
            prerequisites.hidden = false;
            prerequisites.innerHTML = `<div class="schedule-prerequisite-item"><div class="schedule-prerequisite-copy"><strong>Giai đoạn chưa đủ đội để lập lịch</strong><span>Hiện có ${availableTeams.length} đội hợp lệ. Hãy đăng ký ít nhất hai đội vào giai đoạn này.</span></div><button class="btn btn-outline" type="button" data-schedule-prerequisite="manage-stage-teams" data-stage-id="${escapeHtml(stageId)}">Quản lý đội tham gia</button></div>`;
        }
        const selected1 = team1Select.value;
        const selected2 = team2Select.value;
        Array.from(team2Select.options).forEach((option) => {
            if (option.value) option.disabled = option.value === selected1;
        });
        Array.from(team1Select.options).forEach((option) => {
            if (option.value) option.disabled = option.value === selected2;
        });
    }

    function renderStatistics() {
        elements.statTournaments.textContent = state.tournaments.length;
        elements.statStages.textContent = state.stages.length;
        elements.statRounds.textContent = state.rounds.length;
        elements.statMatches.textContent = state.matches.filter((match) => Boolean(match.scheduledTime)).length;
        elements.addStage.disabled = state.tournaments.length === 0;
        // Nút luôn mở biểu mẫu để người dùng biết rõ các điều kiện còn thiếu.
        elements.addMatch.disabled = false;
    }

    function getFilteredMatches() {
        const tournamentId = elements.tournamentFilter.value;
        const stageId = elements.stageFilter.value;
        const roundId = elements.roundFilter.value;
        const status = elements.matchStatusFilter.value;
        const selectedMonth = elements.monthInput.value;
        const keyword = elements.search.value.trim().toLocaleLowerCase('vi');

        return state.matches.filter((match) => {
            if (tournamentId !== 'ALL' && String(match.tournamentId) !== tournamentId) return false;
            if (stageId !== 'ALL' && String(match.stageId) !== stageId) return false;
            if (roundId !== 'ALL' && String(match.roundId) !== roundId) return false;
            if (status !== 'ALL' && normalize(match.matchStatus) !== status) return false;
            // Chỉ lọc theo tháng khi người dùng chủ động chọn một tháng.
            // Trận chưa được xếp lịch không thuộc tháng nào nên sẽ không xuất hiện khi lọc tháng.
            if (selectedMonth && String(match.scheduledTime || '').slice(0, 7) !== selectedMonth) return false;
            if (keyword) {
                const searchText = [
                    match.matchCode, match.tournamentName, match.stageName, match.roundName,
                    match.roundNumber, match.team1Name, match.team1Tag, match.team2Name,
                    match.team2Tag, match.venue
                ].join(' ').toLocaleLowerCase('vi');
                if (!searchText.includes(keyword)) return false;
            }
            return true;
        }).sort((a, b) => {
            if (!a.scheduledTime && !b.scheduledTime) return Number(a.matchId) - Number(b.matchId);
            if (!a.scheduledTime) return 1;
            if (!b.scheduledTime) return -1;
            return String(a.scheduledTime).localeCompare(String(b.scheduledTime));
        });
    }

    function renderWeekStrip(filteredMatches) {
        if (!elements.weekStrip) return;
        const start = state.weekStart;
        const end = addDays(start, 6);
        const dateFormatter = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' });
        elements.weekLabel.textContent = `${dateFormatter.format(start)} – ${dateFormatter.format(end)} · ${start.getFullYear() === end.getFullYear() ? end.getFullYear() : `${start.getFullYear()} – ${end.getFullYear()}`}`;
        elements.weekStrip.innerHTML = Array.from({ length: 7 }, (_, index) => {
            const day = addDays(start, index);
            const key = dateKey(day);
            const count = filteredMatches.filter((match) => String(match.scheduledTime || '').slice(0, 10) === key).length;
            const weekdayNames = ['CHỦ NHẬT', 'THỨ HAI', 'THỨ BA', 'THỨ TƯ', 'THỨ NĂM', 'THỨ SÁU', 'THỨ BẢY'];
            const shortWeekday = weekdayNames[day.getDay()];
            const active = key === dateKey(state.selectedDate);
            return `<button type="button" class="schedule-week-day${active ? ' active' : ''}" data-schedule-date="${key}" aria-pressed="${active}">
                <span class="schedule-week-day-name">${escapeHtml(shortWeekday)}</span>
                <strong class="schedule-week-day-number">${day.getDate()}</strong>
                <span class="schedule-week-day-count">${count ? `${count} trận` : '&nbsp;'}</span>
            </button>`;
        }).join('');
    }

    function setViewMode(mode) {
        state.viewMode = mode === 'week' ? 'week' : 'list';
        const isWeek = state.viewMode === 'week';
        elements.viewList.classList.toggle('active', !isWeek);
        elements.viewWeek.classList.toggle('active', isWeek);
        elements.viewList.setAttribute('aria-pressed', String(!isWeek));
        elements.viewWeek.setAttribute('aria-pressed', String(isWeek));
        elements.weekControls.hidden = !isWeek;
        elements.weekStrip.hidden = !isWeek;
        renderMatchTable();
    }

    function renderRefereeNames(referees) {
        if (!Array.isArray(referees) || referees.length === 0) {
            return '<span class="schedule-referee-empty-inline"><i></i>Chưa phân công</span>';
        }

        const visibleReferees = referees.slice(0, 2);
        const hiddenCount = referees.length - visibleReferees.length;
        const refereeNames = referees.map((referee) => referee.fullName || `Trọng tài #${referee.userId ?? ''}`);
        const chips = visibleReferees.map((referee) =>
            `<span class="schedule-referee-chip">${escapeHtml(referee.fullName || `Trọng tài #${referee.userId ?? ''}`)}</span>`
        ).join('');
        const extraChip = hiddenCount > 0
            ? `<span class="schedule-referee-chip schedule-referee-chip-more">+${hiddenCount}</span>`
            : '';

        return `<div class="schedule-referee-chips" title="${escapeHtml(refereeNames.join(', '))}">${chips}${extraChip}</div>`;
    }

    function renderMatchTable() {
        const filtered = getFilteredMatches();
        const isWeek = state.viewMode === 'week';
        const selectedKey = dateKey(state.selectedDate);
        const visibleMatches = isWeek
            ? filtered.filter((match) => String(match.scheduledTime || '').slice(0, 10) === selectedKey)
            : filtered;

        elements.weekControls.hidden = !isWeek;
        elements.weekStrip.hidden = !isWeek;
        const selectedMonth = elements.monthInput.value;
        const monthParts = selectedMonth ? selectedMonth.split('-') : null;
        const monthHeading = monthParts ? `Trận đấu tháng ${monthParts[1]}/${monthParts[0]}` : 'Tất cả trận đấu';
        elements.resultHeading.textContent = isWeek
            ? new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' }).format(state.selectedDate).replace(/^./, (letter) => letter.toLocaleUpperCase('vi'))
            : monthHeading;
        elements.resultSubheading.textContent = isWeek
            ? 'Các trận đấu được lên lịch trong ngày đã chọn.'
            : selectedMonth
                ? 'Chỉ hiển thị các trận có lịch trong tháng đã chọn.'
                : 'Danh sách tất cả trận đấu, không giới hạn thời gian, sắp xếp từ sớm đến muộn.';
        elements.timezoneLabel.textContent = isWeek ? 'Giờ Việt Nam (GMT+7)' : 'Tất cả thời gian theo GMT+7';
        elements.matchResultCount.textContent = `${visibleMatches.length} trận đấu`;
        elements.visibleMatchCount.textContent = visibleMatches.length;
        renderWeekStrip(filtered);

        if (!visibleMatches.length) {
            const noMatches = state.matches.length === 0;
            const message = noMatches
                ? 'Database hiện chưa có trận đấu nào. Hãy tạo giai đoạn, vòng đấu rồi thêm lịch thi đấu.'
                : isWeek
                    ? 'Không có trận đấu nào trong ngày này. Hãy chọn ngày khác hoặc chuyển sang chế độ Danh sách.'
                    : 'Không tìm thấy trận đấu phù hợp với bộ lọc hiện tại.';
            elements.matchTableBody.innerHTML = `<tr><td colspan="7" class="schedule-empty-cell"><strong>${noMatches ? 'Chưa có trận đấu' : 'Không có dữ liệu phù hợp'}</strong><span>${escapeHtml(message)}</span></td></tr>`;
            return;
        }

        elements.matchTableBody.innerHTML = visibleMatches.map((match) => {
            const status = normalize(match.matchStatus);
            const nextStatus = MATCH_NEXT_STATUS[status];
            const actions = [];
            const refereeCount = Array.isArray(match.referees) ? match.referees.length : 0;
            if (nextStatus) {
                actions.push(`<button class="btn btn-outline btn-sm schedule-action-button" type="button" data-schedule-action="advance-match" data-match-id="${escapeHtml(match.matchId)}" data-next-status="${nextStatus}">${nextStatus === 'READY' ? 'Sẵn sàng' : 'Bắt đầu'}</button>`);
            }
            actions.push(`<button class="btn btn-outline btn-sm schedule-action-button schedule-referee-action" type="button" data-schedule-action="manage-referees" data-match-id="${escapeHtml(match.matchId)}" aria-label="${refereeCount ? 'Quản lý' : 'Phân công'} trọng tài cho trận ${escapeHtml(match.matchCode)}">${refereeCount ? `Trọng tài (${refereeCount})` : '＋ Phân công'}</button>`);
            if (status !== 'COMPLETED') {
                actions.push(`<button class="btn btn-outline btn-sm schedule-action-button" type="button" data-schedule-action="edit-match" data-match-id="${escapeHtml(match.matchId)}">Sửa</button>`);
            } else {
                actions.push(`<button class="btn btn-outline btn-sm schedule-action-button" type="button" data-schedule-action="edit-match" data-match-id="${escapeHtml(match.matchId)}">Chi tiết</button>`);
            }

            const team1 = match.team1Tag || match.team1Name || 'Đội 1';
            const team2 = match.team2Tag || match.team2Name || 'Đội 2';
            const matchDate = match.scheduledTime ? String(match.scheduledTime).slice(0, 10) : '';
            const matchTime = match.scheduledTime ? String(match.scheduledTime).slice(11, 16) : 'Chưa xếp';
            const roundTitle = match.roundName || `Vòng ${match.roundNumber ?? ''}`;
            const scoreLabel = Number.isInteger(Number(match.team1Score)) && Number.isInteger(Number(match.team2Score))
                && match.team1Score !== null && match.team2Score !== null
                ? `${match.team1Score} : ${match.team2Score}` : 'VS';
            return `<tr>
                <td class="schedule-time-cell"><strong>${escapeHtml(matchTime)}</strong><span>${escapeHtml(matchDate ? new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(parseDateKey(matchDate)) : 'Chưa có ngày')}</span></td>
                <td><div class="schedule-matchup"><span class="schedule-team-name">${escapeHtml(team1)}</span><span class="schedule-versus">${escapeHtml(scoreLabel)}</span><span class="schedule-team-name">${escapeHtml(team2)}</span></div><div class="schedule-team-caption">${escapeHtml(match.team1Name || '')}${match.team1Name && match.team2Name ? ' · ' : ''}${escapeHtml(match.team2Name || '')}</div></td>
                <td><div class="schedule-round-primary">${escapeHtml(roundTitle)}</div><div class="schedule-round-secondary">${escapeHtml(match.stageName || 'Chưa có giai đoạn')}</div></td>
                <td><span class="schedule-best-of">BO${escapeHtml(match.bestOf || 3)}</span></td>
                <td><span class="schedule-match-status ${matchStatusClass(status)}"><i></i>${escapeHtml(MATCH_STATUS_LABELS[status] || status || 'Chưa cập nhật')}</span></td>
                <td class="schedule-referee-cell">${renderRefereeNames(match.referees)}</td>
                <td><div class="schedule-match-actions">${actions.join('')}</div></td>
            </tr>`;
        }).join('');
    }

    function getFilteredStages() {
        const tournamentId = elements.tournamentFilter.value;
        const keyword = elements.search.value.trim().toLocaleLowerCase('vi');
        return state.stages
            .filter((stage) => tournamentId === 'ALL' || String(stage.tournamentId) === tournamentId)
            .filter((stage) => {
                if (!keyword) return true;
                const text = [stage.stageName, stage.tournamentName, stageTypeLabel(stage.stageType)]
                    .join(' ').toLocaleLowerCase('vi');
                return text.includes(keyword);
            })
            .sort((a, b) => {
                const nameCompare = String(a.tournamentName || '').localeCompare(String(b.tournamentName || ''), 'vi');
                return nameCompare || Number(a.stageOrder || 0) - Number(b.stageOrder || 0);
            });
    }

    function renderStageCard(stage) {
        const rounds = state.rounds
            .filter((round) => String(round.stageId) === String(stage.stageId))
            .sort((a, b) => Number(a.roundNumber || 0) - Number(b.roundNumber || 0));

        const roundRows = rounds.length ? `
            <div class="schedule-round-table-wrap">
                <table class="schedule-round-table schedule-round-table-extended">
                    <thead>
                        <tr>
                            <th>VÒNG</th>
                            <th>TÊN VÒNG ĐẤU</th>
                            <th>THỜI GIAN DỰ KIẾN</th>
                            <th>SỐ TRẬN</th>
                            <th>TRẠNG THÁI</th>
                            <th>THAO TÁC</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rounds.map((round) => {
                            const matchCount = state.matches.filter((match) => String(match.roundId) === String(round.roundId)).length;
                            return `
                                <tr>
                                    <td class="schedule-round-number">#${escapeHtml(round.roundNumber)}</td>
                                    <td class="schedule-round-name">${escapeHtml(round.roundName || `Vòng ${round.roundNumber}`)}</td>
                                    <td class="schedule-round-date">${escapeHtml(formatDateTime(round.scheduledStart))}</td>
                                    <td>${matchCount} trận</td>
                                    <td><span class="schedule-status-tag ${stageStatusClass(round.roundStatus)}">${escapeHtml(stageStatusLabel(round.roundStatus))}</span></td>
                                    <td>
                                        <div class="schedule-round-actions">
                                            <button class="btn btn-outline btn-sm" type="button"
                                                data-schedule-action="edit-round" data-round-id="${escapeHtml(round.roundId)}">Sửa</button>
                                            <button class="btn btn-outline btn-sm schedule-delete-button" type="button"
                                                data-schedule-action="delete-round" data-round-id="${escapeHtml(round.roundId)}">Xóa</button>
                                        </div>
                                    </td>
                                </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>` : '<div class="schedule-empty-rounds">Giai đoạn này chưa có vòng đấu. Hãy thêm vòng đấu trước khi tạo trận.</div>';

        return `
            <article class="schedule-stage-card">
                <div class="schedule-stage-card-header">
                    <div class="schedule-stage-heading-main">
                        <div class="schedule-stage-order">${String(stage.stageOrder || 0).padStart(2, '0')}</div>
                        <div class="schedule-stage-heading-text">
                            <div class="schedule-stage-title-line">
                                <h3 class="schedule-stage-title">${escapeHtml(stage.stageName)}</h3>
                                <span class="schedule-tag">${escapeHtml(stageTypeLabel(stage.stageType))}</span>
                                <span class="schedule-status-tag ${stageStatusClass(stage.stageStatus)}">${escapeHtml(stageStatusLabel(stage.stageStatus))}</span>
                            </div>
                            <p class="schedule-stage-tournament">${escapeHtml(stage.tournamentName || `Giải đấu #${stage.tournamentId}`)}</p>
                            <div class="schedule-stage-meta">
                                <span>◷ ${escapeHtml(formatStageDateRange(stage.startDate, stage.endDate))}</span>
                                <span>▦ ${rounds.length} vòng đấu</span>
                            </div>
                        </div>
                    </div>
                    <div class="schedule-stage-actions">
                        <button class="btn btn-outline btn-sm" type="button"
                            data-schedule-action="manage-stage-teams" data-stage-id="${escapeHtml(stage.stageId)}">Đội tham gia (${(state.stageTeams[String(stage.stageId)] || []).length})</button>
                        <button class="btn btn-primary btn-sm" type="button"
                            data-schedule-action="add-round" data-stage-id="${escapeHtml(stage.stageId)}">＋ Thêm vòng</button>
                        <button class="btn btn-outline btn-sm" type="button"
                            data-schedule-action="edit-stage" data-stage-id="${escapeHtml(stage.stageId)}">Sửa giai đoạn</button>
                        <button class="btn btn-outline btn-sm schedule-delete-button" type="button"
                            data-schedule-action="delete-stage" data-stage-id="${escapeHtml(stage.stageId)}">Xóa</button>
                    </div>
                </div>
                <div class="schedule-round-section">
                    <div class="schedule-round-section-heading">
                        <h4>Danh sách vòng đấu <span class="schedule-round-count">${rounds.length} vòng</span></h4>
                    </div>
                    ${roundRows}
                </div>
            </article>`;
    }

    function renderStageList() {
        const stages = getFilteredStages();
        elements.stageResultCount.textContent = `${stages.length} giai đoạn`;

        if (!stages.length) {
            const empty = state.stages.length === 0;
            elements.stageList.innerHTML = `
                <div class="schedule-empty-state">
                    <strong>${empty ? 'Chưa có giai đoạn nào' : 'Không tìm thấy giai đoạn phù hợp'}</strong>
                    <p>${empty ? 'Tạo giai đoạn đầu tiên cho giải đấu, sau đó thêm vòng đấu và lên lịch các trận.' : 'Thử thay đổi giải đấu hoặc từ khóa tìm kiếm.'}</p>
                    ${empty && state.tournaments.length > 0
                        ? '<button class="btn btn-primary btn-sm" type="button" data-schedule-action="add-stage">＋ Thêm giai đoạn</button>'
                        : (empty ? '<p>Hãy tạo ít nhất một giải đấu trước khi thiết lập giai đoạn.</p>' : '')}
                </div>`;
            return;
        }
        elements.stageList.innerHTML = stages.map(renderStageCard).join('');
    }

    function renderAll() {
        renderStatistics();
        renderMatchTable();
        renderStageList();
    }

    // Chuyển Match entity hiện có thành cấu trúc phẳng mà giao diện lịch đang sử dụng.
    // Không yêu cầu endpoint /matches/schedule hoặc thay đổi MatchController/MatchService.
    function mapMatchForSchedule(match, refereeRows = [], resultRow = null, lookups = {}) {
        // Match API hiện trả Entity lồng Round/Team; các bảng Stage/Round lại trả DTO phẳng.
        // Dùng ID để bổ sung quan hệ trong trường hợp Jackson chỉ trả ID hoặc proxy rút gọn.
        const round = match.round || lookups.roundsById?.get(String(match.roundId)) || {};
        const nestedStage = round.stage || {};
        const stageId = nestedStage.stageId ?? round.stageId;
        const stage = Object.keys(nestedStage).length
            ? nestedStage
            : (lookups.stagesById?.get(String(stageId)) || {});
        const nestedTournament = stage.tournament || {};
        const tournamentId = nestedTournament.tournamentId ?? stage.tournamentId;
        const tournament = Object.keys(nestedTournament).length
            ? nestedTournament
            : (lookups.tournamentsById?.get(String(tournamentId)) || {});
        const team1Id = match.team1?.teamId ?? match.team1Id;
        const team2Id = match.team2?.teamId ?? match.team2Id;
        const team1 = match.team1 || lookups.teamsById?.get(String(team1Id)) || {};
        const team2 = match.team2 || lookups.teamsById?.get(String(team2Id)) || {};
        const referees = (Array.isArray(refereeRows) ? refereeRows : []).map((item) => {
            const referee = item.referee || item;
            const userId = referee.userId ?? item.refereeUserId ?? item.id?.refereeUserId;
            return {
                userId,
                fullName: referee.fullName || `Trọng tài #${userId ?? ''}`,
                email: referee.email || ''
            };
        }).filter((referee) => referee.userId != null);

        return {
            ...match,
            roundId: round.roundId ?? match.roundId,
            roundNumber: round.roundNumber,
            roundName: round.roundName,
            stageId: stage.stageId ?? round.stageId,
            stageName: stage.stageName,
            tournamentId: tournament.tournamentId ?? stage.tournamentId,
            tournamentName: tournament.tournamentName,
            team1Id,
            team1Name: team1.teamName || '',
            team1Tag: team1.teamTag || '',
            team2Id,
            team2Name: team2.teamName || '',
            team2Tag: team2.teamTag || '',
            team1Score: resultRow?.team1Score ?? null,
            team2Score: resultRow?.team2Score ?? null,
            resultStatus: resultRow?.resultStatus || null,
            referees
        };
    }

    async function loadScheduleData(showLoading = true) {
        if (state.loading) return;
        state.loading = true;
        elements.refresh.disabled = true;
        if (showLoading) {
            elements.matchTableBody.innerHTML = '<tr><td colspan="7" class="schedule-empty-cell">Đang tải dữ liệu lịch thi đấu...</td></tr>';
            elements.stageList.innerHTML = '<div class="schedule-loading-state">Đang tải cấu trúc giải đấu...</div>';
        }

        try {
            // Tải riêng từng nguồn lõi để báo chính xác API nào không trả dữ liệu.
            // Không dùng MOCK_DATA: lịch luôn phản ánh dữ liệu thật từ Backend/Database.
            const coreEndpoints = [
                { path: '/tournaments/options', label: 'Danh sách giải đấu' },
                { path: '/stages', label: 'Giai đoạn' },
                { path: '/rounds', label: 'Vòng đấu' },
                { path: '/matches', label: 'Trận đấu' }
            ];
            const coreResults = await Promise.allSettled(
                coreEndpoints.map(({ path }) => apiRequest(path))
            );
            const failedCore = coreResults
                .map((result, index) => ({ result, endpoint: coreEndpoints[index] }))
                .filter(({ result }) => result.status === 'rejected')
                .map(({ result, endpoint }) => `${endpoint.label} (${endpoint.path}): ${result.reason?.message || 'Lỗi không xác định'}`);

            if (failedCore.length) {
                throw new Error(`Không tải được dữ liệu bắt buộc: ${failedCore.join(' || ')}`);
            }

            const [tournaments, stages, rounds, matches] = coreResults.map((result) => result.value);
            const requireArray = (value, endpointName) => {
                if (!Array.isArray(value)) {
                    throw new Error(`API ${endpointName} trả dữ liệu không đúng định dạng danh sách JSON.`);
                }
                return value;
            };
            const tournamentRows = requireArray(tournaments, '/tournaments/options');
            const stageRows = requireArray(stages, '/stages');
            const roundRows = requireArray(rounds, '/rounds');
            const matchRows = requireArray(matches, '/matches');

            // Danh sách đội và tài khoản chỉ phục vụ các hộp thoại quản lý;
            // lỗi ở đây không được làm biến mất toàn bộ lịch đã tải được.
            const [teamsResult, usersResult] = await Promise.allSettled([
                apiRequest('/teams'),
                apiRequest('/users')
            ]);
            const teams = teamsResult.status === 'fulfilled' ? teamsResult.value : [];
            const users = usersResult.status === 'fulfilled' ? usersResult.value : [];
            const auxiliaryWarnings = [];
            if (teamsResult.status === 'rejected') {
                auxiliaryWarnings.push(`Không tải được danh sách đội (/teams): ${teamsResult.reason?.message || 'Lỗi không xác định'}`);
            }
            if (usersResult.status === 'rejected') {
                auxiliaryWarnings.push(`Không tải được tài khoản trọng tài (/users): ${usersResult.reason?.message || 'Lỗi không xác định'}`);
            }

            // Kết quả là dữ liệu bổ trợ cho cột tỷ số; thiếu kết quả không được làm mất lịch trận.
            let resultRows = [];
            try {
                const response = await apiRequest('/results');
                resultRows = Array.isArray(response) ? response : [];
            } catch (resultError) {
                console.warn('Không tải được tỷ số hiện có; lịch vẫn hiển thị bình thường:', resultError.message);
            }
            const resultByMatchId = new Map(resultRows.map((result) => [
                String(result.match?.matchId ?? result.matchId), result
            ]));

            let refereeDataIncomplete = false;
            const refereeRowsByMatch = await Promise.all(matchRows.map(async (match) => {
                try {
                    return await apiRequest(`/matches/${match.matchId}/referees`);
                } catch (error) {
                    refereeDataIncomplete = true;
                    console.warn(`Không tải được trọng tài của trận ${match.matchId}:`, error.message);
                    return [];
                }
            }));

            state.lastLoadError = '';
            state.tournaments = tournamentRows;
            state.stages = stageRows;
            state.rounds = roundRows;
            state.teams = Array.isArray(teams) ? teams : [];
            state.stageTeams = {};
            await Promise.all(state.stages.map(async (stage) => {
                try {
                    const records = await apiRequest(`/stages/${stage.stageId}/teams`);
                    state.stageTeams[String(stage.stageId)] = Array.isArray(records) ? records : [];
                } catch (error) {
                    const warning = `Không tải được đội tham gia giai đoạn ${stage.stageName || stage.stageId}: ${error.message}`;
                    console.warn(warning);
                    auxiliaryWarnings.push(warning);
                    state.stageTeams[String(stage.stageId)] = [];
                }
            }));
            const lookups = {
                tournamentsById: new Map(state.tournaments.map((item) => [String(item.tournamentId), item])),
                stagesById: new Map(state.stages.map((item) => [String(item.stageId), item])),
                roundsById: new Map(state.rounds.map((item) => [String(item.roundId), item])),
                teamsById: new Map(state.teams.map((item) => [String(item.teamId), item]))
            };
            state.matches = matchRows.map((match, index) => mapMatchForSchedule(
                match,
                refereeRowsByMatch[index],
                resultByMatchId.get(String(match.matchId)) || null,
                lookups
            ));
            state.matches.sort((a, b) => {
                if (!a.scheduledTime && !b.scheduledTime) return Number(a.matchId) - Number(b.matchId);
                if (!a.scheduledTime) return 1;
                if (!b.scheduledTime) return -1;
                return String(a.scheduledTime).localeCompare(String(b.scheduledTime));
            });
            state.referees = (Array.isArray(users) ? users : []).filter((user) =>
                normalize(user.role) === 'REFEREE' && normalize(user.accountStatus) === 'ACTIVE');

            populateTournamentOptions();
            populateMatchFormOptions();
            renderAll();
            if (refereeDataIncomplete) {
                auxiliaryWarnings.push('Một số danh sách trọng tài của trận chưa tải được.');
            }
            if (auxiliaryWarnings.length) {
                showNotice(`Lịch thi đấu đã tải. Một số chức năng phụ đang không khả dụng: ${auxiliaryWarnings.join(' | ')}`, 'error');
            } else {
                showNotice('', 'info');
            }
        } catch (error) {
            state.lastLoadError = error.message || 'Không tải được dữ liệu từ máy chủ.';
            elements.matchTableBody.innerHTML = `
                <tr><td colspan="7" class="schedule-empty-cell">
                    <strong>Không thể tải lịch thi đấu</strong><span>${escapeHtml(error.message)}</span>
                </td></tr>`;
            elements.stageList.innerHTML = `
                <div class="schedule-empty-state">
                    <strong>Không thể tải cấu trúc giải đấu</strong>
                    <p>${escapeHtml(error.message)}</p>
                </div>`;
            showNotice(`Không thể tải dữ liệu từ Backend/Database: ${error.message}. Dữ liệu mẫu không được sử dụng thay thế.`, 'error');
            showToast('Tải dữ liệu Lịch thi đấu thất bại.', true);
        } finally {
            state.loading = false;
            elements.refresh.disabled = false;
        }
    }

    function ensureStatusOption(select, value, labels) {
        if (!value) return;
        const normalized = normalize(value);
        if (!Array.from(select.options).some((option) => option.value === normalized)) {
            const option = document.createElement('option');
            option.value = normalized;
            option.textContent = labels[normalized] || normalized;
            select.appendChild(option);
        }
        select.value = normalized;
    }

    function openStageModal(stage = null) {
        elements.stageForm.reset();
        root.querySelector('#scheduleStageId').value = stage?.stageId ?? '';
        root.querySelector('#scheduleStageModalTitle').textContent = stage ? 'Chỉnh sửa giai đoạn' : 'Thêm giai đoạn';
        root.querySelector('#scheduleStageSubmit').textContent = stage ? 'Lưu thay đổi' : 'Tạo giai đoạn';

        const tournamentSelect = root.querySelector('#scheduleStageTournamentId');
        tournamentSelect.value = stage?.tournamentId
            ? String(stage.tournamentId)
            : (elements.tournamentFilter.value !== 'ALL'
                ? elements.tournamentFilter.value
                : String(state.tournaments[0]?.tournamentId ?? ''));

        root.querySelector('#scheduleStageName').value = stage?.stageName ?? '';
        root.querySelector('#scheduleStageTypeInput').value = stage?.stageType ?? 'GROUP_STAGE';
        root.querySelector('#scheduleStageOrder').value = stage?.stageOrder ?? (
            Math.max(0, ...state.stages
                .filter((item) => String(item.tournamentId) === tournamentSelect.value)
                .map((item) => Number(item.stageOrder) || 0)) + 1
        );
        root.querySelector('#scheduleStageStart').value = toDateTimeInput(stage?.startDate);
        root.querySelector('#scheduleStageEnd').value = toDateTimeInput(stage?.endDate);
        ensureStatusOption(root.querySelector('#scheduleStageStatusInput'), stage?.stageStatus || 'UPCOMING', STAGE_STATUS_LABELS);

        openModal(elements.stageModal);
        root.querySelector('#scheduleStageName').focus();
    }

    function openRoundModal(stage = null, round = null) {
        elements.roundForm.reset();
        root.querySelector('#scheduleRoundId').value = round?.roundId ?? '';
        root.querySelector('#scheduleRoundModalTitle').textContent = round ? 'Chỉnh sửa vòng đấu' : 'Thêm vòng đấu';
        root.querySelector('#scheduleRoundSubmit').textContent = round ? 'Lưu thay đổi' : 'Tạo vòng đấu';

        const stageSelect = root.querySelector('#scheduleRoundStageId');
        stageSelect.value = round?.stageId ?? stage?.stageId ?? '';
        const selectedStage = state.stages.find((item) => String(item.stageId) === String(stageSelect.value));
        root.querySelector('#scheduleRoundStageLabel').textContent = selectedStage
            ? `${selectedStage.stageName} • ${selectedStage.tournamentName || ''}`
            : 'Chọn giai đoạn cho vòng đấu.';
        root.querySelector('#scheduleRoundNumber').value = round?.roundNumber ?? (
            Math.max(0, ...state.rounds
                .filter((item) => String(item.stageId) === String(stageSelect.value))
                .map((item) => Number(item.roundNumber) || 0)) + 1
        );
        root.querySelector('#scheduleRoundName').value = round?.roundName ?? '';
        root.querySelector('#scheduleRoundDate').value = toDateTimeInput(round?.scheduledStart);
        ensureStatusOption(root.querySelector('#scheduleRoundStatusInput'), round?.roundStatus || 'UPCOMING', STAGE_STATUS_LABELS);

        openModal(elements.roundModal);
    }

    async function openMatchModal(match = null) {
        elements.matchForm.reset();
        root.querySelector('#scheduleMatchId').value = match?.matchId ?? '';
        root.querySelector('#scheduleMatchModalTitle').textContent = match ? 'Chỉnh sửa lịch thi đấu' : 'Thêm lịch thi đấu';
        root.querySelector('#scheduleMatchSubmit').textContent = match ? 'Lưu thay đổi' : 'Lưu lịch thi đấu';
        root.querySelector('#scheduleMatchCode').value = match?.matchCode ?? '';
        root.querySelector('#scheduleMatchRoundId').value = match?.roundId ? String(match.roundId) : '';
        root.querySelector('#scheduleMatchTeam1Id').value = match?.team1Id ? String(match.team1Id) : '';
        root.querySelector('#scheduleMatchTeam2Id').value = match?.team2Id ? String(match.team2Id) : '';
        root.querySelector('#scheduleMatchTime').value = toDateTimeInput(match?.scheduledTime);
        root.querySelector('#scheduleMatchVenue').value = match?.venue ?? '';
        root.querySelector('#scheduleMatchBestOf').value = String(match?.bestOf ?? 3);

        const canCreate = state.rounds.length > 0 && state.teams.length > 1;
        const submitButton = root.querySelector('#scheduleMatchSubmit');
        const helpText = root.querySelector('#scheduleMatchHelp');
        const prerequisitePanel = root.querySelector('#scheduleMatchPrerequisites');
        submitButton.disabled = true;
        helpText.textContent = canCreate
            ? 'Chọn vòng đấu để hiển thị các đội đã đăng ký trong giai đoạn. Thời gian và địa điểm có thể cập nhật sau.'
            : 'Hãy hoàn tất các điều kiện cần thiết bên dưới trước khi lưu lịch thi đấu.';

        const missingSteps = [];
        if (state.lastLoadError) {
            missingSteps.push({
                title: 'Chưa tải được dữ liệu hệ thống',
                description: `Không thể lấy danh sách giải đấu, vòng đấu và đội tuyển: ${state.lastLoadError}`,
                action: 'retry',
                actionLabel: 'Thử tải lại'
            });
        } else {
            if (state.tournaments.length === 0) {
                missingSteps.push({
                    title: 'Cần có ít nhất một giải đấu',
                    description: 'Tạo giải đấu trước khi thiết lập giai đoạn và vòng đấu.',
                    action: 'tournaments',
                    actionLabel: 'Đi đến Giải đấu'
                });
            } else if (state.stages.length === 0) {
                missingSteps.push({
                    title: 'Chưa có giai đoạn thi đấu',
                    description: 'Tạo giai đoạn như Vòng bảng, Vòng Thụy Sĩ hoặc Playoffs.',
                    action: 'add-stage',
                    actionLabel: '＋ Thêm giai đoạn'
                });
            } else if (state.rounds.length === 0) {
                missingSteps.push({
                    title: 'Chưa có vòng đấu',
                    description: 'Tạo ít nhất một vòng trong một giai đoạn để xếp trận.',
                    action: 'add-round',
                    actionLabel: '＋ Thêm vòng đấu',
                    stageId: state.stages[0].stageId
                });
            }

            if (state.teams.length < 2) {
                missingSteps.push({
                    title: 'Cần ít nhất hai đội tuyển',
                    description: `Hiện có ${state.teams.length} đội. Hãy bổ sung đội tuyển trước khi tạo cặp đấu.`,
                    action: 'teams',
                    actionLabel: 'Đi đến Đội tuyển'
                });
            }
        }

        prerequisitePanel.hidden = missingSteps.length === 0;
        prerequisitePanel.innerHTML = missingSteps.map((step) => `
            <div class="schedule-prerequisite-item">
                <div class="schedule-prerequisite-copy">
                    <strong>${escapeHtml(step.title)}</strong>
                    <span>${escapeHtml(step.description)}</span>
                </div>
                <button class="btn btn-outline btn-sm" type="button"
                    data-schedule-prerequisite="${escapeHtml(step.action)}"
                    ${step.stageId ? `data-stage-id="${escapeHtml(step.stageId)}"` : ''}>
                    ${escapeHtml(step.actionLabel)}
                </button>
            </div>`).join('');

        openModal(elements.matchModal);
        await populateTeamsForRound(root.querySelector('#scheduleMatchRoundId').value, match?.team1Id ?? '', match?.team2Id ?? '');
        updateMatchSubmitAvailability();
        root.querySelector('#scheduleMatchCode').focus();
    }

    function updateMatchSubmitAvailability() {
        const roundId = root.querySelector('#scheduleMatchRoundId').value;
        const team1Id = root.querySelector('#scheduleMatchTeam1Id').value;
        const team2Id = root.querySelector('#scheduleMatchTeam2Id').value;
        const allowed = Boolean(roundId && team1Id && team2Id && team1Id !== team2Id);
        root.querySelector('#scheduleMatchSubmit').disabled = !allowed;
    }

    function getMatchById(matchId) {
        return state.matches.find((match) => String(match.matchId) === String(matchId));
    }

    function renderCurrentReferees(match) {
        const referees = Array.isArray(match?.referees) ? match.referees : [];
        const list = root.querySelector('#scheduleRefereeCurrentList');
        if (!referees.length) {
            list.innerHTML = '<div class="schedule-referee-empty">Trận đấu chưa được phân công trọng tài.</div>';
        } else {
            list.innerHTML = referees.map((referee) => `
                <div class="schedule-referee-row">
                    <div><strong>${escapeHtml(referee.fullName)}</strong><span>ID tài khoản: ${escapeHtml(referee.userId)}</span></div>
                    <button class="btn btn-outline btn-sm schedule-delete-button" type="button"
                        data-schedule-action="remove-referee" data-user-id="${escapeHtml(referee.userId)}">Gỡ</button>
                </div>`).join('');
        }

        const availableReferees = state.referees.filter((referee) =>
            !referees.some((assigned) => String(assigned.userId) === String(referee.userId)));
        const select = root.querySelector('#scheduleRefereeSelect');
        select.innerHTML = '<option value="">Chọn tài khoản trọng tài</option>' + availableReferees.map((referee) =>
            `<option value="${escapeHtml(referee.userId)}">${escapeHtml(referee.fullName)} — ${escapeHtml(referee.email)}</option>`
        ).join('');
        root.querySelector('#scheduleRefereeSubmit').disabled = availableReferees.length === 0;
        if (!state.referees.length) {
            list.insertAdjacentHTML('beforeend', '<div class="schedule-referee-warning">Database hiện chưa có tài khoản REFEREE đang hoạt động.</div>');
        }
    }

    function openRefereeModal(match) {
        if (!match) return;
        state.activeRefereeMatchId = match.matchId;
        root.querySelector('#scheduleRefereeMatchLabel').textContent = `${match.matchCode} • ${match.team1Tag || match.team1Name} vs ${match.team2Tag || match.team2Name}`;
        renderCurrentReferees(match);
        openModal(elements.refereeModal);
    }

    function validateDateRange(startValue, endValue) {
        if (startValue && endValue && new Date(endValue) < new Date(startValue)) {
            showToast('Thời gian kết thúc không thể trước thời gian bắt đầu.', true);
            return false;
        }
        return true;
    }

    async function submitStageForm(event) {
        event.preventDefault();
        const stageId = root.querySelector('#scheduleStageId').value;
        const startValue = root.querySelector('#scheduleStageStart').value;
        const endValue = root.querySelector('#scheduleStageEnd').value;
        if (!validateDateRange(startValue, endValue)) return;

        const tournamentId = Number(root.querySelector('#scheduleStageTournamentId').value);
        const stageOrder = Number(root.querySelector('#scheduleStageOrder').value);
        const duplicateOrder = state.stages.some((item) => String(item.tournamentId) === String(tournamentId)
            && Number(item.stageOrder) === stageOrder && String(item.stageId) !== String(stageId));
        if (duplicateOrder) {
            showToast('Thứ tự giai đoạn đã được sử dụng trong giải đấu này.', true);
            return;
        }
        const selectedTournament = state.tournaments.find((item) => String(item.tournamentId) === String(tournamentId));
        if (selectedTournament?.startDate && startValue && startValue.slice(0, 10) < selectedTournament.startDate) {
            showToast('Ngày bắt đầu giai đoạn không được trước ngày bắt đầu giải đấu.', true);
            return;
        }
        if (selectedTournament?.endDate && endValue && endValue.slice(0, 10) > selectedTournament.endDate) {
            showToast('Ngày kết thúc giai đoạn không được sau ngày kết thúc giải đấu.', true);
            return;
        }

        const payload = {
            tournamentId,
            stageName: root.querySelector('#scheduleStageName').value.trim(),
            stageType: root.querySelector('#scheduleStageTypeInput').value,
            stageOrder,
            startDate: toApiDateTime(startValue),
            endDate: toApiDateTime(endValue),
            stageStatus: root.querySelector('#scheduleStageStatusInput').value
        };

        const button = root.querySelector('#scheduleStageSubmit');
        button.disabled = true;
        try {
            await apiRequest(stageId ? `/stages/${stageId}` : '/stages', stageId ? 'PUT' : 'POST', payload);
            closeModal(elements.stageModal);
            showToast(stageId ? 'Cập nhật giai đoạn thành công.' : 'Tạo giai đoạn thành công.');
            await loadScheduleData(false);
        } catch (error) {
            showToast(error.message || 'Không thể lưu giai đoạn.', true);
        } finally {
            button.disabled = false;
        }
    }

    async function submitRoundForm(event) {
        event.preventDefault();
        const roundId = root.querySelector('#scheduleRoundId').value;
        const stageId = Number(root.querySelector('#scheduleRoundStageId').value);
        const roundNumber = Number(root.querySelector('#scheduleRoundNumber').value);
        const duplicateNumber = state.rounds.some((item) => String(item.stageId) === String(stageId)
            && Number(item.roundNumber) === roundNumber && String(item.roundId) !== String(roundId));
        if (duplicateNumber) {
            showToast('Thứ tự vòng đã tồn tại trong giai đoạn này.', true);
            return;
        }
        const roundDate = root.querySelector('#scheduleRoundDate').value;
        const selectedStage = state.stages.find((item) => String(item.stageId) === String(stageId));
        if (roundDate && selectedStage?.startDate && roundDate < String(selectedStage.startDate).slice(0, 16)) {
            showToast('Thời gian vòng đấu không được trước ngày bắt đầu giai đoạn.', true);
            return;
        }
        if (roundDate && selectedStage?.endDate && roundDate > String(selectedStage.endDate).slice(0, 16)) {
            showToast('Thời gian vòng đấu không được sau ngày kết thúc giai đoạn.', true);
            return;
        }
        const payload = {
            stageId,
            roundNumber,
            roundName: root.querySelector('#scheduleRoundName').value.trim() || null,
            scheduledStart: toApiDateTime(root.querySelector('#scheduleRoundDate').value),
            roundStatus: root.querySelector('#scheduleRoundStatusInput').value
        };

        const button = root.querySelector('#scheduleRoundSubmit');
        button.disabled = true;
        try {
            await apiRequest(roundId ? `/rounds/${roundId}` : '/rounds', roundId ? 'PUT' : 'POST', payload);
            closeModal(elements.roundModal);
            showToast(roundId ? 'Cập nhật vòng đấu thành công.' : 'Tạo vòng đấu thành công.');
            await loadScheduleData(false);
        } catch (error) {
            showToast(error.message || 'Không thể lưu vòng đấu.', true);
        } finally {
            button.disabled = false;
        }
    }

    async function submitMatchForm(event) {
        event.preventDefault();
        const matchId = root.querySelector('#scheduleMatchId').value;
        const team1Id = Number(root.querySelector('#scheduleMatchTeam1Id').value);
        const team2Id = Number(root.querySelector('#scheduleMatchTeam2Id').value);
        if (!team1Id || !team2Id || team1Id === team2Id) {
            showToast('Hãy chọn hai đội tuyển khác nhau.', true);
            return;
        }
        const selectedRound = state.rounds.find((item) => String(item.roundId) === root.querySelector('#scheduleMatchRoundId').value);
        if (!selectedRound) {
            showToast('Vui lòng chọn vòng đấu hợp lệ.', true);
            return;
        }
        if (!matchId && normalize(selectedRound.roundStatus) === 'COMPLETED') {
            showToast('Không thể thêm trận mới vào vòng đấu đã hoàn thành.', true);
            return;
        }
        const stageForMatch = state.stages.find((item) => String(item.stageId) === String(selectedRound.stageId));
        if (!matchId && normalize(stageForMatch?.stageStatus) === 'COMPLETED') {
            showToast('Không thể thêm trận mới vào giai đoạn đã kết thúc.', true);
            return;
        }
        const stageTeamIds = (state.stageTeams[String(selectedRound.stageId)] || [])
            .filter((record) => ['ACTIVE', 'QUALIFIED'].includes(normalize(record.stageTeamStatus)))
            .map((record) => String(record.teamId));
        if (!stageTeamIds.includes(String(team1Id)) || !stageTeamIds.includes(String(team2Id))) {
            showToast('Hai đội phải nằm trong danh sách tham gia giai đoạn của vòng đấu.', true);
            return;
        }

        const matchTimeValue = root.querySelector('#scheduleMatchTime').value;
        if (matchTimeValue) {
            const stage = state.stages.find((item) => String(item.stageId) === String(selectedRound.stageId));
            const dateValue = matchTimeValue.slice(0, 10);
            if (stage?.startDate && dateValue < String(stage.startDate).slice(0, 10)) {
                showToast('Thời gian trận đấu sớm hơn ngày bắt đầu giai đoạn.', true);
                return;
            }
            if (stage?.endDate && dateValue > String(stage.endDate).slice(0, 10)) {
                showToast('Thời gian trận đấu muộn hơn ngày kết thúc giai đoạn.', true);
                return;
            }
        }

        const payload = {
            matchCode: root.querySelector('#scheduleMatchCode').value.trim(),
            roundId: Number(root.querySelector('#scheduleMatchRoundId').value),
            team1Id,
            team2Id,
            scheduledTime: toApiDateTime(root.querySelector('#scheduleMatchTime').value),
            venue: root.querySelector('#scheduleMatchVenue').value.trim() || null,
            bestOf: Number(root.querySelector('#scheduleMatchBestOf').value)
        };

        const button = root.querySelector('#scheduleMatchSubmit');
        button.disabled = true;
        try {
            await apiRequest(matchId ? `/matches/${matchId}` : '/matches', matchId ? 'PUT' : 'POST', payload);
            closeModal(elements.matchModal);
            showToast(matchId ? 'Cập nhật trận đấu thành công.' : 'Tạo trận đấu thành công.');
            await loadScheduleData(false);
        } catch (error) {
            showToast(error.message || 'Không thể lưu trận đấu.', true);
        } finally {
            button.disabled = false;
        }
    }

    async function submitRefereeForm(event) {
        event.preventDefault();
        const matchId = state.activeRefereeMatchId;
        const refereeUserId = Number(root.querySelector('#scheduleRefereeSelect').value);
        if (!matchId || !refereeUserId) return;

        const button = root.querySelector('#scheduleRefereeSubmit');
        button.disabled = true;
        try {
            await apiRequest(`/matches/${matchId}/referees`, 'POST', { refereeUserId });
            showToast('Phân công trọng tài thành công.');
            await loadScheduleData(false);
            const updatedMatch = getMatchById(matchId);
            if (updatedMatch) renderCurrentReferees(updatedMatch);
        } catch (error) {
            showToast(error.message || 'Không thể phân công trọng tài.', true);
        } finally {
            const latestMatch = getMatchById(matchId);
            const assigned = latestMatch?.referees || [];
            button.disabled = !state.referees.some((referee) =>
                !assigned.some((item) => String(item.userId) === String(referee.userId)));
        }
    }

    async function deleteStage(stageId) {
        const stage = state.stages.find((item) => String(item.stageId) === String(stageId));
        if (!stage || !window.confirm(`Bạn có chắc muốn xóa giai đoạn "${stage.stageName}"? Chỉ xóa được khi giai đoạn không còn vòng đấu hoặc đội tham gia.`)) return;
        try {
            await apiRequest(`/stages/${stageId}`, 'DELETE');
            showToast('Xóa giai đoạn thành công.');
            await loadScheduleData(false);
        } catch (error) {
            showToast(error.message || 'Không thể xóa giai đoạn.', true);
        }
    }

    async function deleteRound(roundId) {
        const round = state.rounds.find((item) => String(item.roundId) === String(roundId));
        if (!round || !window.confirm(`Bạn có chắc muốn xóa "${round.roundName || `Vòng ${round.roundNumber}`}"? Chỉ xóa được khi vòng chưa có trận đấu.`)) return;
        try {
            await apiRequest(`/rounds/${roundId}`, 'DELETE');
            showToast('Xóa vòng đấu thành công.');
            await loadScheduleData(false);
        } catch (error) {
            showToast(error.message || 'Không thể xóa vòng đấu.', true);
        }
    }

    async function handleMatchAction(button) {
        const matchId = button.dataset.matchId;
        const match = getMatchById(matchId);
        if (!match) return;

        const action = button.dataset.scheduleAction;
        if (action === 'edit-match') {
            openMatchModal(match);
            return;
        }
        if (action === 'manage-referees') {
            openRefereeModal(match);
            return;
        }
        if (action === 'advance-match') {
            const nextStatus = normalize(button.dataset.nextStatus);
            if (nextStatus === 'READY') {
                openReadyConfirmation(match);
                return;
            }

            try {
                await apiRequest(`/matches/${matchId}/status`, 'PATCH', { status: nextStatus });
                showToast('Cập nhật trạng thái trận đấu thành công.');
                await loadScheduleData(false);
            } catch (error) {
                showToast(error.message || 'Không thể cập nhật trạng thái.', true);
            }
            return;
        }
        if (action === 'delete-match') {
            if (Array.isArray(match.referees) && match.referees.length > 0) {
                showToast('Hãy gỡ phân công trọng tài trước khi xóa trận đấu.', true);
                openRefereeModal(match);
                return;
            }
            if (!window.confirm(`Bạn có chắc muốn xóa trận ${match.matchCode}? Chỉ trận chưa bắt đầu mới được xóa.`)) return;
            try {
                await apiRequest(`/matches/${matchId}`, 'DELETE');
                showToast('Xóa trận đấu thành công.');
                await loadScheduleData(false);
            } catch (error) {
                showToast(error.message || 'Không thể xóa trận đấu.', true);
            }
        }
    }

    async function removeReferee(button) {
        const matchId = state.activeRefereeMatchId;
        const refereeUserId = button.dataset.userId;
        if (!matchId || !refereeUserId) return;
        if (!window.confirm('Bạn có chắc muốn gỡ trọng tài khỏi trận đấu này?')) return;

        button.disabled = true;
        try {
            await apiRequest(`/matches/${matchId}/referees/${refereeUserId}`, 'DELETE');
            showToast('Đã gỡ trọng tài khỏi trận đấu.');
            await loadScheduleData(false);
            const updatedMatch = getMatchById(matchId);
            if (updatedMatch) renderCurrentReferees(updatedMatch);
        } catch (error) {
            showToast(error.message || 'Không thể gỡ trọng tài.', true);
        } finally {
            button.disabled = false;
        }
    }

    function renderStageTeamsList(stageId) {
        const records = state.stageTeams[String(stageId)] || [];
        if (!records.length) {
            elements.stageTeamsList.innerHTML = '<div class="schedule-empty-rounds">Chưa có đội tuyển tham gia giai đoạn này.</div>';
        } else {
            elements.stageTeamsList.innerHTML = records.map((record) => {
                const team = state.teams.find((item) => String(item.teamId) === String(record.teamId));
                const teamName = team ? `${team.teamTag ? `${team.teamTag} — ` : ''}${team.teamName}` : `Đội #${record.teamId}`;
                const hasMatches = state.matches.some((match) => String(match.stageId) === String(stageId)
                    && (String(match.team1Id) === String(record.teamId) || String(match.team2Id) === String(record.teamId)));
                return `<div class="schedule-stage-team-row"><div><strong>${escapeHtml(teamName)}</strong><span>Hạt giống: ${record.seedNumber ?? 'Chưa xếp'} · ${escapeHtml(record.stageTeamStatus || 'ACTIVE')}${hasMatches ? ' · Đã có trận' : ''}</span></div><button class="btn btn-outline btn-sm schedule-delete-button" type="button" data-stage-team-remove="${escapeHtml(record.teamId)}" ${hasMatches ? 'disabled title="Đội đã có trận trong giai đoạn này"' : ''}>Gỡ đội</button></div>`;
            }).join('');
        }

        const registeredIds = new Set(records.map((record) => String(record.teamId)));
        const approvedIds = new Set((state.approvedTeamsByTournament[String(
            state.stages.find((item) => String(item.stageId) === String(stageId))?.tournamentId
        )] || []).map(String));
        const availableTeams = state.teams.filter((team) =>
            approvedIds.has(String(team.teamId)) && !registeredIds.has(String(team.teamId))
        );
        elements.stageTeamSelect.innerHTML = '<option value="">Chọn đội đã được duyệt</option>' + availableTeams.map((team) =>
            `<option value="${escapeHtml(team.teamId)}">${escapeHtml(team.teamTag ? `${team.teamTag} — ${team.teamName}` : team.teamName)}</option>`
        ).join('');
        elements.stageTeamSelect.disabled = availableTeams.length === 0;
        elements.stageTeamForm.querySelector('button[type="submit"]').disabled = availableTeams.length === 0;
        if (!availableTeams.length) {
            const note = approvedIds.size
                ? 'Không còn đội đã được duyệt nào chưa tham gia giai đoạn này.'
                : 'Giải đấu chưa có đội được duyệt tham dự. Hãy duyệt đơn đăng ký ở mục Giải đấu trước.';
            elements.stageTeamsList.insertAdjacentHTML('beforeend', `<p class="schedule-help">${escapeHtml(note)}</p>`);
        }
    }

    async function openStageTeamsModal(stage) {
        if (!stage) return;
        state.activeTeamStageId = stage.stageId;
        root.querySelector('#scheduleStageTeamsTitle').textContent = `Đội tham gia — ${stage.stageName}`;
        elements.stageTeamForm.reset();
        elements.stageTeamsList.innerHTML = '<div class="schedule-loading-state">Đang tải danh sách đội đã được duyệt...</div>';
        openModal(elements.stageTeamsModal);
        try {
            const applications = await apiRequest(`/tournaments/${stage.tournamentId}/applications`);
            state.approvedTeamsByTournament[String(stage.tournamentId)] = (Array.isArray(applications) ? applications : [])
                .filter((application) => normalize(application.applicationStatus) === 'APPROVED')
                .map((application) => application.team?.teamId ?? application.teamId)
                .filter((teamId) => teamId != null);
            renderStageTeamsList(stage.stageId);
        } catch (error) {
            elements.stageTeamsList.innerHTML = `<div class="schedule-empty-state"><strong>Không tải được đơn đăng ký</strong><p>${escapeHtml(error.message)}</p><p>Không thể thêm đội vào giai đoạn khi chưa xác minh trạng thái đăng ký.</p></div>`;
            elements.stageTeamSelect.innerHTML = '<option value="">Không tải được danh sách đội</option>';
            elements.stageTeamSelect.disabled = true;
            elements.stageTeamForm.querySelector('button[type="submit"]').disabled = true;
            showToast('Không thể kiểm tra đơn đăng ký của giải đấu.', true);
        }
    }

    async function submitStageTeamForm(event) {
        event.preventDefault();
        const stageId = state.activeTeamStageId;
        const teamId = Number(elements.stageTeamSelect.value);
        const seedValue = elements.stageTeamSeed.value;
        if (!stageId || !teamId) {
            showToast('Vui lòng chọn đội tuyển.', true);
            return;
        }
        const payload = {
            teamId,
            seedNumber: seedValue ? Number(seedValue) : null,
            stageTeamStatus: elements.stageTeamStatus.value
        };
        const button = elements.stageTeamForm.querySelector('button[type="submit"]');
        button.disabled = true;
        try {
            await apiRequest(`/stages/${stageId}/teams`, 'POST', payload);
            await loadScheduleData(false);
            renderStageTeamsList(stageId);
            elements.stageTeamForm.reset();
            showToast('Đã thêm đội vào giai đoạn.');
        } catch (error) {
            showToast(error.message || 'Không thể thêm đội vào giai đoạn.', true);
        } finally {
            button.disabled = false;
        }
    }

    async function removeStageTeam(button) {
        const stageId = state.activeTeamStageId;
        const teamId = button.dataset.stageTeamRemove;
        if (!stageId || !teamId) return;
        if (!window.confirm('Bạn có chắc muốn gỡ đội khỏi giai đoạn này?')) return;
        button.disabled = true;
        try {
            await apiRequest(`/stages/${stageId}/teams/${teamId}`, 'DELETE');
            await loadScheduleData(false);
            renderStageTeamsList(stageId);
            showToast('Đã gỡ đội khỏi giai đoạn.');
        } catch (error) {
            showToast(error.message || 'Không thể gỡ đội khỏi giai đoạn.', true);
        } finally {
            button.disabled = false;
        }
    }

    function handleStageAction(button) {
        const action = button.dataset.scheduleAction;
        if (action === 'add-stage') {
            openStageModal();
            return;
        }
        if (action === 'manage-stage-teams') {
            const stage = state.stages.find((item) => String(item.stageId) === String(button.dataset.stageId));
            if (stage) openStageTeamsModal(stage);
            return;
        }
        if (action === 'add-round') {
            const stage = state.stages.find((item) => String(item.stageId) === String(button.dataset.stageId));
            if (stage) openRoundModal(stage);
            return;
        }
        if (action === 'edit-stage') {
            const stage = state.stages.find((item) => String(item.stageId) === String(button.dataset.stageId));
            if (stage) openStageModal(stage);
            return;
        }
        if (action === 'edit-round') {
            const round = state.rounds.find((item) => String(item.roundId) === String(button.dataset.roundId));
            const stage = round && state.stages.find((item) => String(item.stageId) === String(round.stageId));
            if (round && stage) openRoundModal(stage, round);
            return;
        }
        if (action === 'delete-stage') deleteStage(button.dataset.stageId);
        if (action === 'delete-round') deleteRound(button.dataset.roundId);
    }

    // Không tự lọc theo tháng khi vừa mở trang; mặc định hiển thị tất cả trận đấu.
    elements.monthInput.value = '';
    state.monthPickerYear = new Date().getFullYear();
    renderMonthPicker();

    // Sự kiện bộ lọc.
    elements.search.addEventListener('input', () => {
        renderMatchTable();
        renderStageList();
    });
    elements.tournamentFilter.addEventListener('change', () => {
        populateStageFilterOptions('ALL');
        populateRoundFilterOptions('ALL');
        renderMatchTable();
        renderStageList();
    });
    [elements.stageFilter, elements.roundFilter, elements.matchStatusFilter, elements.dateFilter].forEach((element) => {
        element.addEventListener('change', renderMatchTable);
    });

    elements.viewList.addEventListener('click', () => setViewMode('list'));
    elements.viewWeek.addEventListener('click', () => setViewMode('week'));
    elements.weekPrev.addEventListener('click', () => {
        state.selectedDate = addDays(state.selectedDate, -7);
        state.weekStart = getWeekStart(state.selectedDate);
        renderMatchTable();
    });
    elements.weekNext.addEventListener('click', () => {
        state.selectedDate = addDays(state.selectedDate, 7);
        state.weekStart = getWeekStart(state.selectedDate);
        renderMatchTable();
    });
    elements.monthTrigger.addEventListener('click', () => {
        if (elements.monthPopover.hidden) openMonthPicker();
        else closeMonthPicker();
    });
    elements.monthPrevYear.addEventListener('click', () => {
        state.monthPickerYear -= 1;
        renderMonthPicker();
    });
    elements.monthNextYear.addEventListener('click', () => {
        state.monthPickerYear += 1;
        renderMonthPicker();
    });
    elements.monthGrid.addEventListener('click', (event) => {
        const monthButton = event.target.closest('[data-month]');
        if (monthButton) chooseScheduleMonth(Number(monthButton.dataset.month));
    });
    root.querySelector('#scheduleMonthClear').addEventListener('click', () => {
        elements.monthInput.value = '';
        elements.monthInput.dispatchEvent(new Event('change', { bubbles: true }));
        closeMonthPicker(true);
    });
    root.addEventListener('click', (event) => {
        if (!elements.monthPicker.contains(event.target)) closeMonthPicker();
    });
    elements.monthInput.addEventListener('change', () => {
        if (elements.monthInput.value) {
            const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(elements.monthInput.value);
            if (!match) {
                elements.monthInput.value = '';
            } else {
                const year = Number(match[1]);
                const month = Number(match[2]);
                state.selectedDate = new Date(year, month - 1, 1);
                state.weekStart = getWeekStart(state.selectedDate);
                state.monthPickerYear = year;
            }
        }
        renderMonthPicker();
        renderMatchTable();
    });
    elements.weekStrip.addEventListener('click', (event) => {
        const button = event.target.closest('[data-schedule-date]');
        if (!button) return;
        state.selectedDate = parseDateKey(button.dataset.scheduleDate);
        state.weekStart = getWeekStart(state.selectedDate);
        renderMatchTable();
    });
    elements.advancedToggle.addEventListener('click', () => {
        const expanded = elements.advancedToggle.getAttribute('aria-expanded') === 'true';
        elements.advancedToggle.setAttribute('aria-expanded', String(!expanded));
        elements.advancedFilters.hidden = expanded;
    });

    elements.resetFilters.addEventListener('click', () => {
        elements.search.value = '';
        elements.tournamentFilter.value = 'ALL';
        populateStageFilterOptions('ALL');
        populateRoundFilterOptions('ALL');
        elements.matchStatusFilter.value = 'ALL';
        elements.dateFilter.value = '';
        elements.monthInput.value = '';
        renderMonthPicker();
        renderMatchTable();
        renderStageList();
    });

    elements.refresh.addEventListener('click', () => loadScheduleData(true));
    elements.addMatch.addEventListener('click', () => {
        openMatchModal();
    });
    elements.addStage.addEventListener('click', () => openStageModal());

    elements.readyConfirm.addEventListener('click', confirmReadyChange);
    elements.toastUndo.addEventListener('click', undoReadyChange);

    elements.matchTableBody.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-schedule-action]');
        if (button) handleMatchAction(button);
    });
    elements.stageList.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-schedule-action]');
        if (button) handleStageAction(button);
    });
    root.querySelector('#scheduleRefereeCurrentList').addEventListener('click', (event) => {
        const button = event.target.closest('button[data-schedule-action="remove-referee"]');
        if (button) removeReferee(button);
    });

    elements.stageForm.addEventListener('submit', submitStageForm);
    elements.roundForm.addEventListener('submit', submitRoundForm);
    elements.matchForm.addEventListener('submit', submitMatchForm);
    elements.refereeForm.addEventListener('submit', submitRefereeForm);
    elements.stageTeamForm.addEventListener('submit', submitStageTeamForm);
    elements.stageTeamsList.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-stage-team-remove]');
        if (button) removeStageTeam(button);
    });

    // Điều hướng người dùng đến đúng bước còn thiếu trước khi lập lịch.
    root.querySelector('#scheduleMatchPrerequisites').addEventListener('click', async (event) => {
        const button = event.target.closest('button[data-schedule-prerequisite]');
        if (!button) return;

        const action = button.dataset.schedulePrerequisite;
        if (action === 'retry') {
            button.disabled = true;
            await loadScheduleData(true);
            openMatchModal();
            return;
        }

        closeModal(elements.matchModal);
        if (action === 'add-stage') {
            openStageModal();
        } else if (action === 'add-round') {
            const stage = state.stages.find((item) => String(item.stageId) === String(button.dataset.stageId)) || state.stages[0];
            if (stage) openRoundModal(stage);
        } else if (action === 'manage-stage-teams') {
            const stage = state.stages.find((item) => String(item.stageId) === String(button.dataset.stageId));
            if (stage) openStageTeamsModal(stage);
        } else if (action === 'teams' || action === 'tournaments') {
            const pageName = action === 'teams' ? 'teams' : 'tournaments';
            const navigationLink = document.querySelector(`#sidebarNav .nav-item[data-page="${pageName}"]`);
            if (navigationLink) navigationLink.click();
        }
    });

    root.querySelector('#scheduleMatchRoundId').addEventListener('change', async (event) => {
        await populateTeamsForRound(event.target.value);
        updateMatchSubmitAvailability();
    });
    root.querySelector('#scheduleMatchTeam1Id').addEventListener('change', () => {
        const first = root.querySelector('#scheduleMatchTeam1Id').value;
        Array.from(root.querySelector('#scheduleMatchTeam2Id').options).forEach((option) => {
            if (option.value) option.disabled = option.value === first;
        });
        updateMatchSubmitAvailability();
    });
    root.querySelector('#scheduleMatchTeam2Id').addEventListener('change', () => {
        const second = root.querySelector('#scheduleMatchTeam2Id').value;
        Array.from(root.querySelector('#scheduleMatchTeam1Id').options).forEach((option) => {
            if (option.value) option.disabled = option.value === second;
        });
        updateMatchSubmitAvailability();
    });

    root.querySelectorAll('[data-close-schedule-modal]').forEach((button) => {
        button.addEventListener('click', () => {
            const modal = root.querySelector(`#${button.dataset.closeScheduleModal}`);
            if (modal) closeModal(modal);
        });
    });

    [elements.stageModal, elements.roundModal, elements.matchModal, elements.refereeModal, elements.stageTeamsModal, elements.readyModal].forEach((modal) => {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) closeModal(modal);
        });
    });

    root.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        if (!elements.monthPopover.hidden) {
            closeMonthPicker(true);
            return;
        }
        const openedModal = root.querySelector('.schedule-modal-backdrop.open');
        if (openedModal) closeModal(openedModal);
    });

    root.querySelector('#scheduleRoundStageId').addEventListener('change', (event) => {
        const stage = state.stages.find((item) => String(item.stageId) === event.target.value);
        root.querySelector('#scheduleRoundStageLabel').textContent = stage
            ? `${stage.stageName} • ${stage.tournamentName || ''}`
            : 'Chọn giai đoạn cho vòng đấu.';
        if (!root.querySelector('#scheduleRoundId').value && stage) {
            root.querySelector('#scheduleRoundNumber').value = Math.max(0, ...state.rounds
                .filter((item) => String(item.stageId) === String(stage.stageId))
                .map((item) => Number(item.roundNumber) || 0)) + 1;
        }
    });

    window.openScheduleStageModal = () => openStageModal();
    await loadScheduleData(true);
}

// Nối module Lịch thi đấu với bộ điều phối trang mà không ghi đè chức năng khác.
const previousPageInitializerForSchedules = window.initPage;
window.initPage = async function (pageName) {
    if (typeof previousPageInitializerForSchedules === 'function') {
        await previousPageInitializerForSchedules(pageName);
    }
    if (pageName === 'schedules') {
        await initSchedulesPage();
    }
};
