# 📦 Hướng Dẫn Sử Dụng & Kiểm Thử - Epic 3

Tài liệu này hướng dẫn chi tiết cách sử dụng và kiểm thử các tính năng thuộc **Epic 3: Quản lý hàng hóa nâng cao**.

---

## 1. Quản lý Danh mục (US-14)

1. Mở menu **Hàng hóa > Danh mục**.
2. **Thêm mới**: Nhập tên danh mục (VD: *Nước giải khát*) và bấm **Thêm mới**.
3. **Chỉnh sửa**: Bấm icon ✏️ ở danh mục vừa tạo để sửa tên.
4. **Xóa**: 
   - Danh mục không có sản phẩm: Sẽ xóa thành công khi bấm icon 🗑️.
   - Danh mục đã có sản phẩm: Hệ thống chặn không cho xóa để bảo toàn dữ liệu.

---

## 2. Tạo & Quản lý Sản Phẩm Cơ Bản (US-15)

1. Mở menu **Hàng hóa > Danh sách sản phẩm > Thêm sản phẩm**.
2. **Điền thông tin cơ bản**: Tên sản phẩm, Danh mục, Đơn vị tính (Cái, Hộp...), Giá bán lẻ, Giá khuyến mãi.
3. **Tồn kho gốc**: Bật công tắc "Theo dõi số lượng tồn kho", nhập số tồn kho đầu kỳ (VD: `50`).
4. **Mã vạch (Barcode)**: Để trống để hệ thống tự sinh mã, hoặc cắm súng quét mã vạch quét trực tiếp vào ô.
5. Bấm **Lưu sản phẩm**. Sản phẩm hiển thị ra danh sách thành công.

---

## 3. Các Tiện Ích Chỉnh Sửa & Xóa (US-27)

Khi mở form **Sửa một sản phẩm** đã có sẵn, trên cùng góc phải sẽ hiện thêm 2 icon tiện ích:
1. **Icon Sao chép (2 tờ giấy)**: Click vào sẽ tạo ngay một form mới sao chép 100% dữ liệu của sản phẩm đang xem, tên tự thêm hậu tố `- copy`. Thích hợp khi tạo các mặt hàng tương tự nhau.
2. **Icon Thùng rác đỏ (Xóa)**: Click vào để xóa nhanh sản phẩm ngay từ bên trong form mà không cần ra ngoài bảng danh sách.

---

## 4. Tùy Chỉnh Form "Cài Đặt Sản Phẩm" (US-28)

Đây là tính năng độc đáo giúp làm gọn form nhập liệu, chỉ hiển thị những trường thực sự cần thiết với từng cửa hàng.

1. Bấm vào icon **Bánh răng (Cài đặt)** ở góc trên bên phải form sản phẩm.
2. Modal chia làm 4 nhóm thiết lập:
   - **Thông tin chung**: Hình ảnh, Đơn vị, Quy đổi, Mô tả...
   - **Giá sản phẩm**: Giá khuyến mãi, Giá sỉ.
   - **Tồn kho**: Theo dõi tồn, Mã vạch.
   - **Thông tin khác**: Bán kèm, Biến thể, Website...
3. Thử cuộn chuột xuống và **Tắt** "Mã vạch", **Tắt** "Phân loại/Biến thể".
4. Bấm **Lưu cài đặt**. Form sẽ tự động ẩn ngay lập tức các trường vừa tắt. 
5. *(Cấu hình này lưu vĩnh viễn theo tài khoản cửa hàng).*

---

## 5. Các Tính Năng Hàng Hóa Nâng Cao

> [!IMPORTANT]
> Các tính năng này cần được BẬT lên trong Cài đặt (Bánh răng) trước khi sử dụng.

### 5.1. Đơn vị quy đổi (US-29)
- Dành cho sản phẩm bán theo nhiều đơn vị (VD: 1 Lốc = 6 Lon).
- Mở nhóm **Thông tin chung** trong form sản phẩm.
- Nhập: Đơn vị gốc (Lốc) -> Tỉ lệ (6) -> Đơn vị quy đổi (Lon).

### 5.2. Phân loại / Biến thể
- Bật công tắc "Sản phẩm có nhiều phân loại".
- Nhập Thuộc tính 1: Tên = `Màu sắc`, Giá trị = `Đỏ, Xanh`.
- Nhập Thuộc tính 2: Tên = `Size`, Giá trị = `L, XL`.
- Form sẽ tự động vẽ bảng ma trận `(Đỏ-L, Đỏ-XL, Xanh-L, Xanh-XL)` bên dưới. Bạn có thể thiết lập Giá và Tồn kho độc lập cho từng tổ hợp màu/size này.

### 5.3. Giá Sỉ (Wholesale)
- Bật công tắc "Áp dụng giá sỉ".
- Cấu hình: *Từ 10 sản phẩm -> Giá 18.000đ*. Thêm tiếp mức 2: *Từ 50 sản phẩm -> Giá 16.000đ*.

### 5.4. Gợi ý Bán kèm & Website (US-35, US-36)
- **Hiển thị Website**: Thanh gạt Bật/Tắt quyết định sản phẩm có lên web hay không.
- **Bán kèm (Upsell)**: Menu thả xuống cho phép chọn các sản phẩm khác (VD: Trà đá) để bán kèm. Các món được chọn sẽ xếp thành dạng Chip màu xanh lá bên dưới. Bấm nút `x` trên Chip để bỏ chọn.

---

## 6. Lọc Sản Phẩm Theo Danh Mục (US-26)

- Trải nghiệm tại trang **Bán hàng (POS)**.
- Bên trên lưới món ăn có hàng loạt nút (Chip filter) ngang. Mặc định chọn "Tất cả".
- Click vào tên Danh mục nào (VD: Nước giải khát), thì chỉ hiển thị sản phẩm thuộc danh mục đó. Hỗ trợ thao tác chạm nhanh gọn khi dùng trên máy tính bảng/Mobile.
