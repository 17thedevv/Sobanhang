---
name: "User Story Delivery Skill"
description: "Quy trình thực hiện 1 User Story (QUAN TRỌNG NHẤT)."
---

# User Story Delivery Skill

## Purpose
Đảm bảo mỗi US đều được phân tích, lập kế hoạch và triển khai đúng tiêu chuẩn.

## When to Use
Khi bắt tay làm bất kỳ User Story nào.

## Rules
- Minimal Change: Chỉ sửa những gì cần thiết.
- Existing Behavior First: Không phá feature đang có.
- User Story Isolation: Tập trung 1 US, không làm lan man.
- Architecture First: Kiểm tra cấu trúc trước khi code.

## Workflow
1. **UNDERSTAND**: Đọc kỹ US, acceptance criteria.
2. **INSPECT**: Kiểm tra code/API hiện tại.
3. **PLAN**: Chia subtasks, xác định file cần sửa.
4. **IMPLEMENT**: Code (tối thiểu, không refactor unrelated).
5. **VERIFY**: Lint, Build, Responsive, PWA check.
6. **PREVIEW**: Tạo link preview cho tester.
7. **REPORT**: Báo cáo những gì đã làm, list of changes.

## Verification
- Hoàn thành đúng Acceptance Criteria.

## Failure Modes
- Lao vào code ngay mà không Understand/Inspect.
- Tự tiện đập đi xây lại cả component chỉ để sửa 1 nút bấm.


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
