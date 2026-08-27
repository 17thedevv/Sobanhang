# 💰 Hướng Dẫn Sử Dụng & Kiểm Thử - Epic 6

Tài liệu này hướng dẫn chi tiết cách sử dụng và kiểm thử các tính năng thuộc **Epic 6: Quản lý Thu Chi & Dòng tiền (Sổ Quỹ)**.

---

## 1. Bảng Tổng Quan Dòng Tiền

1. Mở menu **Tài chính > Sổ quỹ**.
2. Trên cùng là một Dashboard (Bảng điều khiển) với 3 thẻ xanh lá đặc trưng:
   - **Tổng tiền vào (IN)**: Liệt kê tất cả dòng tiền đã chạy vào tài khoản.
   - **Tổng tiền ra (OUT)**: Liệt kê tất cả dòng tiền đã chạy khỏi tài khoản.
   - **Tồn quỹ**: Bằng Tổng IN trừ đi Tổng OUT, tính luôn cả các số dư đầu kỳ.
3. Số liệu này tự động tính toán dựa trên các hóa đơn và biên lai bạn đã nhập.

---

## 2. Quản lý Nguồn Tiền (Két tiền)

Khu vực cột bên phải (trên Desktop) hoặc Tab Nguồn tiền (Mobile) hiển thị danh sách các Két tiền bạn đang có.

1. Mặc định hệ thống tạo sẵn: `Tiền mặt` và `Chuyển khoản`.
2. **Thêm nguồn tiền mới**: 
   - Gõ tên Ngân hàng hoặc Ví điện tử (VD: MoMo, MB Bank).
   - Đánh dấu vào **Thiết lập làm mặc định** nếu đa phần khách thanh toán qua đây.
   - Bấm `Thêm`. Nguồn tiền mới lập tức hiện trong danh sách.
3. **Kéo thả để sắp xếp (Drag & Drop)**:
   - Ở đầu mỗi nguồn tiền có biểu tượng nắm tay (Grip). Bạn có thể bấm giữ và kéo thả Nguồn tiền lên trên hoặc xuống dưới để thay đổi thứ tự ưu tiên. 
   - Thứ tự này sẽ được phản chiếu đồng bộ ra bên ngoài màn hình **Thanh toán của POS** giúp bạn dễ dàng chọn két thường dùng lên đầu.
4. **Xóa nguồn tiền**: Có thể xóa bằng nút thùng rác, nhưng KHÔNG được phép xóa nếu Nguồn tiền đó đang chứa tiền hoặc đã từng phát sinh giao dịch.

---

## 3. Lịch Sử Giao Dịch Tự Động (Auto-bookkeeping)

Đây là chức năng Sổ quỹ thông minh liên kết với Bán hàng. Bạn hãy thử kiểm chứng:

1. Bán một đơn `Thanh toán ngay` (hoặc Thu nợ đơn cũ) bên màn hình POS/Sổ đơn hàng.
2. Quay lại trang **Sổ quỹ**.
3. Danh sách giao dịch ở cột trái lập tức sẽ xuất hiện 1 bản ghi mới màu **Xanh (IN)** với lý do cụ thể là *"Thanh toán đơn hàng #ABCD"*.
4. Đồng thời, số dư ở cái Nguồn tiền mà bạn vừa chọn lúc chốt đơn cũng sẽ tăng lên đúng bằng khoản tiền đó.

Mọi thứ liên thông hoàn hảo mà không cần bạn phải tự mình ghi chép thu chi cho từng đơn bán hàng.

---

## 4. Ghi Nhận Thu Chi Thủ Công

Dùng cho các giao dịch không phát sinh từ Đơn bán hàng (Ví dụ: Thu tiền cọc ngoài, Chi tiền nhập hàng, Chi tiền điện nước).

1. Bấm nút **+ Tạo giao dịch** ở góc phải Sổ quỹ.
2. Form trượt ra, cho phép bạn thiết lập:
   - **Loại giao dịch**: Khoản Thu (IN) hoặc Khoản Chi (OUT).
   - **Số tiền**: Tùy chọn số tiền bất kỳ.
   - **Nguồn tiền**: Chọn sẽ Trừ tiền/Cộng tiền vào két nào (Tiền mặt hay Bank).
   - **Hạng mục**: Bán hàng, Tiền cọc, Tiền nhà...
   - **Mô tả**: Nhập ghi chú tự do.
3. Bấm **Lưu**. Giao dịch thủ công sẽ hiện vào lịch sử và cộng/trừ số dư két ngay lập tức. Cực kỳ tiện lợi để nắm bắt tình hình lãi lỗ kinh doanh ngoài đơn hàng.
