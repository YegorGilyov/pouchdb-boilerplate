# To-Do App with Categories - Technical Design Document - UI

**IMPORTANT**: Please follow requirements from this document carefully and to the letter!

- **Design System**: Follow Ant Design's default styles and components.
- **Rules**: when implementing UI, make sure to follow rules: 
  - **UI Design Best Practices** specified in `.cursor/rules/ui.mdc` 
  - **Ant Design Best Practices** specified in `.cursor/rules/antd-general.mdc`

## Pages

### TodoPage

- **Purpose**: Main page.
- **Hooks Used**:
  - `useTodoDBInit`: to initialize the database
- **Laytout**:
  - Top: `TodoForm` for creating new to-dos (title input only; auto-assigns selected category).
  - Below: Ant Design `Splitter` with `CategoriesFilter` on the left (25% width) and `TodoList` on the right (75% width).
    - Follow `.cursor/rules/antd-splitter.mdc` to implement the splitter.

## Components

### TodoForm

- **Purpose**: A form for users to create new todos with a title and automatic category assignment based on the current filter.
- **Hooks Used**:
  - `useTodos`: to create new todos and to add them to the currently selected category. 
- **Props**: 
  - `categoryId`: to add newly created todos the currently selected category. 
  ```tsx
  interface TodoFormProps {
    categoryId?: string;
  }
  ```
- **Behavior**:
  - Renders a single input field for the todo title, styled to be centered with a responsive width between 400px and 600px.
  - On form submission, `createTodo` creates the todo.
  - If a specific category (not "All" or "Uncategorized") is selected, `addTodoToCategory` adds the new todo to the category.
  - Validates that the title is not empty, displaying an error message "Title cannot be empty" if the user attempts to submit an empty title.
- **UI**: built with Ant Design's `Form` and `Input` components for a consistent look and feel.

### TodoList

- **Purpose**: displays and manages a list of todos, allowing users to view, edit, complete, delete, and categorize them.
- **Hooks Used**:
  - `useTodos`: provides a list of todos and all the operations (update, delete, add to a category, remove from a category).
  - `useCategories`: to display category names and to display a list of available categories.
- **Props**: 
  - `categoryId`: to filter the list of todos. 
  ```tsx
  interface TodoListProps {
    categoryId?: string;
  }
  ```
- **Behavior**:
  - Uses `useTodos` to retrieve todos, reflecting the current filter (e.g., "All", "Uncategorized", or a specific category).
  - Displays todos in a table grouped by status (incomplete and complete), using tree data to implement collapsible groups that are expanded by default. 
  - Groups `Incomplete` and `Complete` always go in that order.
  - Each row supports:
    - Inline editing of the todo title using `updateTodo`.
    - Toggling completion status with `updateTodo`.
    - Deletion via `deleteTodo`.
    - Category assignment/removal via `addTodoToCategory` (and using the `CategoriesPicker` component to select a category) and `removeTodoFromCategory`.
- **UI**: utilizes Ant Design's `Table` with grouping, fixed header, and fixed columns for status, title, and actions.
  - **Grouping**: uses tree data to group todos by status (incomplete/complete). Groups must be collapsible and expanded by default.
  - **Columns**:
    - **To-Do**: (fixed column) displays the checkbox indicating completion status, and the todo title truncated with tooltips for long titles. The title is editable using Ant Design’s `Typography.Text` with a visible edit icon.
    - **Categories**: presented as Ant Design `Tag` components. Users can add or remove categories via a `CategoriesPicker` popover triggered by a "+" button. The column is wide enough to accommodate all categories, with horizontal scrolling enabled in the table if necessary.
    - **Created**: displays only the date (without time).
    - **Actions** (no header title): Delete icon (fixed column).

### CategoriesFilter

- **Purpose**: a menu listing categories with to-do counts, allowing users to select a category to filter the todo list, with scrolling support for long lists. Also it provides functionality to create, edit, and delete categories, enabling users to manage their category list. 
- **Hooks Used**:
  - `useCategories`: provides a list of categories and all the operations (create, update, delete).
  - `useTodos`: provides a list of todos with ids of assigned categories, so that the number of todos for each category can be calculated.
- **Props**:
  - `selectedCategory`: the currently selected category (e.g., "All", "Uncategorized", or a specific category ID).
  - `onCategorySelect`: callback function triggered when a category is selected, updating the filter state.
  ```tsx
  interface CategoriesFilterProps {
    selectedCategory: string;
    onCategorySelect: (categoryId: string) => void;
  }
  ```
- **Behavior**:
  - Displays a menu with options: "All", "Uncategorized", and all user-created categories.
  - The currently selected category is highlighted based on `selectedCategory`.
  - When a category is clicked, `onCategorySelect` is called.
  - Supports scrolling if the category list exceeds the visible area.
  - Offers modal dialogs for:
    - **Creating**: Opens a modal with an input field; `createCategory` adds the new category upon submission.
    - **Editing**: Opens a modal pre-filled with the category’s current title; `updateCategory` saves changes.
    - **Deleting**: Opens a confirmation modal; `deleteCategory` removes the category upon confirmation.
  - Validates category titles (e.g., non-empty, unique per user), displaying error messages if validation fails.
- **UI**: Implemented with Ant Design's `Menu` component for a sleek, navigable interface.
  - For each category the number of todos this category is assigned to is shown.
  - Leverages Ant Design's `Modal` components for each action (create, edit, delete), paired with input fields and confirmation buttons for a clean, user-friendly experience.

### CategoriesPicker

- **Purpose**: a popover interface for assigning categories to a specific todo.
- **Hooks Used**:
  - `useCategories`: provides a list of categories.
- **Props**:
  - `categories`: a list of categories.
  - `assignedCategories`: an array of category IDs already assigned to the todo, so we need to hide them from the list.
  - `onCategorySelect`: callback function triggered when categories are selected, updating the todo's categories.
  ```tsx
  interface CategoriesPickerProps {
    categories: CategoryDocument[];
    assignedCategories: string[];
    onCategorySelect: (category: CategoryDocument) => void;
  }
  ```
- **Behavior**:
  - Renders a popover listing all categories, filtering out categories that are currently assigned based on `assignedCategories`.
  - When a category is clicked, `onCategorySelect` is called.
  - Closes automatically after selections are made or when clicked outside.
- **UI**: Uses Ant Design's `Popover` containing a list of categories.