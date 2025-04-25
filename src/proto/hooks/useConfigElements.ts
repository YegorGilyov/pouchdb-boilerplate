import { useState, useEffect, useCallback } from 'react';
import { App } from 'antd';
import { usePouchDB } from '../../shared/contexts/PouchDBProvider';
import { ConfigElementDocument } from '../../shared/types';
import { UseConfigElementsReturn, ConfigElementFilter } from '../types';
import { denormalizeDocument } from '../utils/denormalizeDocument';

export function useConfigElements(filter: ConfigElementFilter): UseConfigElementsReturn {
  const [configElements, setConfigElements] = useState<ConfigElementDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { db, dbOperations } = usePouchDB();
  const { message } = App.useApp();

  // Helper function to fetch configuration elements with silent option
  const fetchConfigElements = useCallback(async (silent: boolean = false) => {
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      
      // Base selector always includes type
      let selector: PouchDB.Find.Selector = { 
        type: filter.type,
        name: { $gte: null } // Required for proper index use
      };
      
      // We can only use one filter at a time as per spec
      // Apply availableIn filter if specified
      if (filter.availableIn) {
        selector = { 
          ...selector,
          denormAvailableInSpaceIds: { 
            $in: [filter.availableIn] 
          }
        };
      }
      // Apply availableTo filter if specified
      else if (filter.availableTo) {
        selector = { 
          ...selector,
          denormAvailableToUserIds: { 
            $in: [filter.availableTo, 'everyone'] 
          }
        };
      } 
      // Apply canBeReusedBy filter if specified
      else if (filter.canBeReusedBy) {
        selector = { 
          ...selector,
          denormCanBeReusedByUserIds: { 
            $in: [filter.canBeReusedBy, 'everyone'] 
          }
        };
      }
      
      // Determine the index to use based on the filter
      let useIndex = 'idx-type-name';
      if (filter.availableIn) {
        useIndex = 'idx-type-name-availableIn';
      } else if (filter.availableTo) {
        useIndex = 'idx-type-name-availableTo';
      } else if (filter.canBeReusedBy) {
        useIndex = 'idx-type-name-canBeReusedBy';
      }
      
      // Fetch configuration elements sorted by name
      const result = await dbOperations.find<ConfigElementDocument>(
        selector,
        [{ name: 'asc' }],
        useIndex
      );
      
      setConfigElements(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Failed to fetch configuration elements', error);
      if (!silent) {
        setError(error);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [JSON.stringify(filter), dbOperations]);

  // Fetch configuration elements when filter changes
  useEffect(() => {
    fetchConfigElements(false); // Not silent on initial load or filter change
  }, [JSON.stringify(filter), fetchConfigElements]);

  // Subscribe to changes in configuration element documents
  useEffect(() => {
    const unsubscribe = dbOperations.subscribeToChanges((change) => {
      const changedDoc = change.doc;
      
      // Skip if no document
      if (!changedDoc) {
        return;
      }
      
      // Check if the type matches one of the config element types
      const isConfigElementDoc = changedDoc.type === filter.type;
      if (!isConfigElementDoc) {
        return;
      }

      // Refetch configuration elements silently when data changes
      fetchConfigElements(true);
    });
    
    // Clean up subscription on unmount
    return unsubscribe;
  }, [JSON.stringify(filter), dbOperations, fetchConfigElements]);

  // Add a configuration element to a space
  const addToSpace = useCallback(async (configElement: ConfigElementDocument, spaceId: string): Promise<void> => {
    try {
      // Skip if the space is already in usedInSpaceIds
      if (configElement.usedInSpaceIds.includes(spaceId)) {
        return;
      }
      
      // Add the space to usedInSpaceIds
      const updatedElement = {
        ...configElement,
        usedInSpaceIds: [...configElement.usedInSpaceIds, spaceId]
      };
      
      // Denormalize the updated element
      const denormalizedElement = await denormalizeDocument(updatedElement, db);
      
      // Update the element in the database
      await dbOperations.update(denormalizedElement);
      message.success('Added to space successfully');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Failed to add configuration element to space', error);
      setError(error);
      message.error('Failed to add to space');
      throw error;
    }
  }, [db, dbOperations, message]);

  // Remove a configuration element from a space
  const removeFromSpace = useCallback(async (configElement: ConfigElementDocument, spaceId: string): Promise<void> => {
    try {
      // Skip if the space is not in usedInSpaceIds
      if (!configElement.usedInSpaceIds.includes(spaceId)) {
        return;
      }
      
      // Remove the space from usedInSpaceIds
      const updatedElement = {
        ...configElement,
        usedInSpaceIds: configElement.usedInSpaceIds.filter(id => id !== spaceId)
      };
      
      // Denormalize the updated element
      const denormalizedElement = await denormalizeDocument(updatedElement, db);
      
      // Update the element in the database
      await dbOperations.update(denormalizedElement);
      message.success('Removed from space successfully');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Failed to remove configuration element from space', error);
      setError(error);
      message.error('Failed to remove from space');
      throw error;
    }
  }, [db, dbOperations, message]);

  // Set the published state of a configuration element
  const setPublished = useCallback(async (configElement: ConfigElementDocument, published: boolean): Promise<void> => {
    try {
      // Skip if the published state is already set
      if (configElement.isPublished === published) {
        return;
      }
      
      // Update the published state
      const updatedElement = {
        ...configElement,
        isPublished: published
      };
      
      // Denormalize the updated element
      const denormalizedElement = await denormalizeDocument(updatedElement, db);
      
      // Update the element in the database
      await dbOperations.update(denormalizedElement);
      message.success(`${published ? 'Published' : 'Unpublished'} successfully`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Failed to set published state', error);
      setError(error);
      message.error(`Failed to ${published ? 'publish' : 'unpublish'}`);
      throw error;
    }
  }, [db, dbOperations, message]);

  // Set the active state of a configuration element
  const setActive = useCallback(async (configElement: ConfigElementDocument, active: boolean): Promise<void> => {
    try {
      // Skip if the active state is already set
      if (configElement.isActive === active) {
        return;
      }
      
      // Update the active state
      const updatedElement = {
        ...configElement,
        isActive: active,
        updatedAt: new Date().toISOString()
      };
      
      // Update the element in the database (no need to denormalize as this doesn't affect query filters)
      await dbOperations.update(updatedElement);
      message.success(`${active ? 'Activated' : 'Deactivated'} successfully`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Failed to set active state', error);
      setError(error);
      message.error(`Failed to ${active ? 'activate' : 'deactivate'}`);
      throw error;
    }
  }, [dbOperations, message]);

  return {
    configElements,
    loading,
    error,
    addToSpace,
    removeFromSpace,
    setPublished,
    setActive
  };
} 