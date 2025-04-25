# Configuration Management Prototype - Technical Design Document - Schema

**IMPORTANT**: Please follow requirements from this document carefully and to the letter!

- **Design System**: Follow Ant Design's default styles and components.
- **Rules**: when implementing UI, make sure to follow rules: 
  - **UI Design Best Practices** specified in `.cursor/rules/ui.mdc` 
  - **Ant Design Best Practices** specified in `.cursor/rules/antd-general.mdc`

## Pages

### SpacePage

- **Purpose**: Main page.
- **URL parameters**:
  * `userId`: current user Id.
  * `spaceId`: current space Id.
- **Hooks Used**:
  * `useProtoDBInit`: to initialize the database.
- **Layout**:
  - Left: `LeftNavigation`.
  - Main area: `SpaceHome`.

## Components

### LeftNavigation

- **Purpose**: it mocks the main navigation pane. This prototype only supports switching between users and navigation between spaces.
- **Hooks Used**:
  * `useUsers`: to get a list of users.
  * `useSpaces`: to get a list of spaces available to the current user.
- **Props**:
  * `userId`: current user Id.
  * `spaceId`: current space Id.
  * `onSettingsOpen`: callback function that displays the Settings panel with specified section.
```tsx
interface LeftNavigationProps {
  userId?: string | null;
  spaceId?: string | null;
  onSettingsOpen: (settingsSection?: SettingsSection) => void;
}
```
- **Shared types** (`src/proto/types.index.ts`)
```ts
const SETTINGS_SECTIONS = [
  { key: "itemTypes", label: "Item Types" },
  { key: "workflows", label: "Workflows" },
  { key: "customFields", label: "Custom Fields" }
] as const;

type SettingsSection = typeof SETTINGS_SECTIONS[number]['key'];
```
- **Layout**:
  - Wrike logo at the top left corner and user avatar at the top right corner in the same row.
  - When you click on the user avater, a menu with the following items opens:
    * Current user name with a submenu of all available users to switch between
    * Divider
    * `Settings`: calls `onSettingsOpen` without specifying a section
    * `Help`: non-functional
    * `Mobile apps`: non-functional
    * `Privacy policy`: non-functional
    * Divider
    * `Log out`: non-functional
  - Navigation menu with non-functional options: `Search`, `Inbox`, and `Starred tasks`.
  - Space selector dropdown for switching between spaces.
  - Space overview section with `Space overview` text and a gear icon at the right.
    - When you click on the gear icon, a menu with the following items opens:
      * `General space settings`: non-functional
      * Divider
      * Items from the `SETTINGS_SECTIONS` array, calling `onSettingsOpen`
  - Tools section with a `Tools` header and skeleton placeholder.
  - Projects & folders section with a `Projects and folders` header and skeleton placeholder.
- **UI**:
  - Dark theme using Ant Design's `darkAlgorithm`.
  - Avatar for user selection with dynamically generated image from DiceBear API (using URL format: 'https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=' + userName).
  - No icons in the menu that opens when you clock click on the user avatar.
  - Space overview section looks like a selected menu item, with a corresponding icon at the left, styled as a rounded button with light background color.
  - Tools and Projects and folders sections displayed with secondary text headers and Ant Design Skeleton components to indicate future content.
- **Behavior**:
  - When no `userId` is specified, it selects the first user in the list automatically.
  - When no `spaceId` is specified or the current spaceId is not available to the user, it selects the first available space.
  - When selecting a user or a space, it updates the URL parameters (`userId` and `spaceId`).
  - Displays appropriate loading and error states.

### SpaceHome

- **Purpose**: it mocks a space dashboard.
- **Hooks Used**:
  * `useSpaces`: to get details of the current space.
- **Props**:
  * `userId`: current user Id.
  * `spaceId`: current space Id.
```tsx
interface SpaceHomeProps {
  userId: string | null;
  spaceId: string | null;
}
```
- **Layout**:
  * Space name as a header.

## Router

- Implement separate routing for this slice and include it in `src/app/routes/Routes.tsx` using lazy loading.
- Make SpacePage accessible at "/proto/space" with two query parameters:
  * `spaceId`: specifies the current space.
  * `userId`: specifies the current user.
- The route should support both required and optional parameters (e.g., `/proto/space?spaceId=123&userId=456` or `/proto/space?userId=456`).
- Ensure the root route for the prototype slice automatically routes to the space page.
