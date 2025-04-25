import { useState, useEffect } from 'react';
import { App } from 'antd';
import { usePouchDB } from '../../shared/contexts/PouchDBProvider';
import { OperationState } from '../../shared/types';
import { todoDBIndexes } from '../constants/indexes';

// Shared initialization promise to prevent concurrent initialization
let initializationPromise: Promise<void> | null = null;

export function useTodoDBInit(): OperationState {
  const [state, setState] = useState<OperationState>({
    loading: true,
    error: null
  });
  const { db } = usePouchDB();
  const { message } = App.useApp();

  useEffect(() => {
    const createTodoIndexes = async () => {
      try {
        setState({ loading: true, error: null });

        // If initialization is already in progress, wait for it
        if (initializationPromise) {
          await initializationPromise;
          setState({ loading: false, error: null });
          return;
        }
        
        // Create a new initialization promise
        initializationPromise = (async () => {
          try {
            // Create all indexes in parallel
            await Promise.all(
              todoDBIndexes.map((indexSpec: any) => {
                const fullSpec = {
                  ...indexSpec,
                  ddoc: indexSpec.name
                };
                return db.createIndex(fullSpec as any);
              })
            );
          } catch (error) {
            // Reset the promise on error so we can retry next time
            initializationPromise = null;
            throw error;
          }
        })();

        // Wait for initialization to complete
        await initializationPromise;
        setState({ loading: false, error: null });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error('Failed to create todo indexes:', error);
        message.error('Failed to initialize todo functionality');
        setState({ loading: false, error });
      }
    };
    
    createTodoIndexes();
  }, [message, db]);
  
  return state;
}
