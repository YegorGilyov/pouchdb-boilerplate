# Configuration Management Prototype - Technical Design Document - Schema

**IMPORTANT**: Please follow requirements from this document carefully and to the letter!

## Conceptual Model

- Entities: 
  - `Users`
  - `Spaces`
  - `Configuration Elements` are divided into:
    - `Item Types`
    - `Workflows`
    - `Custom Fields`  
- Relationships:
  - `Spaces` have `Members` and `Admins` (`Users`)
  - Every `Configuration Element` is `Managed in` one of the `Spaces` 
  - Every `Configuration Element` can be `Used in` in any number of `Spaces` 
  - Every `Configuration Element` is `Created by` one of the `Users`
  - Every `Configuration Element` is `Last edited by` one of the `Users`
  - Every `Item Type` has one `Workflow` and any number of `Custom Fields`

## Data Schema (`src/shared/types/index.ts`)

```tsx
// Base document interface that all entities extend
export interface BaseDocument {
  _id: string;
  _rev?: string;
  type: string;
  createdAt: string;
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
```


