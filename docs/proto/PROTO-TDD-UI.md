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
  * `userId` (optional): current user Id.
  * `spaceId` (optional): current space Id.
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
- **Shared types** (`src/proto/types/index.ts`)
```ts
export type SettingsSection = "itemTypes" | "workflows" | "customFields" | "automation" | "requestForms" | "blueprints";

type SettingsSectionItem = {
  key: SettingsSection;
  label: string;
  default?: boolean;
};

export const SETTINGS_SECTIONS: readonly SettingsSectionItem[] = [
  { key: "itemTypes", label: "Item Types" },
  { key: "workflows", label: "Workflows" },
  { key: "customFields", label: "Custom Fields" },
  { key: "automation", label: "Automation", default: true },
  { key: "requestForms", label: "Request Forms" },
  { key: "blueprints", label: "Blueprints" }
]; 
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
  onSettingsOpen: (settingsSection?: SettingsSection) => void;
}
```
- **Layout**:
  - Header
    - At the left: 
      - Space name
      - Tag `You manage this space` inline with the space name, in case the current user in one of the admins 
    - At the right:
      - Configuration button with dropdown menu:
        * Default items from from `CONFIG_SECTIONS` as the primary action
        * Other items from from `CONFIG_SECTIONS` in the dropdown
        * When selected, `onSettingsOpen` is called
      - Share button: button with icon, `Share` text, non-functional
      - Help button: button with icon, no text, non-functional
      - Plus button: primary button with icon, no text, non-functional 
  - Horizontal divider between the header and the rest of the component
  - Fake dashboard consisting of 4 cards (two in the first row and two in the second row), filled with skeletons
- **UI**
  - Use `Dropdown.Button` for the configuration dropdown, with `DownOutlined` icon. Dropdown opens on click.
  - Use skeletons without animation
  - Make the cards in the fake dashboard occupy all vertical space

### SettingsPanel

- **Purpose**: modal dialog for managing all settings and configuration.
- **Hooks Used**:
  - `useSpaces`:
  - `useConfigElements`:
- **Props**:
  * `userId`: current user Id.
  * `spaceId`: current space Id.
  * `section`: selected configuration section.
  * `open`:
  * `onSpaceSelect`:
  * `onSectionSelect`:
  * `onClose`:
```tsx
interface SettingsPanelProps {
  userId: string | null;
  spaceId: string | null;
  section: SettingsSection | null;
  open: boolean;
  onSpaceSelect: (spaceId: string) => void;
  onSectionSelect: (section: SettingsSection) => void;
  onClose: () => void;
}
```
- **Layout**:


## Router

- Implement separate routing for this slice in `src/proto/routes/ProtoRoutes.tsx` and include it in the main application router (`src/app/routes/Routes.tsx`) using lazy loading.
- Set up the following routes:
  * `/proto/space`: Main space page component
  * `/proto`: Should redirect to `/proto/space`
