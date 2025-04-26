import { useState, useEffect } from 'react';
import { App } from 'antd';
import { usePouchDB } from '../../shared/contexts/PouchDBProvider';
import { OperationState, SpaceDocument, ConfigElementDocument } from '../../shared/types';
import { dbIndexes } from '../constants/indexes';
import { denormalizeDocument } from '../utils/denormalizeDocument';

// Shared initialization promise to prevent concurrent initialization
let initializationPromise: Promise<void> | null = null;

export function useProtoDBInit(): OperationState {
  const [state, setState] = useState<OperationState>({
    loading: true,
    error: null
  });
  const { db, dbOperations } = usePouchDB();
  const { message } = App.useApp();

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        setState({ loading: true, error: null });

        // If initialization is already in progress, wait for it
        if (initializationPromise) {
          await initializationPromise;
          setState({ loading: false, error: null });
          console.log('Database already initialized, skipping');
          return;
        }
        
        // Create a new initialization promise
        initializationPromise = (async () => {
          console.log('Initializing database');
          try {
            // Create all indexes in parallel
            await Promise.all(
              dbIndexes.map((indexSpec: any) => {
                const fullSpec = {
                  ...indexSpec,
                  ddoc: indexSpec.name
                };
                return db.createIndex(fullSpec as any);
              })
            );

            // Ensure all documents are properly denormalized
            // Get all documents that need denormalization
            const documentsToProcess = await dbOperations.find<SpaceDocument | ConfigElementDocument>(
              {
                type: { 
                  $in: ['space', 'itemType', 'workflow', 'customField'] 
                } 
              }
            );
            
            // Update denormalized fields for all documents
            const denormalizePromises = documentsToProcess.map(doc => 
              denormalizeDocument(doc, db).then(updated => 
                dbOperations.update(updated)
              )
            );
            
            await Promise.all(denormalizePromises);
            console.log('Database initialized');

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
        console.error('Failed to initialize prototype database:', error);
        message.error('Failed to initialize prototype functionality');
        setState({ loading: false, error });
      }
    };
    
    initializeDatabase();
  }, [message, dbOperations, db, denormalizeDocument]);
  
  return state;
} 