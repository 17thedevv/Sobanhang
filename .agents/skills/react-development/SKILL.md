---
name: "React Development Skill"
description: "Viết code React nhất quán và hiệu quả."
---

# React Development Skill

## Purpose
Đảm bảo code React nhất quán, reusable và an toàn.

## When to Use
Khi sửa đổi hoặc tạo mới React component.

## Rules
- Ưu tiên functional components.
- Reuse hooks và tránh state duplication.
- Tránh prop drilling không cần thiết.
- Tách component nếu quá lớn.
- Không thêm dependency mới nếu built-in solution đủ dùng.

## Workflow
1. Inspect callers, props, state, side effects hiện tại.
2. Xác định regression risk.
3. Chia nhỏ component nếu cần thiết.
4. Implement component.

## Verification
- Component không quá phức tạp (ít prop, logic rõ ràng).
- Không có state dư thừa.

## Failure Modes
- Tạo component khổng lồ (monolithic component).
- Duplicate state làm mất đồng bộ UI.

## Examples
Tách List và ListItem thành hai component riêng biệt để dễ quản lý render.


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
