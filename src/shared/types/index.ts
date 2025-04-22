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

// User entity
export interface UserDocument extends BaseDocument {
  type: 'user';
  name: string;
  avatar?: string;
  updatedAt: string;
}

// Space entity
export interface SpaceDocument extends BaseDocument {
  type: 'space';
  name: string;
  description?: string;
  isPrivate: boolean;      // Private Spaces are available to their members only
  memberUserIds: string[]; // References to Users who are members
  adminUserIds: string[];  // References to Users who are admins
  updatedAt: string;
  // Denormalized fields to simplify queries
  denormAvailableToUserIds: string[];  // References to Users who have access: [...memberIds, ...adminIds] for private Spaces, otherwise ['everyone']
}

// Base for all Configuration Elements
export interface ConfigElementDocument extends BaseDocument {
  name: string;
  description?: string;
  isActive: boolean;
  isPublished: boolean;
  managedInSpaceId: string;       // Reference to the Space where this element is managed
  usedInSpaceIds: string[];       // References to Spaces where this element is used
  createdByUserId: string;        // Reference to the User who created it
  lastEditedByUserId: string;     // Reference to the User who last edited it
  lastEditedAt: string;
  updatedAt: string;
  // Denormalized fields to simplify queries
  denormAvailableInSpaceIds: string[];  // References to Spaces where this element is available: [managedInSpaceId, ...usedInSpaceIds]
  denormAvailableToUserIds: string[];   // References to Users who have access: ['everyone'] if this element is published, or available in a Space that is not private, otherwise all members of all Spaces this element is available in
  denormManagedByUserIds: string[];     // References to Users who are admins of the Space this element is managed in
  denormCanBeReusedByUserIds: string[]; // References to Users who can reuse this element: ['everyone'] if this element is published, otherwise admins of the Space this element is managed in
  type: 'itemType' | 'workflow' | 'customField';
}

// Item Type configuration element
export interface ItemTypeDocument extends ConfigElementDocument {
  type: 'itemType';
  workflow: string;   // Reference to Workflow _id 
  fieldIds: string[]; // References to Custom Field _ids
}

// Workflow configuration element
export interface WorkflowDocument extends ConfigElementDocument {
  type: 'workflow';
  states: {
    id: string;
    name: string;
  }[];
}

// Custom Field configuration element
export interface CustomFieldDocument extends ConfigElementDocument {
  type: 'customField';
  fieldType: string;  // e.g., 'text', 'number', 'date', 'select', etc.
}

// Union type of all document types
export type AppDocument = 
  | TodoDocument 
  | CategoryDocument
  | UserDocument
  | ConfigElementDocument
  | SpaceDocument
  | ItemTypeDocument
  | WorkflowDocument
  | CustomFieldDocument;

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
  get: <T extends AppDocument = AppDocument>(id: string) => Promise<T>;
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