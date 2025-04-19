# Configuration Management Prototype - Technical Design Document - Data Access Layer

**IMPORTANT**: Please follow requirements from this document carefully and to the letter!

When implementing entity-specific hooks, follow rules **Creating entity-specific hooks working with PouchDB** specified in `.cursor/rules/pouchdb.mdc`.

## Entity-specific hooks

- `useUsers` provides only its state (without filtering), no operations.
- `useSpaces` provides only its state (with filtering), no operations.
  - Filter parameters:
    * `availableTo`: user `_id` who has access to this space.
      - Private spaces are available to its admins and members only.
      - Other spaces are available to everyone.
    * `managedBy`: user _id who is an admin of this space.
- `useConfigElements` provides its state (with filtering) and operations.
  - Filter parameters:
    * `type`: `itemType`, `workflow`, or `customField`.
    * `availableIn`: space `_id` where this element is managed or used.
    * `availableTo`: user `_id` who has access to this element.
      - Elements that are managed in spaces that are not private, are avaliable to everyone.
      - Other elements are available to members and admins of spaces they are managed in or used in.
    * `managedBy`: user `_id` who is an admin of a space this element is managed in.
      - First, fetch ids of spaces where this user is an admin, then filter config elements by ids of spaces they are managed in.
    * `canBeReusedBy`: user `_id` who can reuse this element.
      - If an element is published, it can be reused by everyone.
      - Otherwise only admins of the space this element is managed in can reuse it. 
    * `isPublished`
    * `isActive`
  - Operations:
    - `addToSpace`: Adds an element to a space.
    - `removeFromSpace`: Removes an element from a space.
    - `setPublished`: Publishes or unpublishes an element.

## Interfaces

```ts
// Database index specifications
export const dbIndexes = [
  // ...
  // Other indices
  // ...
  {
    index: {
      fields: ['type', 'name']
    },
    name: 'idx-type-name'
  },
  {
    index: {
      fields: ['type', 'name', 'adminIds']
    },
    name: 'idx-type-name-admins'
  },
  {
    index: {
      fields: ['type', 'name', 'adminIds', 'memberIds', 'isPrivate']
    },
    name: 'idx-type-name-admins-members-private'
  },
  {
    index: {
      fields: ['type', 'name', 'managedInSpaceIds', 'usedInSpaceIds', 'isActive', 'isPublished']
    },
    name: 'idx-type-name-managedin-usedin-active-published'
  },
  // ...
  // Other indices
  // ...
] as const;

// Error and loading state interface
export interface OperationState {
  error: Error | null;
  loading: boolean;
}

// User state and operations interfaces
export interface UseUsersReturn extends OperationState {
  users: UserDocument[];
}

// Space state and operations interfaces
export interface UseSpacesReturn extends OperationState {
  spaces: SpaceDocument[];
}

export interface SpaceFilter {
  availableTo?: string; 
  managedBy?: string;   
}

// Configutation element state and operation interfaces
export interface ConfigElementState extends OperationState {
  configElements: ConfigElementDocument[];
}

export interface UseConfigElementsReturn extends ConfigElementState {
  addToSpace: (configElement: ConfigElementDocument, spaceId: string) => Promise<void>;
  removeFromSpace: (configElement: ConfigElementDocument, spaceId: string) => Promise<void>;
  setPublished: (configElement: ConfigElementDocument, published: boolean) => Promise<void>;
  setActive: (configElement: ConfigElementDocument, active: boolean) => Promise<void>;
}

export interface ConfigElementFilter {
  type?: string;
  availableIn?: string; 
  availableTo?: string;
  managedBy?: string;
  canBeReusedBy?: string;  
  isPublished?: boolean;  
  isActive?: boolean;
}
```