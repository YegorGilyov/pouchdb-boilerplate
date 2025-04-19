# To-Do App with Categories - Technical Design Document - Schema

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