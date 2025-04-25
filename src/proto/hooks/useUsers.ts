import { useState, useEffect, useCallback } from 'react';
import { usePouchDB } from '../../shared/contexts/PouchDBProvider';
import { UserDocument } from '../../shared/types';
import { UseUsersReturn } from '../types';

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { dbOperations } = usePouchDB();

  // Helper function to fetch users with silent option
  const fetchUsers = useCallback(async (silent: boolean = false) => {
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      
      // Create selector for users
      const selector: PouchDB.Find.Selector = { type: 'user' };
      
      // Fetch users sorted by name
      const result = await dbOperations.find<UserDocument>(
        selector,
        [{ type: 'asc' }, { name: 'asc' }],
        'idx-type-name'
      );
      
      setUsers(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Failed to fetch users', error);
      if (!silent) {
        setError(error);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [dbOperations]);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers(false); // Not silent on initial load
  }, [fetchUsers]);

  // Subscribe to changes in user documents
  useEffect(() => {
    const unsubscribe = dbOperations.subscribeToChanges((change) => {
      const changedDoc = change.doc;
      
      // Skip if no document
      if (!changedDoc) {
        return;
      }
      
      // Check for user prefix in _id or user type
      const isUserDoc = changedDoc._id.startsWith('user:') || changedDoc.type === 'user';
      if (!isUserDoc) {
        return;
      }

      // Refetch users silently when user data changes
      fetchUsers(true);
    });
    
    // Clean up subscription on unmount
    return unsubscribe;
  }, [dbOperations, fetchUsers]);

  return {
    users,
    loading,
    error
  };
} 