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
export type AppDocument = 
  | TodoDocument 
  | CategoryDocument;

// Error and loading state interface
export interface OperationState {
  error: Error | null;
  loading: boolean;
}

// PouchDB types
export type PouchDBInstance = PouchDB.Database<AppDocument>;

// Context value interface
export interface PouchDBContextValue {
  db: PouchDBInstance;
  dbOperations: DBOperations;
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