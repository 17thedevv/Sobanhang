---
name: "Git Workflow Skill"
description: "Giữ Git workflow nhất quán."
---

# Git Workflow Skill

## Purpose
Làm việc nhóm trên GitHub nhịp nhàng, có track dấu.

## When to Use
Khi tạo branch, commit, push, tạo PR.

## Rules
- Không push trực tiếp main.
- Tên branch phải rõ ràng (feature/epic-XX/us-XX, bugfix/...).
- Không trộn các User Story không liên quan.

## Workflow
1. Từ `develop`, tạo branch mới.
2. Code và commit (message rõ ràng).
3. Tạo Pull Request.

## Verification
- Lịch sử Git gọn gàng.

## Failure Modes
- Gộp 2 tính năng không liên quan vào 1 PR.


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
