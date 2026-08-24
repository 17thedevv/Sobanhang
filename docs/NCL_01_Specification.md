# Epic 1 — NCL-01: Xác thực & Onboarding tài khoản

## Phase 0 — Chốt nghiệp vụ trước khi code

Đây là phase rất quan trọng vì tài liệu hiện còn một số điểm ghi rõ là cần xác nhận/đề xuất.

### Step 0.1 — Chốt mô hình trạng thái tài khoản

Định nghĩa tối thiểu:
```
NEW
  ↓
REGISTERING
  ↓
SHOP_CREATED
  ↓
PASSWORD_NOT_SET
  ↓
ACTIVE
```
Trong tài liệu, tài khoản chưa đặt mật khẩu chỉ được vào Home rút gọn; đặt mật khẩu thành công mới chuyển sang trạng thái đầy đủ và có quyền sử dụng Business Mode.

### Step 0.2 — Chốt flow tổng thể
```
Create Free Store
       ↓
US-01 Chọn nhu cầu
       ↓
US-02 Khảo sát
       ↓
US-03 Nhập SĐT
       ↓
US-04 Thiết lập shop
       ↓
US-05 Gợi ý tính năng
       ↓
US-06 Chọn cách làm quen
       ↓
US-07 Đặt mật khẩu
       ↓
      HOME
```
Các bước onboarding trong tài liệu được tổ chức thành khảo sát 2 bước + thiết lập cửa hàng 3 bước.

### Step 0.3 — Chốt các business rule đang mở

Cụ thể:
- Quy tắc định dạng SĐT Việt Nam.
- Khi SĐT đã tồn tại thì xử lý thế nào.
- Password tối thiểu bao nhiêu ký tự.
- Google account map với account hiện tại thế nào.
- Brute-force login: bao nhiêu lần sai thì khóa.
- OTP hết hạn bao lâu.
- OTP được nhập sai bao nhiêu lần.
- Resend OTP cooldown bao lâu.

Tài liệu hiện đề xuất OTP 5 phút / tối đa 5 lần sai, và resend khoảng 60 giây, nhưng ghi rõ đây là các giá trị đề xuất cần xác nhận.

> **Output của Step 0: Auth & Onboarding Specification v1.**

---

## Phase 1 — Chuẩn bị kiến trúc

### Step 1.1 — Tạo module Auth/Onboarding

Tách riêng:
```
auth/
  domain/
  data/
  presentation/

onboarding/
  domain/
  data/
  presentation/
```
Không để logic auth nằm trực tiếp trong UI.

### Step 1.2 — Thiết kế database

Các entity tối thiểu:

**User**
- id
- phone
- email
- passwordHash
- status
- role
- createdAt

**Store**
- id
- ownerId
- name
- industry
- createdAt

**OnboardingSession**
- id
- phone
- needs
- surveyAnswers
- onboardingPreference
- status

**OtpVerification**
- id
- phone
- codeHash
- purpose
- expiresAt
- attempts
- consumedAt

**OAuthAccount**
- id
- userId
- provider
- providerUserId

Không nên gộp toàn bộ onboarding vào User, vì user có thể chưa hoàn thành đăng ký.

---

## Phase 2 — US-01: Chọn nhu cầu

### Step 2.1 — UI
Tạo màn hình: **Chọn nhu cầu sử dụng**

6 lựa chọn:
- Ghi đơn bán
- In hóa đơn
- Theo dõi tồn kho
- Báo tiền về ngân hàng
- ...
- Không có nhu cầu kinh doanh

Tài liệu yêu cầu multi-select và "Không có nhu cầu kinh doanh" loại trừ các lựa chọn kinh doanh khác.

### Step 2.2 — Logic
- `selectBusinessNeed()`
- `selectNoBusiness()`
- `validateSelection()`
- `continue()`

**Rule:**
- Không kinh doanh = true → tất cả business needs = false
- Business need != empty → không được chọn Không kinh doanh

### Step 2.3 — Backend
Tạo API lưu lựa chọn gắn với registration session. Tài liệu cũng chỉ rõ đây là dữ liệu có thể được lưu trước khi account chính thức được tạo.

### Step 2.4 — Test
- Không chọn gì
- 1 lựa chọn
- Nhiều lựa chọn
- Chọn Không kinh doanh
- Không kinh doanh + business
- Bỏ chọn

---

## Phase 3 — US-02: Khảo sát

### Step 3.1 — UI
Hai câu hỏi:
1. Bạn đang quản lý cửa hàng như thế nào?
2. Bạn biết app từ đâu?

Mỗi câu single-select.

### Step 3.2 — Business logic
Quan trọng: optional. Không chọn gì vẫn được:
Đăng ký ngay → Step 3

Tài liệu xác định rõ khảo sát không bắt buộc.

### Step 3.3 — Persist
Lưu: `surveyAnswers` vào onboarding session/account profile.

