# Sổ Bán Hàng Project Guidelines for Claude

This file contains instructions and context for Claude and AI coding agents working on the "Sổ Bán Hàng" project.

## 🚀 Build and Run Commands
- **Backend Development Server**: `cd backend && npm run dev`
- **Frontend Development Server**: `cd web_app && npm run dev`
- **Install Backend Dependencies**: `cd backend && npm install`
- **Install Frontend Dependencies**: `cd web_app && npm install`
- **Prisma DB Push**: `cd backend && npx prisma db push`
- **Prisma Studio**: `cd backend && npx prisma studio`

## 🏗️ Architecture
- **Backend**: Node.js, Express.js, Prisma ORM.
- **Database**: SQLite (local dev uses `backend/prisma/dev.db`).
- **Frontend**: React, Vite.
- **Authentication**: JWT (JSON Web Tokens) and Google OAuth.
- **Email Service**: Nodemailer (Gmail App Password).

## 📝 Code Style & Guidelines
- **Language**: TypeScript/JavaScript.
- **Error Handling**: Use try/catch blocks in Express controllers. Ensure standard JSON error responses.
- **Database Schema**: Prisma (`schema.prisma`) is the source of truth. Always run `db push` or migrations after modifying the schema.
- **Security**: Never hardcode secrets. Always use `process.env` (configured via `.env` file).
- **API Structure**: Group routes by feature (e.g., Auth, Products, Users).
- **Frontend Components**: Use functional React components with Hooks. Keep styles scoped or use standardized CSS.

## 🔑 Environment Variables Setup
When testing locally, ensure the `.env` in `backend/` contains:
- `PORT`
- `NODE_ENV`
- `JWT_SECRET`
- `DATABASE_URL` (e.g., `"file:./dev.db"`)
- `GOOGLE_CLIENT_ID`
- `GMAIL_USER` / `GMAIL_PASS`

---

# 🔍 Full-Stack Audit Report — Sổ Bán Hàng
*(Report Date: 2026-08-30)*

## Tổng quan

| Hạng mục | Tình trạng | Mức độ ưu tiên |
|---|---|---|
| 🏗️ Web Architecture | ⚠️ Cần cải thiện | Medium |
| ⚡ Performance | 🔴 Có vấn đề | High |
| 🔒 Security | ✅ Ổn | Low |
| ♿ Accessibility | 🔴 Thiếu nhiều | High |
| 📱 Responsive UI | ⚠️ Cần review | Medium |
| ⚛️ React Development | ⚠️ Cần cải thiện | Medium |
| 🔄 State & Data Flow | ⚠️ Cần cải thiện | Medium |
| ✅ Frontend Validation | ⚠️ Chưa đồng bộ | Medium |
| 🌐 Frontend API Integration | 🔴 Vi phạm pattern | High |
| 📲 PWA | ✅ Tốt | Low |
| 📝 Code Review | ⚠️ Có sót | Medium |
| 🖼️ UI Regression | ⚠️ Cần theo dõi | Medium |

---

## 1. 🏗️ Web Architecture Skill

> **Rule:** Tách logic ra hooks/services, không hardcode business logic trong pages.

### 🔴 Critical: Thiếu Service Layer hoàn toàn
Tất cả API calls đang gọi trực tiếp `axios` bên trong component/page. Không có thư mục `services/`.
```
❌ Hiện tại:    Pages/Components → axios.get('/api/...') trực tiếp
✅ Nên:         Pages → Hooks → Services → axios
```

### ⚠️ Medium: Monolithic Pages
Nhiều page file quá dài, chứa cả UI + API + business logic:
- `POS.jsx` (400+ lines): Cần tách CartPanel, ProductGrid
- `ProductModal.jsx` (700+ lines): Quá lớn, cần tách

---

## 2. ⚡ Performance Skill

> **Rule:** Debounce search, tránh re-render thừa, lazy loading.

### 🔴 Critical: Không có Debounce trên bất kỳ ô tìm kiếm nào
Mỗi phím gõ sẽ trigger API call ngay lập tức. Gây spam API server.
- `CustomerList.jsx` — `useEffect([search])` → gọi API mỗi keystroke
- `DebtLedger.jsx` — search filter client-side (ít nghiêm trọng hơn)

