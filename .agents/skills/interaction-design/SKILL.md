---
name: "Interaction Design Skill"
description: "Design meaningful and responsive interactions."
---
# Interaction Design Skill

## Purpose
Đảm bảo mọi tương tác đều rõ ràng và có phản hồi.

## Rules
Mọi interactive element phải trả lời được:
- User click/tap vào đâu?
- Điều gì xảy ra?
- Có immediate feedback không? Có thể undo không?
- Có confirmation không? Có loading state không? Error xảy ra thì sao?

## Anti-patterns
- Không tạo UI "click -> không có feedback".
- Không dùng confirmation cho mọi action.
- **Chỉ dùng Confirmation khi**: destructive, irreversible, financially meaningful, high-risk.

## Project Context
- **Project**: "Sổ Bán Hàng"
- **Primary User**: Chủ cửa hàng nhỏ
- **Core UX Principle**: "Quick to understand. Quick to act. Hard to make mistakes."
