---
name: "Testing Skill"
description: "Viết test và regression test."
---

# Testing Skill

## Purpose
Đảm bảo chất lượng code và ngăn chặn regression (hồi quy).

## When to Use
Khi hoàn thành một tính năng (User Story) hoặc fix bug.

## Rules
- Một tính năng chưa test không được coi là Done.
- Happy path và critical failure path phải pass.

## Workflow
1. Xác định kịch bản test (US-XX).
2. Viết unit/integration test (nếu có yêu cầu).
3. Verify thủ công trên UI.

## Verification
- Code thay đổi không phá vỡ tính năng hiện tại (Regression).

## Failure Modes
- Chỉ test happy path mà quên test các edge cases (nhập sai, mất mạng).


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
