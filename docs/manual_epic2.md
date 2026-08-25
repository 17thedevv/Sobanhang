# 📖 Hướng Dẫn Sử Dụng & Kiểm Thử - Epic 2

Tài liệu này hướng dẫn chi tiết cách sử dụng và kiểm thử các tính năng thuộc **Epic 2: Thiết lập cửa hàng & Giao diện cơ bản** của dự án Sổ Bán Hàng.

---

## 1. Đăng ký & Đăng nhập (US-01, US-02)

### Mục đích
Đảm bảo người dùng có thể tạo tài khoản, đăng nhập an toàn và phiên đăng nhập được lưu trữ bảo mật qua JWT cookie.

### Các bước thực hiện
1. Truy cập vào trang web, hệ thống sẽ tự động chuyển hướng đến màn hình **Đăng nhập** (nếu chưa có phiên đăng nhập).
2. Chọn **"Chưa có tài khoản? Đăng ký ngay"** để sang màn hình Đăng ký.
3. Nhập số điện thoại, mật khẩu (xác nhận lại mật khẩu) và hoàn tất đăng ký.
4. Hệ thống sẽ báo thành công và chuyển sang giao diện Đăng nhập.
5. Tiến hành đăng nhập bằng SĐT và Mật khẩu vừa tạo.

> [!TIP]
> **Kiểm tra kỹ thuật:** Bạn có thể mở F12 -> tab *Application* -> *Cookies* để thấy cookie `accessToken` được set sau khi đăng nhập thành công (thuộc tính HttpOnly).

---

## 2. Onboarding: Tạo Cửa Hàng Đầu Tiên (US-04)

### Mục đích
Một tài khoản mới tinh cần phải có ít nhất một "Cửa hàng" (Sổ bán hàng) để có thể bắt đầu sử dụng các nghiệp vụ.

### Các bước thực hiện
1. Ngay sau khi **đăng nhập lần đầu tiên**, hệ thống phát hiện tài khoản chưa có cửa hàng nào.
2. Hệ thống sẽ tự động chặn không cho vào Dashboard mà chuyển hướng sang **Màn hình Thiết lập Cửa hàng (Onboarding)**.
3. Nhập **Tên cửa hàng** (VD: *Tạp hóa cô Tư*) và chọn **Ngành hàng** (VD: *Bán lẻ, Tạp hóa*).
4. Bấm **Tạo sổ bán hàng**.
5. Hệ thống khởi tạo cửa hàng và chuyển hướng người dùng vào thẳng màn hình trang chủ (Dashboard).

> [!IMPORTANT]
> - Nếu người dùng cố tình nhập URL `/dashboard` khi chưa có cửa hàng, hệ thống sẽ bắt lỗi và đẩy về trang `/onboarding`.
> - Nếu đã có cửa hàng, người dùng sẽ không bao giờ thấy trang Onboarding nữa.

---

## 3. Giao diện Tổng thể (Layout & Navigation)

### Mục đích
Đảm bảo người dùng có trải nghiệm mượt mà, dễ dàng điều hướng giữa các tính năng.

### Các bước thực hiện
1. **Sidebar (Menu bên trái):** 
   - Có thể bấm nút Thu gọn/Mở rộng (`<` `>`) để tối ưu không gian làm việc.
   - Chuyển đổi qua lại giữa các trang: Tổng quan, Bán hàng, Hàng hóa...
2. **Header (Thanh điều hướng trên cùng):**
   - Khu vực bên phải hiển thị icon Avatar và tên của chủ cửa hàng (Lấy từ thông tin tài khoản).
   - Có menu thả xuống để **Đăng xuất**.
3. **Quản lý đa cửa hàng (Multi-store):**
   - Trên Sidebar có hiển thị Tên cửa hàng hiện tại.
   - Có nút chuyển đổi cửa hàng (dành cho các bản cập nhật sau khi chủ shop sở hữu nhiều chi nhánh).

---

> [!NOTE]
> Epic 2 là nền tảng khung xương (Layout & Auth) của toàn bộ hệ thống. Bất kỳ sự cố nào liên quan đến đăng nhập/chuyển trang đều nên được report và fix ngay lập tức.
