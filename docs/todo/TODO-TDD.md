# To-Do App with Categories - Technical Design Document

**IMPORTANT**: Please follow requirements from this document carefully and to the letter!

## Conceptual Model

- Two main entities: `Todos` and `Categories`.
- Many-to-many relationship between `Todos` and `Categories`.

## Data Schema

### Todo Document

```tsx
{
  _id: "todo:123456",  // Unique ID prefixed with "todo:"
  type: "todo",        // Document type for filtering
  title: "Complete project proposal",
  completed: false,
  createdAt: "2025-04-08T09:30:00Z",
  updatedAt: "2025-04-08T09:30:00Z",
  categoryIds: ["category_abc", "category_def"]  // References to categories
}
```

### Category Document

```tsx
{
  _id: "category:123456",  // Unique ID prefixed with "category:"
  type: "category",        // Document type for filtering
  name: "Work",
  createdAt: "2025-04-01T10:00:00Z",
  updatedAt: "2025-04-01T10:00:00Z"
}
```

## Shared Types

- See `src/shared/types/index.ts`

## UI/UX Design

- **Design System**: Follow Ant Design's default styles and components.
- **Rules**: when implementing UI, make sure to follow rules: 
  - **UI Design Best Practices** specified in `.cursor/rules/ui.mdc` 
  - **Ant Design Best Practices** specified in `.cursor/rules/antd-general.mdc`
- **Layout**:
  - **TodoPage** (main page):
    - Top: `TodoForm` for creating new to-dos (title input only; auto-assigns selected category).
    - Below: Ant Design `Splitter` with `CategoriesFilter` on the left (25% width) and `TodoList` on the right (75% width).
      - Follow `.cursor/rules/antd-splitter.mdc` to implement the splitter.
    - The main area below `TodoForm` is wrapped in an Ant Design `Card` for a subtle shadow effect.
- **Components**: see **Component Documentation** in `TODO-COMPONENTS.md`

## Data Access Layer

- See **Data Access Layer** in `TODO-DAL.md`