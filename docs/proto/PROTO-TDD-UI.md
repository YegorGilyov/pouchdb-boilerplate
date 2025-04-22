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
  - Main area: just a placeholder.

## Components

### LeftNavigation

- **Purpose**: it mocks the main navigation pane. This prototype only supports switching between users and navigation between spaces.
- **Hooks Used**:
  * `useProtoDBInit`: to initialize the database.
  * `useUsers`: to get a list of users.
  * `useSpaces`: to get a list of spaces available to the current user.
- **Props**:
  * `userId`: current user Id.
  * `spaceId`: current space Id.
- **Layout**:
  - Users dropdown.
  - Spaces dropdown (shows only spaces available to the current user).
- **Behavior**:
  - When selecting a user or a space, you are redirected to `SpacePage` with new URL parameters (`userId` and `spaceId`).
  - If no `userId` is specified, select the first user in the list.
  - If no `spaceId` is specified, select the first space in the list.

## Router

- Implement separate routing for this slice and include it in `src/app/routes/Routes.tsx` using lazy loading.
- Make SpacePage accessible at "/proto/space" with two query parameters:
  * `spaceId`: specifies the current space.
  * `userId`: specifies the current user.
- The route should support both required and optional parameters (e.g., `/proto/space?spaceId=123&userId=456` or `/proto/space?userId=456`).
- Ensure the root route for the prototype slice automatically routes to the space page.
