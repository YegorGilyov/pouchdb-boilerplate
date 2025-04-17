# To-Do App with Categories - Technical Design Document

**IMPORTANT**: Please follow requirements from this document carefully and to the letter!

## Conceptual Model

- Two main entities: `Todos` and `Categories`.
- Many-to-many relationship between `Todos` and `Categories`.

## Data Schema

```tsx
// Base document interface that all entities extend
export interface BaseDocument {
  _id: string;
  _rev?: string;
  type: string;
  createdAt: string;
}

// Entity-specific interfaces
export interface TodoDocument extends BaseDocument {
  type: 'todo';
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  categoryIds: string[];
}

export interface CategoryDocument extends BaseDocument {
  type: 'category';
  name: string;
  createdAt: string;
  updatedAt: string;
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
- **Components**: see **Component Documentation** in `TODO-COMPONENTS.md`

## Data Access Layer

- See **Data Access Layer** in `TODO-DAL.md`