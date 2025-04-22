import { useState, useEffect } from 'react';
import { App } from 'antd';
import { usePouchDB } from '../../shared/contexts/PouchDBProvider';
import { OperationState } from '../../shared/types';
import { todoDBIndexes } from '../constants/indexes';

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
        
        setState({ loading: false, error: null });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error('Failed to create todo indexes:', error);
        message.error('Failed to initialize todo functionality');
        setState({ loading: false, error });
      }
    };
    
    createTodoIndexes();
  }, [db, message]);
  
  return state;
}
