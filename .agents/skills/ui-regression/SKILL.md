---
name: "UI Regression Skill"
description: "Đảm bảo giao diện không bị vỡ sau khi sửa code."
---

# UI Regression Skill

## Purpose
Đảm bảo chất lượng UI trên nhiều độ phân giải.

## When to Use
Sau mỗi lần sửa đổi CSS, Layout hoặc HTML.

## Rules
- Kiểm tra tối thiểu: 375px, 768px, 1024px, 1200px, 1440px.
- Đặc biệt chú ý ranh giới breakpoint (767px, 768px).

## Workflow
1. Resize trình duyệt hoặc dùng thiết bị thật để xem UI.
2. Kiểm tra text clipping, overflow, grid đứt gãy.
3. Kiểm tra touch targets, safe area.

## Verification
- Không có thanh cuộn ngang (horizontal scroll) không mong muốn.

## Failure Modes
- Code trên màn to đẹp nhưng vỡ nát trên màn nhỏ.


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
