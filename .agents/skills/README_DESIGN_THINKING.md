# Frontend Design Thinking Skill System

Hệ thống skills chuyên về "Frontend Design Thinking / UI UX Reasoning" giúp Agent tự suy nghĩ, đánh giá và đưa ra quyết định thiết kế frontend nhất quán trong toàn bộ project "Sổ Bán Hàng".

## Design Skill Hierarchy & Routing

Sử dụng các skills sau tùy thuộc vào ngữ cảnh:

- **New screen**: `frontend-design-thinking` -> `user-centered-design` -> `information-architecture` -> `visual-hierarchy`
- **Form**: `form-design`
- **Navigation**: `navigation-design`
- **Responsive**: `responsive-design-thinking` -> `mobile-first-design` -> `desktop-ux`
- **State Handling (Loading/Error/Empty)**: `feedback-and-state-design` -> `loading-state-design` / `error-state-design` / `empty-state-design`
- **UI inconsistency**: `visual-consistency` -> `design-system`
- **UX concern**: `usability-review`
- **Final UI review**: `frontend-design-review`

## Integration with Engineering Skills
Design skills must work WITH engineering skills:
- `react-development`
- `responsive-ui`
- `pwa-development`
- `frontend-api-integration`
- `testing`
- `accessibility`
- `performance`
- `user-story-delivery`

**Recommended Flow**:
User Story -> Design Thinking -> Information Architecture -> Interaction Design -> Responsive Design -> React Implementation -> Testing -> Usability Review -> Preview -> Tester -> Iteration
