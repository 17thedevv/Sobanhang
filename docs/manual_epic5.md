# 📋 Hướng Dẫn Sử Dụng & Kiểm Thử - Epic 5

Tài liệu này hướng dẫn chi tiết cách sử dụng và kiểm thử các tính năng thuộc **Epic 5: Quản lý Đơn hàng**.

---

## 1. Sổ Đơn Hàng & Tìm kiếm

1. Từ Sidebar, chọn **Bán hàng > Quản lý đơn hàng**.
2. **Giao diện chính**: Là danh sách toàn bộ các đơn hàng đã được tạo từ POS, sắp xếp theo thời gian mới nhất. Mỗi đơn hiển thị Mã, Tên Khách, Thời gian, Tổng tiền, và một Badge trạng thái nổi bật.
3. **Trạng thái đơn**:
   - `Đã thanh toán` (Màu xanh)
   - `Chưa thanh toán` (Màu xám)
   - `Ghi nợ` (Màu cam)
   - `Đã hủy` (Màu đỏ)
4. **Tìm kiếm (Search)**:
   - Ô tìm kiếm cực kỳ linh hoạt. Bạn có thể gõ **Mã đơn hàng** (VD: C81F), **Tên khách hàng** (VD: Tuấn), hoặc **Số điện thoại khách hàng**.
   - Danh sách sẽ lọc Real-time ngay khi bạn gõ.

---

## 2. Xem Chi Tiết Đơn Hàng

Bấm vào bất kỳ một đơn hàng nào trong Sổ đơn hàng để mở bảng Chi tiết hóa đơn.

Bảng này chứa đầy đủ thông tin:
- Khách hàng, Mã đơn, Thời gian chốt, Trạng thái đơn.
- Danh sách sản phẩm mua, số lượng, đơn giá, thành tiền.
- Bảng tạm tính, Số tiền được giảm giá (nếu có), Phí giao hàng (nếu có) và Tổng cộng.

Dưới cùng bảng chi tiết là các thao tác:
- **Chia sẻ**: Tương tự như bên POS, hỗ trợ copy hoặc gửi text qua Zalo/Facebook.
- **Thu nợ**: Sẽ hiện ra nếu đơn hàng này đang ở trạng thái `Ghi nợ` hoặc `Chưa thanh toán`.

---

## 3. Thu Nợ / Thanh toán sau

Tính năng này dùng để xử lý các đơn Giao sau hoặc Khách mua chịu, nay khách quay lại trả tiền.

1. Bấm vào một đơn hàng có trạng thái `Ghi nợ` hoặc `Chưa thanh toán`.
2. Dưới cùng của bảng Chi tiết sẽ xuất hiện khu vực **Thu nợ**.
3. Bấm vào Menu xổ xuống để chọn **Nguồn thu** (tiền khách trả sẽ chạy vào két Tiền mặt hay Ngân hàng nào).
4. Bấm nút **Thu nợ** (Màu xanh).
5. Hệ thống sẽ báo "Thu tiền thành công!", Trạng thái hóa đơn lập tức chuyển xanh thành `Đã thanh toán`. Tiền sẽ được cộng tự động vào Sổ quỹ tương ứng.

---

## 4. Xuất Báo Cáo Excel

Trên cùng bên phải của trang Sổ đơn hàng có nút **Xuất Excel**.

- Khi bấm vào nút này, toàn bộ dữ liệu đơn hàng (Mã, Khách hàng, Thời gian, Trạng thái, Tổng tiền) sẽ được gói gọn vào một file `.csv` và tải về máy tính/điện thoại của bạn.
- File này có thể mở trực tiếp bằng Microsoft Excel, Google Sheets để phục vụ việc kiểm toán, đối soát dữ liệu với kế toán.