### 🔴 Critical: Không có Code-Splitting (Lazy Loading)
Toàn bộ 20+ pages được import tĩnh trong `App.jsx`. Build bundle **530KB**.
- Cần sử dụng `React.lazy` và `Suspense`.

### ⚠️ Medium: Thiếu useMemo/useCallback
Nhiều derived data nên được memo (e.g. `processedCustomers`, `filteredOrders`).

### ⚠️ Medium: CustomerForm fetch tất cả customers thay vì getById
Frontend fetch toàn bộ customers rồi `.find()` thay vì gọi API lấy by ID có sẵn.

---

## 3. 🔒 Security Skill

### ⚠️ Low: console.log nhạy cảm
Có thể log ra token/user data trong production (`Register.jsx`, `ForgotPassword.jsx`). Nên xóa.

### ⚠️ Low: Không có 401 interceptor
Khi token hết hạn, user không tự động bị redirect về Login. Cần thêm axios response interceptor.

---

## 4. ♿ Accessibility Skill

### 🔴 Critical: Không có `aria-*` attributes
0 file sử dụng `aria-label`, `aria-describedby`, `aria-live`.

### 🔴 Critical: Clickable `<div>` thay vì `<button>`
Nhiều card sử dụng `<div onClick>` mà không có `tabIndex`, `role="button"`, hay `onKeyDown`.

### ⚠️ Medium: Modal không trap focus
Các modal không có focus trap — user có thể Tab ra ngoài modal.

---

## 5. 📱 Responsive UI Skill

### ⚠️ Medium: Inline styles thay vì CSS Media Queries
Nhiều page mới dùng `style={{}}` thay vì CSS class (e.g., Grid `minmax(300px, 1fr)` trong CustomerList có thể bị vỡ trên mobile).

---

## 6. ⚛️ React Development Skill

### ⚠️ Medium: Duplicate State
`AppContext.jsx` quản lý global state, nhưng nhiều page tự fetch riêng lại.

### ⚠️ Medium: Thiếu Error Boundary
Không có React Error Boundary, component crash sẽ làm trắng trang.

---

## 7. 🔄 State & Data Flow Skill

### ⚠️ Medium: Server state lộn xộn
Mỗi page tự quản lý `loading`, `error`, `data` riêng. Nên dùng custom hook `useApiData(url)` để centralize.

---

## 8. ✅ Frontend Validation Skill

### ⚠️ Medium: Validation không đồng bộ
`CustomerForm` nên validate phone format, email format trước khi submit (hiện tại chỉ check `name`).

---

## 9. 🌐 Frontend API Integration Skill

### 🔴 High: Không có Service Layer
Nên tạo `src/services/` (e.g., `customerService.js`, `debtService.js`).

### 🔴 High: Còn 11 file dùng `alert()` thay vì Toast
Cần thay bằng `ToastContext`.

### ⚠️ Medium: Inconsistent Money Formatting
46 chỗ còn dùng `.toLocaleString('vi-VN') + 'đ'` thay vì `formatMoneyVND()` từ `moneyUtils.js`.

---

## 10. 📲 PWA Development Skill

### ⚠️ Low: Thiếu offline fallback page
Khi mất mạng, hiển thị lỗi browser thay vì message fallback.

---

## 11. 📝 Code Review Skill

### ⚠️ Medium: Debug console.log còn sót
Trong auth pages.

### ⚠️ Medium: Comment TODO chưa xử lý
Trong `CustomerForm.jsx:60`.

---

## 12. 🖼️ UI Regression Skill

### ⚠️ Medium: Global `.card` CSS thay đổi
Đã thêm padding. Cần verify lại Dashboard, CashFlow, Products, Orders, DebtLedger.

---

## 🎯 Khuyến nghị hành động (ưu tiên 1 - CẦN LÀM NGAY)

1. Thêm **debounce 300ms** cho tất cả search input.
2. **Lazy load** pages với `React.lazy` + `Suspense` trong App.jsx.
3. Xóa **console.log debug** (Register, ForgotPassword).
4. Thay **alert() → toast** ở 11 file còn lại.
5. Thêm **401 interceptor** để auto-redirect khi token hết hạn.
