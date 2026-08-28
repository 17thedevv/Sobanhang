---
name: "Performance Skill"
description: "Đảm bảo ứng dụng nhanh và mượt."
---

# Performance Skill

## Purpose
Tránh ứng dụng bị chậm do render thừa hoặc tải dữ liệu lớn.

## When to Use
Khi component có dấu hiệu chậm, giật lag, hoặc tải dữ liệu nhiều.

## Rules
- Tránh re-render không cần thiết.
- Không premature optimize (chỉ tối ưu khi cần thiết).
- Pagination, lazy loading, debouncing.

## Workflow
1. Inspect React DevTools Profiler (nếu cần).
2. Thêm debounce cho input search.

## Verification
- Giao diện không bị freeze khi thao tác nhanh.

## Failure Modes
- Gọi API liên tục theo mỗi phím gõ (chưa có debounce).


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
