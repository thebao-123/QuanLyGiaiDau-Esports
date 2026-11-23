const MOCK_DATA = {
  // 1. Danh sách 5 giải đấu mẫu
  tournaments: [
    {
      id: 1,
      code: "CKTG 2026",
      name: "CHUNG KẾT THẾ GIỚI LMHT 2026",
      game: "Liên Minh Huyền Thoại",
      teamCount: 50,
      stageCount: 3,
      time: "10/2026",
      status: "Đang diễn ra",
      statusType: "live"
    },
    {
      id: 2,
      code: "MSI 2026",
      name: "MID-SEASON INVITATIONAL 2026",
      game: "Liên Minh Huyền Thoại",
      teamCount: 12,
      stageCount: 2,
      time: "05/2026",
      status: "Đã xong",
      statusType: "done"
    },
    {
      id: 3,
      code: "LCK SUMMER 2026",
      name: "LCK MÙA HÈ 2026",
      game: "Liên Minh Huyền Thoại",
      teamCount: 10,
      stageCount: 2,
      time: "08/2026",
      status: "Đã xong",
      statusType: "done"
    },
    {
      id: 4,
      code: "LPL SUMMER 2026",
      name: "LPL MÙA HÈ 2026",
      game: "Liên Minh Huyền Thoại",
      teamCount: 17,
      stageCount: 3,
      time: "08/2026",
      status: "Đã xong",
      statusType: "done"
    },
    {
      id: 5,
      code: "KESPA CUP 2026",
      name: "KESPA CUP MÙA ĐÔNG 2026",
      game: "Liên Minh Huyền Thoại",
      teamCount: 16,
      stageCount: 2,
      time: "12/2026",
      status: "Sắp diễn ra",
      statusType: "upcoming"
    }
  ],

  // 2. Danh sách 5 đội tuyển mẫu
  teams: [
    {
      id: 1,
      name: "T1",
      region: "LCK",
      time: "10/2026",
      status: "Đang tham gia",
      winRate: "67,36%",
      titles: 6
    },
    {
      id: 2,
      name: "BLG",
      region: "LPL",
      time: "10/2026",
      status: "Đang tham gia",
      winRate: "64,10%",
      titles: 2
    },
    {
      id: 3,
      name: "WBG",
      region: "LPL",
      time: "10/2026",
      status: "Đang tham gia",
      winRate: "58,50%",
      titles: 1
    },
    {
      id: 4,
      name: "LOS",
      region: "Chưa cập nhật",
      time: "10/2026",
      status: "Đang tham gia",
      winRate: "51,20%",
      titles: 0
    },
    {
      id: 5,
      name: "GEN",
      region: "LCK",
      time: "10/2026",
      status: "Đang tham gia",
      winRate: "71,40%",
      titles: 4
    }
  ],

  // 3. Danh sách 5 trận đấu & kết quả mẫu
  matches: [
    {
      id: 1,
      tournament: "CKTG 2026",
      date: "18/10/2026",
      time: "14:00",
      teamA: "T1",
      teamB: "LOS",
      scoreA: 1,
      scoreB: 0,
      stage: "Thụy Sĩ",
      format: "BO1",
      status: "Đã xong",
      winner: "T1",
      duration: "32:18"
    },
    {
      id: 2,
      tournament: "CKTG 2026",
      date: "18/10/2026",
      time: "18:00",
      teamA: "T1",
      teamB: "BLG",
      scoreA: 0,
      scoreB: 0,
      stage: "Thụy Sĩ",
      format: "BO1",
      status: "Đang diễn ra",
      winner: null,
      duration: null
    },
    {
      id: 3,
      tournament: "CKTG 2026",
      date: "18/10/2026",
      time: "20:00",
      teamA: "BLG",
      teamB: "WBG",
      scoreA: null,
      scoreB: null,
      stage: "Thụy Sĩ",
      format: "BO1",
      status: "Sắp diễn ra",
      winner: null,
      duration: null
    },
    {
      id: 4,
      tournament: "CKTG 2026",
      date: "17/10/2026",
      time: "17:00",
      teamA: "BLG",
      teamB: "T1",
      scoreA: 0,
      scoreB: 1,
      stage: "Thụy Sĩ",
      format: "BO1",
      status: "Đã xong",
      winner: "T1",
      duration: "29:45"
    },
    {
      id: 5,
      tournament: "CKTG 2026",
      date: "17/10/2026",
      time: "19:30",
      teamA: "WBG",
      teamB: "LOS",
      scoreA: 1,
      scoreB: 0,
      stage: "Thụy Sĩ",
      format: "BO1",
      status: "Đã xong",
      winner: "WBG",
      duration: "35:10"
    }
  ]
};