---

## Phase 4 — US-03: Đăng ký SĐT
Đây là authentication foundation, nên làm cẩn thận.

### Step 4.1 — UI
- Số điện thoại
- ☑ Tôi đồng ý Điều khoản
- [Tiếp tục]
- [ Google ]

Nút Continue chỉ active khi SĐT hợp lệ.

### Step 4.2 — Validate
- `normalizePhone()`
- `validateVietnamesePhone()`
- `checkDuplicatePhone()`

Tài liệu yêu cầu xác định định dạng SĐT VN và quy tắc trùng account.

### Step 4.3 — Backend
**API:** `POST /auth/register/phone`

**Flow:**
validate phone → check duplicate → create registration session → create user → generate verification/OTP → send OTP

Tài liệu yêu cầu endpoint tạo account, kiểm tra trùng SĐT và gửi OTP.

### Step 4.4 — Test
- valid phone
- invalid phone
- duplicate phone
- missing terms
- OTP send success
- SMS failure

---

## Phase 5 — US-04: Tạo shop

### Step 5.1 — Step 1/3
Form:
- Tôi là
- Tên cửa hàng
- Mã giới thiệu
- Ngành hàng

Tên shop + ngành hàng là bắt buộc theo đề xuất trong tài liệu.

### Step 5.2 — Backend
**API:** `POST /stores`
**Quan hệ:** User 1 ─── 1 Store
MVP chỉ cần owner là Chủ cửa hàng.

### Step 5.3 — Persist
- `store.ownerId = user.id`
- `store.name`
- `store.industry`

### Step 5.4 — Test
- missing store name
- missing industry
- valid referral
- invalid referral
- create success
- duplicate/invalid state

Tài liệu cũng có test riêng cho thiếu tên/ngành hàng và mã giới thiệu.

---

## Phase 6 — US-05: Gợi ý tính năng theo ngành
Phần này không nên làm quá phức tạp ở MVP.

### Step 6.1 — Static mapping
Ví dụ:
```json
industrySuggestions = {
  grocery: [inventory, cashflow, customerDebt],
  cafe: [inventory, revenue, staff]
};
```
Tài liệu cũng đề xuất bắt đầu bằng bảng mapping tĩnh Ngành hàng → gợi ý.

### Step 6.2 — UI
Checkbox list:
- ☑ Quản lý thu chi
- ☑ Quản lý tồn kho
- ☐ Quản lý nhân viên
- ☐ Tích điểm khách hàng

### Step 6.3 — Backend
Có thể dùng: `GET /onboarding/suggestions?industry=grocery` nhưng không cần biến thành hệ thống recommendation thật.

### Step 6.4 — Test
Ít nhất:
- Grocery → đúng suggestions
- Cafe → đúng suggestions
- Restaurant → đúng suggestions
Tài liệu yêu cầu test ít nhất 2–3 ngành.

---

## Phase 7 — US-06: Cách làm quen

### Step 7.1 — UI
3 radio:
- ○ Tôi muốn tư vấn ngay
- ○ Đặt lịch hẹn
- ○ Tự khám phá Sổ Bán Hàng

### Step 7.2 — MVP backend
Chỉ lưu: `onboardingPreference`. Không xây hệ thống CSKH, booking hay consultant thật. Tài liệu cũng xác định MVP chỉ cần lưu lựa chọn.

### Step 7.3 — Finish onboarding
Sau bước này: onboarding completed → yêu cầu đặt password

---

## Phase 8 — US-07: Đặt mật khẩu lần đầu
Đây là security gate.

### Step 8.1 — UI
- Mật khẩu
- Xác nhận mật khẩu
- [ Đặt mật khẩu ]

Icon show/hide password. Tài liệu yêu cầu UI này và API set password.

### Step 8.2 — Password validation
- `validatePasswordStrength()`
- `validatePasswordConfirmation()`
Tài liệu yêu cầu kiểm tra độ dài/ký tự tối thiểu, nhưng chi tiết rule vẫn cần chốt.

### Step 8.3 — Backend
**API:** `POST /auth/set-password`
**Backend:** hash password → save password → status = ACTIVE

### Step 8.4 — Security transition
`PASSWORD_NOT_SET` ↓ `ACTIVE`
Từ đây user được phép truy cập Business Mode đầy đủ.

### Step 8.5 — Test
- password quá ngắn
- password không hợp lệ
- confirm mismatch
- valid password
- status changed
- cannot reuse setup token

---

## Phase 9 — US-08: Login bằng SĐT + password

### Step 9.1 — UI
- SĐT
- Mật khẩu
- [Đăng nhập]
- Quên mật khẩu
- Đăng nhập bằng Google

Đây là flow đăng nhập chính của MVP.

