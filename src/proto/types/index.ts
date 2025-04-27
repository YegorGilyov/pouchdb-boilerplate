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
  spaceIds?: string[];
}

// Configuration element state and operation interfaces
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
  type: string;
  availableIn?: string;
  availableTo?: string;
  canBeReusedBy?: string;
}

// Settings section configuration
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