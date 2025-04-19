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

## Data Schema

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
  isPrivate: boolean;
  memberIds: string[]; // References to User _ids
  adminIds: string[];  // References to User _ids who are admins
  updatedAt: string;
}

// Base for all Configuration Elements
export interface ConfigElementDocument extends BaseDocument {
  name: string;
  description?: string;
  isActive: boolean;
  isPublished: boolean;
  managedInSpaceId: string;  // The Space where this element is managed
  usedInSpaceIds: string[];  // The Spaces where this element is used
  createdById: string;       // Reference to User _id who created it
  lastEditedById: string;    // Reference to User _id who last edited it
  lastEditedAt: string;
  updatedAt: string;
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


