---
name: "Responsive UI Skill"
description: "Giữ responsive UX nhất quán trên Mobile, Tablet, Desktop."
---

# Responsive UI Skill

## Purpose
Đảm bảo UX hoạt động tốt trên 3 breakpoint: Mobile (<768px), Tablet (768-1199px), Desktop (>=1200px).

## When to Use
Khi phát triển UI mới hoặc sửa giao diện hiện tại.

## Rules
- Mobile: touch-first, bottom navigation, full-screen content, safe-area support.
- Tablet: compact layout, collapsible sidebar.
- Desktop: sidebar, multi-column, mouse/keyboard friendly.
- Ưu tiên dùng CSS media queries. Không render duplicated versions của cùng một UI nếu CSS giải quyết được.

## Workflow
1. Inspect UI requirements.
2. Thiết kế HTML structure chung.
3. Áp dụng CSS media queries cho từng breakpoint.
4. Xử lý safe-area (notch/home bar) cho iOS.

## Verification
- Giao diện không vỡ ở 375px, 768px, 1024px, 1200px, 1440px.

## Failure Modes
- Layout bị ẩn (overflow hidden) mất nội dung trên mobile.
- Nút bấm quá nhỏ trên màn hình cảm ứng.

## Examples
Sử dụng CSS Grid để đổi từ 1 cột (mobile) sang 3 cột (desktop).


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
