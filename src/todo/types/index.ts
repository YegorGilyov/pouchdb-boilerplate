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