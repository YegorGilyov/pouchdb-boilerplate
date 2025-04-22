# Configuration Management Prototype - Technical Design Document - Data Access Layer

**IMPORTANT**: Please follow requirements from this document carefully and to the letter!

When implementing entity-specific hooks, follow rules **Creating entity-specific hooks working with PouchDB** specified in `.cursor/rules/pouchdb.mdc`.

## Entity-specific hooks

- `useUsers` provides only its state (without filtering), no operations.
  - Sorting: by name
- `useSpaces` provides only its state (with filtering), no operations.
  - Filter parameters:
    * `availableTo`: user `_id` who has access to this space.
      - Private spaces are available to its admins and members only.
      - Other spaces are available to **everyone**.
      - Use the denormalized field `availableTo`.
      - Use `$in` operator to ensure that spaces that are available to **everyone** pass through the filter as well as spaces that are available to this user specifically.
  - Sorting: by name
- `useConfigElements` provides its state (with filtering) and operations.
  - Filter parameters:
    - Mandatory:
      * `type`: `itemType`, `workflow`, or `customField`
    - Optional (cannot be used together):
      * `availableIn`: space `_id` where this element is managed or used.
        - Use the denormalized field `denormAvailableInSpaceIds`.
        - Use `$in` operator to ensure that elements that are available in this space pass through the filter.
      * `availableTo`: user `_id` who has access to this element.
        - Use the denormalized field `denormAvailableToUserIds`.
        - Use `$in` operator to ensure that elements that are available to **everyone** pass through the filter as well as elements that are available to this user specifically.
      * `canBeReusedBy`: user `_id` who can reuse this element.
        - Use the denormalized field `denormCanBeReusedByUserIds`.
        - Use `$in` operator to ensure that elements that can be reused by **everyone** pass through the filter as well as elements that can be reused by this user specifically.
  - Sorting: by name
  - Operations:
    - `addToSpace`: Adds an element to a space (`usedInSpaceIds`).
      - Should take care of the denormalized fields (`denormAvailableInSpaceIds`, `denormAvailableToUserIds`, `denormCanBeReusedByUserIds`) of the configuration element. Recalculate those fields from scratch on every change.
    - `removeFromSpace`: Removes an element from a space (`usedInSpaceIds`).
      - Should take care of the denormalized fields (`denormAvailableInSpaceIds`, `denormAvailableToUserIds`, `denormCanBeReusedByUserIds`) of the configuration element. Recalculate those fields from scratch on every change.
    - `setPublished`: Publishes or unpublishes an element.
      - Should take care of the denormalized fields (`denormAvailableToUserIds`, `denormCanBeReusedByUserIds`) of the configuration element. Recalculate those fields from scratch on every change.
    - `setActive`: Activates or deactivates an element.

## Infrastructure hooks

- `useProtoDBInit`: creates indexes and ensures that the entire database is properly denormalized.

## Utility functions

- `denormalizeDocument`: an utility function to update denormalized fields for entities
  - * @param `doc` The document to denormalize
  - * @param `db` The PouchDB database instance

## Database index specification

```ts
// Database index specifications
export const dbIndexes = [
  {
    index: {
      fields: ['type', 'name']
    },
    name: 'idx-type-name'
  },
  {
    index: {
      fields: ['type', 'name', 'availableToUserIds']
    },
    name: 'idx-type-name-availableTo'
  },
  {
    index: {
      fields: ['type', 'name', 'availableInSpaceIds']
    },
    name: 'idx-type-name-availableIn'
  },
  {
    index: {
      fields: ['type', 'name', 'canBeReusedByUserIds']
    },
    name: 'idx-type-name-canBeReusedBy'
  }
] as const;
```

## Interfaces

```ts
import { OperationState, UserDocument, SpaceDocument, ConfigElementDocument } from '../../shared/types';

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
  canBeReusedBy?: string; 
}
```