# To-Do App with Categories - Data Access Layer

- When implementing entity-specific hooks, follow rules **Creating entity-specific hooks working with PouchDB** specified in `.cursor/rules/pouchdb.mdc`.
- Implement the following entity-specific hooks:
  - `useTodos` which provides its state and the following operations:
    - `createTodo`: Creates a new todo
    - `updateTodo`: Updates a todo's title or completion status. 
    - `deleteTodo`: Deletes a todo.
    - `addTodoToCategory`: Adds a todo to a category.
    - `removeTodoFromCategory`: Removes a todo from a category.
  - `useCategories` which provides its state and the following operations:
    - `createCategory`: Adds a new category.
    - `updateCategory`: Modifies an existing category's title.
    - `deleteCategory`: Removes a category.
- Implement the following interfaces:
```ts
// Error and loading state interface
export interface OperationState {
  error: Error | null;
  loading: boolean;
}

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