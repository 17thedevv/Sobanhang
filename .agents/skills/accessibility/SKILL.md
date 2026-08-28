---
name: "Accessibility Skill"
description: "Đảm bảo khả năng truy cập (a11y)."
---

# Accessibility Skill

## Purpose
Giúp mọi người dùng (kể cả người dùng bàn phím, screen reader) đều có thể sử dụng web.

## When to Use
Khi thiết kế markup UI.

## Rules
- Semantic HTML.
- Không dùng `div` giả làm button (hoặc nếu dùng phải có tabIndex và onKeyDown).
- Touch target đủ lớn.
- Không hy sinh accessibility chỉ để giống ảnh screenshot.

## Workflow
1. Dùng đúng thẻ (button, a, nav, main).
2. Test điều hướng bằng phím Tab.

## Verification
- Focus ring hiển thị rõ ràng.

## Failure Modes
- Nút bấm không thể focus bằng phím Tab.


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
