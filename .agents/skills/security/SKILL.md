---
name: "Security Skill"
description: "Xử lý Auth và Security."
---

# Security Skill

## Purpose
Bảo vệ dữ liệu người dùng, quản lý authentication an toàn.

## When to Use
Khi làm việc với Login, Token, Form mật khẩu, API keys.

## Rules
- Không log passwords, access tokens.
- Không tin tưởng UserId/Role do Frontend gửi (Backend phải tự check).
- Không commit secrets (.env).

## Workflow
1. Quản lý trạng thái login/logout chuẩn xác.
2. Xử lý session hết hạn (401 Unauthorized) -> Redirect về Login.

## Verification
- Không có key nhạy cảm lọt ra Console.

## Failure Modes
- Frontend ẩn nút chức năng bằng CSS, nhưng gọi thẳng API vẫn chạy do backend không check quyền.


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
