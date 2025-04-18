# To-Do App with Categories - Technical Design Document

**IMPORTANT**: Please follow requirements from this document carefully and to the letter!

## Introduction

The purpose of this app is to provide a boilerplate for building UI prototypes as local-first applications, using PouchDB as a database. 

Architecturaly the boilerplate consists of the following slices:
- **app**: application shell.
- **shared**: shared utilities, types, and components.
- **db-admin**: admin interface for PouchDB.
- **todo**: sample app, a simple To-Do list with categories.
- **proto**: your prototype (a placeholder).

Every new prototype is supposed to be a separate slice.

## Technical Stack

- **Frontend**: React with TypeScript, bootstrapped with Vite.
- **Database**: PouchDB (all the data is stored locally).
- **UI Components**: Ant Design with default styles.
- **Styling**: CSS Modules where necessary.

## Structure

```
src/
├── app/
│   ├── assets/
│   ├── layouts/                  # Main app layout
│   ├── routes/                   # Main app routes
│   ├── styles/
│   └── App.tsx
│
├── shared/                       # Shared utilities, types, and components
│   ├── contexts/                 # Shared contexts
│   │   ├── PouchDBProvider.tsx   # PouchDB provider
│   ├── styles/                   # Shared styles 
│   └── types/                    # Shared types, including:
│                                 # - entity-specific document interfaces
│                                 # - state and operations interfaces for every entity across all slices
│
├── db-admin/                     # Admin interface for PouchDB
│   ├── components/               # DB admin section UI components
│   ├── layouts/                  # DB admin section layouts
│   ├── pages/                    # DB admin section page components
│   └── routes/                   # DB admin section routes
│
├── todo/                         # Sample app, a simple To-Do list with categories
│   ├── components/               # UI components
│   ├── hooks/                    # Entity-specific hooks to provide database access
│   ├── pages/                    # Page components
│   └── styles/                   # Styles
│
├── proto/                        # Your prototype
│   ├── components/               # UI components
│   ├── hooks/                    # Entity-specific hooks to provide database access
│   ├── layouts/                  # Layout components
│   ├── pages/                    # Page components
│   ├── routes/                   # Routes
│   └── styles/                   # Styles
│
├── index.css
└── main.tsx
```

## UI/UX Design

- **Design System**: Follow Ant Design's default styles and components.
- **Rules**: when implementing UI, make sure to follow rules: 
  - **UI Design Best Practices** specified in `.cursor/rules/ui.mdc` 
  - **Ant Design Best Practices** specified in `.cursor/rules/antd-general.mdc`
- **Layout**:
  - Navigation between slices (`proto`, `todo`, `db-admin`) is done using Ant Design's `FloatingButton`.
  - The page layout is completely defined by the current slice. 
  - The navigational floating button is the only UI element shared between slices.

## Data Access Layer

- The Data Access Layer abstracts away the complexities of data retrieval, manipulation, and state management from the rest of the application. This layer should consist of a single entity-agnostic PouchDB Provider (belongs to `shared`), and entity-specific hooks for every entity (belong to `todo` and `proto`).
- There is a single PouchDB provider available for the entire application, using React Context.
- `PouchDBProvider` provides the following entity-agnostic operations:
  - `get`: Get document by ID
  - `find`: Find documents matching a selector
  - `create`: Create a new document
  - `update`: Update an existing document
  - `remove`: Delete a document
  - `subscribeToChanges`: Subscribe to database changes

## Routing

- There is a React Router with routes for every slice (except for `app` and `shared`):
  - /proto (your prototype slice)
  - /todos (**todo** slice)
  - /db-admin (**db-admin** slice)
- If a slice implements it's own routing (e.g. `proto/routes/`), it should be included using lazy loading (the same way as routing is included for the DB admin section)

## Documentation for slices

### To-Do app

- **docs/todo/TODO-TDD.md**: Technical Design Document.
- **docs/todo/TODO-COMPONENTS.md**: Detailed documentation for each custom component.
- **docs/todo/TODO-DAL.md**: Data Access Layer.
