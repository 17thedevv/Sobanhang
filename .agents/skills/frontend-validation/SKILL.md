---
name: "Frontend Validation Skill"
description: "Xử lý validation phía frontend."
---

# Frontend Validation Skill

## Purpose
Cung cấp UX tốt thông qua phản hồi nhanh chóng khi người dùng nhập liệu.

## When to Use
Khi làm việc với Form, input.

## Rules
- Frontend validation chỉ là UX, authoritative validation nằm ở backend.
- Phải xử lý các trạng thái: empty, invalid, boundary, duplicate.

## Workflow
1. Định nghĩa rules validation.
2. Kiểm tra khi input change hoặc blur.
3. Hiển thị error message rõ ràng.

## Verification
- Submit bị block nếu data invalid.
- Lỗi từ backend được hiển thị đúng vào field tương ứng.

## Failure Modes
- Chỉ validate frontend mà quên xử lý lỗi trả về từ backend (HTTP 400).


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
