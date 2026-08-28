---
name: "State & Data Flow Skill"
description: "Quản lý state cục bộ, toàn cục và server state."
---

# State & Data Flow Skill

## Purpose
Giúp luồng dữ liệu (data flow) trong React app rõ ràng, tránh xung đột.

## When to Use
Khi thiết kế state cho tính năng mới.

## Rules
- Phân biệt rõ local state, page state, global state, server state.
- Không copy cùng một source of truth ra nhiều nơi.
- Tránh race conditions.

## Workflow
1. Đánh giá phạm vi của state (ai cần biết state này?).
2. Đặt state ở component thấp nhất có thể.
3. Cập nhật state cẩn thận (tránh stale closures).

## Verification
- UI cập nhật ngay khi state thay đổi.
- Không có lỗi warning memory leak.

## Failure Modes
- Đưa form input (local state) vào Redux/Context (global state) gây chậm render.
- Sync state sai cách bằng `useEffect`.


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
