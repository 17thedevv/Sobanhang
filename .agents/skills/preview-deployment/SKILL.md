---
name: "Preview Deployment Skill"
description: "Chuẩn bị preview deployment cho tester."
---

# Preview Deployment Skill

## Purpose
Giúp tester có ngay URL để test tính năng mới mà không phải clone source code.

## When to Use
Sau khi làm xong US và đẩy code lên branch.

## Rules
- Kiểm tra production build xem có lỗi không.
- Phục vụ build output, không serve raw JSX.
- Verify MIME types, CORS.

## Workflow
1. Chạy `npm run build`.
2. Kiểm tra output `dist/`.
3. Kiểm tra biến môi trường của môi trường Preview.

## Verification
- Link preview truy cập được. PWA hoạt động trên link preview.

## Failure Modes
- Link preview dùng hard-code `localhost` làm backend URL.


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
