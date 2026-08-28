---
name: "Web Architecture Skill"
description: "Hiểu và tuân thủ architecture hiện tại của dự án."
---

# Web Architecture Skill

## Purpose
Giúp Agent hiểu và duy trì cấu trúc dự án Sổ Bán Hàng (React Frontend + Node.js Backend).

## When to Use
Khi bắt đầu một task mới, hoặc khi cần quyết định nơi đặt code (page, component, hook, service).

## Rules
- Inspect current architecture trước khi code.
- Không đổi framework/library/architecture.
- Giữ separation of concerns: pages không chứa quá nhiều business logic.
- Reuse components trước khi tạo mới.

## Workflow
1. Inspect project structure (package.json, router, entry point).
2. Inspect layers (components, hooks, services, utils, assets, pages).
3. Xác định đúng layer cho logic mới.
4. Implement và duy trì convention.

## Verification
- Code mới nằm đúng thư mục.
- Không có duplicate components.
- Layering rõ ràng.

## Failure Modes
- Tạo component logic phức tạp thay vì tách ra hooks.
- Hardcode business rules ở view layer thay vì service layer.

## Examples
Tạo API call ở `services/`, dùng custom hook ở `hooks/`, và chỉ render ở `components/` hoặc `pages/`.


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
