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