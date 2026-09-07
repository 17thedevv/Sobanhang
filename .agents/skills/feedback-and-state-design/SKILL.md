---
name: "Feedback and State Design Skill"
description: "Design appropriate feedback for user actions."
---
# Feedback and State Design Skill

## Purpose
Cung cấp phản hồi rõ ràng cho mọi hành động thành công hoặc thất bại của user.

## Rules
Mọi successful user action nên có feedback phù hợp:
- Inline update, Toast, Snackbar, Status change, Navigation, Confirmation.

## Anti-patterns
- Không lạm dụng toast.
- Critical action có thể cần persistent status thay vì toast vụt tắt.

## Project Context
- **Project**: "Sổ Bán Hàng"
- **Primary User**: Chủ cửa hàng nhỏ
- **Core UX Principle**: "Quick to understand. Quick to act. Hard to make mistakes."
