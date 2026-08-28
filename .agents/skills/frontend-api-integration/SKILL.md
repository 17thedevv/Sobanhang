---
name: "Frontend API Integration Skill"
description: "Tích hợp backend/API an toàn."
---

# Frontend API Integration Skill

## Purpose
Quản lý giao tiếp giữa frontend và backend API một cách an toàn và nhất quán.

## When to Use
Khi gọi API, lấy dữ liệu, gửi form.

## Rules
- Gọi API qua service layer. Không raw fetch/axios trong component.
- Không hard-code localhost. Dùng environment variables.
- Phải xử lý loading, error, timeout.
- Không tự thay API contract nếu không được yêu cầu.

## Workflow
1. Inspect API contract từ backend.
2. Tạo hàm trong service layer.
3. Gọi hàm từ hook hoặc component.
4. Quản lý trạng thái loading/error.

## Verification
- Network tab hiển thị API gọi đúng endpoint.
- UI phản hồi đúng khi loading và khi có lỗi.

## Failure Modes
- Quên xử lý lỗi mạng (unhandled rejection).
- Hardcode URL.

## Examples
Dùng `try/catch` bao quanh API call và hiển thị toast notification nếu thất bại.


## Project Context
- **Project**: "Sổ Bán Hàng"
- **Frontend**: React
- **Target**: Mobile (< 768px) + Tablet (768-1199px) + Desktop (>= 1200px)
- **PWA**: Yes (iPhone Safari Add to Home Screen support)
- **Hosting frontend**: Cloudflare
- **Backend**: separate Node.js service
- **Database**: existing backend database
- **Source control**: GitHub
- **Development model**: Epic -> User Story
- **Testing model**: User Story -> PR -> Preview -> Tester -> Review -> Merge
