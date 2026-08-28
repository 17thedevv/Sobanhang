---
name: "Debugging Skill"
description: "Debug deployment/build/runtime."
---

# Debugging Skill

## Purpose
Tìm ra root cause thay vì đoán mò hoặc workaround mù.

## When to Use
Khi có Bug.

## Rules
- Phải tái hiện được (Reproduce) trước khi sửa.
- Identify layer bị lỗi (UI, state, API, Backend).
- Không workaround khi chưa biết nguyên nhân.

## Workflow
1. Reproduce -> Collect Error -> Identify Layer -> Fix Root Cause -> Regression Test.

## Verification
- Bug không còn xuất hiện với cùng kịch bản.

## Failure Modes
- Bug do MIME type (vì file tĩnh không load được) nhưng lại đi sửa webpack config mà không check Cloudflare config.


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
