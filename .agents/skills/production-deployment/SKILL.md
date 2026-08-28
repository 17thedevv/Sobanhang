---
name: "Production Deployment Skill"
description: "Quy trình Release ra production."
---

# Production Deployment Skill

## Purpose
Đảm bảo đưa ứng dụng ra môi trường thật an toàn.

## When to Use
Khi merge từ QA sang main để release.

## Rules
- Phải đảm bảo mọi Tests đã Pass.
- No debug logging, no secrets committed.
- API Endpoint trỏ đúng môi trường Production.

## Workflow
1. Kiểm tra lại Production checklist.
2. Deploy.
3. Smoke test trên production (đăng nhập, xem luồng chính).

## Verification
- Ứng dụng chạy trên tên miền chính thức không phát sinh lỗi.

## Failure Modes
- Quên đổi Endpoint từ Staging sang Production.


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