### Step 9.2 — API
**API:** `POST /auth/login`
**Response:**
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {},
  "store": {}
}
```
Tài liệu chỉ rõ API phải xác thực SĐT/password và sinh JWT/session token.

### Step 9.3 — Session
Flutter: receive token → secure storage → restore session on app launch

### Step 9.4 — Brute force
Sau core flow mới thêm: failed attempts → temporary lock. Vì tài liệu đánh brute-force là Nên có, không phải blocker ban đầu.

### Step 9.5 — Test
- correct password
- wrong password
- unknown account
- locked account
- expired session
- restart app

---

## Phase 10 — US-09: Google Login
Làm sau khi phone/password hoàn chỉnh.

### Step 10.1 — Client OAuth
Flutter: Google Sign-In → Google credential/token

### Step 10.2 — Backend verify
**API:** `POST /auth/google`
Backend: verify Google token → find OAuthAccount → existing → login → not found → create account
Tài liệu yêu cầu hỗ trợ cả account đã liên kết và Google account mới.

### Step 10.3 — Mapping rule
Google account ↓ OAuthAccount ↓ User
Không nên chỉ map bằng email một cách tùy tiện.

### Step 10.4 — Test
- existing Google account
- new Google account
- cancel OAuth
- invalid token

---

## Phase 11 — US-10: Quên mật khẩu

### Step 11.1 — UI
- Số điện thoại
- [ Gửi OTP ]
Có countdown resend.

### Step 11.2 — API
**API:** `POST /auth/forgot-password`
Flow: phone → account exists → generate OTP → hash OTP → store expiry → send SMS
Tài liệu yêu cầu SMS Gateway, sinh OTP và lưu kèm thời hạn.

### Step 11.3 — Rate limit
Policy theo tài liệu đề xuất: resend cooldown = 60s, OTP expires = 5m

### Step 11.4 — Test
- registered phone
- unknown phone
- resend too fast
- SMS failure

---

## Phase 12 — US-11: Reset password bằng OTP

### Step 12.1 — UI
- OTP
- Mật khẩu mới
- Xác nhận mật khẩu
- [Đặt lại mật khẩu]

### Step 12.2 — Verify
OTP exists → not expired → attempts < max → correct → consume OTP

### Step 12.3 — Reset
**API:** `POST /auth/reset-password`
Backend: verify OTP → hash new password → update password → invalidate OTP → revoke old sessions

### Step 12.4 — Security
- OTP expired → invalid
- too many failed attempts → invalid
- request new OTP → old OTP invalid

---

## Phase 13 — US-12: Logout

### Step 13.1 — UI
Sidebar: Đăng xuất

### Step 13.2 — Client
clear access token → clear refresh token → clear user session → Login Screen

### Step 13.3 — Backend
Nếu dùng refresh token: revoke refresh token

---

## Phase 14 — Integration Test toàn Epic
Đừng chỉ test từng US riêng lẻ. Phải test end-to-end.

- **Flow A — User mới:** Create store → chọn nhu cầu → khảo sát → SĐT → tạo shop → suggestions → onboarding preference → set password → Home
- **Flow B — User quay lại:** Open app → restore session → Home
- **Flow C — Login:** Logout → Login → SĐT + password → Home
- **Flow D — Forgot password:** Login → Forgot password → SĐT → OTP → new password → login
- **Flow E — Google:** Google Login → existing account → Home
- **Flow F — Security:** wrong password x N → temporary lock | wrong OTP x N → OTP invalid | expired OTP → request new OTP

---

## Phase 15 — Epic Definition of Done
Epic chỉ được đánh DONE khi:
- [ ] User tạo được account
- [ ] User hoàn thành onboarding
- [ ] Tạo được 1 Store
- [ ] Chọn được ngành hàng
- [ ] Lưu được onboarding data
- [ ] Set password thành công
- [ ] Account chuyển ACTIVE
- [ ] Login bằng SĐT/password
- [ ] Session được giữ sau khi restart app
- [ ] Logout hoạt động
- [ ] Forgot password gửi OTP
- [ ] OTP expiry/attempt hoạt động
- [ ] Reset password hoạt động
- [ ] Google login hoạt động
- [ ] Không thể truy cập Business Mode khi chưa set password
- [ ] Validation/error state đầy đủ
- [ ] Unit test
- [ ] Integration test
- [ ] E2E happy path
- [ ] Security test cơ bản

---

## Thứ tự code đề xuất
0. Spec + state machine
1. Database + Auth foundation
2. US-03 Phone Registration
3. US-04 Store Setup
4. US-01 Needs
5. US-02 Survey
6. US-05 Suggestions
7. US-06 Onboarding Preference
8. US-07 First Password
9. US-08 Login
10. US-12 Logout
11. US-10 Forgot Password
12. US-11 Reset Password
13. US-09 Google OAuth
14. Security Hardening
15. Integration + E2E
16. **NCL-01 DONE**
