---
name: "Code Review Skill"
description: "Review code trước khi merge."
---

# Code Review Skill

## Purpose
Kiểm tra chéo chất lượng code.

## When to Use
Trước khi báo "Done" cho một User Story.

## Rules
- Tự review code của chính mình trước.
- Check correctness, security, performance, regression risk.

## Workflow
1. Đọc lại diff (những dòng thay đổi).
2. Đảm bảo không để sót console.log debug.

## Verification
- Không có duplicate code. Không có linter errors.

## Failure Modes
- Review qua loa, chỉ nhìn "chạy được là được".


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
