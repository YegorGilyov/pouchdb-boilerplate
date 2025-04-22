import { 
  SpaceDocument, 
  ConfigElementDocument,
  PouchDBInstance
} from '../../shared/types';

/**
 * Updates denormalized fields for entities to simplify queries
 * @param doc The document to denormalize
 * @param db The PouchDB database instance
 * @returns The denormalized document
 */
export async function denormalizeDocument<T extends SpaceDocument | ConfigElementDocument>(
  doc: T,
  db: PouchDBInstance
): Promise<T> {
  try {
    // Handle Space document
    if (doc.type === 'space') {
      const spaceDoc = doc as SpaceDocument;
      
      // For private spaces, available to members and admins only
      // For public spaces, available to everyone
      let availableToUserIds: string[] = spaceDoc.isPrivate
        ? [...new Set([...spaceDoc.memberUserIds, ...spaceDoc.adminUserIds])]
        : ['everyone'];
        
      return {
        ...spaceDoc,
        denormAvailableToUserIds: availableToUserIds
      } as T;
    }
    
    // Handle ConfigElement document variants
    if (['itemType', 'workflow', 'customField'].includes(doc.type)) {
      const configDoc = doc as ConfigElementDocument;
      
      // Spaces where this element is available: managed in + used in
      const availableInSpaceIds = [
        configDoc.managedInSpaceId, 
        ...configDoc.usedInSpaceIds
      ];
      
      // Fetch the managed space to get admin users
      const managedSpace = await db.get(configDoc.managedInSpaceId) as SpaceDocument;
      const managedByUserIds = managedSpace.adminUserIds;
      
      // Determine who can access this element
      let availableToUserIds: string[] = ['everyone'];
      let canBeReusedByUserIds: string[] = ['everyone'];
      
      // If not published, we need to compute who has access
      if (!configDoc.isPublished) {
        // For unpublished elements, only users in the spaces where the element is available can access it
        availableToUserIds = [];
        canBeReusedByUserIds = [...managedByUserIds]; // Admins of the managed space can reuse it
        
        // Fetch all spaces where this element is available
        const spaces = await Promise.all(
          availableInSpaceIds.map(id => db.get(id) as Promise<SpaceDocument>)
        );
        
        // For each space, if it's private, add its members and admins
        // If it's public, everyone can access it
        for (const space of spaces) {
          if (space.isPrivate) {
            availableToUserIds.push(...space.denormAvailableToUserIds.filter(id => id !== 'everyone'));
          } else {
            // If any space is public, everyone can access
            availableToUserIds = ['everyone'];
            break;
          }
        }
      }
      
      // Return updated document with denormalized fields
      return {
        ...configDoc,
        denormAvailableInSpaceIds: [...new Set(availableInSpaceIds)],
        denormAvailableToUserIds: [...new Set(availableToUserIds)],
        denormManagedByUserIds: [...new Set(managedByUserIds)],
        denormCanBeReusedByUserIds: [...new Set(canBeReusedByUserIds)]
      } as T;
    }
    
    // Return original document for other types
    return doc;
  } catch (error) {
    console.error('Error denormalizing document:', error);
    throw error;
  }
} 