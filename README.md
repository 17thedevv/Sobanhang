# Sổ Bán Hàng - Hướng Dẫn Cài Đặt và Chạy Dự Án

Dự án được chia thành hai phần: **Backend** (Node.js/Express + Prisma) và **Frontend** (React/Vite). Dưới đây là hướng dẫn chi tiết để thiết lập và khởi chạy dự án trên môi trường local.

---

## 1. Yêu Cầu Hệ Thống
- Đã cài đặt **Node.js** (Khuyên dùng bản LTS từ v18 trở lên).
- Đã cài đặt **Git**.
- Tùy chọn: **VS Code** và các extension liên quan (như Prisma, ESLint).

---

## 2. Thiết Lập Môi Trường (Environment Variables)

### 2.1. Cấu hình Backend
Di chuyển vào thư mục `backend/`:
```bash
cd backend
```
Tạo một file có tên `.env` (nếu chưa có) và điền các thông tin sau:
```env
# Server
PORT=3000
NODE_ENV=development

# JWT Secret (Dùng để mã hóa Token)
JWT_SECRET=super_secret_key_sobanhang

# Database (Prisma mặc định dùng SQLite cho nhanh, thư mục prisma/dev.db)
DATABASE_URL="file:./dev.db"

# Google OAuth (Để đăng nhập bằng Google)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Cấu hình Gửi Email (Dùng cho quên mật khẩu / mã OTP)
# Sử dụng App Password (Mật khẩu ứng dụng) của Gmail (16 ký tự)
GMAIL_USER=email_cua_ban@gmail.com
GMAIL_PASS=mat_khau_ung_dung_gmail
```

### 2.2. Cấu hình Frontend
Di chuyển vào thư mục `web_app/`:
```bash
cd web_app
```
(Hiện tại Frontend có thể chưa cần file .env, nhưng nếu dùng thư viện Google OAuth thì cần cấu hình bên trong code ở file main.jsx, hoặc thiết lập VITE_GOOGLE_CLIENT_ID trong tương lai).

---

## 3. Cài Đặt & Khởi Chạy

### 3.1. Chạy Backend (API Server)
Mở terminal mới (hoặc tab mới), và làm theo các bước sau:

1. Vào thư mục Backend:
   ```bash
   cd backend
   ```
2. Cài đặt các gói phụ thuộc (Dependencies):
   ```bash
   npm install
   ```
3. Cập nhật Database với Prisma (tạo bảng theo schema):
   ```bash
   npx prisma db push
   ```
   *(Lưu ý: Bạn cũng có thể dùng `npx prisma migrate dev` để tạo file migration).*
4. Khởi chạy Server Backend:
   ```bash
   npm run dev
   ```
   *Backend sẽ chạy ở địa chỉ: `http://localhost:3000`*

### 3.2. Chạy Frontend (Web App)
Mở một terminal **khác** (để chạy song song với Backend), thực hiện:

1. Vào thư mục Web App:
   ```bash
   cd web_app
   ```
2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
3. Khởi chạy ứng dụng Frontend:
   ```bash
   npm run dev
   ```
   *Frontend sẽ chạy ở địa chỉ: `http://localhost:5173` (hoặc một port khác do Vite cấp).*

---

## 4. Các Lưu Ý Cần Thiết

- **Lỗi Powershell trên Windows (npm cannot be loaded)**:
  Nếu bạn gặp lỗi Security Policy khi gõ `npm` trên Powershell, hãy mở CMD bình thường hoặc chạy dòng lệnh sau trên Powershell với quyền Admin:
  ```powershell
  Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
  ```
  Hoặc đơn giản là dùng chuỗi: `cmd.exe /c "npm run dev"`

- **Email không gửi được**:
  Nếu chức năng Quên mật khẩu báo lỗi gửi mail, hãy đảm bảo bạn đã tạo đúng **Mật khẩu ứng dụng (App Password)** trong phần Bảo mật 2 lớp của tài khoản Google, và đưa nó vào biến `GMAIL_PASS` trong file `.env`. (Tránh dùng mật khẩu đăng nhập thông thường).

- **Google Login không hoạt động**:
  Đảm bảo `GOOGLE_CLIENT_ID` đã được đăng ký trên Google Cloud Console, thêm `http://localhost:5173` vào phần `Authorized JavaScript origins`.

Chúc sếp cài đặt và chạy dự án thành công! 🎉
