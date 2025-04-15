# To-Do App with Categories - Data Access Layer

- Implement a Data Access Layer, which abstracts away the complexities of data retrieval, manipulation, and state management from the rest of the application. This layer should consist of a single entity-agnostic PouchDB Provider, and entity-specific hooks for every entity.
- Implement a single PouchDB Provider and make it available to the entire application using React Context.
- `PouchDBProvider` should provide the following entity-agnostic operations:
  - `get`: Get document by ID
  - `find`: Find documents matching a selector
  - `create`: Create a new document
  - `update`: Update an existing document
  - `remove`: Delete a document
  - `subscribeToChanges`: Subscribe to database changes
- Implement a hook for using the PouchDB context.
- Implement entity-specific hooks for every entity:
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
- Entity-specific change subscriptions:
  - Each custom hook (`useTodos`, `useCategories`, etc.) should set up its own PouchDB changes subscription.
  - Filter changes to only respond to documents of the relevant type (e.g., only `todo` type changes in `useTodos`). This keeps each hook focused on its own data concerns.
- CRUD operations implementation:
  - Operations should ONLY perform the database action, handle errors, and provide toast message feedback. 
  - After a successful operation, do NOT manually update the local state. Let the changes subscription handle the state update instead.
- Loading state management:
  - Indicate loading state only during user-initiated actions that require waiting:
    * Initial page/content loading
    * User-triggered filter application
    * Form submissions
    * Explicit data refresh requests
  - NEVER indicate loading state during real-time updates triggered by PouchDB change events.
- Provide toast message feedback for all operations using Ant Design’s `App.useApp().message` API (see `.cursor/rules/and-messages.mdc`).