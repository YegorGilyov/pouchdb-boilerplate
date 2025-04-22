# To-Do App with Categories - Data Access Layer

**IMPORTANT**: Please follow requirements from this document carefully and to the letter!

When implementing entity-specific hooks, follow rules **Creating entity-specific hooks working with PouchDB** specified in `.cursor/rules/pouchdb.mdc`.

## Entity-specific hooks

- `useTodos` which provides its state and the following operations:
  - `createTodo`: Creates a new todo.
  - `updateTodo`: Updates a todo's title or completion status. 
  - `deleteTodo`: Deletes a todo.
  - `addTodoToCategory`: Adds a todo to a category.
  - `removeTodoFromCategory`: Removes a todo from a category.
- `useCategories` which provides its state and the following operations:
  - `createCategory`: Adds a new category.
  - `updateCategory`: Modifies an existing category's title.
  - `deleteCategory`: Removes a category.

## Infrastructure hooks

- `useTodoDBInit`: creates indexes.

## Database index specification (`src/todo/constants/indexes.ts`)

```ts
// Database index specifications
export const todoDBIndexes = [
  {
    index: {
      fields: ['type']
    },
    name: 'idx-type'
  },
  {
    index: {
      fields: ['type', 'name']
    },
    name: 'idx-type-name'
  },
  {
    index: {
      fields: ['type', 'categoryIds']
    },
    name: 'idx-type-categoryIds'
  },
  {
    index: {
      fields: ['type', 'createdAt', 'categoryIds']
    },
    name: 'idx-type-createdAt-categoryIds'
  }
] as const;
```

## Interfaces (`src/todo/types/index.ts`)

```ts
import { OperationState, CategoryDocument, TodoDocument } from '../../shared/types';

// Category state and operations interfaces
export interface CategoryState extends OperationState {
  categories: CategoryDocument[];
}

export interface UseCategoriesReturn extends CategoryState {
  createCategory: (name: string) => Promise<void>;
  updateCategory: (category: CategoryDocument, newName: string) => Promise<void>;
  deleteCategory: (category: CategoryDocument) => Promise<void>;
}

// Todo state and operations interfaces
export interface TodoState extends OperationState {
  todos: TodoDocument[];
}

export interface UseTodosReturn extends TodoState {
  createTodo: (title: string) => Promise<void>;
  updateTodo: (todo: TodoDocument, updates: { title?: string; completed?: boolean }) => Promise<void>;
  deleteTodo: (todo: TodoDocument) => Promise<void>;
  addTodoToCategory: (todo: TodoDocument, categoryId: string) => Promise<void>;
  removeTodoFromCategory: (todo: TodoDocument, categoryId: string) => Promise<void>;
}
```