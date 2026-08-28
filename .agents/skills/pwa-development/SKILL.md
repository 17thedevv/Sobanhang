---
name: "PWA Development Skill"
description: "Duy trì và nâng cấp PWA behavior."
---

# PWA Development Skill

## Purpose
Đảm bảo ứng dụng luôn hoạt động như một Progressive Web App (PWA) chuẩn mực.

## When to Use
Khi làm việc với service worker, manifest, asset caching, hoặc tối ưu trải nghiệm Add to Home Screen.

## Rules
- PWA là enhancement layer, không viết lại frontend vì nó.
- Caching strategy: cache static assets, network-first hoặc network-only cho API.
- Không cache auth tokens hoặc business data nhạy cảm.

## Workflow
1. Inspect manifest (name, display=standalone, theme_color).
2. Kiểm tra service worker update strategy.
3. Test PWA navigation và refresh.

## Verification
- Chrome Android / Safari iOS Add to Home Screen thành công.
- Ứng dụng launch standalone mượt mà.

## Failure Modes
- Service worker cache nhầm API response cũ làm data không update.
- Mất thanh điều hướng trên iOS (cần xử lý safe area).

## Examples
Chỉnh `navigateFallbackDenylist: [/^/api/]` để không cache API calls.


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
