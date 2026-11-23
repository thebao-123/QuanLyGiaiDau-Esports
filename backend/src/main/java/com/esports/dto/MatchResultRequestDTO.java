package com.esports.dto;

import lombok.Data;

@Data
public class MatchResultRequestDTO {
    private Integer team1Score;
    private Integer team2Score;
    /** Người thực hiện thao tác (nhập / xác nhận / điều chỉnh). */
    private Long userId;
    /** Bắt buộc khi điều chỉnh kết quả đã xác nhận. */
    private String note;
}
