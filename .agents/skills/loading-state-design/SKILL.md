---
name: "Loading State Design Skill"
description: "Design appropriate loading states for asynchronous operations."
---
# Loading State Design Skill

## Purpose
Quản lý kỳ vọng của người dùng trong khi hệ thống đang xử lý.

## Rules
Mọi asynchronous operation phải cân nhắc:
- Initial loading, Button loading, Skeleton, Optimistic update, Retry.

## Anti-patterns
- Không để "click -> UI đứng im".
- Button cần phản hồi Loading -> disable duplicate action -> success/error feedback.

## Project Context
- **Project**: "Sổ Bán Hàng"
- **Primary User**: Chủ cửa hàng nhỏ
- **Core UX Principle**: "Quick to understand. Quick to act. Hard to make mistakes."
