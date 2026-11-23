const PAGE_CONFIG = {
  dashboard: {
    eyebrow: "TỔNG QUAN",
    title: "Dashboard",
    subtitle: "Theo dõi giải đấu, trận đấu và đội tuyển tại một nơi.",
    breadcrumb: "Tổng quan"
  },
  tournaments: {
    eyebrow: "QUẢN LÝ GIẢI ĐẤU",
    title: "Danh sách giải đấu",
    subtitle: "Tạo mới, cập nhật thông tin và theo dõi trạng thái các giải đấu.",
    breadcrumb: "Giải đấu"
  },
  teams: {
    eyebrow: "QUẢN LÝ ĐỘI TUYỂN",
    title: "Đội tuyển & Tuyển thủ",
    subtitle: "Quản lý hồ sơ đội tuyển, đội hình thi đấu và đơn đăng ký tham dự.",
    breadcrumb: "Đội tuyển"
  },
  schedules: {
    eyebrow: "LỊCH THI ĐẤU",
    title: "Vòng đấu & Lịch thi đấu",
    subtitle: "Sắp xếp cặp đấu, thời gian và địa điểm thi đấu.",
    breadcrumb: "Lịch thi đấu"
  },
  results: {
    eyebrow: "KẾT QUẢ & BXH",
    title: "Kết quả trận đấu",
    subtitle: "Cập nhật tỷ số, xác nhận kết quả và bảng xếp hạng.",
    breadcrumb: "Kết quả"
  },
  accounts: {
    eyebrow: "QUẢN TRỊ HỆ THỐNG",
    title: "Tài khoản & Phân quyền",
    subtitle: "Quản lý người dùng, cấp vai trò và trạng thái hoạt động.",
    breadcrumb: "Tài khoản"
  }
};

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = "flex";
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = "none";
}

async function loadPage(pageName) {
  const pageBody = document.getElementById("pageBody");
  if (!pageBody) return;

  // 1. Đổi trạng thái active trên Sidebar
  document.querySelectorAll("#sidebarNav .nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.page === pageName);
  });

  // 2. Cập nhật tiêu đề & Breadcrumb theo từng trang
  const meta = PAGE_CONFIG[pageName];
  if (meta) {
    const eyebrowEl = document.getElementById("pageEyebrow");
    const titleEl = document.getElementById("pageTitle");
    const subtitleEl = document.getElementById("pageSubtitle");
    const crumbEl = document.getElementById("breadcrumbCurrent");

    if (eyebrowEl) eyebrowEl.textContent = meta.eyebrow;
    if (titleEl) titleEl.textContent = meta.title;
    if (subtitleEl) subtitleEl.textContent = meta.subtitle;
    if (crumbEl) crumbEl.textContent = meta.breadcrumb;
  }

  // 3. Nạp file HTML từ thư mục pages/ vào #pageBody
  try {
    const response = await fetch(`pages/${pageName}.html`);
    if (!response.ok) throw new Error(`Chưa có tệp pages/${pageName}.html`);
    pageBody.innerHTML = await response.text();

    if (typeof window.initPage === "function") {
      await window.initPage(pageName);
    }
  } catch (err) {
    pageBody.innerHTML = `
      <div class="placeholder-box">
        Giao diện mục <strong>${pageName}</strong> đang được xây dựng (${err.message}).
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("#sidebarNav .nav-item").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      if (page) loadPage(page);
    });
  });

  // Hiển thị thông tin tài khoản đã đăng nhập lên Topbar & Sidebar
  const savedUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  if (savedUser) {
    const nameEl = document.querySelector(".user-name");
    const roleEl = document.querySelector(".user-role");
    const sideRoleName = document.querySelector(".role-name");
    if (nameEl) nameEl.textContent = savedUser.fullName;
    if (roleEl) roleEl.textContent = savedUser.role;
    if (sideRoleName) sideRoleName.textContent = savedUser.role;
  }

  // Bấm vào góc tên tài khoản trên Topbar để đăng xuất / đổi tài khoản
  const userProfileEl = document.querySelector(".user-profile");
  if (userProfileEl && !userProfileEl.dataset.logoutBound) {
    userProfileEl.dataset.logoutBound = "true";
    userProfileEl.style.cursor = "pointer";
    userProfileEl.title = "Bấm để đăng xuất / đổi tài khoản";
    userProfileEl.addEventListener("click", () => {
      if (confirm("Bạn muốn đăng xuất và chuyển sang trang đăng nhập?")) {
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
      }
    });
  }

  loadPage("dashboard");
});