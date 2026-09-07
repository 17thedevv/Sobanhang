---
name: "Error State Design Skill"
description: "Handle and present errors gracefully."
---
# Error State Design Skill

## Purpose
Hiển thị lỗi một cách dễ hiểu và mang tính xây dựng.

## Rules
Phân biệt các loại lỗi: validation, network, permission, auth, business rule, unexpected.
- Phải cung cấp: understandable explanation và recovery action (nếu có).

## Anti-patterns
- **KHÔNG** đưa technical stack trace cho end-user.

## Project Context
- **Project**: "Sổ Bán Hàng"
- **Primary User**: Chủ cửa hàng nhỏ
- **Core UX Principle**: "Quick to understand. Quick to act. Hard to make mistakes."
