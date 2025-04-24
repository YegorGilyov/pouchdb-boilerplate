import { useState, useEffect, useCallback } from 'react';
import { usePouchDB } from '../../shared/contexts/PouchDBProvider';
import { SpaceDocument } from '../../shared/types';
import { UseSpacesReturn, SpaceFilter } from '../types';

export function useSpaces(filter?: SpaceFilter): UseSpacesReturn {
  const [spaces, setSpaces] = useState<SpaceDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { dbOperations } = usePouchDB();

  // Helper function to fetch spaces with silent option
  const fetchSpaces = useCallback(async (silent: boolean = false) => {
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      
      // Base selector for spaces
      let selector: PouchDB.Find.Selector = { 
        type: 'space',
        name: { $gte: null } // Required for proper index use
      };
      
      // Apply available-to filter if specified
      if (filter?.availableTo) {
        selector = { 
          ...selector,
          denormAvailableToUserIds: { 
            $in: [filter.availableTo, 'everyone'] 
          }
        };
      }
      
      // Apply spaceIds filter if specified
      if (filter?.spaceIds && filter.spaceIds.length > 0) {
        selector = {
          ...selector,
          _id: { $in: filter.spaceIds.map(id => id.startsWith('space:') ? id : `space:${id}`) }
        };
      }
      
      // Fetch spaces sorted by name
      const result = await dbOperations.find<SpaceDocument>(
        selector,
        [{ type: 'asc' }, { name: 'asc' }],
        'idx-type-name'
      );
      
      setSpaces(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Failed to fetch spaces', error);
      if (!silent) {
        setError(error);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [filter]);

  // Fetch spaces when filter changes
  useEffect(() => {
    fetchSpaces(false);
  }, [
    filter?.availableTo, 
    filter?.spaceIds ? JSON.stringify(filter.spaceIds) : undefined
  ]);

  // Subscribe to changes in space documents
  useEffect(() => {
    const unsubscribe = dbOperations.subscribeToChanges((change) => {
      const changedDoc = change.doc;
      
      // Skip if no document
      if (!changedDoc) {
        return;
      }
      
      // Check for space prefix in _id or space type
      const isSpaceDoc = changedDoc._id.startsWith('space:') || changedDoc.type === 'space';
      if (!isSpaceDoc) {
        return;
      }

      // Refetch spaces silently when space data changes
      fetchSpaces(true);
    });
    
    // Clean up subscription on unmount
    return unsubscribe;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter?.availableTo, filter?.spaceIds]);

  return {
    spaces,
    loading,
    error
  };
} 