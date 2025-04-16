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

// Union type of all document types
export type AppDocument = TodoDocument | CategoryDocument;

// Database index specifications
export const dbIndexes = [
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

// PouchDB types
export type PouchDBInstance = PouchDB.Database<AppDocument>;

// Context value interface
export interface PouchDBContextValue {
  db: PouchDBInstance;
  dbOperations: DBOperations;
  createIndexes: () => Promise<void>;
  loading: boolean;
  error: Error | null;
}

// Database operations interface
export interface DBOperations {
  get: (id: string) => Promise<AppDocument>;
  find: <T extends AppDocument>(
    selector: PouchDB.Find.Selector,
    sort?: Array<{ [propName: string]: 'asc' | 'desc' }>,
    useIndex?: string
  ) => Promise<T[]>;
  create: <T extends AppDocument>(doc: Omit<T, '_id' | '_rev'> & { _id?: string }) => Promise<T>;
  update: <T extends AppDocument>(doc: T) => Promise<T>;
  remove: <T extends AppDocument>(doc: T) => Promise<boolean>;
  subscribeToChanges: (callback: (change: PouchDB.Core.ChangesResponseChange<AppDocument>) => void) => () => void;
}