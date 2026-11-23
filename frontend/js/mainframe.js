const PAGE_CONFIG = {
  dashboard: {
    breadcrumb: 'Tổng quan',
    eyebrow: 'TỔNG QUAN',
    title: 'Dashboard',
    subtitle: 'Theo dõi giải đấu, trận đấu và đội tuyển tại một nơi.',
    actionHtml: ''
  },
  tournaments: {
    breadcrumb: 'Quản lý giải đấu',
    eyebrow: 'QUẢN LÝ GIẢI ĐẤU',
    title: 'Danh sách giải đấu',
    subtitle: 'Tổ chức, theo dõi và quản lý toàn bộ giải đấu của bạn.',
    actionHtml: `<button class="btn btn-primary" onclick="openModal('modalCreateTournament')">+ Thêm giải đấu</button>`
  },
  teams: {
    breadcrumb: 'Quản lý đội tuyển',
    eyebrow: 'QUẢN LÝ ĐỘI TUYỂN',
    title: 'Danh sách đội tuyển',
    subtitle: 'Quản lý hồ sơ, khu vực và đội tuyển tham gia giải đấu.',
    actionHtml: `<button class="btn btn-primary">+ Thêm đội tuyển</button>`
  },
  schedules: {
    breadcrumb: 'Lịch thi đấu',
    eyebrow: 'ĐIỀU PHỐI TRẬN ĐẤU',
    title: 'Lịch thi đấu',
    subtitle: 'Lên lịch và theo dõi trận đấu theo ngày.',
    actionHtml: `<button class="btn btn-primary">+ Tạo lịch thi đấu</button>`
  },
  results: {
    breadcrumb: 'Kết quả',
    eyebrow: 'THỐNG KÊ TRẬN ĐẤU',
    title: 'Kết quả thi đấu',
    subtitle: 'Tra cứu tỷ số và xem chi tiết từng trận.',
    actionHtml: `<button class="btn btn-primary">↓ Xuất kết quả</button>`
  }
};

document.querySelectorAll('#sidebarNav .nav-item').forEach((item) => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('#sidebarNav .nav-item').forEach((el) => el.classList.remove('active'));
    item.classList.add('active');

    const pageKey = item.dataset.page;
    const cfg = PAGE_CONFIG[pageKey];
    if (!cfg) return;

    document.getElementById('breadcrumbCurrent').textContent = cfg.breadcrumb;
    document.getElementById('pageEyebrow').textContent = cfg.eyebrow;
    document.getElementById('pageTitle').textContent = cfg.title;
    document.getElementById('pageSubtitle').textContent = cfg.subtitle;
    document.getElementById('pageActions').innerHTML = cfg.actionHtml;
  });
});

function openModal(modalId) {
  document.getElementById(modalId)?.classList.add('open');
}

function closeModal(modalId) {
  document.getElementById(modalId)?.classList.remove('open');
}